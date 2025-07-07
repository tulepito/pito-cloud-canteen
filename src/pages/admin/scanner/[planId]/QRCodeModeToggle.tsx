import { PiQrCode } from 'react-icons/pi';

import Toggle from '@components/Toggle/Toggle';

import { LoadingWrapper } from './LoadingWrapper';

export function QRCodeModeToggle({
  isLoading,
  status,
  onChange,
}: {
  isLoading: boolean;
  status: 'on' | 'off';
  onChange: () => void;
}) {
  return (
    <div
      className="flex items-center justify-center bg-blue-50 p-2 rounded-lg gap-2 cursor-pointer hover:opacity-80 transition-opacity duration-300"
      onClick={onChange}>
      <PiQrCode />
      <div className="-ml-1 text-sm font-semibold">Chế độ QRCode</div>
      <LoadingWrapper size={16} isLoading={isLoading}>
        <Toggle status={status} />
      </LoadingWrapper>
    </div>
  );
}
