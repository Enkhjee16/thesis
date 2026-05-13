import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// QPay calls this webhook after successful payment
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { payment_status, invoice_id } = body

  if (payment_status !== 'PAID' || !invoice_id) {
    return NextResponse.json({ message: 'ignored' })
  }

  const supabase = await createClient()

  await supabase
    .from('orders')
    .update({ payment_status: 'paid', status: 'processing' })
    .eq('qpay_invoice_id', invoice_id)

  return NextResponse.json({ message: 'ok' })
}
