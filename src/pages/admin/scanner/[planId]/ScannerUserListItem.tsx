import React from 'react';
import { PiClock } from 'react-icons/pi';
import classNames from 'classnames';
import { motion } from 'framer-motion';

export const ScannerUserListItem = ({
  userName,
  userProfileImageUrl,
  userAbbrName,
  foodName,
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
      className={classNames(
        'rounded-3xl w-full border border-neutral-200 cursor-pointer',
        state === 'live' ? 'bg-white' : 'bg-green-200',
      )}>
      <div
        className="px-12 py-10 flex flex-col gap-20 z-10 w-full"
        onClick={onClick}>
        {foodName && (
          <div className="text-black text-6xl font-semibold line-clamp-3 h-fit leading-normal">
            {foodName}
          </div>
        )}
        <div className="flex flex-row justify-between items-center w-full">
          {userName && (
            <div className="text-black text-base font-semibold flex items-center gap-3">
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
                      backgroundColor: '#fe693c',
                    }}>
                    {userAbbrName}
                  </div>
                )}
              </div>
              <div className="text-neutral-500 line-clamp-1 text-3xl font-normal">
                {userName}
              </div>
            </div>
          )}

          {scannedAt && (
            <div className="text-3xl text-neutral-500 font-normal flex flex-row items-center">
              <PiClock className="inline-block mr-2" size={32} />
              {scannedAt}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
