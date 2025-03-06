import Button from '@components/Button/Button';

export const RatingSuccessIllustration = ({
  level,
  action,
}: {
  level: 'bad' | 'normal' | 'good';
  action: () => void;
}) => {
  const dataByLevel = {
    bad: {
      src: '/static/rating-asset-bad.png',
      alt: 'bad',
      primaryText: 'THÔI RỒI!',
      secondaryText:
        'Rất tiếc vì món ăn chưa như mong đợi của bạn. Đánh giá của bạn sẽ giúp PITO cải thiện và khắc phục tốt hơn',
    },
    normal: {
      src: '/static/rating-asset-normal.png',
      alt: 'normal',
      primaryText: 'CŨNG CŨNG!!!',
      secondaryText:
        'Cảm ơn bạn đã dành thời gian đánh giá. Mỗi đánh giá của bạn là động lực để PITO hoàn thiện hơn.',
    },
    good: {
      src: '/static/rating-asset-good.png',
      alt: 'good',
      primaryText: 'NGON QUÁ!',
      secondaryText:
        'Thật tuyệt khi bạn thích bữa ăn. Cảm ơn bạn đã dành thời gian đánh giá!',
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
            Đã hiểu
          </Button>
        </div>
      </div>
    </div>
  );
};
