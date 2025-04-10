import React from 'react';

export function EmptyWrapper({
  isEmpty,
  children,
  blank,
}: {
  isEmpty: boolean;
  children: React.ReactNode;
  blank?: boolean;
}) {
  return (
    <div>
      {isEmpty ? (
        blank ? null : (
          <div className="my-2">
            <p className="text-gray-500 text-center">Không tìm thấy dữ liệu</p>
          </div>
        )
      ) : (
        children
      )}
    </div>
  );
}
