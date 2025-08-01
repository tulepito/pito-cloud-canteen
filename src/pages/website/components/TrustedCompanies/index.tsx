import { useIntl } from 'react-intl';
import clsx from 'clsx';
import Image from 'next/image';

import company1 from '../../assets/companies/1.webp'; // booking
import company2 from '../../assets/companies/2.webp'; // shopee
import company3 from '../../assets/companies/3.webp'; // employment hero
import company4 from '../../assets/companies/4.webp'; // deloit
import company5 from '../../assets/companies/5.webp'; // mm
import company6 from '../../assets/companies/6.webp'; // salt
import company7 from '../../assets/companies/7.webp'; // amazon
import company8 from '../../assets/companies/8.webp'; // bck
import company9 from '../../assets/companies/9.webp'; // lazada

import styles from './styles.module.css';

const companies = [
  {
    src: company1,
    alt: 'Employmenthero',
    className: 'aspect-[2/1] w-[150px]',
    classNameImage: 'object-contain',
  },
  {
    src: company2,
    alt: 'SEO WOO VINA',
    className: 'aspect-square w-[120px]',
    classNameImage: 'object-fill',
  },
  {
    src: company3,
    alt: 'Booking.com',
    className: 'aspect-square w-[120px]',
    classNameImage: 'object-fill',
  },
  {
    src: company4,
    alt: 'Amazon',
    className: 'aspect-[2/1] w-[150px]',
    classNameImage: 'object-contain',
  },
  {
    src: company5,
    alt: 'Saltmine',
    className: 'aspect-square w-[120px]',
    classNameImage: 'object-fill',
  },
  {
    src: company6,
    alt: 'JR286',
    className: 'aspect-[2/1] w-[150px]',
    classNameImage: 'object-contain',
  },
  {
    src: company7,
    alt: 'Technos',
    className: 'aspect-[2/1] w-[150px]',
    classNameImage: 'object-contain',
  },
  {
    src: company8,
    alt: 'ARMOR',
    className: 'aspect-[2/1] w-[150px]',
    classNameImage: 'object-contain',
  },
  {
    src: company9,
    alt: 'Lazada',
    className: 'aspect-[2/1] w-[150px]',
    classNameImage: 'object-contain',
  },
];

const TrustedCompanies = () => {
  const intl = useIntl();

  return (
    <div className="mx-auto md:px-4 md:pb-20 px-5 pt-16 md:pt-0 flex flex-col md:gap-0 gap-5 items-center overflow-hidden">
      <span className="w-full md:w-2/3 font-medium text-center text-lg whitespace-pre-line md:whitespace-normal">
        {intl.formatMessage({
          id: 'trusted-by-vietnams-leading-tech-companies',
        })}
      </span>
      <div className={clsx('flex select-none overflow-hidden', styles.marquee)}>
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className={clsx(
              'flex shrink-0 items-center',
              styles.marquee__group,
            )}>
            {companies.map((logo, index) => (
              <div key={index} className={clsx('relative', logo.className)}>
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  fill
                  className={logo.classNameImage}
                  priority
                  loading="eager"
                  sizes="(max-width: 768px) 12vw, 5vw"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrustedCompanies;
