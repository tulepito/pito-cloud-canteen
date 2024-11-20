import { calculateGroupMembers, ensureActiveUserIds } from '@helpers/company';

export const getInitMemberOrder = async ({
  companyAccount,
  selectedGroups,
}: {
  companyAccount: any;
  selectedGroups: any[];
}) => {
  const allMemberIds = await ensureActiveUserIds(
    calculateGroupMembers(companyAccount, selectedGroups),
  );

  const initialMemberOrder = allMemberIds.reduce(
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
