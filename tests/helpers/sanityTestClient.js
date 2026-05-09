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

async function querySubmissionByEmail(email) {
  return sanityClient.fetch(
    `*[_type == "userForms" && email == $email] | order(_createdAt desc) [0]`,
    { email }
  );
}

async function waitForSubmission(email, timeoutMs = 10_000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const doc = await querySubmissionByEmail(email);
    if (doc) return doc;
    await sleep(1000);
  }

  throw new Error(`Submission for ${email} not found in Sanity within ${timeoutMs}ms`);
}

module.exports = { testClient, waitForSubmission };