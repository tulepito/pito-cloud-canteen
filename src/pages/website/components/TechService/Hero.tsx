import { useIntl } from 'react-intl';
import Image from 'next/image';

import { useModal } from '@pages/website/pages/Layout';

import blue from '../../assets/decorations/blue.svg';
import lemon from '../../assets/decorations/lemon.svg';
import pink from '../../assets/decorations/pink.svg';
import yellow from '../../assets/decorations/yellow.svg';
import hero1 from '../../assets/tech/pito-cloud-canteen.webp';
import hero from '../../assets/tech/pito-cloud-canteen-com-van-phong.webp';

const Hero = () => {
  const intl = useIntl();
  const { setIsModalOpen } = useModal();

  return (
    <div className="w-full md:h-[92vh] relative flex flex-col md:flex-row items-center justify-center mb-48 md:mb-0">
      <div className="flex flex-col items-center justify-center gap-20 pt-20 md:py-20 h-full max-w-[1024px] md:px-0 px-5 z-[2]">
        <div className="flex flex-col items-center justify-center text-center md:gap-5 gap-2 w-full md:w-[70%] pt-0">
          <h1 className="font-semibold text-2xl md:text-[40px] font-[unbounded] md:leading-tight md:whitespace-pre-line">
            {intl.formatMessage(
              {
                id: 'losing-hours-each-day-to-lunch-management',
              },
              {
                highlightEn: (
                  <span className="text-[#D680A3]">Losing Hours</span>
                ),
                highlightVi: (
                  <span className="text-[#D680A3]">Đặt cơm trưa thủ công</span>
                ),
              },
            )}
          </h1>
          <span className="text-text md:text-lg md:whitespace-pre-line font-medium">
            {intl.formatMessage({
              id: 'dont-let-admin-hr-waste-time-on-lunch-with-pito-cloud-canteen-the-entire-process-is-automated-on-one-single-platform',
            })}
          </span>
          <a
            href=""
            onClick={(e) => {
              e.preventDefault();
              setIsModalOpen(true);
            }}
            className="capitalize btn border font-[unbounded] border-gray-300 bg-black text-white py-3 px-6 font-semibold hover:opacity-90 transition-all duration-200 hover:scale-[1.01]">
            {intl.formatMessage({ id: 'request-a-demo' })}
          </a>
        </div>
      </div>

      {/* decorations */}
      <div className="aspect-[35/26] w-[28%] bottom-0 -left-[4%] absolute -z-10 rotate-12 hidden md:block">
        <Image src={hero1} alt="hero" className="object-contain" fill />
      </div>
      <div className="aspect-[247/285] w-[24%] -top-[20%] -left-[15%] absolute -z-20 -rotate-[126deg] hidden md:block">
        <Image src={pink} alt="pink triangle decor" fill />
      </div>
      <div className="aspect-[59/54] w-[40%] md:w-[25%] -bottom-[64%] md:bottom-[14%] -left-[18%] absolute -z-20">
        <Image src={lemon} alt="lemon triangle decor" fill />
      </div>
      <div className="aspect-square w-[12%] md:w-[4%] top-[84%] md:top-[35%] left-[5%] absolute -z-10 block">
        <Image src={yellow} alt="hero" className="object-contain" fill />
      </div>

      <div className="aspect-square w-[4%] bottom-[24%] right-[10%] absolute -z-10 hidden md:block">
        <Image src={yellow} alt="hero" className="object-contain" fill />
      </div>

      <div className="aspect-[35/26] w-[30%] -bottom-[10%] -right-[12%] absolute -z-10 -rotate-[20deg] hidden md:block">
        <Image src={blue} alt="hero" className="object-contain" fill />
      </div>

      <div className="h-[80%] md:h-[50%] -bottom-[68%] md:top-[4%] z-0 -right-[10%] absolute -rotate-[12deg]">
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
            className="md:size-80 absolute -bottom-[30%] -z-20 right-[10%] -rotate-[32deg] hidden md:block"
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
