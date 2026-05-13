import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { addToCart } from '@/app/actions/cart'

type Props = { params: Promise<{ id: string }> }

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, vendor:vendors(shop_name, description), category:categories(name)')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (!product) notFound()

  const vendor = product.vendor as { shop_name: string; description: string } | null
  const category = product.category as { name: string } | null

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-bold">Marketplace</Link>
          <Link href="/cart" className="text-sm text-zinc-600 hover:text-zinc-900">Cart</Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900">
          ← Back to products
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="size-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4">
            {category && (
              <span className="text-sm text-zinc-400">{category.name}</span>
            )}
            <h1 className="text-3xl font-bold leading-tight">{product.name}</h1>

            {vendor && (
              <p className="text-sm text-zinc-500">
                Sold by <span className="font-medium text-zinc-700">{vendor.shop_name}</span>
              </p>
            )}

            <p className="text-3xl font-bold">₮{product.price.toLocaleString()}</p>

            {product.description && (
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {product.description}
              </p>
            )}

            <p className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </p>

            {product.stock > 0 && (
              <form action={addToCart} className="flex flex-col gap-3">
                <input type="hidden" name="product_id" value={product.id} />

                <div className="flex items-center gap-3">
                  <label htmlFor="quantity" className="text-sm font-medium">Qty</label>
                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    max={product.stock}
                    defaultValue="1"
                    className="w-20 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>

                <button
                  type="submit"
                  className="h-11 rounded-xl bg-zinc-900 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
                >
                  Add to Cart
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
