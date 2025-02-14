import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

function UserLabelCellContent({
  companyName,
  partnerName,
  mealDate,
  participantName,
  foodName,
  ratingUrl,
}: {
  companyName: string;
  partnerName: string;
  mealDate: string;
  participantName: string;
  foodName: string;
  ratingUrl: string;
}) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  useEffect(() => {
    QRCode.toDataURL(ratingUrl, {
      errorCorrectionLevel: 'L',
    }).then((url: string) => {
      setQrCodeDataUrl(url);
    });
  }, [ratingUrl]);

  return (
    <div className="w-full font-serif h-full gap-0 px-2 py-2 flex flex-col items-center">
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col items-center gap-0 flex-1">
          <div className="text-xs text-center flex items-center gap-0]">
            <div className="text-xs text-center h-[5mm]">
              {companyName.slice(0, 9) + (companyName.length > 9 ? '...' : '')}
            </div>
            &nbsp;|&nbsp;
            <div className="text-xs text-center h-[5mm]">
              {partnerName.slice(0, 9) + (partnerName.length > 9 ? '...' : '')}
            </div>
          </div>
          <div className="text-xs text-center font-semibold">{mealDate}</div>
        </div>
        <div className="mx-auto flex gap-0">
          <p className="m-0 text-right text-xs italic">
            <span className="text-nowrap">Mời bạn</span>
            <br /> <span className="text-nowrap">đánh giá</span>
          </p>
          <img
            src={qrCodeDataUrl}
            className="w-[12mm] h-[12mm] min-w-[12mm] min-h-[12mm]"
            alt="QR Code"
          />
        </div>
      </div>

      <div className="text-sm font-semibold text-center">
        {participantName.slice(0, 40) +
          (participantName.length > 40 ? '...' : '')}
      </div>
      <div className="w-[12mm] h-[0.5mm] mt-4 bg-stone-600"></div>
      <div className="text-sm text-center font-semibold">
        {foodName.slice(0, 40) + (foodName.length > 40 ? '...' : '')}
      </div>

      <i className="text-xs text-center">Chúc bạn ngon miệng!</i>
    </div>
  );
}

export default UserLabelCellContent;
