import { useIntl } from 'react-intl';

import Button from '@components/Button/Button';

export const RatingSuccessIllustration = ({
  level,
  action,
}: {
  level: 'bad' | 'normal' | 'good';
  action: () => void;
}) => {
  const intl = useIntl();
  const dataByLevel = {
    bad: {
      src: '/static/rating-asset-bad.png',
      alt: 'bad',
      primaryText: intl.formatMessage({ id: 'thoi-roi' }),
      secondaryText: intl.formatMessage({
        id: 'rat-tiec-vi-mon-an-chua-nhu-mong-doi-cua-ban-danh-gia-cua-ban-se-giup-pito-cai-thien-va-khac-phuc-tot-hon',
      }),
    },
    normal: {
      src: '/static/rating-asset-normal.png',
      alt: 'normal',
      primaryText: intl.formatMessage({ id: 'cung-cung' }),
      secondaryText: intl.formatMessage({
        id: 'cam-on-ban-da-danh-thoi-gian-danh-gia-moi-danh-gia-cua-ban-la-dong-luc-de-pito-hoan-thien-hon',
      }),
    },
    good: {
      src: '/static/rating-asset-good.png',
      alt: 'good',
      primaryText: intl.formatMessage({ id: 'ngon-qua' }),
      secondaryText: intl.formatMessage({
        id: 'that-tuyet-khi-ban-thich-bua-an-cam-on-ban-da-danh-thoi-gian-danh-gia',
      }),
    },
  };

  return (
    <div className="max-w-[400px] mx-auto">
      <div className="flex flex-col items-center justify-center relative">
        <img
          src="/static/decorator-green.png"
          alt="decorator"
          className="object-contain absolute scale-[300%] opacity-50 z-[1] top-[-40px] left-[-40px] w-20 h-20 rotate-[10deg]"
        />
        <img
          src="/static/decorator-pink.png"
          alt="decorator"
          className="object-contain absolute scale-[120%] md:scale-[150%] opacity-50 z-[1] top-[-20px] right-[40px] w-20 h-20 rotate-12"
        />
        <img
          src="/static/decorator-blue.png"
          alt="decorator"
          className="object-contain absolute scale-[400%] opacity-50 z-[-1] md:z-[0] bottom-0 md:bottom-[-10px] left-[-20px] md:left-[-120px] w-20 h-20 rotate-12 "
        />
        <img
          src="/static/decorator-yellow.png"
          alt="decorator"
          className="object-contain absolute scale-[200%] opacity-50 z-[-1] md:z-[0] bottom-[30px] right-[-80px] md:right-[-120px] w-20 h-20"
        />

        <div className="z-1 flex flex-col items-center justify-center w-full">
          <img
            src={dataByLevel[level].src}
            alt={dataByLevel[level].alt}
            className="w-60 h-60 mb-4"
          />
          <div className="text-2xl font-semibold text-center mb-1">
            {dataByLevel[level].primaryText}
          </div>
          <div className="text-center text-gray-600">
            {dataByLevel[level].secondaryText}
          </div>

          <Button
            onClick={action}
            size="small"
            className="py-2 h-[42px] mt-2 px-8">
            {intl.formatMessage({
              id: 'ManagePartnersPage.deletePartnerAlert.confirmText',
            })}
          </Button>
        </div>
      </div>
    </div>
  );
};
