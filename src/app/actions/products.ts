'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type ProductState = { error: string | null }

export async function createProduct(
  prevState: ProductState,
  formData: FormData
): Promise<ProductState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id, status')
    .eq('user_id', user.id)
    .single()

  if (!vendor) return { error: 'Vendor profile not found' }
  if (vendor.status !== 'approved') return { error: 'Your account is pending approval' }

  const name = (formData.get('name') as string)?.trim()
  const price = parseFloat(formData.get('price') as string)
  const stock = parseInt(formData.get('stock') as string)

  if (!name || isNaN(price) || isNaN(stock)) {
    return { error: 'Name, price, and stock are required' }
  }

  const { error } = await supabase.from('products').insert({
    vendor_id: vendor.id,
    name,
    description: (formData.get('description') as string) || null,
    price,
    stock,
    category_id: (formData.get('category_id') as string) || null,
    image_url: (formData.get('image_url') as string) || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/vendor/products')
  redirect('/dashboard/vendor/products')
}

export async function updateProduct(
  id: string,
  prevState: ProductState,
  formData: FormData
): Promise<ProductState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!vendor) return { error: 'Vendor profile not found' }

  const name = (formData.get('name') as string)?.trim()
  const price = parseFloat(formData.get('price') as string)
  const stock = parseInt(formData.get('stock') as string)

  if (!name || isNaN(price) || isNaN(stock)) {
    return { error: 'Name, price, and stock are required' }
  }

  const { error } = await supabase
    .from('products')
    .update({
      name,
      description: (formData.get('description') as string) || null,
      price,
      stock,
      category_id: (formData.get('category_id') as string) || null,
      image_url: (formData.get('image_url') as string) || null,
    })
    .eq('id', id)
    .eq('vendor_id', vendor.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/vendor/products')
  redirect('/dashboard/vendor/products')
}

export async function deleteProduct(id: string, formData: FormData) {
  const supabase = await createClient()
  await supabase.from('products').delete().eq('id', id)
  revalidatePath('/dashboard/vendor/products')
}

export async function toggleProductActive(id: string, isActive: boolean) {
  const supabase = await createClient()
  await supabase.from('products').update({ is_active: isActive }).eq('id', id)
  revalidatePath('/dashboard/vendor/products')
}
