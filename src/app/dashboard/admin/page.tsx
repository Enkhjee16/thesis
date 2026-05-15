import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AdminOverviewPage() {
  const supabase = await createClient()

  const [
    { count: userCount },
    { count: vendorCount },
    { count: pendingCount },
    { count: orderCount },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('vendors').select('*', { count: 'exact', head: true }),
    supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Total Users', value: userCount ?? 0, href: '/dashboard/admin/users' },
    { label: 'Vendors', value: vendorCount ?? 0, href: '/dashboard/admin/vendors' },
    { label: 'Pending Approvals', value: pendingCount ?? 0, href: '/dashboard/admin/vendors?status=pending', highlight: (pendingCount ?? 0) > 0 },
    { label: 'Total Orders', value: orderCount ?? 0, href: '/dashboard/admin/orders' },
  ]

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Overview</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`rounded-xl border bg-white p-5 transition hover:shadow-sm dark:bg-zinc-900 ${
              stat.highlight
                ? 'border-amber-300 dark:border-amber-600'
                : 'border-zinc-200 dark:border-zinc-800'
            }`}
          >
            <p className="text-sm text-zinc-500">{stat.label}</p>
            <p className={`mt-1 text-3xl font-bold ${stat.highlight ? 'text-amber-600' : ''}`}>
              {stat.value}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
