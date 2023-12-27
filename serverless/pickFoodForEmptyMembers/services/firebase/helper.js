const { initializeApp } = require('firebase/app');
const { doc, getFirestore, setDoc } = require('firebase/firestore');
const config = require('../../utils/config');

const firebaseApp = initializeApp(config.firebase.config);
const firestore = getFirestore(firebaseApp);

const setCollectionDocWithCustomId = async (
  customId,
  data,
  path,
  pathSegments = [],
) => {
  try {
    await setDoc(doc(firestore, path, ...pathSegments, customId), data);
  } catch (error) {
    console.error('setCollectionDocWithCustomId error: ', error);
    throw new Error(error);
  }
};

module.exports = {
  firebaseApp,
  setCollectionDocWithCustomId,
};
