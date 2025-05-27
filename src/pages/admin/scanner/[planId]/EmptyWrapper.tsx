import React from 'react';
import { useIntl } from 'react-intl';

export function EmptyWrapper({
  isEmpty,
  children,
  blank,
}: {
  isEmpty: boolean;
  children: React.ReactNode;
  blank?: boolean;
}) {
  const intl = useIntl();

  return (
    <div>
      {isEmpty ? (
        blank ? null : (
          <div className="my-2">
            <p className="text-gray-500 text-center">
              {intl.formatMessage({ id: 'khong-tim-thay-du-lieu' })}
            </p>
          </div>
        )
      ) : (
        children
      )}
    </div>
  );
}
