const CryptoJS = require('crypto-js');

const {
  createSdkInstance,
  getTrustedSdkWithSubAccountToken,
} = require('./sdk');
const config = require('./config');

const getSubAccountTrustedSdk = async (subAccount) => {
  const newSdk = createSdkInstance();

  const subAccountEmail = subAccount.attributes.email;
  const subAccountPassword =
    subAccount.attributes.profile.privateData?.accountPassword;

  const decryptedPassword = CryptoJS.AES.decrypt(
    subAccountPassword,
    config.encryptPasswordSecretKey,
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
  getSubAccountTrustedSdk,
};
