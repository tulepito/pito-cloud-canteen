import Hashes from 'jshashes';

export const hashStr = (str: string, salt?: string) => {
  const SHA1 = new Hashes.SHA1();

  return SHA1.hex_hmac(str, salt);
};
