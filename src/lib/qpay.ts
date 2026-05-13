const QPAY_URL = process.env.QPAY_URL!
const QPAY_USERNAME = process.env.QPAY_USERNAME!
const QPAY_PASSWORD = process.env.QPAY_PASSWORD!
const QPAY_INVOICE_CODE = process.env.QPAY_INVOICE_CODE!

async function getAccessToken(): Promise<string> {
  const res = await fetch(`${QPAY_URL}/auth/token`, {
    method: 'POST',
    headers: {
      Authorization:
        'Basic ' + Buffer.from(`${QPAY_USERNAME}:${QPAY_PASSWORD}`).toString('base64'),
    },
  })
  if (!res.ok) throw new Error('QPay auth failed')
  const data = await res.json()
  return data.access_token
}

export interface QPayInvoice {
  invoice_id: string
  qr_text: string
  qr_image: string // base64 PNG
  urls: { name: string; description: string; logo: string; link: string }[]
}

export async function createQPayInvoice(
  orderId: string,
  amount: number,
  description: string,
  callbackUrl: string
): Promise<QPayInvoice> {
  const token = await getAccessToken()

  const res = await fetch(`${QPAY_URL}/invoice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      invoice_code: QPAY_INVOICE_CODE,
      sender_invoice_no: orderId,
      invoice_receiver_code: 'terminal',
      invoice_description: description,
      amount: Math.round(amount),
      callback_url: callbackUrl,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`QPay invoice creation failed: ${err}`)
  }

  return res.json()
}

export async function checkQPayPayment(invoiceId: string): Promise<boolean> {
  const token = await getAccessToken()

  const res = await fetch(`${QPAY_URL}/payment/check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      object_type: 'INVOICE',
      object_id: invoiceId,
      offset: { page_number: 1, page_limit: 1 },
    }),
  })

  if (!res.ok) return false
  const data = await res.json()
  return data.count > 0
}
