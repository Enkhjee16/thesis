import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { deleteProduct, toggleProductActive } from '@/app/actions/products'

export default async function VendorProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!vendor) redirect('/dashboard/vendor/onboarding')

  const { data: products } = await supabase
    .from('products')
    .select('*, category:categories(name)')
    .eq('vendor_id', vendor.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link
          href="/dashboard/vendor/products/new"
          className="inline-flex h-9 items-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
        >
          + Add Product
        </Link>
      </div>

      {products && products.length > 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Product</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Category</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-600 dark:text-zinc-400">Price</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-600 dark:text-zinc-400">Stock</th>
                <th className="px-4 py-3 text-center font-medium text-zinc-600 dark:text-zinc-400">Active</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-600 dark:text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {products.map((product) => {
                const deleteWithId = deleteProduct.bind(null, product.id)
                const toggleWithId = toggleProductActive.bind(null, product.id, !product.is_active)

                return (
                  <tr key={product.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="px-4 py-3 font-medium">{product.name}</td>
                    <td className="px-4 py-3 text-zinc-500">
                      {(product.category as { name: string } | null)?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right">₮{product.price.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{product.stock}</td>
                    <td className="px-4 py-3 text-center">
                      <form action={toggleWithId}>
                        <button
                          type="submit"
                          className={`inline-block h-5 w-9 rounded-full transition ${
                            product.is_active ? 'bg-green-500' : 'bg-zinc-300'
                          }`}
                          title={product.is_active ? 'Deactivate' : 'Activate'}
                        />
                      </form>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/vendor/products/${product.id}`}
                          className="text-zinc-500 underline underline-offset-2 hover:text-zinc-900"
                        >
                          Edit
                        </Link>
                        <form action={deleteWithId}>
                          <button
                            type="submit"
                            className="text-red-500 underline underline-offset-2 hover:text-red-700"
                            onClick={(e) => {
                              if (!confirm('Delete this product?')) e.preventDefault()
                            }}
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 py-20 text-center dark:border-zinc-700">
          <p className="text-zinc-400">No products yet</p>
          <Link
            href="/dashboard/vendor/products/new"
            className="mt-3 text-sm text-zinc-900 underline underline-offset-2 dark:text-white"
          >
            Add your first product
          </Link>
        </div>
      )}
    </div>
  )
}
