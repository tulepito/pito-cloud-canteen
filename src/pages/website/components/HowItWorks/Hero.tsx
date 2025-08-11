import { useIntl } from 'react-intl';
import Image from 'next/image';

import { useModal } from '@pages/website/pages/Layout';

import blue from '../../assets/decorations/blue.svg';
import imageDecor1 from '../../assets/decorations/imageDecor1.webp';
import imageDecor2 from '../../assets/decorations/imageDecor2.webp';
import lemon from '../../assets/decorations/lemon.svg';
import lemon2 from '../../assets/decorations/lemon2.svg';
import yellow2 from '../../assets/decorations/yellow2.svg';

interface DecorationItem {
  src: any;
  alt: string;
  className: string;
  isHiddenOnMobile?: boolean;
}

const DECORATIONS: DecorationItem[] = [
  {
    src: yellow2,
    alt: 'yellow circle decor',
    className: 'top-60 size-12 md:top-16 md:right-16 md:size-24 absolute -z-10',
    isHiddenOnMobile: true,
  },
  {
    src: blue,
    alt: 'blue decor',
    className:
      'top-60 size-12 md:top-0 md:-right-44 md:size-[30rem] -rotate-[22deg] absolute -z-20',
    isHiddenOnMobile: true,
  },
  {
    src: lemon,
    alt: 'lemon triangle decor',
    className:
      'top-10 right-0 size-24 -translate-y-28 translate-x-10 md:top-48 md:-right-52 md:size-64 md:translate-y-0 md:translate-x-0 -rotate-[54deg] absolute -z-30',
  },
  {
    src: imageDecor2,
    alt: 'image decor',
    className:
      'top-10 right-0 w-24 -translate-y-14 scale-50 md:top-80 md:right-28 md:w-28 md:translate-y-0 md:scale-100 -rotate-45 absolute aspect-[1/1]',
  },
  {
    src: lemon2,
    alt: 'lemon triangle decor',
    className:
      'top-80 -left-24 size-40 md:top-[-80px] md:-left-16 absolute -z-10',
    isHiddenOnMobile: true,
  },
  {
    src: imageDecor1,
    alt: 'image decor',
    className:
      'top-20 -left-28 w-48 -translate-y-28 translate-x-10 md:top-[-80px] md:-left-80 lg:-left-64 md:w-[37rem] md:translate-y-0 md:translate-x-0 absolute -z-20 aspect-[1/0.9]',
  },
];

const HeroContent = () => {
  const intl = useIntl();
  const { setIsModalOpen } = useModal();

  return (
    <div className="w-full md:min-h-[30rem] relative">
      {/* main hero section */}
      <div className="flex flex-col items-center gap-20 pt-32 md:pt-20 px-5 md:pb-auto pb-12 md:min-h-[30rem] justify-center">
        {/* lhs */}
        <div className="flex flex-col gap-2 md:gap-4 w-full text-center justify-center md:w-2/3">
          <span className="text-center font-medium">
            {intl.formatMessage({ id: 'your-teams-meals' })}
          </span>
          <div className="flex flex-col items-center text-center md:gap-5 gap-2 md:pt-0">
            <h1 className="font-[unbounded] font-bold text-3xl md:text-[40px] md:w-auto leading-[1.4]">
              {intl.formatMessage({ id: 'giai-phap-dat-bua-trua-tu-dong' })},
              <br /> {intl.formatMessage({ id: 'toi-uu-cho-nhom' })}{' '}
              <span className="text-[#D680A3]">20–99</span>{' '}
              {intl.locale === 'vi' && 'người'}
            </h1>
            <span className="text-center md:w-[70%] md:whitespace-pre-line md:text-lg font-medium">
              {intl.formatMessage({
                id: 'helps-you-save-time-on-coordination-so-you-can-focus-on-your-work',
              })}
            </span>
            <button
              className="capitalize btn border font-[unbounded] border-gray-300 bg-black text-white py-3 px-6 font-semibold hover:opacity-90 transition-all duration-200 hover:scale-[1.01]"
              onClick={() => {
                setIsModalOpen(true);
              }}>
              {intl.formatMessage({ id: 'get-started' })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Decorations = () => (
  <>
    {DECORATIONS.map((decoration, index) => (
      <Image
        key={index}
        src={decoration.src}
        alt={decoration.alt}
        className={`${decoration.className} ${
          decoration.isHiddenOnMobile ? 'hidden md:flex' : ''
        }`}
      />
    ))}
  </>
);

const Hero = () => {
  return (
    <section className="w-full relative md:min-h-[30rem]">
      <div className="flex flex-col items-center gap-20 px-5 pt-32 pb-12 md:py-20 md:pt-20">
        <HeroContent />
      </div>
      <Decorations />
    </section>
  );
};

export default Hero;
