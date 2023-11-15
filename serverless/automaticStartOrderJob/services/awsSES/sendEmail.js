const {
  bookerOrderSuccess,
  bookerOrderSuccessSubject,
} = require('./templates/bookerOrderSuccess');
const {
  bookerOrderCancelled,
  bookerOrderCancelledSubject,
} = require('./templates/bookerOrderCanceled');
const {
  partnerSubOrderCanceled,
  partnerSubOrderCanceledSubject,
} = require('./templates/partnerSubOrderCanceled');
const {
  bookerSubOrderCancelled,
  bookerSubOrderCancelledSubject,
} = require('./templates/bookerSubOrderCanceled');
const { sendIndividualEmail } = require('./awsSES');
const { fetchListing, fetchUser } = require('../../utils/integrationHelper');
const { Listing, User } = require('../../utils/data');
const { EmailTemplateTypes } = require('./config');
const { formatTimestamp } = require('../helpers/date');
const { getSystemAttributes } = require('../helpers/attributes');
const {
  participantSubOrderCanceled,
  participantSubOrderCanceledSubject,
} = require('./templates/participantSubOrderCanceled');
const config = require('../../utils/config');

const SENDER_EMAIL = config.ses.senderEmail;

const fetchEmailDataSourceWithOrder = async ({
  receiver,
  orderId,
  participantId,
  restaurantId,
}) => {
  switch (receiver) {
    case 'booker': {
      const order = await fetchListing(orderId);
      const orderListing = Listing(order);
      const {
        companyId,
        bookerId,
        plans = [],
        quotationId,
      } = orderListing.getMetadata();
      const plan = await fetchListing(plans[0]);
      const quotation = quotationId ? await fetchListing(quotationId) : null;
      const company = await fetchUser(companyId);
      const booker = await fetchUser(bookerId);

      const planListing = Listing(plan);
      const quotationListing = quotation && Listing(quotation);
      const companyUser = User(company);
      const bookerUser = User(booker);

      return {
        companyUser,
        bookerUser,
        orderListing,
        planListing,
        ...(quotationListing && { quotationListing }),
      };
    }

    case 'participant': {
      const order = await fetchListing(orderId);
      const participant = await fetchUser(participantId);
      const orderListing = Listing(order);
      const { companyId, bookerId } = orderListing.getMetadata();
      const company = await fetchUser(companyId);
      const booker = await fetchUser(bookerId);

      const companyUser = User(company);
      const bookerUser = User(booker);
      const participantUser = User(participant);

      return {
        companyUser,
        bookerUser,
        orderListing,
        participantUser,
      };
    }

    case 'partner': {
      const order = await fetchListing(orderId);
      const orderListing = Listing(order);
      const { companyId, plans = [], quotationId } = orderListing.getMetadata();
      const plan = await fetchListing(plans[0]);
      const quotation = quotationId ? await fetchListing(quotationId) : null;
      const company = await fetchUser(companyId);
      const restaurant = await fetchListing(restaurantId, ['author']);

      const planListing = Listing(plan);
      const quotationListing = quotation && Listing(quotation);
      const companyUser = User(company);

      const restaurantListing = Listing(restaurant);

      const { author } = restaurantListing.getFullData();
      const partnerId = author.id.uuid;
      const partner = await fetchUser(partnerId);
      const partnerUser = User(partner);

      return {
        companyUser,
        orderListing,
        planListing,
        partnerUser,
        restaurantListing,
        ...(quotationListing && { quotationListing }),
      };
    }

    default: {
      return {};
    }
  }
};

const emailSendingFactory = async (emailTemplateType, emailParams = {}) => {
  try {
    switch (emailTemplateType) {
      case EmailTemplateTypes.BOOKER.BOOKER_ORDER_SUCCESS: {
        const { orderId } = emailParams;
        const emailDataSource = await fetchEmailDataSourceWithOrder({
          receiver: 'booker',
          orderId,
        });

        const { bookerUser, orderListing } = emailDataSource;
        const { orderName } = orderListing.getPublicData();
        const { email: bookerEmail } = bookerUser?.getAttributes() || {};
        const emailTemplate = bookerOrderSuccess(emailDataSource);
        const emailDataParams = {
          receiver: [bookerEmail],
          subject: bookerOrderSuccessSubject(orderName),
          content: emailTemplate,
          sender: SENDER_EMAIL,
        };
        sendIndividualEmail(emailDataParams);
        break;
      }

      case EmailTemplateTypes.BOOKER.BOOKER_ORDER_CANCELLED: {
        const { orderId } = emailParams;
        const emailDataSource = await fetchEmailDataSourceWithOrder({
          receiver: 'booker',
          orderId,
        });

        const { bookerUser, orderListing } = emailDataSource;
        const { orderName } = orderListing.getPublicData();
        const { email: bookerEmail } = bookerUser?.getAttributes() || {};
        const emailTemplate = bookerOrderCancelled(emailDataSource);
        const emailDataParams = {
          receiver: [bookerEmail],
          subject: bookerOrderCancelledSubject(orderName),
          content: emailTemplate,
          sender: SENDER_EMAIL,
        };
        sendIndividualEmail(emailDataParams);
        break;
      }

      case EmailTemplateTypes.BOOKER.BOOKER_SUB_ORDER_CANCELED: {
        const { orderId, timestamp } = emailParams;
        const emailDataSource = await fetchEmailDataSourceWithOrder({
          receiver: 'booker',
          orderId,
        });

        const { systemVATPercentage } = await getSystemAttributes();

        const { bookerUser } = emailDataSource;
        const { email: bookerEmail } = bookerUser?.getAttributes() || {};
        const emailTemplate = bookerSubOrderCancelled({
          ...emailDataSource,
          timestamp,
          systemVATPercentage,
        });
        const subOrderDate = formatTimestamp(timestamp);
        const emailDataParams = {
          receiver: [bookerEmail],
          subject: bookerSubOrderCancelledSubject(subOrderDate),
          content: emailTemplate,
          sender: SENDER_EMAIL,
        };
        sendIndividualEmail(emailDataParams);
        break;
      }

      case EmailTemplateTypes.PARTICIPANT.PARTICIPANT_SUB_ORDER_CANCELED: {
        const { participantId, orderId, timestamp } = emailParams;
        const emailDataSource = await fetchEmailDataSourceWithOrder({
          receiver: 'participant',
          participantId,
          orderId,
        });

        const { participantUser } = emailDataSource;
        const { email: participantEmail } =
          participantUser?.getAttributes() || {};
        const emailTemplate = participantSubOrderCanceled({
          ...emailDataSource,
          timestamp,
        });
        const subOrderDate = formatTimestamp(timestamp);
        const emailDataParams = {
          receiver: [participantEmail],
          subject: participantSubOrderCanceledSubject(subOrderDate),
          content: emailTemplate,
          sender: SENDER_EMAIL,
        };
        sendIndividualEmail(emailDataParams);
        break;
      }

      case EmailTemplateTypes.PARTNER.PARTNER_SUB_ORDER_CANCELED: {
        const { orderId, restaurantId, timestamp } = emailParams;
        const emailDataSource = await fetchEmailDataSourceWithOrder({
          receiver: 'partner',
          orderId,
          restaurantId,
        });
        const { partnerUser } = emailDataSource;
        const { email: partnerEmail } = partnerUser?.getAttributes() || {};
        const emailTemplate = partnerSubOrderCanceled({
          ...emailDataSource,
          timestamp,
        });
        const subOrderDate = formatTimestamp(timestamp);
        const emailDataParams = {
          receiver: [partnerEmail],
          subject: partnerSubOrderCanceledSubject(subOrderDate),
          content: emailTemplate,
          sender: SENDER_EMAIL,
        };
        sendIndividualEmail(emailDataParams);
        break;
      }

      default: {
        break;
      }
    }
  } catch (error) {
    console.error('emailSendingFactory: ', error);
  }
};

module.exports = { emailSendingFactory };
