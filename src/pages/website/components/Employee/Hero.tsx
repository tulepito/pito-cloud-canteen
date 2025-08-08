import Image from 'next/image';

import { useModal } from '@pages/website/pages/Layout';

import blue2 from '../../assets/decorations/blue2.svg';
import blue from '../../assets/decorations/blue3.svg';
import lemon from '../../assets/decorations/lemon.svg';
import pink from '../../assets/decorations/pink.svg';
import yellow from '../../assets/decorations/yellow.svg';
import image from '../../assets/employee/employee-hero.webp';
import imageMobile from '../../assets/employee/HeroMobile.webp';

const Hero = () => {
  const { setIsModalOpen } = useModal();

  return (
    <>
      <div className="w-full md:min-h-[70vh] relative">
        {/* main hero section */}

        <div className="flex md:flex-row flex-col-reverse items-center md:justify-start justify-center md:py-20 mb-5 md:mb-0 max-w-[1024px] mx-auto md:px-0 px-5">
          <div className="flex flex-col md:items-start items-center md:text-left text-center md:gap-5 gap-2 md:w-[65%] pt-0">
            <span className=" font-medium">
              Delicious - On time - Your choice.
            </span>
            <p className="font-semibold text-3xl md:text-[42px] font-[unbounded] md:leading-tight md:whitespace-pre-line">
              No more “What should <br className="hidden md:block" /> I eat for
              lunch today?”
            </p>
            <span className="text-text md:text-lg md:whitespace-pre-line font-medium">
              At lunchtime, your personalized meal is ready.{' '}
              <br className="hidden md:block" /> No waiting, no mix-ups, no
              boring repeats.
            </span>
            <div className="flex md:flex-row flex-col md:items-center items-stretch w-full gap-2 mt-8">
              <a
                href=""
                onClick={(e) => {
                  e.preventDefault();
                  setIsModalOpen(true);
                }}
                className="capitalize btn border font-[unbounded] border-gray-300 bg-black text-white py-3 px-6 font-semibold hover:opacity-90 transition-all duration-200 hover:scale-[1.01]">
                See How PITO Cloud Canteen Works
              </a>
            </div>
          </div>
          <div className="h-full w-[35%] hidden md:block">
            <div className="relative aspect-square w-full">
              <Image
                src={yellow}
                alt="yellow circle decor"
                className="md:size-[60px] absolute top-[30%] -z-20 -right-[60%]"
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
                src={blue}
                alt="lemon triangle decor"
                className="size-[80%] absolute -top-[32%] -z-20 -right-[24%]"
              />

              <Image
                src={pink}
                alt="pink triangle decor"
                className="size-[100%] absolute -bottom-[50%] -z-20 -right-[44%] -rotate-[176deg]"
              />
            </div>
          </div>
        </div>

        <div className="relative aspect-[18/19] w-full md:hidden block">
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
        <div className="aspect-[277/255] h-[65%] z-0 md:top-[10%] md:-left-[12%] absolute md:flex hidden rotate-[104deg]">
          <Image src={lemon} alt="lemon decor" fill />
        </div>

        <div className="aspect-[11/8] h-[20%] z-10 md:top-[20%] md:left-[4%] absolute md:flex hidden -rotate-[20deg]">
          <Image src={blue2} alt="lemon triangle decor" fill />
        </div>
      </div>
    </>
  );
};

export default Hero;
