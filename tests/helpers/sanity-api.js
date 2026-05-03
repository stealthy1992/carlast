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

// ✅ Projections removed from the URL query string entirely.
// Sanity's REST API struggles with complex projections containing
// nested braces and quoted keys when URL-encoded in a GET query param.
// Instead we fetch all fields (*) and let the test files work with
// the full document — this is simpler and never causes 400 errors.
// If you want field filtering, use Sanity's POST query endpoint instead.

async function fetchCars(request, category) {
  const schemaType = SCHEMA_TYPES[category];

  // ✅ Simple query — no projection, no nested braces, no encoding issues
  const rawQuery = `*[_type == "${schemaType}"]`;
  const query    = encodeURIComponent(rawQuery);

  // ✅ Always api.sanity.io — never CDN — for test freshness
  const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VER}/data/query/${DATASET}?query=${query}`;

  // Uncomment to debug on Jenkins if 400 errors return:
  // console.log('Fetching URL:', url);

  const response = await request.get(url, {
    headers: {
      ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` })
    }
  });

  if (!response.ok()) {
    // ✅ Log the full response body so you can see exactly what Sanity rejected
    let body = '';
    try { body = await response.text(); } catch(e) {}
    throw new Error(
      `Sanity API error: ${response.status()} ${response.statusText()} — ${body}`
    );
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

async function fetchCarsForSale(request) { return fetchCars(request, 'sale'); }
async function fetchCarsForRent(request) { return fetchCars(request, 'rent'); }

module.exports = { fetchCarsForSale, fetchCarsForRent, refToUrl };