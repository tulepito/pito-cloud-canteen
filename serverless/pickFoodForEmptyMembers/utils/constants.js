require('dotenv').config();

const VEGETARIAN_ONLY_USER_IDS =
  JSON.parse(process.env.VEGETARIAN_ONLY_USER_IDS) || [];

module.exports = {
  VEGETARIAN_ONLY_USER_IDS,
};
