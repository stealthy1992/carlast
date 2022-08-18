export default {
  name: 'carsforsale',
  type: 'document',
	title: 'Cars For Sale',
  fields: [
    {
      name: 'name',
      type: 'string',
      title: 'Name'
    },
    
    {
        name: 'modelyear',
        type: 'number',
        title: 'Model Year',
    },
    {
        name: 'manufacturer',
        type: 'string',
        title: 'Manufacturer',
    },
    {
        name: 'registrationyear',
        type: 'number',
        title: 'Registration Year',
    },
    {
        name: 'mileage',
        type: 'number',
        title: 'Total Mileage',
    },
    {
        name: 'sittingcapacity',
        type: 'number',
        title: 'Sitting Capacity',
    },
    {
        name: 'color',
        type: 'string',
        title: 'Color',
    },
    {
        name: "transmission",
        title: "Transmission",
        // description: "Choose a category",
        type: "string",
        options: {
          layout: "radio",
          list: [
            { title: "Manual", value: "manual" },
            { title: "Automatic", value: "automatic" },
          ],
        },
        initialValue: "manual", // set initialValue's value to one of the `value`s in your list of radio items
      },
    {
        name: 'price',
        type: 'number',
        title: 'Price',
    },
    {
        name: 'images',
        type: 'array',
        title: 'Car Photos',
        of: [{type: 'image'}],
        options: {
            hotspot: true
        }
    },
    {
        name: 'description',
        type: 'string',
        title: 'Car Description',
    },
    {
        name: 'slug',
        type: 'slug',
        title: 'Slug',
        options: {
            source: 'name',
            maxLenght: 80
        }
    }

  ]

}