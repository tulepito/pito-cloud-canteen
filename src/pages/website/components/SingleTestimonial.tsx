import { useIntl } from 'react-intl';
import Image from 'next/image';

import SaltMine from '../assets/companies/company6.svg';
import Lan from '../assets/lan.png';

const SingleTestimonial = () => {
  const intl = useIntl();

  return (
    <div className="md:px-0 md:pb-16 px-5 md:pt-16 pt-24 flex flex-col gap-5 items-center max-w-[1024px] mx-auto">
      <span className="font-alt text-2xl md:text-3xl font-semibold md:leading-tight">
        “
        {intl.formatMessage({
          id: 'pito-cloud-canteen-has-significantly-improved-our-meal-quality-and-hygiene-sharing-meals-together-has-strengthened-team-bonds-and-deepened-employees-loyalty-to-the-company',
        })}
        ”
      </span>
      <div className="flex items-center justify-between w-full">
        {/* lhs */}
        <div className="flex items-center gap-2">
          <Image src={Lan} alt="Lan" className="size-16 rounded-full" />
          <div className="flex flex-col">
            <span className="font-semibold text-lg">Lan Thy</span>
            <span>{intl.formatMessage({ id: 'admin-executive' })}</span>
          </div>
        </div>
        {/* rhs */}
        <Image src={SaltMine} alt="saltmine" />
      </div>
    </div>
  );
};

export default SingleTestimonial;
