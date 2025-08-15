
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Briefcase, FileText, Mail, Files, MailCheck } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/jobs', label: 'Job Tracker', icon: Briefcase },
  // { href: '/resume-optimizer', label: 'Resume Optimizer', icon: FileText },
  { href: '/resumes', label: 'Resumes', icon: Files },
  { href: '/cover-letter-generator', label: 'Cover Letter Gen', icon: Mail },
  { href: '/my-cover-letters', label: 'Cover Letters', icon: MailCheck },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col border-r bg-sidebar p-4 shadow-lg">
      <div className="mb-8 flex items-center gap-2 px-2">
        <Icons.Logo className="h-8 w-8 text-accent" />
        <h1 className="font-headline text-2xl font-semibold text-accent">Career Compass</h1>
      </div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Button
              key={item.label}
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn(
                "w-full justify-start text-base",
                isActive && "font-semibold text-primary hover:bg-primary/10" 
              )}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            </Button>
          );
        })}
      </nav>
      {/* Optional: Add a footer section for settings or user profile quick link */}
      {/* <div className="mt-auto">
        <Button variant="ghost" className="w-full justify-start">
          <Settings className="mr-2 h-4 w-4" /> Settings
        </Button>
      </div> */}
    </aside>
  );
}
