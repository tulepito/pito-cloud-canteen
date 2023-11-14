const CryptoJS = require('crypto-js');

const {
  createSdkInstance,
  getTrustedSdkWithSubAccountToken,
} = require('./sdk');

const getSubAccountSdk = async (subAccount) => {
  const newSdk = createSdkInstance();

  const subAccountEmail = subAccount.attributes.email;
  const subAccountPassword =
    subAccount.attributes.profile.privateData?.accountPassword;

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

const getSubAccountTrustedSdk = async (subAccount) => {
  const newSdk = createSdkInstance();

  const subAccountEmail = subAccount.attributes.email;
  const subAccountPassword =
    subAccount.attributes.profile.privateData?.accountPassword;

  const decryptedPassword = CryptoJS.AES.decrypt(
    subAccountPassword,
    process.env.ENCRYPT_PASSWORD_SECRET_KEY,
  );
  const password = decryptedPassword.toString(CryptoJS.enc.Utf8);

  const { data } = await newSdk.login({
    username: subAccountEmail,
    password,
  });

  const trustedSdk = await getTrustedSdkWithSubAccountToken(data);

  return trustedSdk;
};

module.exports = {
  getSubAccountSdk,
  getSubAccountTrustedSdk,
};
