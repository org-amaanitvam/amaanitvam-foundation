const mongoose = require('mongoose');

const uri = 'mongodb://127.0.0.1:27017/amaanitvam';

async function inspectDb() {
  console.log('Connecting to local MongoDB at:', uri);
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    const db = mongoose.connection.db;

    const collections = await db.listCollections().toArray();
    console.log('Collections in local DB:', collections.map(c => c.name));

    for (const c of collections) {
      if (c.name.toLowerCase().includes('gallery') || c.name.toLowerCase().includes('folder')) {
        const docs = await db.collection(c.name).find().toArray();
        console.log(`\n--- COLLECTION: ${c.name} (${docs.length} docs) ---`);
        console.log(JSON.stringify(docs, null, 2));
      }
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Database connection/query error:', err.message);
  }
}

inspectDb();
