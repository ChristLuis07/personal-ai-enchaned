import React from 'react';
import Provider from './provider';

function WorkSpaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Provider>
      <div>{children}</div>
    </Provider>
  );
}

export default WorkSpaceLayout;
