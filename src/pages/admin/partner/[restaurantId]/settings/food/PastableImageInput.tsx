import classNames from 'classnames';

import css from './ManagePartnerFoods.module.scss';

export const PastableImageInput = ({
  onChange,
}: {
  onChange?: (value: string) => void;
}) => {
  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (e) => {
          onChange?.(e.target?.result as string);
        };
        reader.readAsDataURL(blob!);
        event.preventDefault();
      }
    }
  };

  return (
    <div
      className={classNames(
        css['hidden-all-images'],
        'flex flex-col items-center',
      )}>
      <div
        contentEditable
        onPaste={handlePaste}
        onInput={(e) => {
          e.currentTarget.textContent = 'Hoặc bạn có thể paste hình ảnh từ đây';
        }}
        suppressContentEditableWarning
        className="border border-gray-300 p-2 mb-4 w-[200px] rounded-lg flex items-center flex-col justify-center max-w-md h-[66px] text-xs overflow-hidden text-left">
        Hoặc bạn có thể paste hình ảnh từ đây
      </div>
    </div>
  );
};
