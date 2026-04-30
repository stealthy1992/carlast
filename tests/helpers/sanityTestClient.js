const sanityClient = require('@sanity/client')

const testClient = sanityClient({
    projectId: 'bushe0bq',
    dataset: 'production',
    apiVersion: '2022-03-10',
    useCdn: false,  // ← false for testing
    token: process.env.NEXT_PUBLIC_SANITY_TOKEN
})

module.exports = { testClient }