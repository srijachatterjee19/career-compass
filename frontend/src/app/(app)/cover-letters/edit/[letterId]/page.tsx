"use client";

import { useState, type FormEvent, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Save, XCircle, ArrowLeft, FileText as FileTextIcon, Loader2 as LoaderIcon, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CoverLetter, Job } from "@/types";
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';


function Loader2({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("animate-spin", className)}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}


interface CoverLetterFormState {
  name: string;
  content: string;
  job_id?: number;
}

const initialFormState: CoverLetterFormState = {
  name: '',
  content: '',
  job_id: undefined,
};

export default function EditCoverLetterPage() {
  const router = useRouter();
  const params = useParams();
  const letterId = params.letterId as string;
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState<CoverLetterFormState>(initialFormState);
  const [originalLetter, setOriginalLetter] = useState<CoverLetter | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);

  // Fetch jobs for the dropdown
  const fetchJobs = async () => {
    if (!user) return;
    
    try {
      setIsLoadingJobs(true);
      const response = await fetch(`/api/jobs?userId=${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      
      const jobsData = await response.json();
      setJobs(jobsData);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        variant: "destructive",
        title: "Failed to Load Jobs",
        description: "Could not load jobs for the dropdown.",
      });
    } finally {
      setIsLoadingJobs(false);
    }
  };

  useEffect(() => {
    if (letterId) {
      const fetchLetterData = async () => {
        setIsFetching(true);
        try {
          const response = await fetch(`/api/cover-letters/${letterId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch cover letter');
          }
          
          const letterData = await response.json();
          console.log('Fetched cover letter data:', letterData);
          
          setOriginalLetter(letterData);
          setFormData({
            name: letterData.title || letterData.name || 'Untitled Cover Letter',
            content: letterData.content || '',
            job_id: letterData.job_id || undefined,
          });
        } catch (error) {
          console.error('Error fetching cover letter:', error);
          toast({
            variant: "destructive",
            title: "Cover Letter Not Found",
            description: "Could not find the cover letter to edit.",
          });
          router.push('/my-cover-letters');
        } finally {
          setIsFetching(false);
        }
      };
      fetchLetterData();
    }
  }, [letterId, router, toast]);

  // Fetch jobs when component mounts
  useEffect(() => {
    fetchJobs();
  }, [user]);

  const handleInputChange = (field: keyof CoverLetterFormState, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };



  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);

    if (!formData.name.trim()) {
      toast({ variant: "destructive", title: "Missing Name", description: "Cover Letter Name is required." });
      setIsSaving(false);
      return;
    }
    if (!originalLetter) {
       toast({ variant: "destructive", title: "Error", description: "Original cover letter data not found." });
       setIsSaving(false);
       return;
    }

    const updatedLetterData = {
      title: formData.name,
      content: formData.content,
      job_id: formData.job_id,
    };
    
    // Make real API call to update
    const response = await fetch(`/api/cover-letters/${letterId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedLetterData),
    });

    if (!response.ok) {
      throw new Error('Failed to update cover letter');
    }

    const savedLetter = await response.json();
    console.log("Cover letter updated successfully:", savedLetter);

    toast({
      title: "Cover Letter Updated Successfully!",
      description: `The cover letter "${formData.name}" has been updated.`,
    });
    router.push('/my-cover-letters');
    setIsSaving(false);
  };

  if (isFetching) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Loading cover letter for editing...</p>
      </div>
    );
  }
  
  const allFieldsDisabled = isSaving;

  return (
    <div className="space-y-8">
      <Button variant="outline" size="sm" asChild className="mb-4">
        <Link href="/my-cover-letters">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cover Letters
        </Link>
      </Button>
      <Card className="w-full max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center">
            <FileTextIcon className="mr-3 h-7 w-7 text-accent" />
            Edit Cover Letter
          </CardTitle>
          <CardDescription>Edit the name, associated job, and content of your cover letter below.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="letterName" className="text-base">Cover Letter Name*</Label>
              <Input
                id="letterName"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter cover letter name..."
                required
                disabled={allFieldsDisabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobSelection" className="text-base">Associated Job </Label>
              <Select
                value={formData.job_id?.toString() || "general"}
                onValueChange={(value) => {
                  if (value === "general") {
                    handleInputChange('job_id', undefined);
                  } else {
                    handleInputChange('job_id', parseInt(value));
                  }
                }}
                disabled={allFieldsDisabled || isLoadingJobs}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a job or General" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">
                    <div className="flex items-center">
                      <FileTextIcon className="mr-2 h-4 w-4" />
                      General
                    </div>
                  </SelectItem>
                  {jobs.length > 0 && (
                    <>
                      <Separator className="my-2" />
                      <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                        Saved Jobs
                      </div>
                      {jobs.map((job) => (
                        <SelectItem key={job.id} value={job.id.toString()}>
                          <div className="flex items-center">
                            <Briefcase className="mr-2 h-4 w-4" />
                            <div className="flex flex-col">
                              <span className="font-medium">{job.title}</span>
                              <span className="text-xs text-muted-foreground">{job.company}</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="letterContent" className="text-base">Cover Letter Content*</Label>
              <Textarea
                id="letterContent"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Write your cover letter content here..."
                className="min-h-[400px]"
                required
                disabled={allFieldsDisabled}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-3 pt-6">
            <Button type="button" variant="outline" onClick={() => router.push('/my-cover-letters')} disabled={allFieldsDisabled}>
              <XCircle className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={allFieldsDisabled || !formData.name} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
