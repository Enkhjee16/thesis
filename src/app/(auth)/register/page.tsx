'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { register } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

const inputClass =
  'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-zinc-700'

export default function RegisterPage() {
  const [state, action, pending] = useActionState(register, { error: null })

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
        <p className="mt-1 text-sm text-zinc-500">Join our marketplace</p>
      </div>

      <form action={action} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="full_name" className="text-sm font-medium">
            Full Name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            autoComplete="name"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            minLength={6}
            className={inputClass}
          />
          <p className="text-xs text-zinc-400">Minimum 6 characters</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Account Type</label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-zinc-300 px-3 py-2.5 text-sm has-[:checked]:border-zinc-900 has-[:checked]:bg-zinc-50 dark:has-[:checked]:border-zinc-100 dark:has-[:checked]:bg-zinc-800">
              <input
                type="radio"
                name="role"
                value="customer"
                defaultChecked
                className="accent-zinc-900"
              />
              <span>Customer</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-zinc-300 px-3 py-2.5 text-sm has-[:checked]:border-zinc-900 has-[:checked]:bg-zinc-50 dark:has-[:checked]:border-zinc-100 dark:has-[:checked]:bg-zinc-800">
              <input
                type="radio"
                name="role"
                value="vendor"
                className="accent-zinc-900"
              />
              <span>Vendor</span>
            </label>
          </div>
          <p className="text-xs text-zinc-400">
            Vendors require admin approval before selling.
          </p>
        </div>

        {state?.error && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}

        <Button
          type="submit"
          disabled={pending}
          className="mt-2 h-10 w-full text-sm"
        >
          {pending ? 'Creating account…' : 'Create Account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-zinc-900 hover:underline dark:text-zinc-100"
        >
          Sign In
        </Link>
      </p>
    </div>
  )
}
