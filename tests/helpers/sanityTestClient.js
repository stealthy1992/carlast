const sanityClient = require('@sanity/client');

const testClient = sanityClient({
  // ✅ Read from env — never hardcode credentials
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID 
          || process.env.SANITY_PROJECT_ID 
          || 'bushe0bq',  // fallback only
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET 
          || process.env.SANITY_DATASET 
          || 'production',
  apiVersion: '2022-03-10',
  useCdn: false,          // ✅ Always false for tests — never serve stale CDN data
  token: process.env.NEXT_PUBLIC_SANITY_TOKEN 
      || process.env.SANITY_API_TOKEN,
});

module.exports = { testClient };