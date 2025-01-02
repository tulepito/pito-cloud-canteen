const getPCCFeeByMemberAmount = (memberAmount) => {
  if (!memberAmount) {
    return 0;
  }

  if (memberAmount < 45) {
    return 169000;
  }

  if (memberAmount < 60) {
    return 210000;
  }

  if (memberAmount < 75) {
    return 258000;
  }

  if (memberAmount < 105) {
    return 333000;
  }

  if (memberAmount < 130) {
    return 396000;
  }

  if (memberAmount < 150) {
    return 438000;
  }

  if (memberAmount < 200) {
    return 558000;
  }

  return 540000;
};

const ORDER_STATE_PICKING = 'picking';

const orderStatesShouldSendEmail = [ORDER_STATE_PICKING];

module.exports = { getPCCFeeByMemberAmount, orderStatesShouldSendEmail };
