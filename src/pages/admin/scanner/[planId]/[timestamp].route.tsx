import React from 'react';

import { PlanAllowToScanGuard } from './PlanAllowToScanGuard';
import { ScannerInputForm } from './ScannerInputForm';
import { ScannerUserList } from './ScannerUserList';

function ScannerPage() {
  return (
    <PlanAllowToScanGuard>
      <div className="p-4 grid gap-4 grid-cols-1 w-full">
        <ScannerInputForm />
        <ScannerUserList />
      </div>
    </PlanAllowToScanGuard>
  );
}

export default ScannerPage;
