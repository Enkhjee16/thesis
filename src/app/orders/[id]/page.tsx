import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PayWithQPay } from './PayWithQPay'

type Props = { params: Promise<{ id: string }> }

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-zinc-100 text-zinc-500',
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: order } = await supabase
    .from('orders')
    .select('*, vendor:vendors(shop_name), items:order_items(*, product:products(name, image_url))')
    .eq('id', id)
    .single()

  if (!order) notFound()
  if (order.customer_id !== user.id) redirect('/orders')

  const vendor = order.vendor as { shop_name: string } | null
  const items = order.items as {
    id: string; quantity: number; unit_price: number
    product: { name: string; image_url: string | null } | null
  }[]

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-bold">Marketplace</Link>
          <Link href="/orders" className="text-sm text-zinc-600 hover:text-zinc-900">← My Orders</Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">Order #{id.slice(0, 8)}</h1>
          <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColors[order.status] ?? ''}`}>
            {order.status}
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Items */}
          <div className="space-y-3 md:col-span-2">
            <h2 className="font-semibold">Items</h2>
            {items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <p className="font-medium">{item.product?.name ?? 'Product'}</p>
                  <p className="text-sm text-zinc-500">× {item.quantity}</p>
                </div>
                <p className="font-semibold">₮{(item.unit_price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* Summary + Payment */}
          <div className="space-y-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="font-semibold">Summary</h2>
              {vendor && <p className="mt-2 text-sm text-zinc-500">Seller: {vendor.shop_name}</p>}
              <div className="mt-4 flex justify-between border-t border-zinc-200 pt-4 font-bold dark:border-zinc-700">
                <span>Total</span>
                <span>₮{order.total_amount.toLocaleString()}</span>
              </div>
              <p className={`mt-2 text-sm font-medium capitalize ${order.payment_status === 'paid' ? 'text-green-600' : 'text-red-500'}`}>
                Payment: {order.payment_status}
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                {new Date(order.created_at).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
            </div>

            {/* QPay payment section */}
            {order.payment_status === 'unpaid' && (
              <PayWithQPay orderId={id} />
            )}

            {order.payment_status === 'paid' && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center text-sm text-green-700">
                Payment confirmed
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
