const {
  addCollectionDoc,
  deleteDocument,
  getCollectionCount,
  getDocumentById,
  queryAllCollectionData,
  queryCollectionData,
  updateCollectionDoc,
} = require('./helper');

const { FIREBASE_PAYMENT_RECORD_COLLECTION_NAME } = process.env;

const createPaymentRecordOnFirebase = async (type, params) => {
  const paymentCreatedAt = new Date();
  try {
    const data = {
      ...params,
      paymentType: type,
      paymentStatus: 'success',
      createdAt: paymentCreatedAt,
    };
    const paymentRecordId = await addCollectionDoc(
      data,
      FIREBASE_PAYMENT_RECORD_COLLECTION_NAME,
    );
    const paymentRecordData = await getDocumentById(
      paymentRecordId,
      FIREBASE_PAYMENT_RECORD_COLLECTION_NAME,
    );

    return {
      id: paymentRecordId,
      ...paymentRecordData,
    };
  } catch (error) {
    console.error('Error payment record type: ', type);
    console.error('Error creating payment record: ', error);
  }
};

const queryPaymentRecordOnFirebase = async (query) => {
  try {
    const { paymentType, partnerId, orderId, subOrderDate, isHideFromHistory } =
      query;
    const paymentQuery = {
      ...(partnerId && {
        partnerId: {
          operator: '==',
          value: partnerId,
        },
      }),
      orderId: {
        operator: '==',
        value: orderId,
      },
      ...(subOrderDate && {
        subOrderDate: {
          operator: '==',
          value: subOrderDate,
        },
      }),
      ...(isHideFromHistory && {
        isHideFromHistory: {
          operator: '==',
          value: true,
        },
      }),
    };
    const paymentRecords = await queryCollectionData({
      collectionName: FIREBASE_PAYMENT_RECORD_COLLECTION_NAME,
      queryParams: {
        paymentType: {
          operator: '==',
          value: paymentType,
        },
        ...paymentQuery,
      },
    });

    return paymentRecords;
  } catch (error) {
    console.error('Error query payment record: ', error);
  }
};

const queryAllPartnerPaymentRecordsOnFirebase = async (query = {}) => {
  try {
    const { partnerId } = query;
    const paymentRecords = await queryAllCollectionData({
      collectionName: FIREBASE_PAYMENT_RECORD_COLLECTION_NAME,
      queryParams: {
        paymentType: {
          operator: '==',
          value: 'partner',
        },
        ...(partnerId && {
          partnerId: {
            operator: '==',
            value: partnerId,
          },
        }),
      },
    });

    return paymentRecords;
  } catch (error) {
    console.error('Error query payment record: ', error);
  }
};

const queryAllCompanyPaymentRecordsOnFirebase = async (query = {}) => {
  const { companyId } = query;

  return queryAllCollectionData({
    collectionName: FIREBASE_PAYMENT_RECORD_COLLECTION_NAME,
    queryParams: {
      paymentType: {
        operator: '==',
        value: 'client',
      },
      ...(companyId && {
        partnerId: {
          operator: '==',
          value: companyId,
        },
      }),
    },
  });
};

const getTotalRecordsOnFirebase = async (query) => {
  try {
    const totalRecords = await getCollectionCount({
      collectionName: FIREBASE_PAYMENT_RECORD_COLLECTION_NAME,
      queryParams: query,
    });

    return totalRecords;
  } catch (error) {
    console.error('Error query payment record: ', error);
  }
};

const deletePaymentRecordByIdOnFirebase = async (paymentRecordId) => {
  try {
    await deleteDocument(
      paymentRecordId,
      FIREBASE_PAYMENT_RECORD_COLLECTION_NAME,
    );
  } catch (error) {
    console.error('Error delete payment record: ', error);
  }
};

const queryClientPaymentRecordsOnFirebase = async (query) => {
  try {
    const { orderIds } = query;
    const paymentQuery = {
      orderId: {
        operator: 'in',
        value: orderIds,
      },
      paymentType: {
        operator: '==',
        value: 'client',
      },
    };
    const paymentRecords = await queryCollectionData({
      collectionName: FIREBASE_PAYMENT_RECORD_COLLECTION_NAME,
      queryParams: {
        ...paymentQuery,
      },
    });

    return paymentRecords;
  } catch (error) {
    console.error('Error query payment record: ', error);
  }
};

const updatePaymentRecordOnFirebase = async (paymentRecordId, params) => {
  await updateCollectionDoc(
    paymentRecordId,
    params,
    FIREBASE_PAYMENT_RECORD_COLLECTION_NAME,
  );

  const paymentRecordData = await getDocumentById(
    paymentRecordId,
    FIREBASE_PAYMENT_RECORD_COLLECTION_NAME,
  );

  return {
    id: paymentRecordId,
    ...paymentRecordData,
  };
};

module.exports = {
  createPaymentRecordOnFirebase,
  queryPaymentRecordOnFirebase,
  queryAllPartnerPaymentRecordsOnFirebase,
  updatePaymentRecordOnFirebase,
  getTotalRecordsOnFirebase,
  queryAllCompanyPaymentRecordsOnFirebase,
  queryClientPaymentRecordsOnFirebase,
  deletePaymentRecordByIdOnFirebase,
};
