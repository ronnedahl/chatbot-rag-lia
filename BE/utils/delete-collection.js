import admin from 'firebase-admin';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccountPath = join(__dirname, '../config/bostr-chatbot-firebase-adminsdk-fbsvc-2cbee44156.json');
const serviceAccount = JSON.parse(await readFile(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function deleteCollection(collectionPath, batchSize) {
  const db = admin.firestore();
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, batchSize, resolve, reject);
  });
}

async function deleteQueryBatch(db, query, batchSize, resolve, reject) {
  const snapshot = await query.get();

  if (snapshot.size === 0) {
    resolve();
    return;
  }

  // Delete documents in a batch
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  try {
    await batch.commit();
  } catch (error) {
    reject(error);
  }

  // Recurse on the next process tick, to avoid
  // exploding the event loop.
  process.nextTick(() => {
    deleteQueryBatch(db, query, batchSize, resolve, reject);
  });
}

const collectionName = 'openai_document_embeddings'; //! Change to current collection name
const batchSize = 1;

deleteCollection(collectionName, batchSize)
  .then(() => {
    console.log(`Successfully deleted collection: ${collectionName}`);
  })
  .catch((error) => {
    console.error('Error deleting collection:', error);
  });
