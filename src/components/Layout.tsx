import React from 'react';
import { Sidebar } from './Sidebar';
import { User } from 'firebase/auth';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onSignOut: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onSignOut, activeTab, setActiveTab }) => {
  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
      {user && (
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          user={user} 
          onSignOut={onSignOut} 
        />
      )}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b border-[#E9ECEF] bg-white flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-semibold capitalize">{activeTab.replace('-', ' ')}</h1>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[#495057]">{user.displayName}</span>
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                  alt="Avatar" 
                  className="w-8 h-8 rounded-full border border-[#DEE2E6]"
                />
              </div>
            ) : (
              <span className="text-sm text-[#6C757D]">Not signed in</span>
            )}
          </div>
        </header>
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
