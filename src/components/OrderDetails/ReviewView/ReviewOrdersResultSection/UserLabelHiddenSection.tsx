import { shallowEqual } from 'react-redux';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';

import { useAppSelector } from '@hooks/reduxHooks';
import type { UserListing } from '@src/types';

import UserLabelCellContent from './UserLabelCellContent';

interface UserLabelRecord {
  partnerName: string;
  companyName: string;
  mealDate: string;
  participantName: string;
  foodName: string;
  ratingUrl: string;
  requirement?: string;
}

function UserLabelHiddenSection({
  preparedData,
  targetedDate,
}: {
  preparedData: any[];
  targetedDate: string;
}) {
  const company: UserListing | null = useAppSelector(
    (state) => state.OrderManagement.companyData,
    shallowEqual,
  );
  const router = useRouter();

  const userLabelRecords = preparedData.reduce<UserLabelRecord[]>(
    (result, { date, orderData }) => {
      if (date === targetedDate || targetedDate === 'all') {
        const userLabelData = orderData.map(
          ({
            memberData,
            foodData,
            restaurant,
          }: {
            memberData: {
              name: string;
            };
            foodData: {
              foodName: string;
              requirement: string;
            };
            restaurant: {
              restaurantName: string;
            };
          }) => {
            const { name: participantName } = memberData || {};
            const { foodName, requirement } = foodData || {};

            return {
              partnerName: restaurant?.restaurantName,
              requirement,
              companyName:
                company?.attributes?.profile?.publicData?.companyName,
              mealDate: DateTime.fromMillis(Number(date)).toFormat(
                'dd/MM/yyyy',
              ),
              participantName,
              foodName,
              ratingUrl: `${process.env.NEXT_PUBLIC_CANONICAL_URL}/participant/order/${router.query.orderId}/?subOrderDate=${date}&openRatingModal=true`,
            };
          },
        );

        return result.concat(userLabelData);
      }

      return result;
    },
    [] as UserLabelRecord[],
  );

  const chunksOf18UserLabelRecords = (() => {
    const sameDateMap = userLabelRecords.reduce((result, current) => {
      const { mealDate } = current;
      if (result[mealDate]) {
        result[mealDate].push(current);
      } else {
        result[mealDate] = [current];
      }

      return result;
    }, {} as Record<string, UserLabelRecord[]>);

    const chunks = Object.values(sameDateMap).reduce((result, current) => {
      const chunkSize = 18;
      const chunk = [];
      for (let i = 0; i < current.length; i += chunkSize) {
        chunk.push(current.slice(i, i + chunkSize));
      }

      return result.concat(chunk);
    }, [] as UserLabelRecord[][]);

    return chunks;
  })();

  return (
    <div className="h-0 overflow-hidden absolute">
      <div>
        {chunksOf18UserLabelRecords.map((userLabelRecordsx18, index) => (
          <div
            key={index}
            className="grid grid-cols-3 w-[210mm] h-[297mm] content-start"
            id={`printable-area-${index}`}>
            {userLabelRecordsx18.map((userLabelRecord, idx) => (
              <div key={idx} className="w-full h-[49.5mm]">
                <UserLabelCellContent
                  partnerName={userLabelRecord.partnerName}
                  companyName={userLabelRecord.companyName}
                  mealDate={userLabelRecord.mealDate}
                  participantName={userLabelRecord.participantName}
                  foodName={userLabelRecord.foodName}
                  ratingUrl={userLabelRecord.ratingUrl}
                  note={userLabelRecord.requirement}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserLabelHiddenSection;
