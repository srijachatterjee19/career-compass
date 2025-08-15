
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, User as UserIcon, Settings, LayoutDashboard, Briefcase, FileText, Mail, Files, MailCheck, Menu, Smile } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { ThemeToggleButton } from '@/components/theme-toggle-button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/jobs', label: 'Job Tracker', icon: Briefcase },
  // { href: '/resume-optimizer', label: 'Resume Optimizer', icon: FileText },
  { href: '/resumes', label: 'Resumes', icon: Files },
  // { href: '/cover-letter-generator', label: 'Cover Letter Generator', icon: Mail },
  { href: '/my-cover-letters', label: 'Cover Letters', icon: MailCheck },
];

export default function AppHeader() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/login');
    } catch (error) {
       toast({ variant: "destructive", title: "Logout Failed", description: "Could not log you out. Please try again." });
    }
  };

  const getInitials = (email?: string) => {
    if (!email) return 'CC';
    return email.substring(0, 2).toUpperCase();
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-card px-4 sm:px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <h1 className="font-headline text-xl font-semibold text-accent hidden sm:block">Career Compass</h1>
        </div>
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Button
                key={item.label}
                variant="ghost"
                size="sm"
                className={cn(
                  "font-medium px-2 lg:px-3",
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
                asChild
              >
                <Link href={item.href} onClick={() => console.log(`Navigating to: ${item.href}`)}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>
      
      <div className="flex items-center gap-2">
        <ThemeToggleButton />
        {/* Mobile Navigation Menu */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <DropdownMenuItem key={`mobile-nav-${item.label}`} asChild>
                    <Link href={item.href} className={cn(isActive ? 'font-semibold text-primary bg-accent/10' : '')} onClick={() => console.log(`Mobile navigating to: ${item.href}`)}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* User Profile Dropdown */}
        {loading ? (
          <div className="h-10 w-10 rounded-full animate-pulse bg-muted"></div>
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={`https://placehold.co/100x100.png?text=${getInitials(user.email)}`} alt={user.email || 'User'} data-ai-hint="user avatar" />
                  <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.display_name || user.email}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              {/* <DropdownMenuItem asChild>
                <Link href="/profile">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem> */}
              {/* <DropdownMenuItem disabled>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="default" onClick={() => router.push('/login')}>Log In</Button>
        )}
      </div>
    </header>
  );
}
