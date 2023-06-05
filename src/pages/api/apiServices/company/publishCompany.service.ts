import CryptoJS from 'crypto-js';

import { emailSendingFactory, EmailTemplateTypes } from '@services/email';
import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { User } from '@src/utils/data';
import { ECompanyStates } from '@src/utils/enums';
import type { TObject } from '@src/utils/types';

const publishCompany = async (companyId: string, queryParams: TObject = {}) => {
  const integrationSdk = getIntegrationSdk();
  const company = await fetchUser(companyId);
  const companyUser = User(company);
  const { subAccountId } = companyUser.getPrivateData();
  const { isOnBoardingEmailSent = false } = companyUser.getMetadata();
  const subAccount = await fetchUser(subAccountId);
  const subAccountUser = User(subAccount);
  const { accountPassword: subAccountPassword } =
    subAccountUser.getPrivateData();
  const decryptedPassword = CryptoJS.AES.decrypt(
    subAccountPassword,
    process.env.ENCRYPT_PASSWORD_SECRET_KEY,
  );
  const password = decryptedPassword.toString(CryptoJS.enc.Utf8);
  const response = await integrationSdk.users.updateProfile(
    {
      id: companyId,
      metadata: {
        userState: ECompanyStates.published,
        isOnBoardingEmailSent: true,
      },
    },
    queryParams,
  );

  if (!isOnBoardingEmailSent) {
    await emailSendingFactory(
      EmailTemplateTypes.BOOKER.BOOKER_ACCOUNT_CREATED,
      {
        password,
        companyId,
      },
    );
  }

  return response;
};

export default publishCompany;
