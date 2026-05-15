-- ============================================================
-- Phase 6 Migration: Security Hardening & DB Optimization
-- Run this in the Supabase SQL Editor
-- ============================================================

-- --------------------------------------------------------
-- 1. FIX: Prevent admin role from being claimed at signup
--    Old version accepted raw_user_meta_data->>'role' blindly.
--    Now only 'customer' and 'vendor' are allowed; anything
--    else (including 'admin') falls back to 'customer'.
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    CASE
      WHEN NEW.raw_user_meta_data->>'role' IN ('customer', 'vendor')
      THEN NEW.raw_user_meta_data->>'role'
      ELSE 'customer'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------------------
-- 2. Atomic stock decrement function
--    Raises an exception if stock would go negative,
--    so placeOrder can catch insufficient-stock errors.
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION decrement_product_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET stock = stock - p_quantity
  WHERE id = p_product_id AND stock >= p_quantity;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'insufficient_stock:%', p_product_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------------------
-- 3. Missing indexes
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_orders_payment_status  ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at       ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_created_at     ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id  ON order_items(product_id);
