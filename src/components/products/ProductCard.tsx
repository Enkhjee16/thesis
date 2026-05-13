import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/types'

type Props = {
  product: Product & { vendor?: { shop_name: string }; category?: { name: string } }
}

export function ProductCard({ product }: Props) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col rounded-xl border border-zinc-200 bg-white overflow-hidden transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-800">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-300 dark:text-zinc-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        {product.stock === 0 && (
          <span className="absolute top-2 left-2 rounded bg-zinc-800 px-2 py-0.5 text-xs text-white">
            Out of stock
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1 p-3">
        {product.category && (
          <span className="text-xs text-zinc-400">{product.category.name}</span>
        )}
        <p className="font-medium text-sm leading-snug line-clamp-2">{product.name}</p>
        {product.vendor && (
          <p className="text-xs text-zinc-500">{product.vendor.shop_name}</p>
        )}
        <p className="mt-1 font-semibold text-sm">
          ₮{product.price.toLocaleString()}
        </p>
      </div>
    </Link>
  )
}
