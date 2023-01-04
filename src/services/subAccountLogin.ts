import { createSdkInstance } from '@sharetribe/sdk';
import type { TUser } from '@utils/types';
import CryptoJS from 'crypto-js';

const subAccountLogin = async (subAccount: TUser) => {
  const newSdk = createSdkInstance();

  const subAccountEmail = subAccount.attributes.email;
  const subAccountPassword =
    subAccount.attributes.profile.privateData.accountPassword;

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
