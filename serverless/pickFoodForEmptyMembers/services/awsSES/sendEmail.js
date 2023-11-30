const get = require('lodash/get');
const { sendIndividualEmail } = require('./awsSES');
// Email template

const {
  participantAutoPickFood,
  participantAutoPickFoodSubject,
} = require('./templates/participantAutoPickFood');

const { EmailTemplateTypes } = require('./config');

const config = require('../../utils/config');

const SENDER_EMAIL = config.ses.senderEmail;

const emailSendingFactory = async (emailTemplateType, emailParams = {}) => {
  try {
    switch (emailTemplateType) {
      case EmailTemplateTypes.PARTICIPANT.PARTICIPANT_AUTO_PICK_FOOD: {
        const { participant, order, subOrderDateFoodList } = emailParams;

        const { email: participantEmail } = get(participant, 'attributes', {});
        const emailTemplate = participantAutoPickFood({
          order,
          participantUser: participant,
          subOrderDateFoodList,
        });
        const emailDataParams = {
          receiver: [participantEmail],
          subject: participantAutoPickFoodSubject(),
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
