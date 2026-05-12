import sanityClient from '@sanity/client'
import formidable from 'formidable'
import fs from 'fs'
import nodemailer from 'nodemailer'

export const config = {
  api: {
    bodyParser: false,
  },
}

const serverClient = sanityClient({
  projectId: 'bushe0bq',
  dataset: 'production',
  apiVersion: '2022-03-10',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

// ✅ Switch transporter based on ENABLE_TEST_EMAIL flag
// Production: real Gmail SMTP — emails reach real inboxes
// Test:       Ethereal SMTP  — emails are caught, never delivered
function createTransporter() {
  if (process.env.ENABLE_TEST_EMAIL === 'true') {
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.ETHEREAL_USER,
        pass: process.env.ETHEREAL_PASS,
      },
    })
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const form = formidable({ maxFileSize: 10 * 1024 * 1024 })

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ message: 'Error parsing form data' })
    }

    const customerName = fields.customerName?.[0] || fields.customerName
    const email        = fields.email?.[0]        || fields.email
    const carName      = fields.carName?.[0]      || fields.carName
    const rentDays     = fields.rentDays?.[0]     || fields.rentDays
    const file         = files.clearanceCertificate?.[0] || files.clearanceCertificate

    if (!customerName?.trim() || !email?.trim() || !carName || !rentDays || !file) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    try {
      const fileBuffer = fs.readFileSync(file.filepath)
      const uploadedAsset = await serverClient.assets.upload(
        file.mimetype?.includes('image') ? 'image' : 'file',
        fileBuffer,
        {
          filename: file.originalFilename,
          contentType: file.mimetype,
        }
      )

      const doc = await serverClient.create({
        _type: 'userForms',
        customerName: customerName.trim(),
        email: email.trim(),
        carName,
        rentDays: Number(rentDays),
        clearanceCertificate: {
          _type: 'file',
          asset: {
            _type: 'reference',
            _ref: uploadedAsset._id,
          },
        },
        submittedAt: new Date().toISOString(),
        status: 'pending',
      })

      // ✅ Create transporter and send email
      const transporter = createTransporter()
      const sentInfo = await transporter.sendMail({
        from: `"Car Rentals" <${process.env.GMAIL_USER}>`,
        to: email.trim(),
        subject: `Rent Application Received — ${carName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #333;">Application Received ✅</h2>
            <p>Hi <strong>${customerName.trim()}</strong>,</p>
            <p>We have received your rental application. Here's a summary:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr style="background: #f5f5f5;">
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Car</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${carName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Rent Days</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${rentDays} day(s)</td>
              </tr>
              <tr style="background: #f5f5f5;">
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Status</td>
                <td style="padding: 10px; border: 1px solid #ddd;">⏳ Pending Review</td>
              </tr>
            </table>
            <p>Our team will review your application and Police Clearance Certificate.</p>
            <p style="color: #888; font-size: 13px; margin-top: 32px;">This is an automated message. Please do not reply.</p>
          </div>
        `,
      })

      // ✅ previewUrl only exists in test mode — null in production
      // This does NOT break production since null is safely ignored
      const previewUrl = process.env.ENABLE_TEST_EMAIL === 'true'
        ? nodemailer.getTestMessageUrl(sentInfo)
        : null

      return res.status(200).json({
        success: true,
        documentId: doc._id,
        previewUrl,           // null in production, Ethereal URL in test
      })

    } catch (err) {
      console.error('Submission error:', err)
      return res.status(500).json({ message: 'Submission failed' })
    }
  })
}