export default {
  name: 'userForms',
  type: 'document',
  title: 'User Forms',
  __experimental_actions: ['update', 'publish', 'delete'],
  fields: [
    {
      name: 'customerName',
      type: 'string',
      title: 'Full Name',
      readOnly: true,
    },
    {
      name: 'email',
      type: 'string',
      title: 'Email Address',
      readOnly: true,
    },
    {
      name: 'carName',
      type: 'string',
      title: 'Car Name',
      readOnly: true,
    },
    {
      name: 'rentDays',
      type: 'number',
      title: 'Rent Days',
      readOnly: true,
    },
    {
      name: 'clearanceCertificate',
      type: 'file',
      title: 'Police Clearance Certificate',
      readOnly: true,
      options: {
        accept: '.pdf,.jpg,.jpeg,.png'
      }
    },
    {
      name: 'submittedAt',
      type: 'datetime',
      title: 'Submitted At',
      readOnly: true,
    },
    {
      name: 'status',
      type: 'string',
      title: 'Application Status',
      initialValue: 'pending',
      readOnly: ({ document }) =>
        document?.applicationStatus === 'approved' ||
        document?.applicationStatus === 'declined',
        options: {
            list: [
            { title: '🔲 Pending',  value: 'pending'  },
            { title: '✅ Approved', value: 'approved' },
            { title: '❌ Declined', value: 'declined' },
            ],
            layout: 'radio',
        },
    },
    {
    name: 'reason',
    type: 'text',
    title: 'Reason (mandatory before approving/declining)',
    description: 'This message will be emailed directly to the customer. Required.',
    rows: 4,
    readOnly: ({ document }) =>
        document?.status === 'approved' ||
        document?.status === 'declined',
    validation: Rule => Rule.custom((reason, context) => {
        const status = context.document?.status
        if ((status === 'approved' || status === 'declined') && !reason?.trim()) {
        return 'You must provide a reason before approving or declining.'
        }
        return true
    }),
    },
  ],
  preview: {
    select: {
      title: 'customerName',
      subtitle: 'carName',
      status: 'status',
    },
    prepare({ title, subtitle, status }) {
      const icon = status === 'approved' ? '✅' : status === 'declined' ? '❌' : '⏳'
      return {
        title: `${icon} ${title}`,
        subtitle,
      }
    },
  },
}