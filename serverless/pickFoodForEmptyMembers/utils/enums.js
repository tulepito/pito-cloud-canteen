const EOrderType = {
  normal: 'normal',
  group: 'group',
};

const EParticipantOrderStatus = {
  empty: 'empty',
  joined: 'joined',
  notJoined: 'notJoined',
  notAllowed: 'notAllowed',
  expired: 'expired',
};

const ALLERGIES_OPTIONS = [
  {
    key: 'egg',
    label: 'Trứng',
  },
  {
    key: 'shrimp',
    label: 'Tôm',
  },
  {
    key: 'seafood',
    label: 'Hải sản',
  },
  {
    key: 'msg',
    label: 'Bột ngọt',
  },
  {
    key: 'soy',
    label: 'Đậu nành',
  },
];

module.exports = {
  EOrderType,
  EParticipantOrderStatus,
  ALLERGIES_OPTIONS,
};
