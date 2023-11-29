const NATIVE_NOTIFICATION_TYPES = {
  BookerTransitOrderStateToPicking: 'BookerTransitOrderStateToPicking',
  BookerTransitOrderStateToInProgress: 'BookerTransitOrderStateToInProgress',
  AdminTransitSubOrderToDelivering: 'AdminTransitSubOrderToDelivering',
  AdminTransitSubOrderToDelivered: 'AdminTransitSubOrderToDelivered',
  AdminTransitSubOrderToCanceled: 'AdminTransitSubOrderToCanceled',
  TransitOrderStateToCanceled: 'TransitOrderStateToCanceled',
  PartnerTransitOrderToCanceled: 'PartnerTransitOrderToCanceled',
  PartnerEditSubOrder: 'PartnerEditSubOrder',
};
module.exports = { NATIVE_NOTIFICATION_TYPES };
