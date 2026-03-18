import React from 'react';
import { 
  LayoutDashboard, 
  Beaker, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  PlusCircle,
  Folder
} from 'lucide-react';
import { User } from 'firebase/auth';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User;
  onSignOut: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, onSignOut }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: Folder },
    { id: 'studies', label: 'Studies', icon: Beaker },
    { id: 'templates', label: 'Templates', icon: LayoutDashboard },
    { id: 'participants', label: 'Participants', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#E9ECEF] flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-[#0066FF] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">I</span>
          </div>
          <span className="text-xl font-bold tracking-tight">InsightQA</span>
        </div>

        <button 
          onClick={() => setActiveTab('create-study')}
          className="w-full py-2.5 px-4 bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors mb-8 shadow-sm"
        >
          <PlusCircle size={18} />
          New Study
        </button>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                activeTab === item.id 
                  ? "bg-[#F0F7FF] text-[#0066FF]" 
                  : "text-[#495057] hover:bg-[#F8F9FA] hover:text-[#1A1A1A]"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-[#E9ECEF]">
        <button 
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-[#DC3545] hover:bg-[#FFF5F5] transition-all"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
