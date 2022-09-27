export default {
    name: 'footerBanner',
    title: 'Footer Banner',
    type: 'document',
    fields: [
        {
            name: 'image',
            title: 'Image',
            type: 'image',
            options: {
                hotspot: true,
            },
        },
        {
            name: 'topLeftSmallText',
            title: 'Top Left Small Text',
            type: 'string',
        },
        {
            name: 'topLeftBigText',
            title: 'Top Left Big Text',
            type: 'string',
        },
        {
            name: 'bottomLeftBigText',
            title: 'Bottom Left Big Textt',
            type: 'string',
        },
        {
            name: 'bottomLeftSmallText',
            title: 'Bottom Left Small Text',
            type: 'string',
        },
        {
            name: 'topRightSmallText',
            title: 'Top Right Small Text',
            type: 'string',
        },
        {
            name: 'bottomRightSmallText',
            title: 'Bottom Right Small Text',
            type: 'string',
        },
        {
            name: 'buttonText',
            title: 'Button Text',
            type: 'string',
        },
    ],
  };