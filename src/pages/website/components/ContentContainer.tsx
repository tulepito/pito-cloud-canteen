import React from 'react';

function ContentContainer({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-[1224px]">{children}</div>;
}

export default ContentContainer;
