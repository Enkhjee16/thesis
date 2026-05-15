'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')
  return supabase
}

export async function setVendorStatus(vendorId: string, status: 'approved' | 'rejected', _formData: FormData) {
  const supabase = await requireAdmin()
  await supabase.from('vendors').update({ status }).eq('id', vendorId)
  revalidatePath('/dashboard/admin/vendors')
}

export async function setOrderStatus(orderId: string, status: string, _formData: FormData) {
  const supabase = await requireAdmin()
  await supabase.from('orders').update({ status }).eq('id', orderId)
  revalidatePath('/dashboard/admin/orders')
}
