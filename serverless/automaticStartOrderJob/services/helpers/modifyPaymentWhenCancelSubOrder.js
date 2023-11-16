const { calculatePriceQuotationInfoFromQuotation } = require('./order');
const {
  deletePaymentRecordByIdOnFirebase,
  queryPaymentRecordOnFirebase,
  updatePaymentRecordOnFirebase,
} = require('../firebase/payment');
const { fetchUser } = require('../../utils/integrationHelper');
const { ensureListing, Listing, User } = require('../../utils/data');

const { PITO_ADMIN_ID } = process.env;

const modifyPaymentWhenCancelSubOrder = async ({
  order,
  subOrderDate,
  clientQuotation,
  partnerQuotation,
}) => {
  const orderListing = Listing(order);
  const orderId = orderListing.getId();
  const {
    packagePerMember,
    orderVATPercentage,
    hasSpecificPCCFee,
    specificPCCFee,
  } = orderListing.getMetadata();
  const partnerPaymentRecord = await queryPaymentRecordOnFirebase({
    paymentType: 'partner',
    orderId,
    subOrderDate: subOrderDate.toString(),
  });

  if (partnerPaymentRecord && partnerPaymentRecord?.length > 0) {
    await deletePaymentRecordByIdOnFirebase(partnerPaymentRecord[0].id);
  }

  const clientPaymentRecords = await queryPaymentRecordOnFirebase({
    paymentType: 'client',
    orderId,
  });
  if (clientPaymentRecords && clientPaymentRecords?.length > 0) {
    const clientPaymentRecord = clientPaymentRecords[0];
    const { id } = clientPaymentRecord;

    const admin = await fetchUser(PITO_ADMIN_ID);
    const adminUser = User(admin);
    const { systemVATPercentage } = adminUser.getPrivateData();

    const quotationListing = ensureListing({
      attributes: {
        metadata: {
          client: clientQuotation,
          partner: partnerQuotation,
        },
      },
    });

    const { totalWithVAT: newTotalPrice } =
      calculatePriceQuotationInfoFromQuotation({
        quotation: quotationListing,
        packagePerMember,
        currentOrderVATPercentage: orderVATPercentage || systemVATPercentage,
        hasSpecificPCCFee,
        specificPCCFee,
      });

    if (newTotalPrice === 0) {
      await deletePaymentRecordByIdOnFirebase(id);
    } else {
      await updatePaymentRecordOnFirebase(id, {
        totalPrice: newTotalPrice,
      });
    }
  }
};

module.exports = { modifyPaymentWhenCancelSubOrder };
