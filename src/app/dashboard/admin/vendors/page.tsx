import { createClient } from '@/lib/supabase/server'
import { setVendorStatus } from '@/app/actions/admin'

type Props = { searchParams: Promise<{ status?: string }> }

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
}

export default async function AdminVendorsPage({ searchParams }: Props) {
  const { status } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('vendors')
    .select('*, profile:profiles(full_name, email)')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data: vendors } = await query

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vendors</h1>

        {/* Status filter */}
        <div className="flex gap-2 text-sm">
          {['', 'pending', 'approved', 'rejected'].map((s) => (
            <a
              key={s}
              href={s ? `?status=${s}` : '/dashboard/admin/vendors'}
              className={`rounded-full border px-3 py-1 transition ${
                (status ?? '') === s
                  ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900'
                  : 'border-zinc-300 hover:border-zinc-500 dark:border-zinc-700'
              }`}
            >
              {s || 'All'}
            </a>
          ))}
        </div>
      </div>

      {vendors && vendors.length > 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Shop</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Owner</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Registered</th>
                <th className="px-4 py-3 text-center font-medium text-zinc-600 dark:text-zinc-400">Status</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-600 dark:text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {vendors.map((vendor) => {
                const profile = vendor.profile as { full_name: string | null; email: string } | null
                const approveAction = setVendorStatus.bind(null, vendor.id, 'approved')
                const rejectAction = setVendorStatus.bind(null, vendor.id, 'rejected')

                return (
                  <tr key={vendor.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="px-4 py-3">
                      <p className="font-medium">{vendor.shop_name}</p>
                      {vendor.description && (
                        <p className="text-xs text-zinc-400 line-clamp-1">{vendor.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      <p>{profile?.full_name ?? '—'}</p>
                      <p className="text-xs text-zinc-400">{profile?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {new Date(vendor.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[vendor.status] ?? ''}`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {vendor.status !== 'approved' && (
                          <form action={approveAction}>
                            <button type="submit" className="text-green-600 underline underline-offset-2 hover:text-green-800 text-xs">
                              Approve
                            </button>
                          </form>
                        )}
                        {vendor.status !== 'rejected' && (
                          <form action={rejectAction}>
                            <button type="submit" className="text-red-500 underline underline-offset-2 hover:text-red-700 text-xs">
                              Reject
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-zinc-300 py-20 text-zinc-400 dark:border-zinc-700">
          No vendors found
        </div>
      )}
    </div>
  )
}
