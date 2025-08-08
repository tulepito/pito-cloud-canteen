import { PiForkKnife, PiUser, PiUsersThreeLight } from 'react-icons/pi';
import { useIntl } from 'react-intl';
import Image from 'next/image';

import pink from '../assets/decorations/pink.svg';
import yellow from '../assets/decorations/yellow.svg';

const HighlightedFeaturesCard = () => {
  const intl = useIntl();

  return (
    <div className="flex flex-col md:gap-12 md:pb-16 md:px-0 px-2 pb-10 pt-10 md:pt-16 gap-10 relative max-w-[1024px] mx-auto">
      {/* Heading */}
      <div className="flex flex-col gap-2 items-center">
        <span className="w-2/3 text-center font-medium">
          {intl.formatMessage({
            id: 'reclaim-your-time-boost-team-satisfaction',
          })}
        </span>
        <h2 className="font-[unbounded] text-3xl md:text-[40px] font-bold md:w-1/2 text-center md:leading-tight">
          {intl.formatMessage({ id: 'highlighted-features' })}
        </h2>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:px-0">
        {/* Card 1 */}
        <div className="flex md:flex-col gap-8 justify-between border border-black/10 bg-white rounded-3xl p-5">
          <div className="shrink-0 bg-[#F6AFCE]/30 text-[#D680A3] size-10 rounded-full flex items-center justify-center text-xl">
            <PiUser />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold">
              {intl.formatMessage({ id: 'auto-pilot-for-admins-0' })}
            </h3>
            <span className="text-sm md:min-h-[60.01px]">
              {intl.formatMessage({
                id: 'schedule-once-for-the-week-monitor-everything-on-the-system-and-make-real-time-edits-with-ease',
              })}
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="flex md:flex-col gap-8 justify-between border border-black/10 bg-white rounded-3xl p-5">
          <div className="shrink-0 bg-[#6CCFF6]/30 text-[#3598BF] size-10 rounded-full flex items-center justify-center text-xl">
            <PiUsersThreeLight />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold">
              {intl.formatMessage({ id: 'auto-pilot-for-participants' })}
            </h3>
            <span className="text-sm">
              {intl.formatMessage({
                id: 'weekly-meal-reminders-dietary-filtering-and-curated-menus-set-it-and-enjoy-it-hassle-free',
              })}
            </span>
          </div>{' '}
        </div>

        {/* Card 3 */}
        <div className="flex md:flex-col gap-8 justify-between border border-black/10 bg-white rounded-3xl p-5">
          <div className="shrink-0 bg-[#C5D475]/30 text-[#96A546] size-10 rounded-full flex items-center justify-center text-xl">
            <PiForkKnife />
          </div>

          <div className="flex flex-col gap-1">
            <h3 className="font-semibold">
              {intl.formatMessage({ id: 'personalized-packaging-0' })}
            </h3>
            <span className="text-sm">
              {intl.formatMessage({
                id: 'each-box-is-labeled-with-the-employees-name-meal-details-and-dietary-information-no-more-lunchtime-mix-ups-0',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Decorations */}
      <Image
        src={pink}
        className="absolute md:top-68 top-60 md:left-12 -left-24 size-64 -rotate-90 -z-10"
        alt="pink decor"
      />
      <Image
        src={yellow}
        className="absolute md:bottom-28 md:top-auto top-40 md:right-44 -right-12 size-20 -z-10"
        alt="yellow circle decor"
      />
    </div>
  );
};

export default HighlightedFeaturesCard;
