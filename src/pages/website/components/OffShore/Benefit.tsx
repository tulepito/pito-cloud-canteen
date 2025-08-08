import {
  PiChatCircle,
  PiCheck,
  PiClock,
  PiHandshake,
  PiHeart,
  PiUsersThree,
} from 'react-icons/pi';
import { useIntl } from 'react-intl';
import Image from 'next/image';

import blue from '../../assets/decorations/blue.svg';
import pink from '../../assets/decorations/pink.svg';
import yellow from '../../assets/decorations/yellow.svg';

const Benefit = () => {
  const intl = useIntl();

  return (
    <div className="flex flex-col md:gap-10 md:mb-36 mb-20 gap-5 relative max-w-[1024px] mx-auto px-5 md:px-0">
      {/* Heading */}
      <div className="flex flex-col gap-2 items-center">
        <span className="text-text w-full md:w-2/3 text-center font-semibold">
          {intl.formatMessage({
            id: 'reclaim-your-time-boost-team-satisfaction',
          })}
        </span>
        <span className="font-alt text-2xl font-[unbounded] font-semibold md:text-[40px] text-center md:leading-tight md:whitespace-pre-line">
          What Startups Get from <br className="hidden md:block" /> PITO Cloud
          Canteen?
        </span>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-5">
        {/* Card 1 */}
        <div className="flex md:flex-row gap-[10px] items-center border border-black/10 bg-white rounded-2xl md:rounded-3xl px-3 py-4 md:p-5">
          <div className="shrink-0 bg-[#F6AFCE]/30 text-[#D680A3] size-8 md:size-10 rounded-full flex items-center justify-center text-2xl">
            <PiClock className="text-xl md:text-2xl" />
          </div>
          <span className="font-medium text-base md:font-semibold md:text-lg md:h-[56px] flex items-center">
            Save 10+ hours/week for Admin/HR
          </span>
        </div>

        {/* Card 2 */}
        <div className="flex md:flex-row gap-[10px] items-center border border-black/10 bg-white rounded-2xl md:rounded-3xl px-3 py-4 md:p-5">
          <div className="shrink-0 bg-[#6CCFF6]/30 text-[#3598BF] size-8 md:size-10 rounded-full flex items-center justify-center text-2xl">
            <PiHeart className="text-xl md:text-2xl" />
          </div>
          <span className="font-medium text-base md:font-semibold md:text-lg md:h-[56px] flex items-center">
            Improve delivery team satisfaction & focus
          </span>
        </div>

        {/* Card 3 */}
        <div className="flex md:flex-row gap-[10px] items-center border border-black/10 bg-white rounded-2xl md:rounded-3xl px-3 py-4 md:p-5">
          <div className="shrink-0 bg-[#C5D475]/30 text-[#96A546] size-8 md:size-10 rounded-full flex items-center justify-center text-2xl">
            <PiCheck className="text-xl md:text-2xl" />
          </div>
          <span className="font-medium text-base md:font-semibold md:text-lg md:h-[56px] flex items-center">
            Adjust meals daily without Zalo or Excel
          </span>
        </div>
        <div className="col-span-1 flex md:flex-row gap-[10px] items-center border border-black/10 bg-white rounded-2xl md:rounded-3xl px-3 py-4 md:p-5">
          <div className="shrink-0 bg-[#F6AFCE]/30 text-[#D680A3] size-8 md:size-10 rounded-full flex items-center justify-center text-2xl">
            <PiChatCircle className="text-xl md:text-2xl" />
          </div>
          <span className="font-medium text-base md:font-semibold md:text-lg md:h-[56px] flex items-center">
            Respond instantly to employee feedback
          </span>
        </div>
        <div className="col-span-1 flex md:flex-row gap-[10px] items-center border border-black/10 bg-white rounded-2xl md:rounded-3xl px-3 py-4 md:p-5">
          <div className="shrink-0 bg-[#6CCFF6]/30 text-[#3598BF] size-8 md:size-10 rounded-full flex items-center justify-center text-2xl">
            <PiHandshake className="text-xl md:text-2xl" />
          </div>
          <span className="font-medium text-base md:font-semibold md:text-lg md:h-[56px] flex items-center">
            Edit orders, pause meals, change portions
          </span>
        </div>
        <div className="col-span-1 flex md:flex-row gap-[10px] items-center border border-black/10 bg-white rounded-2xl md:rounded-3xl px-3 py-4 md:p-5">
          <div className="shrink-0 bg-[#C5D475]/30 text-[#96A546] size-8 md:size-10 rounded-full flex items-center justify-center text-2xl">
            <PiUsersThree className="text-xl md:text-2xl" />
          </div>
          <span className="font-medium text-base md:font-semibold md:text-lg md:h-[56px] flex items-center">
            Adapt to changing headcounts & overlapping shifts
          </span>
        </div>
      </div>

      {/* Decorations */}
      <div className="aspect-[247/285] w-[40%] top-[10%] -left-[25%] absolute -z-20 -rotate-[148deg] hidden md:block">
        <Image src={pink} alt="pink triangle decor" fill />
      </div>
      <Image
        src={yellow}
        className="absolute size-20 -bottom-[2%] -left-[25%] -z-10 hidden md:block"
        alt="yellow circle decor"
      />
      <Image
        src={yellow}
        className="absolute size-20 top-[35%] -right-[22%] -z-10 hidden md:block"
        alt="yellow circle decor"
      />
      <div className="aspect-[247/285] w-[45%] top-[14%] -right-[25%] absolute -z-20 -rotate-[22deg] hidden md:block">
        <Image src={blue} alt="pink triangle decor" fill />
      </div>
    </div>
  );
};

export default Benefit;
