
"use client";

import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User as UserIcon, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-full min-h-[calc(100vh-8rem)] items-center justify-center">
        <Icons.Spinner className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-lg">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    // This case should ideally be handled by AppLayout, but good for robustness
    return (
      <div className="flex h-full min-h-[calc(100vh-8rem)] items-center justify-center">
        <p className="text-lg text-destructive">User not found. Please log in.</p>
      </div>
    );
  }

  const getInitials = (email?: string) => {
    if (!email) return 'U';
    const namePart = email.split('@')[0];
    if (namePart.length >=2) return namePart.substring(0, 2).toUpperCase();
    return namePart.substring(0,1).toUpperCase();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
         <h1 className="font-headline text-3xl font-semibold text-foreground flex items-center">
            <UserIcon className="mr-3 h-8 w-8 text-accent" />
            My Profile
        </h1>
      </div>
     
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader className="items-center text-center border-b pb-6">
          <Avatar className="h-24 w-24 mb-4 border-4 border-primary shadow-md">
            <AvatarImage 
              src={`https://placehold.co/150x150.png?text=${getInitials(user.email)}`} 
              alt={user.displayName || user.email || 'User avatar'} 
              data-ai-hint="user avatar large" 
            />
            <AvatarFallback className="text-3xl bg-muted text-muted-foreground">{getInitials(user.email)}</AvatarFallback>
          </Avatar>
          <CardTitle className="font-headline text-2xl">{user.displayName || user.email?.split('@')[0] || 'Valued User'}</CardTitle>
          <CardDescription>Manage your account settings and personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-base font-medium">Display Name</Label>
            <Input id="displayName" value={user.displayName || user.email?.split('@')[0] || ''} readOnly disabled className="bg-muted/30 cursor-not-allowed" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-medium">Email Address</Label>
            <Input id="email" type="email" value={user.email || ''} readOnly disabled className="bg-muted/30 cursor-not-allowed" />
          </div>
          
          <div className="border-t pt-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center">
                <ShieldCheck className="mr-2 h-5 w-5 text-accent" />
                Account Security
            </h3>
            <Button variant="outline" disabled className="w-full sm:w-auto">Change Password (Not Implemented)</Button>
            {/* Future security options could go here, e.g., two-factor authentication setup */}
          </div>
        </CardContent>
        {/* 
        <CardFooter className="border-t pt-6">
          <Button className="w-full" disabled>Update Profile (Not Implemented)</Button>
        </CardFooter> 
        */}
      </Card>
    </div>
  );
}
