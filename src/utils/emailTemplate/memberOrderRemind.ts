type TMemberOrderRemindParams = {
  // url: /participant/order/[orderId]
  url: string;
  deadline: string;
  description?: string;
};
export const memberOrderRemind = ({
  url,
  deadline,
  description,
}: TMemberOrderRemindParams) => {
  return `
  <p>Nhắc nhở đặt phần ăn. </p>
  <p>Vui lòng nhấn vào <a href="${url}" target="_blank">đây</a> để đặt món trước hạn định (${deadline})</p>
  <div>${description}</div>
  `;
};
