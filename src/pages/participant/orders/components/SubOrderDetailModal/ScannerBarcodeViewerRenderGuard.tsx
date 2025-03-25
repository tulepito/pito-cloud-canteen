import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';

import { generateScannerBarCode } from '@pages/api/admin/scanner/[planId]/toggle-mode.api';

const BarcodeViewer = dynamic(() => import('./BarcodeViewer'), { ssr: false });

function ScannerBarcodeViewerRenderGuard({
  foodPicked,
  allowToScan,
  barcodeData: { planId, memberId, date },
}: {
  foodPicked: boolean;
  allowToScan: boolean;
  barcodeData: {
    planId: string;
    memberId: string;
    date: string;
  };
}) {
  const code = useMemo(() => {
    return generateScannerBarCode(planId, memberId, date);
  }, [planId, memberId, date]);

  if (!allowToScan) {
    return null;
  }

  if (!foodPicked) {
    return null;
  }

  return code ? <BarcodeViewer code={code} /> : null;
}

export default ScannerBarcodeViewerRenderGuard;
