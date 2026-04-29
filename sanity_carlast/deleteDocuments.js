const sanityClient = require('@sanity/client');

const client = sanityClient({
    projectId: 'bushe0bq',   // find in sanity.config.js or sanity.cli.js
    dataset: 'production',
    token: 'skvvV1flkMD5Vfj6daS3aMtOxhx6y2NhfhHGF5Z4UnpiJFoRi7lN1rqqmbLRu0mxkanumArzYYbiAe6DThPnMglGshGM9f8bHuinLhMPwhH0wRHYRCneQ5vvHXlA5SOnEDS846NvywBNxR2edaIYblufUURfqSDU4roOfYZdBfYX032nxKTz',       // from sanity.io/manage → API → Tokens
    useCdn: false
});

async function deleteBadDocuments() {
    // Find documents without slug
    const docsToDelete = await client.fetch(
        `*[_type == "carsforsale" && !defined(slug.current)]{ _id, name }`
    );

    console.log(`Found ${docsToDelete.length} documents to delete`);

    if (docsToDelete.length === 0) {
        console.log('No documents to delete!');
        return;
    }

    // Delete each one
    for (const doc of docsToDelete) {
        await client.delete(doc._id);
        console.log(`Deleted: ${doc._id} - ${doc.name}`);
    }

    console.log('Done!');
}

deleteBadDocuments().catch(console.error);