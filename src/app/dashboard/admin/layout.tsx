import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'

const navLinks = [
  { href: '/dashboard/admin', label: 'Overview' },
  { href: '/dashboard/admin/vendors', label: 'Vendors' },
  { href: '/dashboard/admin/users', label: 'Users' },
  { href: '/dashboard/admin/orders', label: 'Orders' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex h-full flex-col">
          <div className="border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
            <Link href="/" className="text-sm font-bold">Marketplace</Link>
            <p className="mt-0.5 text-xs text-zinc-500">Admin Panel</p>
          </div>

          <nav className="flex-1 space-y-0.5 p-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center rounded-lg px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
            <p className="mb-2 truncate px-3 text-xs text-zinc-500">{profile?.full_name}</p>
            <form action={logout}>
              <button
                type="submit"
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main className="flex-1 bg-zinc-50 dark:bg-zinc-950">{children}</main>
    </div>
  )
}
