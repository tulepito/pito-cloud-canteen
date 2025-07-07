'use client';

import React from 'react';

import { PlanAllowToScanGuard } from './PlanAllowToScanGuard';
import { ScannerInputForm } from './ScannerInputForm';
import { ScannerUserList } from './ScannerUserList';

function ScannerPage() {
  const [searchInput, setSearchInput] = React.useState('');

  const resetSearchInput = () => {
    if (!searchInput) return;
    setSearchInput('');
  };

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
  };

  return (
    <PlanAllowToScanGuard>
      <div className="grid gap-4 grid-cols-1 w-full">
        <ScannerInputForm
          searchValue={searchInput}
          resetSearchInput={resetSearchInput}
          handleSearchInputChange={handleSearchInputChange}
        />
        <ScannerUserList
          searchValue={searchInput}
          resetSearchInput={resetSearchInput}
        />
      </div>
    </PlanAllowToScanGuard>
  );
}

export default ScannerPage;
