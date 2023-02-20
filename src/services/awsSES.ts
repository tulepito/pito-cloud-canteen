import AWS from 'aws-sdk';
import type {
  Address,
  AddressList,
  Body,
  MessageData,
  SendEmailRequest,
} from 'aws-sdk/clients/ses';

const credential = new AWS.Config({
  accessKeyId: `${process.env.AWS_SES_ACCESS_KEY_ID}`,
  secretAccessKey: `${process.env.AWS_SES_SECRET_ACCESS_KEY}`,
  region: `${process.env.AWS_SES_REGION}`,
});

AWS.config.update(credential);

export const createEmailParams = (
  receiver: AddressList,
  subject: MessageData,
  content: MessageData,
  sender: Address,
) => {
  const toAddresses = Array.isArray(receiver) ? receiver : [receiver];
  const body: Body = {
    Html: {
      Charset: 'UTF-8',
      Data: content,
    },
  };
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
    Source: sender || process.env.AWS_SENDER_EMAIL,
  } as SendEmailRequest;
};

export const sendEmail = (params: SendEmailRequest) => {
  return new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
};

export const sendIndividualEmail = ({
  receiver,
  subject,
  content,
  sender,
}: {
  receiver: AddressList;
  subject: MessageData;
  content: MessageData;
  sender: Address;
}) => {
  receiver.forEach((email) => {
    const params = createEmailParams([email], subject, content, sender);
    sendEmail(params);
  });
};
