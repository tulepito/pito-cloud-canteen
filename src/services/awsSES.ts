import AWS from 'aws-sdk';
import type {
  Address,
  AddressList,
  Body,
  MessageData,
  SendEmailRequest,
} from 'aws-sdk/clients/ses';

const SES = new AWS.SES({
  accessKeyId: `${process.env.AWS_SES_ACCESS_KEY_ID}`,
  secretAccessKey: `${process.env.AWS_SES_SECRET_ACCESS_KEY}`,
  region: `${process.env.AWS_SES_REGION}`,
  apiVersion: '2010-12-01',
});

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

  const emailSender = sender || process.env.AWS_SENDER_EMAIL!;
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
  } satisfies SendEmailRequest;
};

export const sendEmail = (params: SendEmailRequest) => {
  return SES.sendEmail(params).promise();
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
