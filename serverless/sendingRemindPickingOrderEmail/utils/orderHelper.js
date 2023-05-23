const getPCCFeeByMemberAmount = (memberAmount) => {
  if (memberAmount < 30) {
    return 70000;
  }
  if (memberAmount < 45) {
    return 150000;
  }
  if (memberAmount < 60) {
    return 140000;
  }
  if (memberAmount < 75) {
    return 200000;
  }
  if (memberAmount < 105) {
    return 230000;
  }
  if (memberAmount < 130) {
    return 250000;
  }

  return 500000;
};

const ORDER_STATE_PICKING = 'picking';

const orderStatesShouldSendEmail = [ORDER_STATE_PICKING];

module.exports = { getPCCFeeByMemberAmount, orderStatesShouldSendEmail };
