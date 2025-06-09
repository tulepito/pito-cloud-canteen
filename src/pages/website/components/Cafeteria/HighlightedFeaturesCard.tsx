import { PiFileTextLight, PiForkKnife, PiUser } from 'react-icons/pi';
import Image from 'next/image';

import pink from '../../assets/decorations/pink.svg';
import yellow from '../../assets/decorations/yellow.svg';

const HighlightedFeaturesCard = () => {
  return (
    <div className="flex flex-col md:gap-20 md:pb-36 md:p-20 md:px-0 px-2 pt-16 gap-10 relative max-w-[1024px] mx-auto">
      {/* Heading */}
      <div className="flex flex-col gap-2 items-center">
        <span className="text-text w-2/3 text-center">
          Reclaim Your Time. Boost Team Satisfaction
        </span>
        <span className="font-alt text-2xl md:text-4xl font-bold md:w-1/2 text-center md:leading-[3rem]">
          Highlighted Features
        </span>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:px-0">
        {/* Card 1 */}
        <div className="flex md:flex-col gap-6 border border-black/10 bg-white rounded-3xl p-5">
          <div className="shrink-0 bg-[#6CCFF6]/30 text-[#3598BF] size-10 rounded-full flex items-center justify-center text-xl">
            <PiUser />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-semibold">Flexible Grouping</span>
            <span className="text-sm">
              Eliminate endless Slack messages and manual spreadsheets
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="flex md:flex-col gap-6 border border-black/10 bg-white rounded-3xl p-5">
          <div className="shrink-0 bg-[#F6AFCE]/30 text-[#D680A3] size-10 rounded-full flex items-center justify-center text-xl">
            <PiFileTextLight />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-semibold">Department-Based Reporting</span>
            <span className="text-sm">
              Easily track costs by department or for the entire company.
            </span>
          </div>{' '}
        </div>

        {/* Card 3 */}
        <div className="flex md:flex-col gap-6 border border-black/10 bg-white rounded-3xl p-5">
          <div className="shrink-0 bg-[#C5D475]/30 text-[#96A546] size-10 rounded-full flex items-center justify-center text-xl">
            <PiForkKnife />
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-semibold">On-Site Setup & Service</span>
            <span className="text-sm">
              For orders of 150+ meals per day, a dedicated team is available to
              set up and serve on-site.
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
