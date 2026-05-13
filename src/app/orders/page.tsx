import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-zinc-100 text-zinc-500',
}

const paymentColors: Record<string, string> = {
  unpaid: 'text-red-600',
  paid: 'text-green-600',
  refunded: 'text-zinc-500',
}

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: orders } = await supabase
    .from('orders')
    .select('*, vendor:vendors(shop_name)')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-bold">Marketplace</Link>
          <Link href="/cart" className="text-sm text-zinc-600 hover:text-zinc-900">Cart</Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">My Orders</h1>

        {!orders || orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 py-24 text-center dark:border-zinc-700">
            <p className="text-zinc-400">No orders yet</p>
            <Link href="/" className="mt-3 text-sm text-zinc-900 underline dark:text-white">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const vendor = order.vendor as { shop_name: string } | null
              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 transition hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">Order #{order.id.slice(0, 8)}</p>
                    {vendor && <p className="text-xs text-zinc-500">{vendor.shop_name}</p>}
                    <p className="text-xs text-zinc-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <p className="font-semibold">₮{order.total_amount.toLocaleString()}</p>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[order.status] ?? ''}`}>
                      {order.status}
                    </span>
                    <span className={`text-xs font-medium capitalize ${paymentColors[order.payment_status] ?? ''}`}>
                      {order.payment_status}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
