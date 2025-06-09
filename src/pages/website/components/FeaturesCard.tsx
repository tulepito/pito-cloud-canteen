import {
  PiHourglassMedium,
  PiRobotLight,
  PiUsersThreeLight,
} from 'react-icons/pi';
import { useIntl } from 'react-intl';
import Image from 'next/image';

import lemon from '../assets/decorations/lemon.svg';
import yellow from '../assets/decorations/yellow.svg';

const FeaturesCard = () => {
  const intl = useIntl();

  return (
    <div className="flex flex-col md:gap-10 md:pb-16 gap-5 relative max-w-[1024px] mx-auto">
      {/* Heading */}
      <div className="flex flex-col gap-2 items-center">
        <span className="text-text w-full md:w-2/3 text-center">
          {intl.formatMessage({
            id: 'reclaim-your-time-boost-team-satisfaction',
          })}
        </span>
        <span className="font-alt text-2xl md:text-[42px] font-bold text-center md:leading-[3rem] md:whitespace-pre-line">
          {intl.formatMessage({
            id: 'designed-for-hr-and-admin-professionals-in-tech',
          })}
        </span>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1 */}
        <div className="flex md:flex-col gap-8 justify-between border border-black/10 bg-white rounded-3xl p-5">
          <div className="shrink-0 bg-[#F6AFCE]/30 text-[#D680A3] size-10 rounded-full flex items-center justify-center text-xl">
            <PiHourglassMedium />
          </div>
          <span>
            {intl.formatMessage({
              id: 'eliminate-endless-slack-messages-and-manual-spreadsheets',
            })}
          </span>
        </div>

        {/* Card 2 */}
        <div className="flex md:flex-col gap-8 justify-between border border-black/10 bg-white rounded-3xl p-5">
          <div className="shrink-0 bg-[#FFC811]/30 text-[#C79000] size-10 rounded-full flex items-center justify-center text-xl">
            <PiUsersThreeLight />
          </div>
          <span>
            {intl.formatMessage({
              id: 'flexible-meal-solutions-for-dynamic-fast-changing-teams',
            })}
          </span>
        </div>

        {/* Card 3 */}
        <div className="flex md:flex-col gap-8 justify-between border border-black/10 bg-white rounded-3xl p-5">
          <div className="shrink-0 bg-[#6CCFF6]/30 text-[#3598BF] size-10 rounded-full flex items-center justify-center text-xl">
            <PiRobotLight />
          </div>
          <span>
            {intl.formatMessage({
              id: 'intelligent-ordering-that-adapts-to-your-people-and-operations',
            })}
          </span>
        </div>
      </div>

      {/* Decorations */}
      <Image
        src={lemon}
        className="absolute md:top-32 top-60 md:-left-10 -left-24 size-36 -rotate-45 -z-10"
        alt="lemon triangle decor"
      />
      <Image
        src={yellow}
        className="absolute md:bottom-24 md:top-auto top-40 md:-right-12 -right-12 size-20 -z-10"
        alt="yellow circle decor"
      />
    </div>
  );
};

export default FeaturesCard;
