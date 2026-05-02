const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID 
                || process.env.SANITY_PROJECT_ID;
const DATASET    = process.env.NEXT_PUBLIC_SANITY_DATASET 
                || process.env.SANITY_DATASET 
                || 'production';
const API_TOKEN  = process.env.NEXT_PUBLIC_SANITY_TOKEN 
                || process.env.SANITY_API_TOKEN;
const API_VER    = '2021-10-21';

if (!PROJECT_ID) throw new Error('SANITY_PROJECT_ID is not set');
if (!DATASET)    throw new Error('SANITY_DATASET is not set');

const SCHEMA_TYPES = {
  sale: 'carsforsale',
  rent: 'carsforrent',
};

const PROJECTIONS = {
  carsforsale: `{
    _id, name, modelyear, manufacturer, registrationyear,
    mileage, sittingcapacity, color, transmission, price,
    description, slug,
    "images": images[]{ "_ref": asset._ref }
  }`,
  carsforrent: `{
    _id, name, modelyear, manufacturer, registrationyear,
    mileage, sittingcapacity, color, transmission, rent,
    description, slug,
    "images": images[]{ "_ref": asset._ref }
  }`,
};

async function fetchCars(request, category) {
  const schemaType = SCHEMA_TYPES[category];
  const projection = PROJECTIONS[category];

  const query    = encodeURIComponent(`*[_type == "${schemaType}"] ${projection}`);
  // ✅ Always api.sanity.io — never CDN — for test freshness
  const url      = `https://${PROJECT_ID}.api.sanity.io/v${API_VER}/data/query/${DATASET}?query=${query}`;

  const response = await request.get(url, {
    headers: {
      ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` })
    }
  });

  if (!response.ok()) {
    throw new Error(`Sanity API error: ${response.status()} ${response.statusText()}`);
  }

  const { result } = await response.json();
  return result;
}

function refToUrl(ref) {
  if (!ref) return null;
  const withoutPrefix = ref.replace('image-', '');
  const parts         = withoutPrefix.split('-');
  const extension     = parts.pop();
  const rest          = parts.join('-');
  return `https://cdn.sanity.io/images/${PROJECT_ID}/${DATASET}/${rest}.${extension}`;
}

async function fetchCarsForSale(request)  { return fetchCars(request, 'sale'); }
async function fetchCarsForRent(request)  { return fetchCars(request, 'rent'); }

module.exports = { fetchCarsForSale, fetchCarsForRent, refToUrl };