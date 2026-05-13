-- ============================================================
-- Multi-Vendor E-Commerce Platform - Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- --------------------------------------------------------
-- TABLES
-- --------------------------------------------------------

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT        NOT NULL,
  full_name   TEXT,
  phone       TEXT,
  role        TEXT        NOT NULL DEFAULT 'customer'
                          CHECK (role IN ('customer', 'vendor', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vendors
CREATE TABLE vendors (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  shop_name   TEXT        NOT NULL,
  description TEXT,
  logo_url    TEXT,
  status      TEXT        NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  slug        TEXT        NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id   UUID        NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  category_id UUID        REFERENCES categories(id) ON DELETE SET NULL,
  name        TEXT        NOT NULL,
  description TEXT,
  price       NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  stock       INTEGER     NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url   TEXT,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cart Items
CREATE TABLE cart_items (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id  UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity    INTEGER     NOT NULL DEFAULT 1 CHECK (quantity > 0),
  UNIQUE (user_id, product_id)
);

-- Orders
CREATE TABLE orders (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id      UUID        NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  vendor_id        UUID        NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
  status           TEXT        NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status   TEXT        NOT NULL DEFAULT 'unpaid'
                               CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  total_amount     NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
  qpay_invoice_id  TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID        NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity    INTEGER     NOT NULL CHECK (quantity > 0),
  unit_price  NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0)
);

-- --------------------------------------------------------
-- INDEXES (for query optimization)
-- --------------------------------------------------------

CREATE INDEX idx_products_vendor_id    ON products(vendor_id);
CREATE INDEX idx_products_category_id  ON products(category_id);
CREATE INDEX idx_products_is_active    ON products(is_active);
CREATE INDEX idx_cart_items_user_id    ON cart_items(user_id);
CREATE INDEX idx_orders_customer_id    ON orders(customer_id);
CREATE INDEX idx_orders_vendor_id      ON orders(vendor_id);
CREATE INDEX idx_orders_status         ON orders(status);
CREATE INDEX idx_order_items_order_id  ON order_items(order_id);
CREATE INDEX idx_vendors_status        ON vendors(status);

-- --------------------------------------------------------
-- TRIGGER: auto-create profile on user sign-up
-- --------------------------------------------------------

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- --------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- --------------------------------------------------------

ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors     ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- vendors
CREATE POLICY "Anyone can view approved vendors"
  ON vendors FOR SELECT USING (status = 'approved');

CREATE POLICY "Vendor can view own record"
  ON vendors FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Vendor can update own record"
  ON vendors FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can register as vendor"
  ON vendors FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all vendors"
  ON vendors FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- categories
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- products
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT USING (is_active = true);

CREATE POLICY "Vendor can view own products"
  ON products FOR SELECT
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendor can manage own products"
  ON products FOR ALL
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all products"
  ON products FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- cart_items
CREATE POLICY "Users can manage own cart"
  ON cart_items FOR ALL USING (user_id = auth.uid());

-- orders
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Customers can create orders"
  ON orders FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Vendors can view their orders"
  ON orders FOR SELECT
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can update order status"
  ON orders FOR UPDATE
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all orders"
  ON orders FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- order_items
CREATE POLICY "Users can view order items for their orders"
  ON order_items FOR SELECT
  USING (order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid()));

CREATE POLICY "Vendors can view order items for their orders"
  ON order_items FOR SELECT
  USING (order_id IN (
    SELECT id FROM orders
    WHERE vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
  ));

CREATE POLICY "Admins can view all order items"
  ON order_items FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "System can insert order items"
  ON order_items FOR INSERT WITH CHECK (
    order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid())
  );

-- --------------------------------------------------------
-- SEED: default categories
-- --------------------------------------------------------

INSERT INTO categories (name, slug) VALUES
  ('Electronics',  'electronics'),
  ('Clothing',     'clothing'),
  ('Food',         'food'),
  ('Home & Living','home-living'),
  ('Sports',       'sports');
