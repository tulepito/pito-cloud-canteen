import React from 'react';
import classNames from 'classnames';
import { motion } from 'framer-motion';

import ResponsiveImage from '@components/ResponsiveImage/ResponsiveImage';

import { ScannerIcon } from './ScannerIcon';

export const ScannerUserListItem = ({
  userName,
  userProfileImageUrl,
  userAbbrName,
  foodName,
  foodThumbnailUrl,
  scannedAt,
  state,
  onClick,
}: {
  userName: string;
  userProfileImageUrl?: string;
  userAbbrName?: string;
  foodName: string;
  foodThumbnailUrl?: string;
  scannedAt: string;
  state: 'live' | 'offline';
  onClick: () => void;
}) => {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={classNames('p-2 bg-white shadow-lg rounded-3xl', {
        'shadow-xl': state === 'live',
      })}>
      <div
        style={{
          backgroundColor:
            state === 'live' ? '#FF5722' : 'rgba(255, 255, 255, 0.5)',
        }}
        className={classNames(
          `flex min-h-[200px] gap-4 items-center rounded-3xl cursor-pointer hover:opacity-90 transition-opacity duration-300 overflow-hidden border border-gray-200 border-solid`,
          {
            '!bg-gray-400': state === 'offline',
          },
        )}
        onClick={onClick}>
        <div className="h-full rounded-3xl overflow-hidden min-h-[200px] border-r-[8px] border-white border-solid aspect-[9/6] bg-white relative">
          <ResponsiveImage
            style={{
              objectFit: 'cover',
            }}
            image={null}
            className="w-full h-full"
            src={foodThumbnailUrl}
            alt={foodName}
            emptyType="food"
          />
        </div>
        <div className="p-4 flex flex-col gap-2 z-10">
          {foodName && (
            <div className="text-white text-3xl font-semibold line-clamp-1">
              {foodName}
            </div>
          )}
          {userName && (
            <div className="text-white text-base font-semibold flex items-center gap-2">
              <div className="min-w-[40px] min-h-[40px] w-[40px] h-[40px] rounded-full bg-gray-400 border-2 border-solid border-white overflow-hidden">
                {userProfileImageUrl && (
                  <img
                    src={userProfileImageUrl}
                    alt={userName}
                    className="object-cover rounded-full w-full h-full"
                  />
                )}

                {!userProfileImageUrl && (
                  <div
                    className="flex justify-center items-center h-full text-white text-base font-semibold"
                    style={{
                      backgroundColor: '#FF5722',
                    }}>
                    {userAbbrName}
                  </div>
                )}
              </div>
              <div className="text-white line-clamp-1">{userName}</div>
            </div>
          )}

          {scannedAt && (
            <div className="flex items-center gap-1 text-white">
              <div className="min-w-[40px] flex justify-center items-center">
                <ScannerIcon />
              </div>
              <div className="">{scannedAt}</div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
