import Image from 'next/image';

import { useModal } from '@pages/website/pages/Layout';

import blue from '../../assets/decorations/blue.svg';
import lemon from '../../assets/decorations/lemon.svg';
import pink from '../../assets/decorations/pink.svg';
import yellow from '../../assets/decorations/yellow.svg';
import hero from '../../assets/startup/hero.webp';
import heroMobile from '../../assets/startup/hero-mobile.webp';
import hero1 from '../../assets/startup/hero1.webp';

const Hero = () => {
  const { setIsModalOpen } = useModal();

  return (
    <div className="w-full md:h-[90vh] relative md:mb-0 mb-20 md:px-0 px-5 flex flex-col md:flex-row items-center justify-center">
      {/* main hero section */}
      <div className="flex flex-col items-center justify-center gap-20 md:py-20 h-full max-w-[1024px]">
        {/* lhs */}
        <div className="flex flex-col items-center justify-center text-center md:gap-5 gap-2 w-full md:w-[70%] pt-0">
          <span className=" font-medium">
            Delicious - On time - Your choice.
          </span>
          <p className="font-semibold text-3xl md:text-[42px] font-[unbounded] md:leading-tight md:whitespace-pre-line">
            Are you wasting 2 hours a day just...{' '}
            <span className="text-[#D680A3]">ordering lunch?</span>
          </p>
          <span className="text-text md:text-lg md:whitespace-pre-line font-medium">
            Don&apos;t let ordering lunch become a nightmare for the person in
            charge. Automate the lunch ordering process with PITO Cloud Canteen
            in just a few minutes.
          </span>
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
      {/* decorations */}

      <div className="relative aspect-[629/586] scale-[175%] w-full md:hidden block mr-[10%] mt-[3%] -z-10">
        <Image
          src={heroMobile}
          alt="Image hero"
          fill
          sizes="(max-width: 768px) 100vw, 40vw"
          priority
          loading="eager"
        />
      </div>

      <div className="aspect-[35/26] w-[30%] bottom-0 -left-[10%] absolute -z-10 hidden md:block">
        <Image src={hero} alt="hero" className="object-contain" fill />
      </div>
      <div className="aspect-[247/285] w-[24%] -top-[20%] -left-[15%] absolute -z-20 -rotate-[126deg] hidden md:block">
        <Image src={pink} alt="pink triangle decor" fill />
      </div>
      <div className="aspect-[59/54] w-[25%] bottom-[5%] -left-[10%] absolute -z-20 hidden md:block">
        <Image src={lemon} alt="lemon triangle decor" fill />
      </div>
      <div className="aspect-[35/26] w-[30%] -top-[7%] -right-[12%] absolute -z-10 -rotate-[16deg] hidden md:block">
        <Image src={blue} alt="hero" className="object-contain" fill />
      </div>

      <div className="h-[50%] bottom-0 z-0 -right-[10%] absolute hidden md:block">
        <div className="relative aspect-[2997/2443] h-full">
          <Image
            src={yellow}
            alt="yellow circle decor"
            className="md:size-[100px] absolute top-[2%] -z-20 left-[2%]"
          />
          <Image
            src={hero1}
            alt="Image hero"
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            priority
            loading="eager"
          />
          <Image
            src={lemon}
            alt="lemon triangle decor"
            className="md:size-80 absolute -top-[30%] -z-20 -right-[2%] -rotate-[32deg]"
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
