import { useIntl } from 'react-intl';
import Image from 'next/image';

import { useModal } from '@pages/website/pages/Layout';

import blue from '../../assets/decorations/blue2.svg';
import imageDecor2Alt from '../../assets/decorations/imageDecor2Alt.svg';
import imageDecor3Alt from '../../assets/decorations/imageDecor3Alt.svg';
import lemon from '../../assets/decorations/lemon.svg';
import yellow from '../../assets/decorations/yellow.svg';

const CTA = () => {
  const intl = useIntl();
  const { setIsModalOpen } = useModal();

  return (
    <div className="w-full md:min-h-[40rem] md:px-0 px-5 relative md:mb-0 mb-5 max-w-[1024px] mx-auto">
      {/* main hero section */}
      <div className="flex md:flex-row flex-col-reverse items-center md:justify-start justify-center md:py-16">
        {/* lhs */}
        <div className="flex flex-col md:items-start items-center md:text-left text-center md:gap-5 gap-2 md:w-3/4 w-full md:pt-0 pt-50">
          <div className="md:hidden h-[160px]"></div>
          <span className="text-text md:w-3/4 font-medium">
            {intl.formatMessage({ id: 'your-teams-meals-0' })}
          </span>
          <h2 className="font-[unbounded] font-bold text-3xl md:text-[40px] leading-tight whitespace-pre-line">
            {intl.formatMessage({ id: 'upgrade-your-teams-lunch-experience' })}
          </h2>
          <span className="text-text md:w-[55%] md:text-lg font-medium leading-tight">
            {intl.formatMessage({
              id: 'whether-its-100-or-500-employees-lunch-coordination-is-no-longer-a-hassle',
            })}
          </span>
          <a
            href=""
            onClick={(e) => {
              e.preventDefault();
              setIsModalOpen(true);
            }}
            className="capitalize btn border font-[unbounded] border-gray-300 bg-black text-white py-3 px-6 font-semibold hover:opacity-90 transition-all duration-200 hover:scale-[1.01] mt-4">
            {intl.formatMessage({ id: 'request-a-free-consultation' })}{' '}
          </a>
        </div>
      </div>
      {/* decorations */}
      <Image
        src={yellow}
        alt="yellow circle decor"
        className="md:top-12 md:right-[18rem] right-24 top-24 md:size-16 size-8 absolute z-10"
      />
      <Image
        src={lemon}
        alt="lemon triangle decor"
        className="md:top-[24rem] md:size-64 size-20 -rotate-45 top-0 left-auto md:right-auto right-5 md:-left-80 absolute -z-10 md:flex hidden"
      />
      <Image
        src={lemon}
        alt="lemon triangle decor"
        className="md:top-[20rem] md:size-64 size-40 -rotate-180 top-0 md:right-10 -right-20 absolute -z-10"
      />
      <Image
        src={blue}
        alt="blue decor"
        className="md:-top-40 md:-left-[440px] -left-24 -top-10 md:size-120 size-48 -rotate-[22deg] absolute -z-20"
      />
      <Image
        src={imageDecor2Alt}
        alt="blue decor"
        className="md:top-8 md:-left-[120px] left-12 top-4 md:size-20 size-14 -rotate-22 absolute -z-20"
      />
      <Image
        src={imageDecor3Alt}
        alt="blue decor"
        className="md:top-8 -right-20 -top-20 md:size-[540px] size-[280px] absolute -z-10"
      />
    </div>
  );
};

export default CTA;
