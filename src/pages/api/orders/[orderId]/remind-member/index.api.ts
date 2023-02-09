import { createEmailParams, sendEmail } from '@services/awsSES';
import cookies from '@services/cookie';
import { handleError } from '@services/sdk';
import { memberOrderRemind } from '@utils/emailTemplate/memberOrderRemind';
import type { NextApiRequest, NextApiResponse } from 'next';

const systemSenderEmail = process.env.AWS_SES_SENDER_EMAIL;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { emailList, deadline, orderLink, description } = req.body;

    const newParticipantMembersEmailTemplate = memberOrderRemind({
      deadline,
      url: orderLink,
      description,
    });

    const hasFlexAccountEmailParamsData = {
      receiver: emailList,
      subject: 'PITO Cloud Canteen - Nhắc nhở chọn món',
      content: newParticipantMembersEmailTemplate,
      sender: systemSenderEmail as string,
    };

    const hasFlexAccountEmailParams = createEmailParams(
      hasFlexAccountEmailParamsData.receiver,
      hasFlexAccountEmailParamsData.subject,
      hasFlexAccountEmailParamsData.content,
      hasFlexAccountEmailParamsData.sender,
    );

    if (emailList?.length > 0) {
      sendEmail(hasFlexAccountEmailParams);
    }

    res.json({
      statusCode: 200,
      message: `Successfully send email to member, memberList: ${emailList}`,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export default cookies(handler);
