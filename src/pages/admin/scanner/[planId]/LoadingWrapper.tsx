import React from 'react';
import classNames from 'classnames';

export function LoadingWrapper({
  isLoading,
  children,
  size = 32,
}: {
  isLoading: boolean;
  children: React.ReactNode;
  size?: number;
}) {
  return (
    <div
      className={classNames('flex justify-center items-center', {
        'opacity-50': isLoading,
      })}>
      {isLoading ? (
        <div
          className={`animate-spin rounded-full border-b-2 border-gray-900`}
          style={{ width: size, height: size }}
        />
      ) : (
        children
      )}
    </div>
  );
}
