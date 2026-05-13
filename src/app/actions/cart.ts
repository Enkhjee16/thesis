'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function addToCart(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const productId = formData.get('product_id') as string
  const quantity = parseInt(formData.get('quantity') as string) || 1

  const { data: existing } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single()

  if (existing) {
    await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id)
  } else {
    await supabase
      .from('cart_items')
      .insert({ user_id: user.id, product_id: productId, quantity })
  }

  revalidatePath('/cart')
  redirect('/cart')
}

export async function updateCartItem(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const quantity = parseInt(formData.get('quantity') as string)

  if (quantity < 1) {
    await supabase.from('cart_items').delete().eq('id', id)
  } else {
    await supabase.from('cart_items').update({ quantity }).eq('id', id)
  }

  revalidatePath('/cart')
}

export async function removeFromCart(id: string, formData: FormData) {
  const supabase = await createClient()
  await supabase.from('cart_items').delete().eq('id', id)
  revalidatePath('/cart')
}
