'use client'

import { useState } from 'react'
import Image from 'next/image'

export function PayWithQPay({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false)
  const [invoice, setInvoice] = useState<{
    invoice_id: string
    qr_image?: string
    urls?: { name: string; link: string; logo: string }[]
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [paid, setPaid] = useState(false)

  async function handlePay() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/payment/qpay/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'QPay error')
      setInvoice(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invoice')
    } finally {
      setLoading(false)
    }
  }

  async function handleCheckPayment() {
    if (!invoice) return
    setChecking(true)
    try {
      const res = await fetch(`/api/payment/qpay/check/${invoice.invoice_id}`)
      const data = await res.json()
      if (data.paid) {
        setPaid(true)
        window.location.reload()
      } else {
        setError('Payment not confirmed yet. Please try again after paying.')
      }
    } catch {
      setError('Failed to check payment status')
    } finally {
      setChecking(false)
    }
  }

  if (paid) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center text-sm text-green-700">
        Payment confirmed!
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="font-semibold">Pay with QPay</h2>

      {!invoice ? (
        <>
          <p className="mt-2 text-sm text-zinc-500">
            Scan the QR code or open the QPay app to complete your payment.
          </p>
          <button
            onClick={handlePay}
            disabled={loading}
            className="mt-4 h-10 w-full rounded-lg bg-zinc-900 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900"
          >
            {loading ? 'Generating…' : 'Generate QPay Invoice'}
          </button>
        </>
      ) : (
        <div className="mt-4 space-y-4">
          {invoice.qr_image && (
            <div className="flex justify-center">
              <Image
                src={`data:image/png;base64,${invoice.qr_image}`}
                alt="QPay QR Code"
                width={200}
                height={200}
                className="rounded-lg"
              />
            </div>
          )}

          {invoice.urls && invoice.urls.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-zinc-500 text-center">Or open with:</p>
              {invoice.urls.map((url) => (
                <a
                  key={url.name}
                  href={url.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  {url.logo && (
                    <Image src={url.logo} alt={url.name} width={20} height={20} className="rounded" />
                  )}
                  {url.name}
                </a>
              ))}
            </div>
          )}

          <button
            onClick={handleCheckPayment}
            disabled={checking}
            className="h-9 w-full rounded-lg border border-zinc-300 text-sm transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            {checking ? 'Checking…' : 'I have paid — Check Status'}
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
    </div>
  )
}
