import nodemailer from 'nodemailer'

// Nodemailer transporter — Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // --- Security: verify the shared secret sent by the Sanity webhook ---
  const secret = req.headers['x-webhook-secret']
  if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  // Sanity webhook delivers the full document in req.body
  const { customerName, email, carName, rentDays, status, reason } = req.body

  // Only act on approved or declined — ignore any other saves (e.g. status: 'pending')
  if (status !== 'approved' && status !== 'declined') {
    return res.status(200).json({ message: 'No action needed for this status' })
  }

  if (!email || !customerName || !carName) {
    return res.status(400).json({ message: 'Missing required fields in webhook payload' })
  }

  const isApproved   = status === 'approved'
  const statusLabel  = isApproved ? '✅ Approved' : '❌ Declined'
  const statusColor  = isApproved ? '#2e7d32' : '#c62828'
  const statusBg     = isApproved ? '#e8f5e9' : '#ffebee'

  try {
    await transporter.sendMail({
      from: `"Car Rentals" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Your Rent Application has been ${isApproved ? 'Approved' : 'Declined'} — ${carName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: ${statusColor};">Application ${isApproved ? 'Approved' : 'Declined'} ${isApproved ? '✅' : '❌'}</h2>
          <p>Hi <strong>${customerName}</strong>,</p>
          <p>We have reviewed your rental application. Here is the update:</p>

          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr style="background: #f5f5f5;">
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Car</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${carName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Rent Days</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${rentDays} day(s)</td>
            </tr>
            <tr style="background: ${statusBg};">
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Status</td>
              <td style="padding: 10px; border: 1px solid #ddd; color: ${statusColor}; font-weight: bold;">${statusLabel}</td>
            </tr>
          </table>

          ${reason ? `
          <div style="margin: 20px 0; padding: 16px; background: #f9f9f9; border-left: 4px solid ${statusColor}; border-radius: 4px;">
            <p style="margin: 0 0 8px 0; font-weight: bold; color: #333;">Message from our team:</p>
            <p style="margin: 0; color: #555;">${reason}</p>
          </div>
          ` : ''}

          ${isApproved
            ? '<p>Please visit our office with your original Police Clearance Certificate to complete the rental process.</p>'
            : '<p>If you have questions about this decision, please contact us directly.</p>'
          }

          <p style="color: #888; font-size: 13px; margin-top: 32px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      `,
    })

    return res.status(200).json({ message: 'Email sent successfully' })

  } catch (err) {
    console.error('Notify customer error:', err)
    return res.status(500).json({ message: 'Failed to send email' })
  }
}
