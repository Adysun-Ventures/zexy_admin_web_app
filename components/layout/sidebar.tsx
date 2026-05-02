'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Megaphone, Users, Settings, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Campaigns', href: '/campaigns', icon: Megaphone },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-card/50 backdrop-blur-sm flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-xl font-bold text-primary-foreground">Z</span>
          </div>
          <div>
            <h2 className="font-bold text-lg">Zexy Admin</h2>
            <p className="text-xs text-muted-foreground">Campaign Manager</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <div className="px-4 py-3 rounded-lg bg-muted/50">
          <p className="text-xs font-medium text-muted-foreground mb-1">Need Help?</p>
          <p className="text-xs text-muted-foreground">Check our documentation</p>
        </div>
      </div>
    </aside>
  );
}
