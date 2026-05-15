import { createClient } from '@/lib/supabase/server'

const roleColors: Record<string, string> = {
  customer: 'bg-zinc-100 text-zinc-600',
  vendor: 'bg-blue-100 text-blue-700',
  admin: 'bg-purple-100 text-purple-700',
}

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Users</h1>

      {users && users.length > 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Name</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Email</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Phone</th>
                <th className="px-4 py-3 text-center font-medium text-zinc-600 dark:text-zinc-400">Role</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="px-4 py-3 font-medium">{user.full_name ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-600">{user.email}</td>
                  <td className="px-4 py-3 text-zinc-500">{user.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${roleColors[user.role] ?? ''}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-zinc-300 py-20 text-zinc-400 dark:border-zinc-700">
          No users found
        </div>
      )}
    </div>
  )
}
