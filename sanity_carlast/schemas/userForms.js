export default {
  name: 'userForms',
  type: 'document',
  title: 'User Forms',
  // Make all fields read-only via __experimental_actions
  __experimental_actions: ['update', 'publish', 'delete'], // no 'create' from Studio UI
  fields: [
    {
      name: 'customerName',
      type: 'string',
      title: 'Full Name',
      readOnly: true,
    },
    {
      name: 'phone',
      type: 'string',
      title: 'Phone Number',
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
      options: {
        layout: 'radio',
        list: [
          { title: '⏳ Pending', value: 'pending' },
          { title: '✅ Approved', value: 'approved' },
          { title: '❌ Declined', value: 'declined' },
        ],
      },
      // status is the ONLY editable field — no readOnly here
    },
  ],
  preview: {
    select: {
      title: 'customerName',
      subtitle: 'carName',
      status: 'status',
    },
    prepare({ title, subtitle, status }) {
      const icon = status === 'approved' ? '✅' : status === 'declined' ? '❌' : '⏳';
      return {
        title: `${icon} ${title}`,
        subtitle,
      };
    },
  },
};