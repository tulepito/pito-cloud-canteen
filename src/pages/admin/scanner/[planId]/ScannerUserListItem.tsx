import React from 'react';
import classNames from 'classnames';
import { motion } from 'framer-motion';

export const ScannerUserListItem = ({
  userName,
  userProfileImageUrl,
  userAbbrName,
  foodName,
  state,
  note,
  onClick,
}: {
  userName: string;
  userProfileImageUrl?: string;
  userAbbrName?: string;
  foodName: string;
  foodThumbnailUrl?: string;
  scannedAt: string;
  state: 'live' | 'offline';
  note?: string;
  onClick: () => void;
}) => {
  return (
    <motion.div
      layout
      initial={{ scale: 0.5, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{
        scale: 0.8,
        opacity: 0,
        x: -100,
        transition: {
          duration: 0.3,
          ease: 'easeInOut',
        },
      }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={classNames(
        'rounded-3xl w-full border border-neutral-200 cursor-pointer',
        state === 'live' ? 'bg-white' : 'bg-green-200',
      )}>
      <div
        className="px-4 md:px-12 py-4 md:py-10 flex flex-col gap-6 md:gap-20 z-10 w-full"
        onClick={onClick}>
        {foodName && (
          <div className="text-black text-2xl md:text-6xl font-semibold line-clamp-5 md:line-clamp-3 h-fit leading-normal">
            {foodName}
          </div>
        )}
        <div className="flex flex-row justify-between items-center w-full">
          {userName && (
            <div className="text-black text-base font-semibold flex items-center gap-3">
              <div className="min-w-8 min-h-8 md:min-w-[40px] md:min-h-[40px] w-8 h-8 md:w-[40px] md:h-[40px] rounded-full bg-gray-400 border-2 border-solid border-white overflow-hidden">
                {userProfileImageUrl && (
                  <img
                    src={userProfileImageUrl}
                    alt={userName}
                    className="object-cover rounded-full w-full h-full"
                  />
                )}

                {!userProfileImageUrl && (
                  <div
                    className="flex justify-center items-center h-full text-white text-xs md:text-base font-semibold"
                    style={{
                      backgroundColor: '#fe693c',
                    }}>
                    {userAbbrName}
                  </div>
                )}
              </div>
              <div className="text-neutral-500 line-clamp-1 text-lg md:text-3xl font-normal">
                {userName}
              </div>
            </div>
          )}
        </div>

        {note && (
          <path className="text-neutral-700 text-lg md:text-2xl font-normal">
            * {note}
          </path>
        )}
      </div>
    </motion.div>
  );
};
