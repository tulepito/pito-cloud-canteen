import { useIntl } from 'react-intl';
import Image from 'next/image';

import blue from '../../assets/decorations/blue.svg';
import imageDecor1 from '../../assets/decorations/imageDecor1.svg';
import imageDecor2 from '../../assets/decorations/imageDecor2.svg';
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
      'top-10 right-0 size-24 -translate-y-14 scale-50 md:top-80 md:right-28 md:size-28 md:translate-y-0 md:scale-100 -rotate-45 absolute',
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
      'top-20 -left-28 size-48 -translate-y-28 translate-x-10 md:top-[-80px] md:-left-64 md:size-[37rem] md:translate-y-0 md:translate-x-0 absolute -z-20',
  },
];

const HeroContent = () => {
  const intl = useIntl();

  return (
    <div className="flex flex-col items-center justify-center gap-2 w-full text-center md:w-2/3 md:gap-4">
      <span className="text-center">
        {intl.formatMessage({ id: 'your-teams-meals' })}
      </span>

      <div className="flex flex-col items-center text-center gap-2 md:gap-5">
        <h1 className="font-alt font-bold text-3xl leading-tight md:text-6xl xl:whitespace-pre">
          {intl.formatMessage({
            id: 'done-right-without-the-daily-coordination',
          })}
        </h1>

        <p className="text-center md:w-[60%] md:whitespace-pre-line">
          {intl.formatMessage({
            id: 'automated-lunch-ordering-system-designed-for-teams-of-20-to-99-employees-helps-you-save-time-on-coordination-so-you-can-focus-on-your-work',
          })}
        </p>

        <button className="btn capitalize border border-solid border-black bg-black text-white hover:bg-white hover:text-black mt-5 w-full md:w-auto">
          {intl.formatMessage({ id: 'get-started' })}
        </button>
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
    <section className="w-full relative md:min-h-[40rem]">
      <div className="flex flex-col items-center gap-20 px-5 pt-32 pb-12 md:py-20 md:pt-20">
        <HeroContent />
      </div>
      <Decorations />
    </section>
  );
};

export default Hero;
