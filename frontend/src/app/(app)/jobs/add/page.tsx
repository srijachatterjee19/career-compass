
"use client";

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon, Save, XCircle, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import type { Job, JobStatus } from "@/types";

const jobStatuses: JobStatus[] = ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

// Status progression rules for new jobs
const getInitialStatusOptions = (selectedStatus: JobStatus): { status: JobStatus; description: string; disabled: boolean }[] => {
  return jobStatuses.map(status => {
    let description = '';
    let disabled = false;
    
    switch (status) {
      case 'Saved':
        description = 'Job saved for future application';
        break;
      case 'Applied':
        description = 'Application submitted';
        break;
      case 'Interviewing':
        description = 'In interview process';
        break;
      case 'Offer':
        description = 'Received job offer';
        break;
      case 'Rejected':
        description = 'Application rejected (final state)';
        disabled = true; // Don't allow starting with rejected
        break;
    }
    
    return { status, description, disabled };
  });
};

export default function AddJobPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<JobStatus>('Saved'); // Start with Saved as default
  const [applicationDate, setApplicationDate] = useState<Date | undefined>();
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    if (!title || !company) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Job Title and Company are required.",
      });
      setIsLoading(false);
      return;
    }

    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Please log in to save jobs.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const newJob = {
        title,
        company,
        url: url || undefined,
        status,
        application_date: applicationDate ? applicationDate.toISOString() : undefined,
        deadline: deadline ? deadline.toISOString() : undefined,
        notes: notes || undefined,
        userId: user.id, // Include user ID for the API
      };

      console.log("Saving new job:", newJob);
      
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newJob),
      });

      if (!response.ok) {
        throw new Error('Failed to save job');
      }

      const savedJob = await response.json();
      console.log("Job saved successfully:", savedJob);

      toast({
        title: "Job Saved Successfully!",
        description: `The job "${title}" at ${company} has been saved to your tracker.`,
      });
      
      router.push('/jobs');
    } catch (error) {
      console.error('Error saving job:', error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Failed to save the job. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
       <Button variant="outline" size="sm" asChild className="mb-4">
        <Link href="/jobs">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Job Tracker
        </Link>
      </Button>
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Add New Job</CardTitle>
          <CardDescription>Track a new job opportunity. Fill in the details below.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Software Engineer"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g., FutureTech Solutions"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Job Posting URL</Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/job/123"
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as JobStatus)} disabled={isLoading}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {getInitialStatusOptions(status).map(({ status: statusOption, description, disabled }) => (
                      <SelectItem 
                        key={statusOption} 
                        value={statusOption}
                        disabled={disabled}
                        className={disabled ? 'opacity-50 cursor-not-allowed' : ''}
                      >
                        <div>
                          <div className="font-medium">{statusOption}</div>
                          <div className="text-xs text-muted-foreground">{description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {status === 'Saved' && 'Start here to save a job for future application'}
                  {status === 'Applied' && 'Use this when you submit your application'}
                  {status === 'Interviewing' && 'Use this when you start the interview process'}
                  {status === 'Offer' && 'Use this when you receive a job offer'}
                  {status === 'Rejected' && 'This is a final state - no further changes allowed'}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="applicationDate">Application Date</Label>
                 <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !applicationDate && "text-muted-foreground"
                      )}
                      disabled={isLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {applicationDate ? format(applicationDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={applicationDate}
                      onSelect={setApplicationDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Application Deadline</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !deadline && "text-muted-foreground"
                      )}
                      disabled={isLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deadline ? format(deadline, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={deadline}
                      onSelect={setDeadline}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes about this job (e.g., contacts, next steps)..."
                className="min-h-[100px]"
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-3 pt-6">
            <Button type="button" variant="outline" onClick={() => router.push('/jobs')} disabled={isLoading}>
              <XCircle className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" variant="default" disabled={isLoading || !title || !company}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save Job'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
