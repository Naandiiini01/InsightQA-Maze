import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { User } from 'firebase/auth';
import { Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onSignOut: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNewProject: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onSignOut, activeTab, setActiveTab, onNewProject }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans overflow-hidden">
      {user && (
        <>
          {/* Mobile Sidebar Overlay */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
          
          <div className={`
            fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <Sidebar 
              activeTab={activeTab} 
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setIsSidebarOpen(false);
              }} 
              user={user} 
              onSignOut={onSignOut} 
              onNewProject={onNewProject}
            />
          </div>
        </>
      )}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-[#E9ECEF] bg-white flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 flex-shrink-0">
          <div className="flex items-center gap-4">
            {user && (
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-[#F8F9FA] rounded-lg lg:hidden transition-colors"
              >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
            <h1 className="text-lg md:text-xl font-semibold capitalize truncate">{activeTab.replace('-', ' ')}</h1>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-2 md:gap-3">
                <span className="text-xs md:text-sm font-medium text-[#495057] hidden sm:inline-block">{user.displayName}</span>
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                  alt="Avatar" 
                  className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-[#DEE2E6]"
                />
              </div>
            ) : (
              <span className="text-xs md:text-sm text-[#6C757D]">Not signed in</span>
            )}
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
