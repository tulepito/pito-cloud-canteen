import { useIntl } from 'react-intl';
import Image from 'next/image';

import { useModal } from '@pages/website/pages/Layout';

import image from '../../assets/admin/admin.webp';
import CTABgMobile from '../../assets/admin/CTABgMobile.webp';
import blue from '../../assets/decorations/blue3.svg';
import lemon from '../../assets/decorations/lemon.svg';
import pink from '../../assets/decorations/pink.svg';
import yellow from '../../assets/decorations/yellow.svg';
import imageVideo from '../../assets/videoPlaceholder.png';

const Ready = () => {
  const intl = useIntl();
  const { setIsModalOpen } = useModal();

  return (
    <>
      <div className="w-full md:min-h-[70vh] relative overflow-hidden">
        {/* main hero section */}

        <div className="flex md:flex-row flex-col-reverse items-center md:justify-start justify-center md:py-20 mb-5 md:mb-0 max-w-[1024px] mx-auto md:px-0 px-5">
          <div className="flex flex-col md:items-start items-center md:text-left text-center md:gap-5 gap-2 md:w-2/3 pt-0">
            <span className=" font-medium">Your Team&apos;s Meals</span>
            <p className="font-semibold text-3xl md:text-[42px] font-[unbounded] md:leading-tight md:whitespace-pre-line">
              Ready to transform lunch at the office? Why wait?
            </p>
            <span className="md:text-lg md:whitespace-pre-line  font-medium">
              Deliver a new standard of employee{' '}
              <br className="hidden md:block" /> wellness - one meal at a time.
            </span>
            <div className="flex md:flex-row flex-col md:items-center items-stretch w-full gap-2 mt-3 md:mt-8">
              <a
                href=""
                onClick={(e) => {
                  e.preventDefault();
                  setIsModalOpen(true);
                }}
                className="capitalize btn border font-[unbounded] border-gray-300 bg-black text-white py-3 px-6 font-semibold hover:opacity-90 transition-all duration-200">
                {intl.formatMessage({ id: 'book-free-consultation-0' })}
              </a>
            </div>
          </div>
        </div>
        {/* decorations */}

        <div className="relative aspect-[120/107] w-full md:hidden block">
          <Image
            src={CTABgMobile}
            alt="Image hero"
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            priority
            loading="eager"
          />
        </div>

        <div className="aspect-[635/470] h-1/2 z-10 md:top-0 md:-left-[12%] absolute md:flex hidden">
          <Image src={blue} alt="blue decor" fill />
        </div>

        <div className="aspect-square h-[100px] z-20 md:top-[40%] md:left-[4%] absolute md:flex hidden">
          <Image src={imageVideo} alt="image video" fill />
        </div>

        <div className="aspect-[366/340] h-[40%] z-10 md:-bottom-[20%] md:-left-[6%] absolute md:flex hidden rotate-45">
          <Image src={lemon} alt="lemon triangle decor" fill />
        </div>

        <div className="aspect-[635/470] h-1/2 z-10 md:top-0 md:-right-[10%] absolute md:flex hidden">
          <Image src={blue} alt="blue decor" fill />
        </div>

        <div className="aspect-[366/340] h-[40%] z-10 md:-bottom-[24%] md:-right-[10%] absolute md:flex hidden rotate-[60deg]">
          <Image src={lemon} alt="lemon triangle decor" fill />
        </div>

        <div className="h-[100%] md:bottom-0 md:right-[15%] z-0 absolute">
          <div className="relative aspect-[317/440] h-full">
            <Image
              src={yellow}
              alt="yellow circle decor"
              className="md:size-[60px] absolute top-[60%] -z-20 -right-[6%]"
            />
            <Image
              src={image}
              alt="Image hero"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              priority
              loading="eager"
            />
            <Image
              src={pink}
              alt="pink triangle decor"
              className="size-[100%] absolute -bottom-[30%] -z-20 right-[30%] -rotate-[110deg]"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Ready;
