'use client';

import './globals.css';
import React from 'react';


const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="en">
        <body className="flex flex-col min-h-screen bg-gray-100">
          {children}
        </body>
    </html>
  );
};

export default RootLayout;