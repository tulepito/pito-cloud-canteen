import { PiFileTextLight, PiForkKnife, PiUser } from 'react-icons/pi';
import { useIntl } from 'react-intl';
import Image from 'next/image';

import pink from '../../assets/decorations/pink.svg';
import yellow from '../../assets/decorations/yellow.svg';

const HighlightedFeaturesCard = () => {
  const intl = useIntl();

  return (
    <div className="flex flex-col md:gap-20 md:pb-16 md:pt-16 md:px-0 px-2 py-10 gap-10 relative max-w-[1024px] mx-auto">
      {/* Heading */}
      <div className="flex flex-col gap-2 items-center">
        <span className="w-full md:w-2/3 text-center font-medium">
          {intl.formatMessage({
            id: 'reclaim-your-time-boost-team-satisfaction',
          })}
        </span>
        <h2 className="font-[unbounded] text-3xl md:text-[40px] font-bold w-full md:w-[60%] text-center md:leading-tight">
          {intl.formatMessage({ id: 'highlighted-features' })}
        </h2>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:px-0">
        {/* Card 1 */}
        <div className="flex md:flex-col gap-6 border border-black/10 bg-white rounded-3xl p-5">
          <div className="shrink-0 bg-[#6CCFF6]/30 text-[#3598BF] size-10 rounded-full flex items-center justify-center text-xl">
            <PiUser />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-semibold">
              {intl.formatMessage({ id: 'flexible-grouping' })}
            </span>
            <span className="text-sm">
              {intl.formatMessage({
                id: 'eliminate-endless-slack-messages-and-manual-spreadsheets-0',
              })}
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="flex md:flex-col gap-6 border border-black/10 bg-white rounded-3xl p-5">
          <div className="shrink-0 bg-[#F6AFCE]/30 text-[#D680A3] size-10 rounded-full flex items-center justify-center text-xl">
            <PiFileTextLight />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-semibold">
              {intl.formatMessage({ id: 'department-based-reporting' })}
            </span>
            <span className="text-sm">
              {intl.formatMessage({
                id: 'easily-track-costs-by-department-or-for-the-entire-company',
              })}
            </span>
          </div>{' '}
        </div>

        {/* Card 3 */}
        <div className="flex md:flex-col gap-6 border border-black/10 bg-white rounded-3xl p-5">
          <div className="shrink-0 bg-[#C5D475]/30 text-[#96A546] size-10 rounded-full flex items-center justify-center text-xl">
            <PiForkKnife />
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-semibold">
              {intl.formatMessage({ id: 'on-site-setup-and-service-0' })}
            </span>
            <span className="text-sm">
              {intl.formatMessage({
                id: 'for-orders-of-100-meals-per-day-a-dedicated-team-is-available-to-set-up-and-serve-on-site',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Decorations */}
      <Image
        src={pink}
        className="absolute md:top-67 top-60 md:left-34 -left-24 size-64 -rotate-[120deg] -z-10"
        alt="pink decor"
      />
      <Image
        src={yellow}
        className="absolute md:bottom-28 md:top-auto top-40 md:-right-8 -right-12 size-20 -z-10"
        alt="yellow circle decor"
      />
    </div>
  );
};

export default HighlightedFeaturesCard;
