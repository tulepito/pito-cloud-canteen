type CompanyInvitationParams = {
  companyName: string;

  // url: /company-invitation/[companyId]
  url: string;
};
export const companyInvitation = ({
  companyName,
  url,
}: CompanyInvitationParams) => {
  return `
  <p>Bạn nhận được một lời mời tham gia vào công ty ${companyName}. 
  Vui lòng nhấn vào <a href="${url}" target="_blank">đây</a> để chấp nhận hoặc từ chối lời mời</p>
  `;
};
