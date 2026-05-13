import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function VendorOverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vendor } = await supabase
    .from('vendors')
    .select('*, products(count)')
    .eq('user_id', user.id)
    .single()

  // No vendor record yet — send to onboarding
  if (!vendor) redirect('/dashboard/vendor/onboarding')

  const productCount = (vendor.products as unknown as { count: number }[])?.[0]?.count ?? 0

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{vendor.shop_name}</h1>
        <p className="mt-1 text-sm text-zinc-500">{vendor.description}</p>
      </div>

      {/* Status banner */}
      {vendor.status === 'pending' && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Your shop is <strong>pending approval</strong>. An admin will review your account shortly. You can set up your products in the meantime.
        </div>
      )}
      {vendor.status === 'rejected' && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Your shop application was rejected. Please contact support for more information.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">Products</p>
          <p className="mt-1 text-3xl font-bold">{productCount}</p>
          <Link
            href="/dashboard/vendor/products"
            className="mt-2 inline-block text-xs text-zinc-500 underline underline-offset-2"
          >
            Manage →
          </Link>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">Status</p>
          <p className={`mt-1 text-lg font-semibold capitalize ${
            vendor.status === 'approved' ? 'text-green-600' :
            vendor.status === 'rejected' ? 'text-red-600' : 'text-amber-600'
          }`}>
            {vendor.status}
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6">
        <Link
          href="/dashboard/vendor/products/new"
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
        >
          + Add Product
        </Link>
      </div>
    </div>
  )
}
