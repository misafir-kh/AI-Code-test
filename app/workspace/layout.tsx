import { UserButton } from '@clerk/nextjs';
import React from 'react';

function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex justify-between items-center p-4 shadow-sm border-b">
        <div className="font-bold text-2xl text-blue-600">
          AI Code test
        </div>
        <ul className="flex gap-5 font-medium text-gray-700">
          <li className="cursor-pointer hover:text-blue-600">Workspace</li>
          <li className="cursor-pointer hover:text-blue-600">Pricing</li>
          <li className="cursor-pointer hover:text-blue-600">Support</li>
        </ul>
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-between bg-blue-100 text-blue-800 px-3 py-1 rounded-lg">
            <h2 className="text-sm font-semibold">Remaining Credits: 2000</h2>
          </div>
          <UserButton />
        </div>
        
      </header>
      <main className="flex-grow p-8 bg-gray-50">
        {children}
      </main>
    </div>
  );
}

export default WorkspaceLayout;