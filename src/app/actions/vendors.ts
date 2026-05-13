'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type VendorState = { error: string | null }

export async function createVendorProfile(
  prevState: VendorState,
  formData: FormData
): Promise<VendorState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const shopName = (formData.get('shop_name') as string)?.trim()
  if (!shopName) return { error: 'Shop name is required' }

  const { error } = await supabase.from('vendors').insert({
    user_id: user.id,
    shop_name: shopName,
    description: (formData.get('description') as string) || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/vendor')
  redirect('/dashboard/vendor')
}
