import { initializeApp } from 'firebase/app';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  setDoc,
  startAfter,
  updateDoc,
  where,
} from 'firebase/firestore';
import pick from 'lodash/pick';

import type { TObject } from '@src/utils/types';

const firebaseConfig = {
  apiKey: process.env.NEXT_APP_FIREBASE_API_KEY,
  authDomain: `${process.env.NEXT_PUBLIC_NEXT_APP_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.NEXT_PUBLIC_NEXT_APP_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.NEXT_PUBLIC_NEXT_APP_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.NEXT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_APP_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_APP_FIREBASE_MEASURE_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
export const firestore = getFirestore(firebaseApp);

const getCollectionData = async (collectionName: string) => {
  const ref = collection(firestore, collectionName);
  const snapshot = await (await getDocs(ref)).docs;
  const list: any[] = [];
  snapshot.forEach((_doc: any) => {
    list.push({ ..._doc.data(), id: _doc.id });
  });

  return list;
};

const queryCollectionData = async ({
  collectionName,
  queryParams,
  limitRecords = 20,
  lastRecord,
}: {
  collectionName: string;
  queryParams: TObject;
  limitRecords?: number;
  lastRecord?: number;
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

  const list: any[] = [];
  snapshot.forEach((_doc: any) => {
    list.push({ ..._doc.data(), id: _doc.id });
  });

  return list;
};

const queryAllCollectionData = async ({
  collectionName,
  queryParams,
  neededDataAttributes,
}: {
  collectionName: string;
  queryParams: TObject;
  neededDataAttributes?: string[];
}) => {
  const hasNeededDataAttributes =
    neededDataAttributes && neededDataAttributes.length > 0;
  const ref = collection(firestore, collectionName);
  const queryFuncs = Object.keys(queryParams).map((key) =>
    where(key, queryParams[key].operator, queryParams[key].value),
  );
  const q = query(ref, ...queryFuncs, orderBy('createdAt', 'desc'));

  const snapshot = await (await getDocs(q)).docs;

  const list: any[] = [];

  snapshot.forEach((_doc) => {
    const neededData = !hasNeededDataAttributes
      ? _doc.data()
      : pick(_doc.data(), neededDataAttributes);
    list.push({ ...neededData, id: _doc.id });
  });

  return list;
};

const addCollectionDoc = async (data: any, collectionName: string) => {
  const ref = collection(firestore, collectionName);

  const addedDoc = await addDoc(ref, data);

  return addedDoc.id;
};

const setCollectionDocWithCustomId = async (
  customId: string,
  data: any,
  path: string,
  pathSegments = [],
) => {
  await setDoc(doc(firestore, path, ...pathSegments, customId), data);
};

const setCollectionDoc = async (data: any, path: string, pathSegments = []) => {
  await setDoc(doc(firestore, path, ...pathSegments), data);
};

const updateCollectionDoc = async (
  documentId: string,
  data: any,
  path: string,
  pathSegments = [],
) => {
  const docRef = doc(firestore, path, ...pathSegments, documentId);

  await updateDoc(docRef, data);
};

const getDocumentById = async (documentId: string, collectionName: string) => {
  const docRef = doc(firestore, collectionName, documentId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { ...docSnap.data(), id: docSnap.id };
  }

  return null;
};

const getCollectionCount = async ({
  collectionName,
  queryParams,
}: {
  collectionName: string;
  queryParams: TObject;
}) => {
  const ref = collection(firestore, collectionName);
  const queryFuncs = Object.keys(queryParams).map((key) =>
    where(key, queryParams[key].operator, queryParams[key].value),
  );
  const q = query(ref, ...queryFuncs, orderBy('createdAt', 'desc'));
  const count = await getCountFromServer(q);

  return count.data().count;
};

const deleteDocument = async (
  documentId: string,
  path: string,
  pathSegments = [],
) => {
  await deleteDoc(doc(firestore, path, ...pathSegments, documentId));
};

export {
  addCollectionDoc,
  deleteDocument,
  getCollectionCount,
  getCollectionData,
  getDocumentById,
  queryAllCollectionData,
  queryCollectionData,
  setCollectionDoc,
  setCollectionDocWithCustomId,
  updateCollectionDoc,
};

export default firebaseApp;
