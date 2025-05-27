import React from 'react';

function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-[1224px]">{children}</div>;
}

export default Container;
