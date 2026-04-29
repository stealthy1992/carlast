const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET    = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const API_TOKEN = process.env.NEXT_PUBLIC_SANITY_TOKEN;
const API_VER = '2021-10-21';

// console.log('ENV CHECK:');
// console.log('PROJECT_ID:', PROJECT_ID ?? 'UNDEFINED ❌');
// console.log('DATASET:',    DATASET    ?? 'UNDEFINED ❌');
// console.log('API_TOKEN:',  API_TOKEN  ? 'SET ✅' : 'NOT SET ⚠️');

if (!PROJECT_ID) throw new Error('SANITY_PROJECT_ID is not set');
if (!DATASET)    throw new Error('SANITY_DATASET is not set');

const SCHEMA_TYPES = {
  sale: 'carsforsale',   // ← confirmed from your schema
  rent: 'carsforrent',   // ← confirmed from getStaticPaths()
};

const PROJECTIONS = {
  carsforsale: `{
        _id,
        name,
        modelyear,
        manufacturer,
        registrationyear,
        mileage,
        sittingcapacity,
        color,
        transmission,
        price,
        images,
        description,
        slug,
        "images":images[]{"_ref":asset._ref}}
    }`,

    carsforrent: `{
        _id,
        name,
        modelyear,
        manufacturer,
        registrationyear,
        mileage,
        sittingcapacity,
        color,
        transmission,
        rentperday,
        images,
        description,
        slug,
        "images":images[]{"_ref":asset._ref}}
    }`,
};

// Valid categories — used to guard against typos in test files
const VALID_CATEGORIES = Object.keys(PROJECTIONS); // ['sale', 'rent']

async function fetchCars(request, category) {

    // console.log('call received');
      // Guard — catch wrong category strings early with a helpful message
    // if (!VALID_CATEGORIES.includes(category)) {
    //     throw new Error(
    //     `Invalid category "${category}". Must be one of: ${VALID_CATEGORIES.join(', ')}`
    //     );
    // }

    // Pick the right projection for this category
    const projection = PROJECTIONS[category];
    const schemaType = SCHEMA_TYPES[category]; 

    const query = encodeURIComponent(
      `*[_type == "${schemaType}"]`
    );
    const url      = `https://${PROJECT_ID}.api.sanity.io/v${API_VER}/data/query/${DATASET}?query=${query}`;

    //Printing all the values prior to sending request

    // const rawQuery = `*[_type == "${schemaType}"]`;

    // console.log('--- DEBUG ---');
    // console.log('PROJECT_ID:', PROJECT_ID);
    // console.log('DATASET:',    DATASET);
    // console.log('API_VER:',    API_VER);
    // console.log('schemaType:', schemaType);
    // console.log('Raw query:',  rawQuery);
    // console.log('Encoded:',    encodeURIComponent(rawQuery));
    // console.log('Full URL:',   `https://${PROJECT_ID}.api.sanity.io/v${API_VER}/data/query/${DATASET}?query=${encodeURIComponent(rawQuery)}`);
    // console.log('-------------');
    
    //Printing ends

    const response = await request.get(url, {
        headers: {
            ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` })
          }
    });

    if (!response.ok()) {
        throw new Error(
          `Sanity API request failed: ${response.status()} ${response.statusText()}`
        );
      }


    const { result } = await response.json();
    return result;
  }

  function refToUrl(ref) {
    console.log('Image reference is: ',ref);
    if (!ref) return null;
  
    // _ref format: image-{assetId}-{dimensions}-{extension}
    const withoutPrefix = ref.replace('image-', '');         // "fea05cad-3345x2040-jpg"
    const parts         = withoutPrefix.split('-');           // ["fea05cad", "3345x2040", "jpg"]
    const extension     = parts.pop();                        // "jpg"  ← last part
    const rest          = parts.join('-');                    // "fea05cad-3345x2040"
  
    return `https://cdn.sanity.io/images/${PROJECT_ID}/${DATASET}/${rest}.${extension}`;
  }

  async function fetchCarsForSale(request) {
    return fetchCars(request, 'sale');
  }
  
  async function fetchCarsForRent(request) {
    return fetchCars(request, 'rent');
  }
  
  module.exports = { fetchCarsForSale, fetchCarsForRent, refToUrl};