import { Listing, User } from '@src/utils/data';
import { formatTimestamp } from '@src/utils/dates';
import bookerAccountCreated, {
  bookerAccountCreatedSubject,
} from '@src/utils/emailTemplate/bookerAccountCreated';
import bookerAccountSuspended, {
  bookerAccountSuspendedSubject,
} from '@src/utils/emailTemplate/bookerAccountSuspended';
import bookerOrderCancelled, {
  bookerOrderCancelledSubject,
} from '@src/utils/emailTemplate/bookerOrderCancelled';
import bookerOrderCreated, {
  bookerOrderCreatedSubject,
} from '@src/utils/emailTemplate/bookerOrderCreated';
import bookerOrderPicking, {
  bookerOrderPickingSubject,
} from '@src/utils/emailTemplate/bookerOrderPicking';
import bookerOrderSuccess, {
  bookerOrderSuccessSubject,
} from '@src/utils/emailTemplate/bookerOrderSuccess';
import bookerSubOrderIsCanceled, {
  bookerSubOrderIsCanceledSubject,
} from '@src/utils/emailTemplate/bookerSubOrderIsCanceled';
import participantCompanyInvitation, {
  participantCompanyInvitationSubject,
} from '@src/utils/emailTemplate/participantCompanyInvitation';
import participantOrderPicking, {
  participantOrderPickingSubject,
} from '@src/utils/emailTemplate/participantOrderPicking';
import participantSubOrderIsCanceled, {
  participantSubOrderIsCanceledSubject,
} from '@src/utils/emailTemplate/participantSubOrderIsCanceled';
import partnerNewOrderAppear, {
  partnerNewOrderAppearSubject,
} from '@src/utils/emailTemplate/partnerNewOrderAppear';
import partnerOrderDetailsUpdated, {
  partnerOrderDetailsUpdatedSubject,
} from '@src/utils/emailTemplate/partnerOrderDetailsUpdated';
import partnerSubOrderIsCanceled, {
  partnerSubOrderIsCanceledSubject,
} from '@src/utils/emailTemplate/partnerSubOrderIsCanceled';

import { sendIndividualEmail } from './awsSES';
import getSystemAttributes from './getSystemAttributes';
import { fetchListing, fetchUser } from './integrationHelper';

const systemSenderEmail = process.env.AWS_SES_SENDER_EMAIL;

export enum EmailTemplateForBookerTypes {
  BOOKER_ACCOUNT_CREATED = 'BOOKER_ACCOUNT_CREATED',
  BOOKER_ACCOUNT_SUSPENDED = 'BOOKER_ACCOUNT_SUSPENDED',
  BOOKER_ORDER_CREATED = 'BOOKER_ORDER_CREATED',
  BOOKER_ORDER_PICKING = 'BOOKER_ORDER_PICKING',
  BOOKER_ORDER_SUCCESS = 'BOOKER_ORDER_SUCCESS',
  BOOKER_SUB_ORDER_CANCELED = 'BOOKER_SUB_ORDER_CANCELED',
  BOOKER_REVENUE_ANALYTICS = 'BOOKER_REVENUE_ANALYTICS',
  BOOKER_ORDER_CANCELLED = 'BOOKER_ORDER_CANCELLED',
}

export enum EmailTemplateForParticipantTypes {
  PARTICIPANT_COMPANY_INVITATION = 'PARTICIPANT_COMPANY_INVITATION',
  PARTICIPANT_ORDER_PICKING = 'PARTICIPANT_ORDER_PICKING',
  PARTICIPANT_SUB_ORDER_CANCELED = 'PARTICIPANT_SUB_ORDER_CANCELED',
}

export enum EmailTemplateForPartnerTypes {
  PARTNER_NEW_ORDER_APPEAR = 'PARTNER_NEW_ORDER_APPEAR',
  PARTNER_SUB_ORDER_CANCELED = 'PARTNER_SUB_ORDER_CANCELED',
  PARTNER_ORDER_DETAILS_UPDATED = 'PARTNER_ORDER_DETAILS_UPDATED',
}

export const EmailTemplateTypes = {
  BOOKER: EmailTemplateForBookerTypes,
  PARTICIPANT: EmailTemplateForParticipantTypes,
  PARTNER: EmailTemplateForPartnerTypes,
};

export type TEmailTemplateTypes =
  | EmailTemplateForParticipantTypes
  | EmailTemplateForBookerTypes
  | EmailTemplateForPartnerTypes;

export type EmailDataSourceBuilder = {
  receiver: string;
  orderId: string;
  participantId?: string;
  partnerId?: string;
  restaurantId?: string;
};
export const fetchEmailDataSourceWithOrder = async ({
  receiver,
  orderId,
  participantId,
  restaurantId,
}: EmailDataSourceBuilder) => {
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
      const participant = await fetchUser(participantId as string);
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
      const restaurant = await fetchListing(restaurantId as string, ['author']);

      const planListing = Listing(plan);
      const quotationListing = quotation && Listing(quotation);
      const companyUser = User(company);

      const restaurantListing = Listing(restaurant);

      const { author } = restaurantListing.getFullData();
      const partnerId = author.id.uuid;
      const partner = await fetchUser(partnerId as string);
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

type EmailDataSourceWithCompanyBuilder = {
  companyId: string;
  participantId?: string;
  receiver: string;
};

const fetchEmailDataSourceWithCompany = async ({
  companyId,
  receiver,
  participantId,
}: EmailDataSourceWithCompanyBuilder) => {
  switch (receiver) {
    case 'booker': {
      const company = await fetchUser(companyId);
      const companyUser = User(company);

      return {
        companyUser,
      };
    }
    case 'participant': {
      const company = await fetchUser(companyId);
      const participant = await fetchUser(participantId as string);

      const companyUser = User(company);
      const participantUser = User(participant);

      return {
        companyUser,
        participantUser,
      };
    }

    default: {
      return {};
    }
  }
};

export const emailSendingFactory = async (
  emailTemplateType: TEmailTemplateTypes,
  emailParams: any = {},
) => {
  try {
    switch (emailTemplateType) {
      case EmailTemplateTypes.BOOKER.BOOKER_ORDER_CREATED: {
        const { orderId } = emailParams;
        const emailDataSource = await fetchEmailDataSourceWithOrder({
          receiver: 'booker',
          orderId,
        });

        const { bookerUser, orderListing } = emailDataSource;
        const { orderName } = orderListing.getPublicData();
        const { email: bookerEmail } = bookerUser?.getAttributes() || {};
        const emailTemplate = bookerOrderCreated(emailDataSource);
        const emailDataParams = {
          receiver: [bookerEmail],
          subject: bookerOrderCreatedSubject(orderName),
          content: emailTemplate as string,
          sender: systemSenderEmail as string,
        };
        sendIndividualEmail(emailDataParams);
        break;
      }
      case EmailTemplateTypes.BOOKER.BOOKER_ORDER_PICKING: {
        const { orderId } = emailParams;
        const emailDataSource = await fetchEmailDataSourceWithOrder({
          receiver: 'booker',
          orderId,
        });

        const { bookerUser, orderListing } = emailDataSource;
        const { orderName } = orderListing.getPublicData();
        const { email: bookerEmail } = bookerUser?.getAttributes() || {};
        const emailTemplate = bookerOrderPicking(emailDataSource);
        const emailDataParams = {
          receiver: [bookerEmail],
          subject: bookerOrderPickingSubject(orderName),
          content: emailTemplate as string,
          sender: systemSenderEmail as string,
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
        const emailTemplate = bookerSubOrderIsCanceled({
          ...emailDataSource,
          timestamp,
          systemVATPercentage,
        });
        const subOrderDate = formatTimestamp(timestamp);
        const emailDataParams = {
          receiver: [bookerEmail],
          subject: bookerSubOrderIsCanceledSubject(subOrderDate),
          content: emailTemplate as string,
          sender: systemSenderEmail as string,
        };
        sendIndividualEmail(emailDataParams);
        break;
      }
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
          content: emailTemplate as string,
          sender: systemSenderEmail as string,
        };
        sendIndividualEmail(emailDataParams);
        break;
      }
      case EmailTemplateTypes.BOOKER.BOOKER_ACCOUNT_CREATED: {
        const { password, companyId } = emailParams;
        const emailDataSource: any = await fetchEmailDataSourceWithCompany({
          companyId,
          receiver: 'booker',
        });

        const { companyUser } = emailDataSource;
        const { email: companyEmail } = companyUser?.getAttributes() || {};
        const emailTemplate = bookerAccountCreated({
          ...emailDataSource,
          password,
        });
        const emailDataParams = {
          receiver: [companyEmail],
          subject: bookerAccountCreatedSubject,
          content: emailTemplate as string,
          sender: systemSenderEmail as string,
        };
        sendIndividualEmail(emailDataParams);
        break;
      }
      case EmailTemplateTypes.BOOKER.BOOKER_ACCOUNT_SUSPENDED: {
        const { suspendedTimestamp, companyId } = emailParams;
        const emailDataSource: any = await fetchEmailDataSourceWithCompany({
          companyId,
          receiver: 'booker',
        });

        const { companyUser } = emailDataSource;
        const { email: companyEmail } = companyUser?.getAttributes() || {};
        const emailTemplate = bookerAccountSuspended({
          ...emailDataSource,
          suspendedTimestamp,
        });
        const emailDataParams = {
          receiver: [companyEmail],
          subject: bookerAccountSuspendedSubject,
          content: emailTemplate as string,
          sender: systemSenderEmail as string,
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
          content: emailTemplate as string,
          sender: systemSenderEmail as string,
        };
        sendIndividualEmail(emailDataParams);
        break;
      }
      case EmailTemplateTypes.PARTICIPANT.PARTICIPANT_ORDER_PICKING: {
        const { orderId, participantId, bookerNote } = emailParams;
        const emailDataSource = await fetchEmailDataSourceWithOrder({
          receiver: 'participant',
          orderId,
          participantId,
        });

        const { participantUser, orderListing } = emailDataSource;
        const { orderName } = orderListing.getPublicData();
        const { email: participantEmail } =
          participantUser?.getAttributes() || {};
        const emailTemplate = participantOrderPicking({
          ...emailDataSource,
          bookerNote,
        });
        const emailDataParams = {
          receiver: [participantEmail],
          subject: participantOrderPickingSubject(orderName),
          content: emailTemplate as string,
          sender: systemSenderEmail as string,
        };
        sendIndividualEmail(emailDataParams);
        break;
      }
      case EmailTemplateTypes.PARTICIPANT.PARTICIPANT_COMPANY_INVITATION: {
        const { participantId, companyId } = emailParams;
        const emailDataSource: any = await fetchEmailDataSourceWithCompany({
          receiver: 'participant',
          participantId,
          companyId,
        });

        const { participantUser, companyUser } = emailDataSource;
        const { companyName } = companyUser?.getPublicData() || {};
        const { email: participantEmail } =
          participantUser?.getAttributes() || {};
        const emailTemplate = participantCompanyInvitation(emailDataSource);
        const emailDataParams = {
          receiver: [participantEmail],
          subject: participantCompanyInvitationSubject(companyName),
          content: emailTemplate as string,
          sender: systemSenderEmail as string,
        };
        sendIndividualEmail(emailDataParams);
        break;
      }
      case EmailTemplateTypes.PARTICIPANT.PARTICIPANT_SUB_ORDER_CANCELED: {
        const { participantId, orderId, timestamp } = emailParams;
        const emailDataSource: any = await fetchEmailDataSourceWithOrder({
          receiver: 'participant',
          participantId,
          orderId,
        });

        const { participantUser } = emailDataSource;
        const { email: participantEmail } =
          participantUser?.getAttributes() || {};
        const emailTemplate = participantSubOrderIsCanceled({
          ...emailDataSource,
          timestamp,
        });
        const subOrderDate = formatTimestamp(timestamp);
        const emailDataParams = {
          receiver: [participantEmail],
          subject: participantSubOrderIsCanceledSubject(subOrderDate),
          content: emailTemplate as string,
          sender: systemSenderEmail as string,
        };
        sendIndividualEmail(emailDataParams);
        break;
      }
      case EmailTemplateTypes.PARTNER.PARTNER_NEW_ORDER_APPEAR: {
        const { orderId, promotion = 0, restaurantId } = emailParams;
        const emailDataSource: any = await fetchEmailDataSourceWithOrder({
          receiver: 'partner',
          orderId,
          restaurantId,
        });
        const { partnerUser, orderListing } = emailDataSource;
        const { orderName } = orderListing.getPublicData();
        const { systemVATPercentage } = await getSystemAttributes();
        const { email: partnerEmail } = partnerUser?.getAttributes() || {};
        const emailTemplate = partnerNewOrderAppear({
          ...emailDataSource,
          promotion,
          systemVATPercentage,
        });
        const emailDataParams = {
          receiver: [partnerEmail],
          subject: partnerNewOrderAppearSubject(orderName),
          content: emailTemplate as string,
          sender: systemSenderEmail as string,
        };
        sendIndividualEmail(emailDataParams);
        break;
      }
      case EmailTemplateTypes.PARTNER.PARTNER_SUB_ORDER_CANCELED: {
        const { orderId, restaurantId, timestamp } = emailParams;
        const emailDataSource: any = await fetchEmailDataSourceWithOrder({
          receiver: 'partner',
          orderId,
          restaurantId,
        });
        const { partnerUser } = emailDataSource;
        const { email: partnerEmail } = partnerUser?.getAttributes() || {};
        const emailTemplate = partnerSubOrderIsCanceled({
          ...emailDataSource,
          timestamp,
        });
        const subOrderDate = formatTimestamp(timestamp);
        const emailDataParams = {
          receiver: [partnerEmail],
          subject: partnerSubOrderIsCanceledSubject(subOrderDate),
          content: emailTemplate as string,
          sender: systemSenderEmail as string,
        };
        sendIndividualEmail(emailDataParams);
        break;
      }
      case EmailTemplateTypes.PARTNER.PARTNER_ORDER_DETAILS_UPDATED: {
        const { orderId, partnerId, restaurantId, timestamp } = emailParams;
        const emailDataSource: any = await fetchEmailDataSourceWithOrder({
          receiver: 'partner',
          partnerId,
          orderId,
          restaurantId,
        });
        const { partnerUser } = emailDataSource;
        const { email: partnerEmail } = partnerUser?.getAttributes() || {};
        const subOrderDate = formatTimestamp(timestamp);
        const emailTemplate = partnerOrderDetailsUpdated({
          ...emailDataSource,
          subOrderDate,
        });
        const emailDataParams = {
          receiver: [partnerEmail],
          subject: partnerOrderDetailsUpdatedSubject(subOrderDate),
          content: emailTemplate as string,
          sender: systemSenderEmail as string,
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
