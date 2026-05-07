import sanityClient from '@sanity/client'

// This client uses a server-only token — NOT prefixed with NEXT_PUBLIC_
const serverClient = sanityClient({
  projectId: 'bushe0bq',
  dataset: 'production',
  apiVersion: '2022-03-10',
  token: process.env.SANITY_WRITE_TOKEN,  // server-side only
  useCdn: false,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { customerName, phone, carName, rentDays } = req.body

  if (!customerName?.trim() || !phone?.trim() || !carName || !rentDays) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  try {
    await serverClient.create({
      _type: 'userForms',
      customerName: customerName.trim(),
      phone: phone.trim(),
      carName,
      rentDays: Number(rentDays),
      submittedAt: new Date().toISOString(),
      status: 'pending',
    })

    return res.status(200).json({ message: 'Submission successful' })

  } catch (err) {
    console.error('Sanity write error:', err)
    return res.status(500).json({ message: 'Submission failed' })
  }
}