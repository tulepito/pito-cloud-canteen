import { calculateGroupMembers } from '@helpers/company';

export const getInitMemberOrder = ({
  companyAccount,
  selectedGroups,
}: {
  companyAccount: any;
  selectedGroups: any[];
}) => {
  const allMembers = calculateGroupMembers(companyAccount, selectedGroups);
  const initialMemberOrder = allMembers.reduce(
    (result: any, _memberId: any) => ({
      ...result,
      [_memberId]: {
        foodId: '',
        status: 'empty',
      },
    }),
    {},
  );

  return initialMemberOrder;
};
