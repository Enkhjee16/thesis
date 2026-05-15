import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { removeFromCart, updateCartItem } from '@/app/actions/cart'
import { placeOrder } from '@/app/actions/orders'

type Props = { searchParams: Promise<{ error?: string }> }

export default async function CartPage({ searchParams }: Props) {
  const { error: errorParam } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cartItems } = await supabase
    .from('cart_items')
    .select('*, product:products(id, name, price, image_url, stock, vendor:vendors(shop_name))')
    .eq('user_id', user.id)
    .order('id')

  const total = (cartItems ?? []).reduce((sum, item) => {
    const price = (item.product as { price: number }).price
    return sum + price * item.quantity
  }, 0)

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-bold">Marketplace</Link>
          <Link href="/orders" className="text-sm text-zinc-600 hover:text-zinc-900">My Orders</Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Shopping Cart</h1>

        {errorParam === 'insufficient_stock' && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
            One or more items in your cart is out of stock. Please update your cart and try again.
          </div>
        )}

        {!cartItems || cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 py-24 text-center dark:border-zinc-700">
            <p className="text-zinc-400">Your cart is empty</p>
            <Link href="/" className="mt-3 text-sm text-zinc-900 underline dark:text-white">
              Browse products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Items */}
            <div className="space-y-3 lg:col-span-2">
              {cartItems.map((item) => {
                const product = item.product as {
                  id: string; name: string; price: number
                  image_url: string | null; stock: number
                  vendor: { shop_name: string } | null
                }
                const removeWithId = removeFromCart.bind(null, item.id)

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                      {product.image_url ? (
                        <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="80px" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-zinc-300 text-xs">No image</div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col gap-1">
                      <Link href={`/products/${product.id}`} className="font-medium hover:underline">
                        {product.name}
                      </Link>
                      {product.vendor && (
                        <p className="text-xs text-zinc-500">{product.vendor.shop_name}</p>
                      )}
                      <p className="text-sm font-semibold">₮{product.price.toLocaleString()}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <form action={updateCartItem} className="flex items-center gap-1">
                        <input type="hidden" name="id" value={item.id} />
                        <input
                          type="number"
                          name="quantity"
                          defaultValue={item.quantity}
                          min="1"
                          max={product.stock}
                          className="w-16 rounded border border-zinc-300 px-2 py-1 text-center text-sm dark:border-zinc-700 dark:bg-zinc-800"
                          onChange={(e) => e.currentTarget.form?.requestSubmit()}
                        />
                      </form>

                      <form action={removeWithId}>
                        <button type="submit" className="text-xs text-red-500 hover:text-red-700">
                          Remove
                        </button>
                      </form>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary */}
            <div className="h-fit rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="font-semibold">Order Summary</h2>
              <div className="mt-4 space-y-2 text-sm">
                {cartItems.map((item) => {
                  const product = item.product as { name: string; price: number }
                  return (
                    <div key={item.id} className="flex justify-between text-zinc-600">
                      <span className="truncate pr-2">{product.name} × {item.quantity}</span>
                      <span>₮{(product.price * item.quantity).toLocaleString()}</span>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 flex justify-between border-t border-zinc-200 pt-4 font-semibold dark:border-zinc-700">
                <span>Total</span>
                <span>₮{total.toLocaleString()}</span>
              </div>

              <form action={placeOrder} className="mt-4">
                <button
                  type="submit"
                  className="h-11 w-full rounded-xl bg-zinc-900 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
                >
                  Place Order
                </button>
              </form>

              <Link
                href="/"
                className="mt-3 block text-center text-sm text-zinc-500 hover:text-zinc-900"
              >
                Continue shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
