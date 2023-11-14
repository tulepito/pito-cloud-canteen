/* eslint-disable no-bitwise */
const DEFAULT_SALT = 'PitoCloudCanteen'; // Replace with your own secret salt

const generateUncountableId = (countableId, salt = DEFAULT_SALT) => {
  // Choose a hash function, such as SHA-256, from a library or implement your own
  // Here's an example using a simple hash function that concatenates the ID with a secret salt
  const combinedID = countableId + salt; // Concatenate the ID with the salt
  let hash = 0;

  // Loop through each character in the combined ID and calculate the hash
  for (let i = 0; i < combinedID.length; i++) {
    const char = combinedID.charCodeAt(i); // Get the Unicode value of the character
    hash = (hash << 5) - hash + char; // Perform a simple bitwise left shift and subtraction to calculate the hash
  }

  // Convert the hash to a positive integer
  hash = Math.abs(hash);

  // Convert the hash to a 5-character string with uppercase letters and numbers
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let uncountableID = '';
  for (let i = 0; i < 5; i++) {
    const index = hash % alphabet.length;
    uncountableID += alphabet.charAt(index);
    hash = Math.floor(hash / alphabet.length);
  }

  return uncountableID;
};

const generateUncountableIdForQuotation = (countableId) => {
  return generateUncountableId(countableId, 'PitoCloudCanteenQuotation');
};

module.exports = {
  generateUncountableId,
  generateUncountableIdForQuotation,
};
