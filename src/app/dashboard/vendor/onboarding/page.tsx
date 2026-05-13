'use client'

import { useActionState } from 'react'
import { createVendorProfile } from '@/app/actions/vendors'

const inputClass =
  'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800'

export default function VendorOnboardingPage() {
  const [state, action, pending] = useActionState(createVendorProfile, { error: null })

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Set up your shop</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Complete your vendor profile to start selling. An admin will review and approve your shop.
          </p>
        </div>

        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="shop_name" className="text-sm font-medium">
              Shop Name <span className="text-red-500">*</span>
            </label>
            <input
              id="shop_name"
              name="shop_name"
              type="text"
              required
              placeholder="e.g. Enkhjee's Store"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Describe what you sell…"
              className={`${inputClass} resize-none`}
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="h-10 w-full rounded-lg bg-zinc-900 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900"
          >
            {pending ? 'Submitting…' : 'Submit for Approval'}
          </button>
        </form>
      </div>
    </div>
  )
}
