const sanityClient = require('@sanity/client');

const testClient = sanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID 
          || process.env.SANITY_PROJECT_ID 
          || 'bushe0bq',
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET 
          || process.env.SANITY_DATASET 
          || 'production',
  apiVersion: '2022-03-10',
  useCdn: false,
  token: process.env.NEXT_PUBLIC_SANITY_TOKEN 
      || process.env.SANITY_API_TOKEN,
});

// ✅ sleep helper — required by waitForSubmission
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function querySubmissionByEmail(email) {
  // ✅ testClient.fetch() — not sanityClient.fetch()
  return testClient.fetch(
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

module.exports = { testClient, querySubmissionByEmail, waitForSubmission };