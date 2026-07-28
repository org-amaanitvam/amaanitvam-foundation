import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uris = [
  process.env.MONGO_URI,
  process.env.MONGODB_URI,
  "mongodb://127.0.0.1:27017/amaanitvam"
].filter(Boolean);

const CANONICAL_MAP = {
  "clothes donation": "Clothes Donation Drive",
  "clothes donation drive": "Clothes Donation Drive",
  "webinar & competitions": "Webinars & Workshops",
  "webinars & workshops": "Webinars & Workshops",
  "webinars": "Webinars & Workshops",
  "webinar": "Webinars & Workshops",
  "awards": "Awards & Recognition",
  "awards & recognition": "Awards & Recognition",
  "project shiksha": "Project Shiksha",
  "shiksha": "Project Shiksha",
  "project manthan": "Project Manthan",
  "manthan": "Project Manthan",
  "project udaan": "Project Udaan",
  "udaan": "Project Udaan",
  "project pravah": "Project Pravah",
  "pravah": "Project Pravah"
};

async function cleanDatabaseFolders() {
  let connected = false;
  for (const uri of uris) {
    try {
      console.log(`[migration] Trying connection to MongoDB: ${uri.replace(/:[^:@]+@/, ':****@')}`);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
      connected = true;
      break;
    } catch (err) {
      console.warn(`[migration] Could not connect to ${uri.slice(0, 30)}...: ${err.message}`);
    }
  }

  if (!connected) {
    console.log("[migration] No active MongoDB connection available. Migration will run automatically whenever backend connects to a database.");
    return;
  }

  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections({}, { nameOnly: true }).toArray();
    const collectionNames = collections.map(c => c.name);

    const folderCollections = collectionNames.filter(name => /gallery.*folder/i.test(name) || /^galleryfolders?$/i.test(name));
    const mediaCollections = collectionNames.filter(name => /gallery.*media/i.test(name) || /^gallery$/i.test(name));

    console.log(`[migration] Found folder collections: ${folderCollections.join(', ') || 'none'}`);

    for (const colName of folderCollections) {
      const folders = await db.collection(colName).find().toArray();
      console.log(`[migration] Inspecting '${colName}' (${folders.length} records):`);

      const seenNames = new Set();
      for (const folder of folders) {
        const rawName = String(folder.name || folder.title || '').trim();
        const lower = rawName.toLowerCase();
        const canonical = CANONICAL_MAP[lower] || rawName;

        if (rawName !== canonical) {
          console.log(`  - Updating folder name: '${rawName}' -> '${canonical}'`);
          await db.collection(colName).updateOne({ _id: folder._id }, { $set: { name: canonical, title: canonical, updatedAt: new Date() } });
        }

        const canonKey = canonical.toLowerCase();
        if (seenNames.has(canonKey)) {
          let mediaCount = 0;
          for (const mediaCol of mediaCollections) {
            const count = await db.collection(mediaCol).countDocuments({
              $or: [
                { folderId: folder._id },
                { folderId: String(folder._id) },
                { folder: canonical },
                { album: canonical }
              ]
            });
            mediaCount += count;
          }

          if (mediaCount === 0) {
            console.log(`  - Deleting duplicate empty folder: '${canonical}' (_id: ${folder._id})`);
            await db.collection(colName).deleteOne({ _id: folder._id });
          }
        } else {
          seenNames.add(canonKey);
        }
      }
    }

    console.log("[migration] Database cleanup and canonical normalization completed successfully.");
    await mongoose.disconnect();
  } catch (error) {
    console.error("[migration] Error during database cleanup:", error.message);
  }
}

cleanDatabaseFolders();
