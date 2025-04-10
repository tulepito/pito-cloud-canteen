import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { getCompanyRatingsApi } from '@apis/companyApi';
import Avatar from '@components/Avatar/Avatar';
import { EmptyWrapper } from '@pages/admin/scanner/[planId]/EmptyWrapper';
import { LoadingWrapper } from '@pages/admin/scanner/[planId]/LoadingWrapper';
import { enGeneralPaths } from '@src/paths';
import type { OrderListing, RatingListing, UserListing } from '@src/types';
import { buildFullNameFromProfile } from '@src/utils/emailTemplate/participantOrderPicking';

export interface BookerViewerRatingData extends RatingListing {
  reviewer?: UserListing;
  order?: OrderListing;
}

const BookerRatingSection = () => {
  const router = useRouter();
  const { companyId } = router.query;

  const [ratingListing, setRatingListing] = useState<BookerViewerRatingData[]>(
    [],
  );
  const [inProgress, setInProgress] = useState<boolean>(true);

  // load 5 latest rating listing of current company id
  useEffect(() => {
    if (companyId) {
      setInProgress(true);
      getCompanyRatingsApi(companyId as string, {
        page: 1,
        perPage: 3,
      })
        .then(setRatingListing)
        .catch((error) => {
          console.error('Error fetching ratings:', error);
        })
        .finally(() => {
          setInProgress(false);
        });
    }
  }, [companyId]);

  if (!companyId) {
    return null;
  }

  if (!ratingListing?.length) {
    return null;
  }

  return (
    <div className="w-full">
      <LoadingWrapper isLoading={inProgress}>
        <EmptyWrapper blank isEmpty={ratingListing.length === 0}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base md:uppercase md:text-lg md:font-semibold mt-1">
              Đánh giá
            </h3>
            <Link
              href={enGeneralPaths.company['[companyId]'].ratings.index(
                companyId as string,
              )}>
              <div className="flex text-blue-500">
                <p className="text-sm ml-2">Xem tất cả</p>
                <svg
                  width="21"
                  height="20"
                  viewBox="0 0 21 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M4.16797 9.77148C4.16797 9.45507 4.4031 9.19358 4.70816 9.15219L4.79297 9.14648H17.293C17.6381 9.14648 17.918 9.42631 17.918 9.77148C17.918 10.0879 17.6828 10.3494 17.3778 10.3908L17.293 10.3965H4.79297C4.44779 10.3965 4.16797 10.1167 4.16797 9.77148Z"
                    fill="currentColor"></path>
                  <path
                    d="M11.811 5.19307C11.5664 4.94952 11.5655 4.55379 11.8091 4.30919C12.0305 4.08683 12.3776 4.06591 12.6227 4.24693L12.6929 4.30729L17.7346 9.32729C17.9576 9.54936 17.9779 9.89779 17.7955 10.1428L17.7346 10.213L12.693 15.2339C12.4484 15.4774 12.0527 15.4766 11.8091 15.232C11.5877 15.0097 11.5682 14.6624 11.7503 14.4181L11.8109 14.3482L16.4076 9.76993L11.811 5.19307Z"
                    fill="currentColor"></path>
                </svg>
              </div>
            </Link>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            {ratingListing.length > 0 ? (
              ratingListing.map((rating) =>
                rating.reviewer ? (
                  <div
                    key={rating.id?.uuid}
                    className="bg-white rounded-xl p-4 flex gap-2 w-full border border-gray-100 border-solid">
                    <Avatar user={rating.reviewer} className="w-8 h-8" />
                    <div className="flex flex-col gap-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-xs m-0">
                          {buildFullNameFromProfile(
                            rating.reviewer.attributes?.profile,
                          )}
                        </p>
                        <div className="flex items-center gap-0 ml-[-2px]">
                          {new Array(rating.attributes?.metadata?.generalRating)
                            .fill(0)
                            .map((_, _index) => (
                              <svg
                                fill="#ffba42"
                                key={_index}
                                width={16}
                                height={16}
                                viewBox="0 0 1024 1024"
                                xmlns="http://www.w3.org/2000/svg">
                                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                <g
                                  id="SVGRepo_tracerCarrier"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"></g>
                                <g id="SVGRepo_iconCarrier">
                                  {' '}
                                  <path d="M908.1 353.1l-253.9-36.9L540.7 86.1c-3.1-6.3-8.2-11.4-14.5-14.5-15.8-7.8-35-1.3-42.9 14.5L369.8 316.2l-253.9 36.9c-7 1-13.4 4.3-18.3 9.3a32.05 32.05 0 0 0 .6 45.3l183.7 179.1-43.4 252.9a31.95 31.95 0 0 0 46.4 33.7L512 754l227.1 119.4c6.2 3.3 13.4 4.4 20.3 3.2 17.4-3 29.1-19.5 26.1-36.9l-43.4-252.9 183.7-179.1c5-4.9 8.3-11.3 9.3-18.3 2.7-17.5-9.5-33.7-27-36.3z"></path>{' '}
                                </g>
                              </svg>
                            ))}
                        </div>
                      </div>
                      <p className="text-gray-700 text-xs">
                        #{rating.order?.attributes?.title}
                        {!!rating.attributes?.metadata?.detailTextRating &&
                          ` - ${rating.attributes?.metadata?.detailTextRating}`}
                      </p>
                    </div>
                  </div>
                ) : null,
              )
            ) : (
              <p>No ratings available.</p>
            )}
          </div>
        </EmptyWrapper>
      </LoadingWrapper>
    </div>
  );
};

export default BookerRatingSection;
