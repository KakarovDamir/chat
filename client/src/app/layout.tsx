'use client';

import { UserProvider } from './context/UserContext';
import './globals.css';
import React from 'react';


const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="en">
        <body className="flex flex-col min-h-screen bg-gray-100">
          <UserProvider>
          {children}
          </UserProvider>
        </body>
    </html>
  );
};

export default RootLayout;