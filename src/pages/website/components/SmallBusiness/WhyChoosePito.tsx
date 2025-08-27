import {
  PiFileText,
  PiForkKnife,
  PiHandshake,
  PiLaptop,
  PiStar,
  PiUser,
} from 'react-icons/pi';
import { useIntl } from 'react-intl';

const WhyChoosePito = () => {
  const intl = useIntl();

  return (
    <div className="flex flex-col items-center md:gap-12 md:px-0 px-5 md:pb-16 md:pt-16 gap-10 relative pb-10 max-w-[1024px] mx-auto">
      <div className="flex flex-col gap-2 items-center">
        <h2 className="font-[unbounded] text-3xl md:text-[40px] font-bold text-center md:leading-tight">
          {intl.formatMessage({ id: 'why-choose-pito-cloud-canteen' })}
        </h2>
        <span className="md:w-3/4 text-center font-medium md:text-lg">
          {intl.formatMessage({
            id: 'no-more-manual-lunch-ordering-pito-helps-you-schedule-lunch-for-the-whole-week-in-just-a-few-minutes-no-excel-files-no-complicated-zalo-messages',
          })}
        </span>
      </div>
      <div className="grid md:grid-cols-2 gap-5 w-full md:px-18">
        <div className="rounded-2xl p-3 border border-[#D7D7D7] flex items-center gap-3">
          <div className="size-11 text-xl flex items-center justify-center shrink-0 bg-[#6CCFF6]/60 text-[#3598BF] rounded-full">
            <PiForkKnife />
          </div>
          <span className="font-semibold">
            {intl.formatMessage({
              id: 'perfect-for-offices-without-in-house-kitchens',
            })}
          </span>
        </div>
        <div className="rounded-2xl p-3 border border-[#D7D7D7] flex items-center gap-3">
          <div className="size-11 text-xl flex items-center justify-center shrink-0 bg-[#F6AFCE]/60 text-[#D680A3] rounded-full">
            <PiLaptop />
          </div>
          <span className="font-semibold">
            {intl.formatMessage({
              id: 'manage-everything-from-one-simple-platform',
            })}{' '}
          </span>
        </div>
        <div className="rounded-2xl p-3 border border-[#D7D7D7] flex items-center gap-3">
          <div className="size-11 text-xl flex items-center justify-center shrink-0 bg-[#FFC811]/60 text-[#C79000] rounded-full">
            <PiHandshake />
          </div>
          <span className="font-semibold">
            {intl.formatMessage({ id: 'works-with-verified-rotating-vendors' })}{' '}
          </span>
        </div>
        <div className="rounded-2xl p-3 border border-[#D7D7D7] flex items-center gap-3">
          <div className="size-11 text-xl flex items-center justify-center shrink-0 bg-[#6CCFF6]/60 text-[#3598BF] rounded-full">
            <PiFileText />
          </div>
          <span className="font-semibold">
            {intl.formatMessage({ id: 'transparent-pricing-no-hidden-fees' })}{' '}
          </span>
        </div>
        <div className="rounded-2xl p-3 border border-[#D7D7D7] flex items-center gap-3">
          <div className="size-11 text-xl flex items-center justify-center shrink-0 bg-[#F6AFCE]/60 text-[#D680A3] rounded-full">
            <PiUser />
          </div>
          <span className="font-semibold">
            {intl.formatMessage({
              id: 'personalized-meals-for-each-employee-the-right-person-the-right-dish',
            })}{' '}
          </span>
        </div>
        <div className="rounded-2xl p-3 border border-[#D7D7D7] flex items-center gap-3">
          <div className="size-11 text-xl flex items-center justify-center shrink-0 bg-[#C5D475]/60 text-[#96A546] rounded-full">
            <PiStar />
          </div>
          <span className="font-semibold">
            {intl.formatMessage({
              id: 'diverse-high-quality-menus-with-real-user-ratings',
            })}{' '}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WhyChoosePito;
