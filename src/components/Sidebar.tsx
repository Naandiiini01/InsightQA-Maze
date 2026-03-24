import React from 'react';
import { 
  ChevronLeft,
  ChevronRight,
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
  onNewProject: () => void;
  onNewStudy: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  user, 
  onSignOut, 
  onNewProject, 
  onNewStudy,
  isCollapsed,
  setIsCollapsed
}) => {
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
    <aside className={cn(
      "h-full bg-white border-r border-[#E9ECEF] flex flex-col shadow-xl lg:shadow-none transition-all duration-300 relative",
      isCollapsed ? "w-20" : "w-64 lg:w-72"
    )}>
      <div className={cn("p-6 flex-1 overflow-y-auto", isCollapsed && "px-4")}>
        <div className={cn("flex items-center gap-2 mb-8", isCollapsed && "justify-center")}>
          <div className="w-8 h-8 bg-[#0066FF] rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">I</span>
          </div>
          {!isCollapsed && <span className="text-xl font-bold tracking-tight">InsightQA</span>}
        </div>

        <div className="flex flex-col gap-2 mb-8">
          <button 
            onClick={onNewStudy}
            title={isCollapsed ? "New Study" : undefined}
            className={cn(
              "w-full py-2.5 bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-sm",
              isCollapsed ? "px-0" : "px-4"
            )}
          >
            <PlusCircle size={18} />
            {!isCollapsed && "New Study"}
          </button>
          <button 
            onClick={onNewProject}
            title={isCollapsed ? "New Project" : undefined}
            className={cn(
              "w-full py-2.5 bg-white border border-[#E9ECEF] hover:bg-[#F8F9FA] text-[#495057] rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-sm",
              isCollapsed ? "px-0" : "px-4"
            )}
          >
            <Folder size={18} />
            {!isCollapsed && "New Project"}
          </button>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "w-full flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isCollapsed ? "justify-center px-0" : "px-4",
                activeTab === item.id 
                  ? "bg-[#F0F7FF] text-[#0066FF]" 
                  : "text-[#495057] hover:bg-[#F8F9FA] hover:text-[#1A1A1A]"
              )}
            >
              <item.icon size={18} className="flex-shrink-0" />
              {!isCollapsed && item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className={cn("mt-auto p-6 border-t border-[#E9ECEF] space-y-1", isCollapsed && "px-4")}>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand Menu" : "Collapse Menu"}
          className={cn(
            "w-full flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium text-[#495057] hover:bg-[#F8F9FA] transition-all hidden lg:flex",
            isCollapsed ? "justify-center px-0" : "px-4"
          )}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        <button 
          onClick={onSignOut}
          title={isCollapsed ? "Sign Out" : undefined}
          className={cn(
            "w-full flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium text-[#DC3545] hover:bg-[#FFF5F5] transition-all",
            isCollapsed ? "justify-center px-0" : "px-4"
          )}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!isCollapsed && "Sign Out"}
        </button>
      </div>
    </aside>
  );
};
