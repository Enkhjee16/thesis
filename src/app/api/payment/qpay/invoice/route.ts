import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createQPayInvoice } from '@/lib/qpay'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orderId } = await req.json()
  if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 })

  const { data: order } = await supabase
    .from('orders')
    .select('id, total_amount, qpay_invoice_id, customer_id')
    .eq('id', orderId)
    .single()

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (order.customer_id !== user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Return existing invoice if already created
  if (order.qpay_invoice_id) {
    return NextResponse.json({ invoice_id: order.qpay_invoice_id, cached: true })
  }

  const callbackUrl = new URL('/api/payment/qpay/callback', req.url).toString()

  try {
    const invoice = await createQPayInvoice(
      orderId,
      order.total_amount,
      `Order #${orderId.slice(0, 8)}`,
      callbackUrl
    )

    // Save invoice ID to order
    await supabase
      .from('orders')
      .update({ qpay_invoice_id: invoice.invoice_id })
      .eq('id', orderId)

    return NextResponse.json(invoice)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'QPay error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
