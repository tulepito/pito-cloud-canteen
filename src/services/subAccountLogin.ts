import { createSdkInstance } from '@sharetribe/sdk';
import type { TUser } from '@utils/types';
import CryptoJS from 'crypto-js';
import get from 'lodash/get';

const subAccountLogin = async (subAccount: TUser) => {
  const newSdk = createSdkInstance();
  const privateData = get(subAccount, 'attributes.profile.privateData', {});
  const subAccountEmail = subAccount.attributes.email;
  const { accountPassword: subAccountPassword } = privateData;
  const decryptedPassword = CryptoJS.AES.decrypt(
    subAccountPassword,
    process.env.ENCRYPT_PASSWORD_SECRET_KEY,
  );
  const password = decryptedPassword.toString(CryptoJS.enc.Utf8);

  await newSdk.login({
    username: subAccountEmail,
    password,
  });

  return newSdk;
};

export default subAccountLogin;
