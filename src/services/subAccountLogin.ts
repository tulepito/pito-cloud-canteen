import { createSdkInstance } from '@sharetribe/sdk';
import type { TUser } from '@utils/types';
import get from 'lodash/get';

const subAccountLogin = async (subAccount: TUser) => {
  const newSdk = createSdkInstance();
  const privateData = get(subAccount, 'attributes.profile.privateData', {});
  const subAccountEmail = subAccount.attributes.email;
  const { accountPassword: subAccountPassword } = privateData;

  await newSdk.login({
    username: subAccountEmail,
    password: subAccountPassword,
  });

  return newSdk;
};

export default subAccountLogin;
