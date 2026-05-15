import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateOrderStatus } from '@/app/actions/orders'

const NEXT_STATUS: Record<string, string | null> = {
  pending: 'processing',
  processing: 'shipped',
  shipped: 'delivered',
  delivered: null,
  cancelled: null,
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-zinc-100 text-zinc-500',
}

export default async function VendorOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!vendor) redirect('/dashboard/vendor/onboarding')

  const { data: orders } = await supabase
    .from('orders')
    .select('*, customer:profiles(full_name, email), items:order_items(quantity, unit_price, product:products(name))')
    .eq('vendor_id', vendor.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Orders</h1>

      {orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => {
            const customer = order.customer as { full_name: string | null; email: string } | null
            const items = order.items as { quantity: number; unit_price: number; product: { name: string } | null }[]
            const nextStatus = NEXT_STATUS[order.status]
            const advanceAction = nextStatus
              ? updateOrderStatus.bind(null, order.id, nextStatus)
              : null

            return (
              <div
                key={order.id}
                className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-medium">#{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-zinc-500">{customer?.full_name ?? customer?.email}</p>
                    <p className="text-xs text-zinc-400">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColors[order.status] ?? ''}`}>
                      {order.status}
                    </span>
                    <span className={`text-sm font-medium capitalize ${order.payment_status === 'paid' ? 'text-green-600' : 'text-red-500'}`}>
                      {order.payment_status}
                    </span>
                    <span className="font-semibold">₮{order.total_amount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="mt-3 space-y-1 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                  {items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm text-zinc-600">
                      <span>{item.product?.name ?? 'Product'} × {item.quantity}</span>
                      <span>₮{(item.unit_price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Advance status */}
                {advanceAction && (
                  <form action={advanceAction} className="mt-3">
                    <button
                      type="submit"
                      className="h-8 rounded-lg border border-zinc-300 px-3 text-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      Mark as {nextStatus}
                    </button>
                  </form>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-zinc-300 py-20 text-zinc-400 dark:border-zinc-700">
          No orders yet
        </div>
      )}
    </div>
  )
}
