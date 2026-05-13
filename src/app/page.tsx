import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/products/ProductCard'

type Props = {
  searchParams: Promise<{ search?: string; category?: string }>
}

export default async function HomePage({ searchParams }: Props) {
  const { search, category } = await searchParams
  const supabase = await createClient()

  const categoriesQuery = supabase.from('categories').select('id, name, slug').order('name')

  let productsQuery = supabase
    .from('products')
    .select('*, vendor:vendors(shop_name), category:categories(name)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (search) {
    productsQuery = productsQuery.ilike('name', `%${search}%`)
  }
  if (category) {
    productsQuery = productsQuery.eq('category_id', category)
  }

  const [{ data: categories }, { data: products }] = await Promise.all([
    categoriesQuery,
    productsQuery,
  ])

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Marketplace
          </Link>

          <form method="GET" className="flex-1 max-w-sm">
            <input
              name="search"
              defaultValue={search}
              placeholder="Search products…"
              className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800"
            />
          </form>

          <nav className="flex items-center gap-3 text-sm">
            <Link href="/cart" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400">
              Cart
            </Link>
            <Link href="/login" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400">
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Category filter */}
        {categories && categories.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <Link
              href="/"
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                !category
                  ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900'
                  : 'border-zinc-300 hover:border-zinc-500 dark:border-zinc-700'
              }`}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/?category=${cat.id}${search ? `&search=${search}` : ''}`}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  category === cat.id
                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900'
                    : 'border-zinc-300 hover:border-zinc-500 dark:border-zinc-700'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        {/* Results count */}
        {search && (
          <p className="mb-4 text-sm text-zinc-500">
            {products?.length ?? 0} result{products?.length !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;
          </p>
        )}

        {/* Product grid */}
        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-zinc-400 text-lg">No products found</p>
            {search && (
              <Link href="/" className="mt-2 text-sm text-zinc-500 underline">
                Clear search
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
