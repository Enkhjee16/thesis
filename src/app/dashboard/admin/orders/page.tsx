import { createClient } from '@/lib/supabase/server'
import { setOrderStatus } from '@/app/actions/admin'

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-zinc-100 text-zinc-500',
}

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('*, customer:profiles(full_name, email), vendor:vendors(shop_name)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Orders</h1>

      {orders && orders.length > 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Order</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Customer</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Vendor</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-600 dark:text-zinc-400">Total</th>
                <th className="px-4 py-3 text-center font-medium text-zinc-600 dark:text-zinc-400">Payment</th>
                <th className="px-4 py-3 text-center font-medium text-zinc-600 dark:text-zinc-400">Status</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-600 dark:text-zinc-400">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {orders.map((order) => {
                const customer = order.customer as { full_name: string | null; email: string } | null
                const vendor = order.vendor as { shop_name: string } | null

                return (
                  <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs text-zinc-500">#{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-zinc-400">{new Date(order.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      <p>{customer?.full_name ?? '—'}</p>
                      <p className="text-xs text-zinc-400">{customer?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{vendor?.shop_name ?? '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      ₮{order.total_amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-medium capitalize ${order.payment_status === 'paid' ? 'text-green-600' : 'text-red-500'}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[order.status] ?? ''}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <form action={setOrderStatus.bind(null, order.id, '')} className="flex justify-end">
                        <select
                          name="status"
                          defaultValue={order.status}
                          onChange={(e) => {
                            const form = e.currentTarget.form!
                            const action = setOrderStatus.bind(null, order.id, e.target.value)
                            form.action = action as unknown as string
                            form.requestSubmit()
                          }}
                          className="rounded border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </form>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-zinc-300 py-20 text-zinc-400 dark:border-zinc-700">
          No orders yet
        </div>
      )}
    </div>
  )
}
