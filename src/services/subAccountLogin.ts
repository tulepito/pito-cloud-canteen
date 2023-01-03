import { createSdkInstance } from '@sharetribe/sdk';
import type { TUser } from '@utils/types';

const subAccountLogin = async (subAccount: TUser) => {
  const newSdk = createSdkInstance();

  const subAccountEmail = subAccount.attributes.email;
  const subAccountPassword =
    subAccount.attributes.profile.privateData.accountPassword;
  await newSdk.login({
    username: subAccountEmail,
    password: subAccountPassword,
  });
  return newSdk;
};

export default subAccountLogin;
