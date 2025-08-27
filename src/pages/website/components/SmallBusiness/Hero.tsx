import { useIntl } from 'react-intl';
import Image from 'next/image';

import { useModal } from '@pages/website/pages/Layout';

import blue from '../../assets/decorations/blue2.svg';
import lemon from '../../assets/decorations/lemon.svg';
import pink from '../../assets/decorations/pink.svg';
import imageDecor1Alt2 from '../../assets/decorations/PITO-cloud-canteen-dat-com-trua-van-phong.webp';
import yellow from '../../assets/decorations/yellow.svg';

const Hero = () => {
  const intl = useIntl();
  const { setIsModalOpen } = useModal();

  return (
    <div className="w-full md:min-h-[35rem] md:px-0 px-5 relative max-w-[1024px] mx-auto">
      <div className="flex md:flex-row flex-col-reverse items-center md:justify-start justify-center md:py-20 mb-5 md:mb-0">
        <div className="flex flex-col md:items-start items-center md:text-left text-center md:gap-5 gap-2 md:w-[55%] w-full pt-0 md:pb-0 pb-50">
          <div className="md:hidden h-[80px]"></div>
          <h1 className="font-[unbounded] font-bold text-3xl md:text-[40px] leading-tight">
            <span className="text-[#D680A3]">
              {intl.formatMessage({ id: 'lunch-made-easy-0' })},{' '}
            </span>
            <br className="hidden md:block" />
            {intl.formatMessage({ id: 'for-teams-with-no-time-to-waste' })}
          </h1>
          <span className="md:text-lg font-medium">
            {intl.formatMessage({
              id: 'no-more-collecting-orders-manually-in-excel-files-no-more-tedious-zalo-messages-pito-helps-you-plan-your-teams-lunch-for-the-entire-week-in-just-a-few-minutes',
            })}
          </span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="capitalize btn border font-[unbounded] border-gray-300 bg-black text-white py-3 px-6 font-semibold hover:opacity-90 transition-all duration-200 hover:scale-[1.01] mt-4">
            {intl.formatMessage({ id: 'free-consultation-0' })}{' '}
          </button>
          <div className="md:hidden h-[200px]"></div>
        </div>
      </div>
      {/* decorations */}
      <Image
        src={yellow}
        alt="yellow circle decor"
        className="md:top-8 md:-left-[26%] md:right-auto right-0 md:bottom-auto -bottom-20 md:size-11 size-24 absolute z-10"
      />
      <Image
        src={lemon}
        alt="lemon triangle decor"
        className="md:size-64 size-40 md:rotate-10 -rotate-16 md:top-0 -translate-y-32 translate-x-8 md:transform-none -left-10 md:-left-[50%] absolute -z-[999]"
      />
      <Image
        src={lemon}
        alt="lemon triangle decor"
        className="absolute size-34 -rotate-80 -bottom-10 -z-20 md:hidden flex md:transform-none scale-[0.4] translate-x-[-200px] translate-y-[-480px]"
      />
      <Image
        src={pink}
        alt="lemon triangle decor"
        className="md:size-80 size-30 md:top-72 -top-15 md:-rotate-[150deg] -rotate-120 -right-20 md:right-auto md:-left-[50%] left-auto absolute -z-10 md:transform-none scale-[0.4] translate-x-[120px] translate-y-[-720px] -rotate-90"
      />
      <Image
        src={blue}
        alt="blue decor"
        className="md:top-20 md:-right-40 -top-10 md:size-[400px] size-56 rotate-[22deg] absolute -z-20 md:flex hidden"
      />
      <div className="md:top-20 md:-right-20 md:bottom-auto -bottom-16 right-8  md:h-[340px] md:w-fit aspect-[3/2] w-80 absolute -z-20">
        <Image
          src={imageDecor1Alt2}
          alt="image decor"
          fill
          className="object-contain"
        />
      </div>
    </div>
  );
};

export default Hero;
