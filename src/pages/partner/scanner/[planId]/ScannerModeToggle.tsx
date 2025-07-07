import Toggle from '@components/Toggle/Toggle';

import { LoadingWrapper } from './LoadingWrapper';
import { ScannerIcon } from './ScannerIcon';

export function ScannerModeToggle({
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
      <ScannerIcon />
      <div className="-ml-1 text-sm font-semibold">Chế độ scan</div>
      <LoadingWrapper size={16} isLoading={isLoading}>
        <Toggle status={status} />
      </LoadingWrapper>
    </div>
  );
}
