import Image from 'next/image';

import { useModal } from '@pages/website/pages/Layout';

import blue2 from '../../assets/decorations/blue2.svg';
import lemon from '../../assets/decorations/lemon.svg';
import pink from '../../assets/decorations/pink.svg';
import yellow from '../../assets/decorations/yellow.svg';
import image from '../../assets/offshore/hero.webp';
import heroMobile from '../../assets/offshore/heroMobile.webp';

const Hero = () => {
  const { setIsModalOpen } = useModal();

  return (
    <>
      <div className="w-full md:min-h-[70vh] relative">
        {/* main hero section */}
        <div className="flex md:flex-row flex-col-reverse items-center md:justify-start justify-center md:py-20 mb-5 md:mb-0 max-w-[1024px] mx-auto md:px-0 px-5">
          <div className="flex flex-col md:items-start items-center md:text-left text-center md:gap-5 gap-2 md:w-2/3 pt-0">
            <p className="font-semibold text-2xl md:text-[40px] font-[unbounded] md:leading-tight md:whitespace-pre-line">
              Running a delivery team across shifts?
              <br className="hidden md:block" />
              <span className="text-[#D680A3]">
                Lunch shouldn’t be the hardest part.
              </span>
            </p>
            <span className="text-text md:text-lg md:whitespace-pre-line font-medium">
              For offshore teams, time and consistency are everything.{' '}
              <br className="hidden md:block" />
              PITO Cloud Canteen automates daily meals — no more Zalo threads,{' '}
              <br className="hidden md:block" />
              delays, or meal complaints.
            </span>
            <div className="flex flex-col items-center md:items-start w-full gap-4 md:gap-6 mt-8">
              <a
                href=""
                onClick={(e) => {
                  e.preventDefault();
                  setIsModalOpen(true);
                }}
                className="capitalize btn border font-[unbounded] border-gray-300 bg-black text-white py-3 px-6 font-semibold hover:opacity-90 transition-all duration-200 hover:scale-[1.01]">
                Request a Free Demo
              </a>
              <span className="text-text md:text-lg md:whitespace-pre-line font-medium">
                Try it for 7 days — no setup, no commitment
              </span>
            </div>
          </div>
        </div>
        <div className="max-h-[70vh] overflow-hidden md:hidden block">
          <div className="relative aspect-[655/422] scale-[175%] mt-[20%] overflow-hidden w-full  ">
            <Image
              src={heroMobile}
              alt="Image hero"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              priority
              loading="eager"
            />
          </div>
        </div>

        {/* decorations */}
        <div className="aspect-[277/255] h-[65%] z-0 md:top-[2%] md:-left-[12%] absolute md:flex hidden rotate-[104deg]">
          <Image src={lemon} alt="lemon decor" fill />
        </div>
        <div className="aspect-[11/8] h-[20%] z-10 md:top-[14%] md:left-[4%] absolute md:flex hidden -rotate-[20deg]">
          <Image src={blue2} alt="lemon triangle decor" fill />
        </div>
        <div className="aspect-[247/285] w-[14%] -bottom-[2%] -left-[6%] absolute -z-20 rotate-[246deg] hidden md:block">
          <Image src={pink} alt="pink triangle decor" fill />
        </div>
        <div className="h-[90%] w-fit top-0 -right-[5%] z-0 absolute hidden md:block">
          <div className="relative aspect-[428/315] h-full">
            <Image
              src={yellow}
              alt="yellow circle decor"
              className="md:size-[90px] absolute top-[10%] -z-20 left-[6%]"
            />
            <Image
              src={image}
              alt="Image hero"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              priority
              loading="eager"
            />
            <div className="aspect-[247/285] w-[80%] -bottom-[26%] -right-[15%] absolute -z-20 rotate-[136deg]">
              <Image src={pink} alt="pink triangle decor" fill />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero;
