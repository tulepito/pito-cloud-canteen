import Image from 'next/image';

import { useModal } from '@pages/website/pages/Layout';

import blue from '../../assets/decorations/blue3.svg';
import lemon from '../../assets/decorations/lemon.svg';
import pink from '../../assets/decorations/pink.svg';
import yellow2 from '../../assets/decorations/yellow2.svg';
import imageMobile from '../../assets/startup/image.webp';
import image from '../../assets/startup/ready.webp';

const Hero = () => {
  const { setIsModalOpen } = useModal();

  return (
    <>
      <div className="w-full md:min-h-[60vh] relative">
        <div className="relative aspect-[15/14] w-full md:hidden block mb-6">
          <Image
            src={imageMobile}
            alt="Image hero"
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            priority
            loading="eager"
          />
        </div>
        {/* main hero section */}
        <div className="flex md:flex-row-reverse flex-col-reverse items-center md:justify-start h-full justify-center md:mb-0 max-w-[1024px] mx-auto md:min-h-[60vh] md:px-0 px-5">
          <div className="flex flex-col md:items-start items-center md:text-left text-center md:gap-5 gap-2 md:w-[60%] pt-0">
            <span className=" font-medium">
              Delicious - On time - Your choice.
            </span>
            <p className="font-semibold text-3xl md:text-[42px] font-[unbounded] md:leading-tight md:whitespace-pre-line">
              Ready to upgrade your team&apos;s lunch –{' '}
              <span className="text-[#D680A3]">saving time</span> and effort?
            </p>
            <div className="flex md:flex-row flex-col md:items-center items-stretch w-full gap-2 mt-8">
              <a
                href=""
                onClick={(e) => {
                  e.preventDefault();
                  setIsModalOpen(true);
                }}
                className="capitalize btn border font-[unbounded] border-gray-300 bg-black text-white py-3 px-6 font-semibold hover:opacity-90 transition-all duration-200 hover:scale-[1.01]">
                Request a Demo
              </a>
            </div>
          </div>
        </div>
        {/* decorations */}
        <div className="aspect-[635/470] h-1/3 z-10 md:top-0 md:-right-[6%] absolute md:flex hidden">
          <Image src={blue} alt="blue decor" fill />
        </div>

        <div className="aspect-[247/285] h-[80%] z-10 md:-bottom-[20%] md:-right-[6%] absolute md:flex hidden -rotate-[180deg]">
          <Image src={pink} alt="lemon triangle decor" fill />
        </div>
        <Image
          src={yellow2}
          alt="yellow circle decor"
          className="size-[100px] z-20 md:bottom-[26%] md:right-[5%] absolute md:flex hidden"
        />

        <div className="h-[95%] w-fit md:top-0 md:-left-[3%] z-0 right-0 absolute hidden md:block">
          <div className="relative aspect-[807/590] h-full">
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
              className="size-[70%] absolute -bottom-[15%] -z-20 right-0 -rotate-[12deg]"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero;
