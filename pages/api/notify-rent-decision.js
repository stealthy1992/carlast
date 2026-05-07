import { Resend } from 'resend'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

// Verify the request genuinely came from Sanity
function verifySignature(req, rawBody) {
  const signature = req.headers['sanity-webhook-signature']
  if (!signature) return false

  const [, ts, , v1] = signature.match(/t=(\d+),.*v1=([a-f0-9]+)/) || []
  if (!ts || !v1) return false

  const computedSig = crypto
    .createHmac('sha256', process.env.SANITY_WEBHOOK_SECRET)
    .update(`${ts}.${rawBody}`)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(computedSig, 'hex'),
    Buffer.from(v1, 'hex')
  )
}

export const config = {
  api: { bodyParser: false },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // Read raw body for signature verification
  const rawBody = await new Promise((resolve, reject) => {
    let data = ''
    req.on('data', chunk => (data += chunk))
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })

  if (!verifySignature(req, rawBody)) {
    return res.status(401).json({ message: 'Invalid signature' })
  }

  const payload = JSON.parse(rawBody)

  const { status, reason, email, customerName, carName, rentDays } = payload

  // Only send email when status is a final decision
  if (status !== 'approved' && status !== 'declined') {
    return res.status(200).json({ message: 'No action needed' })
  }

  // Guard: reason must be present (belt-and-suspenders beyond schema validation)
  if (!reason?.trim()) {
    return res.status(400).json({ message: 'Reason is required before sending decision email' })
  }

  const isApproved = status === 'approved'
  const statusLabel = isApproved ? 'Approved ✅' : 'Declined ❌'
  const statusColor = isApproved ? '#16a34a' : '#dc2626'

  try {
    await resend.emails.send({
      from: 'CarLast <noreply@yourdomain.com>', // replace with your verified Resend domain
      to: email,
      subject: `Your Car Rental Request has been ${statusLabel} — CarLast`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h1 style="color: #111827; font-size: 24px; margin-bottom: 4px;">CarLast Rental Request Update</h1>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />

          <p style="color: #374151; font-size: 16px;">Dear <strong>${customerName}</strong>,</p>

          <p style="color: #374151; font-size: 16px;">
            Your rental request for <strong>${carName}</strong> (${rentDays} day${rentDays > 1 ? 's' : ''}) 
            has been reviewed by our team.
          </p>

          <div style="background: #f9fafb; border-left: 4px solid ${statusColor}; padding: 16px; border-radius: 4px; margin: 24px 0;">
            <p style="margin: 0; font-size: 18px; font-weight: bold; color: ${statusColor};">
              Status: ${statusLabel}
            </p>
          </div>

          <div style="margin: 24px 0;">
            <p style="color: #374151; font-size: 16px; font-weight: bold; margin-bottom: 8px;">Reason:</p>
            <p style="color: #374151; font-size: 15px; background: #f3f4f6; padding: 12px; border-radius: 4px;">
              ${reason}
            </p>
          </div>

          ${isApproved ? `
          <p style="color: #374151; font-size: 15px;">
            Please contact us to confirm pickup arrangements and complete any remaining formalities.
          </p>
          ` : `
          <p style="color: #374151; font-size: 15px;">
            You are welcome to submit a new application or contact us if you have any questions.
          </p>
          `}

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 13px;">
            This is an automated message from CarLast. Please do not reply to this email.
          </p>
        </div>
      `,
    })

    return res.status(200).json({ message: 'Email sent successfully' })

  } catch (err) {
    console.error('Resend error:', err)
    return res.status(500).json({ message: 'Failed to send email' })
  }
}