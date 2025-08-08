import { useIntl } from 'react-intl';
import Image from 'next/image';

import { useModal } from '@pages/website/pages/Layout';

import image from '../../assets/admin/hero.webp';
import imageMobile from '../../assets/admin/heroMobile.webp';
import blue from '../../assets/decorations/blue3.svg';
import lemon from '../../assets/decorations/lemon.svg';
import yellow from '../../assets/decorations/yellow.svg';
import imageVideo from '../../assets/videoPlaceholder.png';

const Hero = () => {
  const intl = useIntl();
  const { setIsModalOpen } = useModal();

  return (
    <>
      <div className="w-full md:min-h-[70vh] relative">
        {/* main hero section */}

        <div className="flex md:flex-row flex-col-reverse items-center md:justify-start justify-center md:py-20 mb-6 md:mb-0 max-w-[1024px] mx-auto md:px-0 px-5">
          <div className="flex flex-col md:items-start items-center md:text-left text-center md:gap-5 gap-2 md:w-2/3 pt-0">
            <p className="font-semibold text-[26px] md:text-[42px] font-[unbounded] md:leading-tight md:whitespace-pre-line">
              Cut <span className="text-[#D680A3]">80%</span> of admin time,
              Increase <span className="text-[#D680A3]">100%</span> employee
              satisfaction
            </p>
            <span className="text-text md:text-lg md:whitespace-pre-line font-medium">
              Automate your lunch process across teams. Manage menus,{' '}
              <br className="md:block hidden" /> budgets, and feedback — all in
              one place.
            </span>
            <div className="flex md:flex-row flex-col md:items-center items-stretch w-full gap-2 mt-8">
              <a
                href=""
                onClick={(e) => {
                  e.preventDefault();
                  setIsModalOpen(true);
                }}
                className="capitalize btn border font-[unbounded] border-gray-300 bg-black text-white py-3 px-6 font-semibold hover:opacity-90 transition-all duration-200 hover:scale-[1.01]">
                {intl.formatMessage({ id: 'book-free-consultation-0' })}
              </a>
            </div>
          </div>
        </div>

        <div className="relative aspect-[9/8] w-full md:hidden block">
          <Image
            src={imageMobile}
            alt="Image hero"
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            priority
            loading="eager"
          />
        </div>
        {/* decorations */}
        <div className="aspect-[635/470] h-1/2 z-10 md:top-0 md:-left-[12%] absolute md:flex hidden">
          <Image src={blue} alt="blue decor" fill />
        </div>

        <div className="aspect-square h-[100px] z-20 md:top-[40%] md:left-[4%] absolute md:flex hidden">
          <Image src={imageVideo} alt="image video" fill />
        </div>

        <div className="aspect-[366/340] h-[40%] z-10 md:-bottom-[20%] md:-left-[6%] absolute md:flex hidden rotate-45">
          <Image src={lemon} alt="lemon triangle decor" fill />
        </div>

        <div className="h-[85%] w-fit md:top-0 md:-right-[5%] z-0 right-0 absolute -rotate-6 hidden md:block">
          <div className="relative aspect-[19/14] h-full">
            <Image
              src={yellow}
              alt="yellow circle decor"
              className="size-[12%] absolute top-[16%] -z-20 left-[10%]"
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
              src={lemon}
              alt="lemon triangle decor"
              className="md:size-80 absolute -bottom-[20%] -z-20 right-[20%] -rotate-45"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero;
