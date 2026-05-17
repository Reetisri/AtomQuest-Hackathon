import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-8 shadow-sm z-10">
          <h2 className="font-heading font-semibold text-lg">Goal Setting & Tracking Portal</h2>
          {/* We could add cycle banner here */}
          <div className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
            Phase: GOAL_SETTING
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8 bg-muted/30">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
