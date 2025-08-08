import Image from 'next/image';

import { useModal } from '@pages/website/pages/Layout';

import blue from '../../assets/decorations/blue.svg';
import lemon from '../../assets/decorations/lemon.svg';
import pink from '../../assets/decorations/pink.svg';
import yellow from '../../assets/decorations/yellow.svg';
import hero from '../../assets/tech/hero.webp';
import hero1 from '../../assets/tech/hero1.webp';
import heroMobile from '../../assets/tech/heroMobile.webp';

const Hero = () => {
  const { setIsModalOpen } = useModal();

  return (
    <div className="w-full md:h-[92vh] relative flex flex-col md:flex-row items-center justify-center">
      {/* main hero section */}
      <div className="flex flex-col items-center justify-center gap-20 md:py-20 h-full max-w-[1024px] md:px-0 px-5">
        {/* lhs */}
        <div className="flex flex-col items-center justify-center text-center md:gap-5 gap-2 w-full md:w-[70%] pt-0">
          <span className=" font-medium">
            Delicious - On time - Your choice.
          </span>
          <p className="font-semibold text-3xl md:text-[42px] font-[unbounded] md:leading-tight md:whitespace-pre-line">
            Still <span className="text-[#D680A3]">losing hours each week</span>
            ... just to{' '}
            <span className="text-[#D680A3]">manage lunch orders</span>?
          </p>
          <span className="text-text md:text-lg md:whitespace-pre-line font-medium">
            In Tech Services, every minute matters. Automate your lunch
            operations with PITO Cloud Canteen - and keep your team focused on
            delivery, not logistics.
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

      <div className="relative aspect-[36/35] w-full md:hidden block mt-4">
        <Image
          src={heroMobile}
          alt="Image hero"
          fill
          sizes="(max-width: 768px) 100vw, 40vw"
          priority
          loading="eager"
        />
      </div>
      {/* decorations */}
      <div className="aspect-[35/26] w-[28%] bottom-0 -left-[4%] absolute -z-10 rotate-12 hidden md:block">
        <Image src={hero1} alt="hero" className="object-contain" fill />
      </div>
      <div className="aspect-[247/285] w-[24%] -top-[20%] -left-[15%] absolute -z-20 -rotate-[126deg] hidden md:block">
        <Image src={pink} alt="pink triangle decor" fill />
      </div>
      <div className="aspect-[59/54] w-[25%] bottom-[14%] -left-[18%] absolute -z-20 hidden md:block">
        <Image src={lemon} alt="lemon triangle decor" fill />
      </div>
      <div className="aspect-square w-[4%] top-[35%] left-[5%] absolute -z-10 hidden md:block">
        <Image src={yellow} alt="hero" className="object-contain" fill />
      </div>

      <div className="aspect-square w-[4%] bottom-[24%] right-[10%] absolute -z-10 hidden md:block">
        <Image src={yellow} alt="hero" className="object-contain" fill />
      </div>

      <div className="aspect-[35/26] w-[30%] -bottom-[10%] -right-[12%] absolute -z-10 -rotate-[20deg] hidden md:block">
        <Image src={blue} alt="hero" className="object-contain" fill />
      </div>

      <div className="h-[50%] top-[4%] z-0 -right-[10%] absolute -rotate-[12deg] hidden md:block">
        <div className="relative aspect-[289/215] h-full">
          <Image
            src={hero}
            alt="Image hero"
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            priority
            loading="eager"
          />
          <Image
            src={lemon}
            alt="lemon triangle decor"
            className="md:size-80 absolute -bottom-[30%] -z-20 right-[10%] -rotate-[32deg]"
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
