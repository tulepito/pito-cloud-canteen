import React, { useRef } from 'react';
import { PiCaretLeftLight, PiCaretRightLight } from 'react-icons/pi';
import { useIntl } from 'react-intl';
// @ts-expect-error ignore
import type { SplideRef } from '@splidejs/react-splide';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import type { StaticImageData } from 'next/image';
import Image from 'next/image';

import avatar1 from '../../assets/pfps/avatar1.png';
import avatar2 from '../../assets/pfps/avatar2.png';
import avatar3 from '../../assets/pfps/avatar3.png';
import avatar4 from '../../assets/pfps/avatar4.png';
// import avatar5 from '../../assets/pfps/avatar5.png';
import company2 from '../../assets/testimonialCompanyLogos/company2.svg';
import company3 from '../../assets/testimonialCompanyLogos/company3.svg';
// import company5 from '../../assets/testimonialCompanyLogos/company5.svg';
import company6 from '../../assets/testimonialCompanyLogos/company6.svg';
import company7 from '../../assets/testimonialCompanyLogos/company7.svg';

import '@splidejs/react-splide/css';

interface Testimonial {
  name: string;
  role: string;
  review: string;
  pfp: StaticImageData;
  companyLogo: StaticImageData;
}

const Testimonials: React.FC = () => {
  const splideRef = useRef<SplideRef>(null);
  const intl = useIntl();

  const goNext = () => splideRef.current?.splide.go('+');
  const goPrev = () => splideRef.current?.splide.go('-');

  const testimonials: Testimonial[] = [
    {
      name: 'Mr. Duc Thang',
      role: intl.formatMessage({ id: 'team-leader' }),
      review: intl.formatMessage({
        id: 'thanks-to-pito-cloud-canteen-i-no-longer-have-to-overthink-lunch-planning-for-our-team-i-receive-helpful-meal-suggestions-and-ordering-support-along-with-clear-and-transparent-billing-for-every-order',
      }),
      pfp: avatar1,
      companyLogo: company6,
    },
    {
      name: 'Ms. Minh Trang',
      role: 'Administrator',
      review: intl.formatMessage({
        id: 'pito-cloud-canteen-recommends-restaurants-and-kitchens-that-perfectly-match-our-teams-taste-preferences-after-using-the-service-for-a-while-everyone-has-given-positive-feedback-and-is-very-satisfied-with-the-lunch-quality',
      }),
      pfp: avatar2,
      companyLogo: company2,
    },
    {
      name: 'Nhi Rubi',
      role: intl.formatMessage({ id: 'admin-officer' }),
      review: intl.formatMessage({
        id: 'pito-cloud-canteen-meals-are-neatly-and-hygienically-prepared-the-support-team-is-enthusiastic-and-always-provides-timely-assistance-to-customers',
      }),
      pfp: avatar3,
      companyLogo: company3,
    },
    {
      name: 'Ms. Diem Phuc',
      role: intl.formatMessage({ id: 'office-manager' }),
      review: intl.formatMessage({
        id: 'pito-cloud-canteen-meets-all-our-requirements-for-payment-invoicing-and-delivery-the-staff-are-professional-and-enthusiastic-deliveries-are-always-on-time-and-the-reusable-lunchboxes-are-neat-clean-and-free-from-plastic-waste',
      }),
      pfp: avatar4,
      companyLogo: company7,
    },
  ];

  return (
    <div className="md:mb-32 mb-20">
      <div className="flex flex-col gap-6 md:gap-12 max-w-[1024px] mx-auto w-full">
        <div className="flex items-center md:justify-between relative md:px-0 px-5">
          <h2 className="relative font-semibold font-[unbounded] font-alt text-[28px]">
            {intl.formatMessage({ id: 'testimonial-and-brand-trust' })}
          </h2>
          <div className="md:flex gap-2 hidden text-lg">
            <button
              onClick={goPrev}
              className="bg-white border border-solid border-black/10 rounded-lg p-2 hover:bg-black hover:text-white transition-all duration-300 ease-in-out cursor-pointer"
              aria-label="Previous slide">
              <PiCaretLeftLight />
            </button>
            <button
              onClick={goNext}
              className="bg-white border border-solid border-black/10 rounded-lg p-2 hover:bg-black hover:text-white transition-all duration-300 ease-in-out cursor-pointer"
              aria-label="Next slide">
              <PiCaretRightLight />
            </button>
          </div>
        </div>
        <Splide
          ref={splideRef}
          options={{
            type: 'loop', // enables autoplay to loop properly
            perPage: 1,
            gap: '1.5rem',
            arrows: false,
            autoplay: true,
            padding: '0rem',
            updateOnMove: true,
            focus: 'center',
            pagination: false,
            breakpoints: {
              1024: {
                perPage: 1,
                padding: '2rem',
                gap: '0.8rem',
              },
              640: {
                perPage: 1,
                padding: '20px',
                gap: '2rem',
              },
            },
          }}>
          {testimonials.map((testimonial, index) => {
            return (
              <SplideSlide key={index} className="group w-full">
                <div className="rounded-2xl px-0 md:p-6 flex flex-col md:justify-between gap-6 md:gap-4 h-full">
                  <p className="md:flex-1 font-semibold text-2xl md:text-3xl line-clamp-5 md:line-clamp-none">
                    &quot;{testimonial.review}&quot;
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative w-10 md:w-20 aspect-square">
                        <Image
                          src={testimonial.pfp}
                          alt={testimonial.name}
                          className="rounded-full object-cover"
                          sizes="80px"
                          fill
                          quality={100}
                        />
                      </div>

                      <div>
                        <div className="font-semibold text-base md:text-[28px]  ">
                          {testimonial.name}
                        </div>
                        <div className="text-[14px] md:text-2xl font-display  font-medium">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                    <div className="relative aspect-[2/1] w-[85px] md:w-[216px]">
                      <Image
                        src={testimonial.companyLogo}
                        alt="company"
                        fill
                        sizes="216px"
                        quality={100}
                      />
                    </div>
                  </div>
                </div>
              </SplideSlide>
            );
          })}
        </Splide>
        <div className="flex gap-2 items-center justify-center md:hidden">
          <button
            onClick={goPrev}
            className="bg-white border border-solid border-black/10 rounded-lg p-2 hover:bg-black hover:text-white transition-all duration-300 ease-in-out cursor-pointer"
            aria-label="Previous slide">
            <PiCaretLeftLight />
          </button>
          <button
            onClick={goNext}
            className="bg-white border border-solid border-black/10 rounded-lg p-2 hover:bg-black hover:text-white transition-all duration-300 ease-in-out cursor-pointer"
            aria-label="Next slide">
            <PiCaretRightLight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
