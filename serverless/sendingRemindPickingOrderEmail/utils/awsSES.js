const AWS = require('aws-sdk');

const SES = new AWS.SES({
  accessKeyId: `${process.env.AWS_SES_ACCESS_KEY_ID}`,
  secretAccessKey: `${process.env.AWS_SES_SECRET_ACCESS_KEY}`,
  region: `${process.env.AWS_SES_REGION}`,
  apiVersion: '2010-12-01',
});

const createEmailParams = (receiver, subject, content, sender) => {
  const toAddresses = Array.isArray(receiver) ? receiver : [receiver];
  const body = {
    Html: {
      Charset: 'UTF-8',
      Data: content,
    },
  };

  const emailSender = sender || process.env.AWS_SENDER_EMAIL;
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

module.exports = {
  createEmailParams,
  sendEmail,
  sendIndividualEmail,
};
