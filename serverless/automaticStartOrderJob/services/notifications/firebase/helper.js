const { initializeApp } = require('firebase/app');
const {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASURE_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);

const getCollectionData = async (collectionName) => {
  const ref = collection(firestore, collectionName);
  const snapshot = await (await getDocs(ref)).docs;
  const list = [];
  snapshot.forEach((_doc) => {
    list.push({ ..._doc.data(), id: _doc.id });
  });

  return list;
};

const queryCollectionData = async ({
  collectionName,
  queryParams,
  limitRecords = 20,
  lastRecord,
}) => {
  const ref = collection(firestore, collectionName);
  let q;

  const queryFuncs = Object.keys(queryParams).map((key) =>
    where(key, queryParams[key].operator, queryParams[key].value),
  );
  if (!lastRecord) {
    q = query(
      ref,
      ...queryFuncs,
      orderBy('createdAt', 'desc'),
      limit(limitRecords),
    );
  } else {
    const lastCreatedAt = new Date(lastRecord * 1000);
    // next page
    q = query(
      ref,
      ...queryFuncs,
      orderBy('createdAt', 'desc'),
      startAfter(lastCreatedAt),
      limit(limitRecords),
    );
  }

  const snapshot = await (await getDocs(q)).docs;

  const list = [];
  snapshot.forEach((_doc) => {
    list.push({ ..._doc.data(), id: _doc.id });
  });

  return list;
};

const addCollectionDoc = async (data, collectionName) => {
  const ref = collection(firestore, collectionName);

  const addedDoc = await addDoc(ref, data);

  return addedDoc.id;
};

const getDocumentById = async (documentId, collectionName) => {
  const docRef = doc(firestore, collectionName, documentId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { ...docSnap.data(), id: docSnap.id };
  }

  return null;
};

export {
  addCollectionDoc,
  getCollectionData,
  getDocumentById,
  queryCollectionData,
};

export default firebaseApp;
