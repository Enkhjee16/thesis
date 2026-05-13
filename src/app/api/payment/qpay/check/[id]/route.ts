import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkQPayPayment } from '@/lib/qpay'

type Props = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Props) {
  const { id: invoiceId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const isPaid = await checkQPayPayment(invoiceId)

    if (isPaid) {
      await supabase
        .from('orders')
        .update({ payment_status: 'paid', status: 'processing' })
        .eq('qpay_invoice_id', invoiceId)
    }

    return NextResponse.json({ paid: isPaid })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Check failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
