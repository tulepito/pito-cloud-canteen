import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

import { scanApi } from '@apis/scanner';
import Button from '@components/Button/Button';
import { useAppSelector } from '@hooks/reduxHooks';
import { getErrorStringFromErrorObject } from '@redux/slices/scanner.slice';
import { enGeneralPaths } from '@src/paths';

export function ScannerInputForm() {
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!barcode) {
      return;
    }

    try {
      setLoading(true);

      await scanApi({
        planId: router.query.planId as string,
        timestamp: router.query.timestamp as string,
        barcode,
      });

      setBarcode('');
    } catch (error) {
      toast.error(getErrorStringFromErrorObject(error), {
        position: 'top-right',
      });
    } finally {
      setLoading(false);
    }
  };

  const planListing = useAppSelector((state) => state.scanner.planListing);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-4 p-8 bg-stone-50 rounded-lg ">
      <input
        type="text"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        placeholder="Tiến hành quét mã..."
        autoFocus
        className="flex-1 p-6 border-gray-600 rounded-lg text-2xl border-2 border-solid outline-none"
      />
      <Button
        inProgress={loading}
        color="primary"
        type="submit"
        className="p-4 rounded-lg transition-colors duration-300 text-lg font-semibold min-w-[84px] min-h-[84px]">
        <svg
          viewBox="0 0 24 24"
          width={48}
          height={48}
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"></g>
          <g id="SVGRepo_iconCarrier">
            <path
              d="M10 14L13 21L20 4L3 11L6.5 12.5"
              stroke="white"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"></path>
          </g>
        </svg>
      </Button>
      <Button
        variant="secondary"
        type="button"
        onClick={() => {
          if (planListing?.attributes?.metadata?.orderId) {
            router.replace(
              enGeneralPaths.admin.order['[orderId]'].index(
                planListing?.attributes?.metadata?.orderId,
              ),
            );
          }
        }}
        className="p-4 rounded-lg transition-colors duration-300 text-lg font-semibold min-w-[84px] min-h-[84px]">
        <svg
          viewBox="0 0 1024 1024"
          className="icon"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          fill="#000000">
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"></g>
          <g id="SVGRepo_iconCarrier">
            <path
              d="M512 128C300.8 128 128 300.8 128 512s172.8 384 384 384 384-172.8 384-384S723.2 128 512 128z m0 85.333333c66.133333 0 128 23.466667 179.2 59.733334L273.066667 691.2C236.8 640 213.333333 578.133333 213.333333 512c0-164.266667 134.4-298.666667 298.666667-298.666667z m0 597.333334c-66.133333 0-128-23.466667-179.2-59.733334l418.133333-418.133333C787.2 384 810.666667 445.866667 810.666667 512c0 164.266667-134.4 298.666667-298.666667 298.666667z"
              fill="#D50000"></path>
          </g>
        </svg>
      </Button>
    </form>
  );
}
