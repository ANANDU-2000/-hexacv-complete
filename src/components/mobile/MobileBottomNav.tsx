import React from 'react';
import { Home, FileText, Eye, Download, Settings } from 'lucide-react';

type NavItem = 'home' | 'edit' | 'preview' | 'download' | 'settings';

interface MobileBottomNavProps {
  activeItem: NavItem;
  onNavigate: (item: NavItem) => void;
  showDownload?: boolean;
}

export default function MobileBottomNav({ activeItem, onNavigate, showDownload = true }: MobileBottomNavProps) {
  const navItems: { id: NavItem; icon: React.ReactNode; label: string }[] = [
    { id: 'home', icon: <Home size={20} strokeWidth={activeItem === 'home' ? 2.5 : 1.5} />, label: 'Home' },
    { id: 'edit', icon: <FileText size={20} strokeWidth={activeItem === 'edit' ? 2.5 : 1.5} />, label: 'Edit' },
    { id: 'preview', icon: <Eye size={20} strokeWidth={activeItem === 'preview' ? 2.5 : 1.5} />, label: 'Preview' },
    ...(showDownload ? [{ id: 'download' as NavItem, icon: <Download size={20} strokeWidth={activeItem === 'download' ? 2.5 : 1.5} />, label: 'Export' }] : []),
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}>
      {/* iOS-style blur background */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-2xl border-t border-gray-200/50" style={{ boxShadow: '0 -2px 10px rgba(0,0,0,0.08)' }} />
      
      {/* Navigation items */}
      <nav className="relative flex items-center justify-around px-4 h-14">
        {navItems.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-1.5 px-2
                transition-all duration-200 ease-out
                active:scale-90
                ${isActive ? 'text-black' : 'text-gray-400'}
              `}
            >
              {/* Icon container with iOS-style indicator */}
              <div className={`
                relative p-1.5 rounded-xl transition-all duration-300
                ${isActive ? 'bg-black/5' : 'bg-transparent'}
              `}>
                {item.icon}
                
                {/* Active indicator dot */}
                {isActive && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-full" />
                )}
              </div>
              
              {/* Label */}
              <span className={`
                text-[11px] font-semibold tracking-wide
                transition-all duration-200
                ${isActive ? 'text-black' : 'text-gray-400'}
              `}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
      
      {/* Home indicator bar (iOS style) */}
      <div className="flex justify-center pb-1">
        <div className="w-32 h-1 bg-black/20 rounded-full" />
      </div>
    </div>
  );
}
