'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function placeOrder() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch cart with product + vendor info
  const { data: cartItems } = await supabase
    .from('cart_items')
    .select('*, product:products(id, price, stock, vendor_id)')
    .eq('user_id', user.id)

  if (!cartItems || cartItems.length === 0) redirect('/cart')

  // Group cart items by vendor
  const byVendor = new Map<string, typeof cartItems>()
  for (const item of cartItems) {
    const vendorId = (item.product as { vendor_id: string }).vendor_id
    if (!byVendor.has(vendorId)) byVendor.set(vendorId, [])
    byVendor.get(vendorId)!.push(item)
  }

  const createdOrderIds: string[] = []

  for (const [vendorId, items] of byVendor) {
    const total = items.reduce((sum, item) => {
      const price = (item.product as { price: number }).price
      return sum + price * item.quantity
    }, 0)

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: user.id,
        vendor_id: vendorId,
        total_amount: total,
      })
      .select('id')
      .single()

    if (orderError || !order) continue

    // Create order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: (item.product as { id: string }).id,
      quantity: item.quantity,
      unit_price: (item.product as { price: number }).price,
    }))

    await supabase.from('order_items').insert(orderItems)
    createdOrderIds.push(order.id)
  }

  // Clear cart
  await supabase.from('cart_items').delete().eq('user_id', user.id)

  revalidatePath('/orders')

  // Redirect to first order for payment
  if (createdOrderIds.length === 1) {
    redirect(`/orders/${createdOrderIds[0]}`)
  }
  redirect('/orders')
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient()
  await supabase.from('orders').update({ status }).eq('id', orderId)
  revalidatePath(`/dashboard/vendor/orders`)
  revalidatePath(`/orders/${orderId}`)
}
