const { EmailTemplateTypes } = require('./awsSES/config');
const { emailSendingFactory } = require('./awsSES/sendEmail');

module.exports = async ({
  groupFoodIdsBySubOrder,
  allEmptyMembersIds,
  participantResponses,
  newOrderDetail,
  orderResponse,
}) => {
  const handlingSendEmailToParticipants = allEmptyMembersIds.map(
    async (participantId) => {
      const subOrderDateFoodList = Object.keys(groupFoodIdsBySubOrder).map(
        (subOrderDate) => {
          const { memberOrders = {}, restaurant = {} } =
            newOrderDetail[subOrderDate];
          const { foodList = {} } = restaurant;

          const { foodId } = memberOrders[participantId];
          const { foodName } = foodList[foodId];

          return {
            subOrderDate,
            foodName,
          };
        },
      );
      const emailParams = {
        participant: participantResponses.find(
          (participant) => participant.id.uuid === participantId,
        ),
        order: orderResponse,
        subOrderDateFoodList,
      };

      await emailSendingFactory(
        EmailTemplateTypes.PARTICIPANT.PARTICIPANT_AUTO_PICK_FOOD,
        emailParams,
      );
    },
  );

  return handlingSendEmailToParticipants;
};
