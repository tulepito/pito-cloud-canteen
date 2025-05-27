import { useIntl } from 'react-intl';
import Image from 'next/image';

import company1 from '../assets/companies/company1.svg'; // booking
import company2 from '../assets/companies/company2.svg'; // shopee
import company3 from '../assets/companies/company3.svg'; // employment hero
import company4 from '../assets/companies/company4.svg'; // deloit
import company5 from '../assets/companies/company5.svg'; // mm
import company6 from '../assets/companies/company6.svg'; // salt
import company7 from '../assets/companies/company7.svg'; // amazon
import company8 from '../assets/companies/company8.svg'; // bck

const companies = [
  company1,
  company4,
  company6,
  company7,
  company8,
  company3,
  company5,
  company2,
];

const TrustedCompanies = () => {
  const intl = useIntl();

  return (
    <div className="md:px-4 md:pb-36 px-2 pt-16 flex flex-col md:gap-10 gap-5 items-center">
      <span className="w-2/3 text-center">
        {intl.formatMessage({
          id: 'trusted-by-vietnams-leading-tech-companies',
        })}
      </span>
      <div className="flex items-center justify-center flex-nowrap">
        {companies.map((logo, index) => (
          <Image
            key={index}
            src={logo}
            alt={`Company ${index + 1}`}
            className="md:h-16 md:max-w-[120px] max-w-[23%] object-contain grayscale hover:grayscale-0 transition-all duration-300 ease-in-out"
          />
        ))}
      </div>
    </div>
  );
};

export default TrustedCompanies;
