import React from 'react';
import JsBarcode from 'jsbarcode';

function BarcodeViewer({ code }: { code: string }) {
  const barcodeRef = React.useRef(null);

  React.useEffect(() => {
    JsBarcode(barcodeRef.current, code, {
      format: 'CODE128',
      width: 2,
      height: 60,
      background: 'transparent',
      displayValue: true,
    });
  }, [code]);

  return (
    <div className="flex justify-center bg-stone-100 p-0 rounded-lg my-2">
      <svg ref={barcodeRef}></svg>
    </div>
  );
}

export default BarcodeViewer;
