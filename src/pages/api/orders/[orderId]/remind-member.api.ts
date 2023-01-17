import { createEmailParams, sendEmail } from '@services/awsSES';
import cookies from '@services/cookie';
import companyChecker from '@services/permissionChecker/company';
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
      subject: 'PITO Cloud Canteen - Bạn có một lời mời tham gia công ty',
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

    res.json({});
  } catch (error) {
    handleError(res, error);
  }
};

export default cookies(companyChecker(handler));
