'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type AuthState = { error: string | null }

export async function login(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient()

  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Something went wrong. Please try again.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'admin') redirect('/dashboard/admin')
  if (profile?.role === 'vendor') redirect('/dashboard/vendor')
  redirect('/')
}

export async function register(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient()

  const fullName = (formData.get('full_name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string
  const role = (formData.get('role') as string) || 'customer'

  if (!fullName || !email || !password) {
    return { error: 'All fields are required' }
  }
  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role } },
  })

  if (error) return { error: error.message }

  // If email confirmation is enabled, session will be null
  if (!data.session) {
    redirect('/login?message=Check your email to confirm your account')
  }

  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
