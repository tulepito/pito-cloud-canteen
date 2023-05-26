const { integrationSdk } = require('./utils/sdk');
const { denormalisedResponseEntities, User, Listing } = require('./utils/data');
const {
  bookerOrderPicking,
  bookerOrderPickingSubject,
} = require('./utils/emailTemplate');
const { sendIndividualEmail } = require('./utils/awsSES');
const { orderStatesShouldSendEmail } = require('./utils/orderHelper');

const systemSenderEmail = process.env.AWS_SES_SENDER_EMAIL;

exports.handler = async (_event) => {
  try {
    console.log('Start to run schedule to send remind picking order email ...');
    console.log('_event: ', _event);
    const { orderId } = _event;
    const orderResponse = denormalisedResponseEntities(
      await integrationSdk.listings.show({
        id: orderId,
      }),
    )[0];

    const orderListing = Listing(orderResponse);

    const { bookerId, orderState, companyId } = orderListing.getMetadata();

    if (orderStatesShouldSendEmail.includes(orderState)) {
      const bookerResponse = denormalisedResponseEntities(
        await integrationSdk.users.show({
          id: bookerId,
        }),
      )[0];
      const companyResponse = denormalisedResponseEntities(
        await integrationSdk.users.show({
          id: companyId,
        }),
      )[0];

      const companyUser = User(companyResponse);

      const bookerUser = User(bookerResponse);

      const emailDataSource = {
        bookerUser,
        orderListing,
        companyUser,
      };
      const { orderName } = orderListing.getPublicData();
      const { email: bookerEmail } = bookerUser?.getAttributes() || {};
      const emailTemplate = bookerOrderPicking(emailDataSource);
      const emailDataParams = {
        receiver: [bookerEmail],
        subject: bookerOrderPickingSubject(orderName),
        content: emailTemplate,
        sender: systemSenderEmail,
      };
      sendIndividualEmail(emailDataParams);
    }
  } catch (error) {
    console.error(
      'Schedule to send remind picking order email',
      error?.data ? error?.data?.errors?.[0] : error,
    );
  }
};
