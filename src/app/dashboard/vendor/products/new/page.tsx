'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createProduct } from '@/app/actions/products'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/types'

const inputClass =
  'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800'

export default function NewProductPage() {
  const [state, action, pending] = useActionState(createProduct, { error: null })
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('categories')
      .select('*')
      .order('name')
      .then(({ data }) => setCategories(data ?? []))
  }, [])

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href="/dashboard/vendor/products"
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          ← Back to products
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Add Product</h1>
      </div>

      <div className="max-w-lg rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input id="name" name="name" type="text" required className={inputClass} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="price" className="text-sm font-medium">
                Price (₮) <span className="text-red-500">*</span>
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="1"
                required
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="stock" className="text-sm font-medium">
                Stock <span className="text-red-500">*</span>
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                required
                defaultValue="1"
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="category_id" className="text-sm font-medium">
              Category
            </label>
            <select id="category_id" name="category_id" className={inputClass}>
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="image_url" className="text-sm font-medium">
              Image URL
            </label>
            <input
              id="image_url"
              name="image_url"
              type="url"
              placeholder="https://…"
              className={inputClass}
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={pending}
              className="h-9 flex-1 rounded-lg bg-zinc-900 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900"
            >
              {pending ? 'Saving…' : 'Save Product'}
            </button>
            <Link
              href="/dashboard/vendor/products"
              className="inline-flex h-9 items-center rounded-lg border border-zinc-300 px-4 text-sm transition hover:bg-zinc-50 dark:border-zinc-700"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
