const AWS = require('aws-sdk');
const config = require('../../utils/config');

const SES = new AWS.SES(config.ses.config);

const createEmailParams = (receiver, subject, content, sender) => {
  const toAddresses = Array.isArray(receiver) ? receiver : [receiver];
  const body = {
    Html: {
      Charset: 'UTF-8',
      Data: content,
    },
  };

  const emailSender = sender || config.ses.senderEmail;
  const senderName = 'PITO Cloud Canteen';
  const source = `${senderName} <${emailSender}>`;

  return {
    Destination: {
      ToAddresses: toAddresses,
    },
    Message: {
      Body: body,
      Subject: {
        Charset: 'UTF-8',
        Data: subject,
      },
    },
    Source: source,
  };
};

const sendEmail = (params) => {
  return SES.sendEmail(params).promise();
};

const sendIndividualEmail = ({ receiver, subject, content, sender }) => {
  receiver.forEach((email) => {
    const params = createEmailParams([email], subject, content, sender);
    sendEmail(params);
  });
};

module.exports = { sendIndividualEmail };
