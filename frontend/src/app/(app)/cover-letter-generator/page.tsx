
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Save, XCircle, ArrowLeft, FileText as FileTextIcon, Loader2, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import type { Job } from "@/types";
import { useEffect } from "react";
import Link from "next/link";

interface CoverLetterFormState {
  title: string;
  content: string;
  job_id?: number;
}

const initialFormState: CoverLetterFormState = {
  title: '',
  content: '',
  job_id: undefined,
};

// Default cover letter template
const defaultCoverLetterContent = `Dear Hiring Manager,

I am writing to express my strong interest in the [Position Title] position at [Company Name]. With my background in [relevant field/experience], I am confident in my ability to contribute effectively to your team and help achieve your company's goals.

Throughout my career, I have developed strong skills in [key skill 1], [key skill 2], and [key skill 3]. My experience includes [brief description of relevant experience], which I believe aligns well with the requirements for this role.

I am particularly drawn to [Company Name] because of [specific reason - company values, mission, projects, etc.]. I am excited about the opportunity to [specific contribution you can make] and believe my background makes me an excellent candidate for this position.

I would welcome the opportunity to discuss how my skills and experience can benefit your organization. Thank you for considering my application. I look forward to hearing from you.

Sincerely,
[Your Name]
[Your Contact Information]`;

export default function CreateCoverLetterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState<CoverLetterFormState>(initialFormState);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);

  // Initialize form with default content
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      content: defaultCoverLetterContent
    }));
  }, []);

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

  // Fetch jobs when component mounts
  useEffect(() => {
    fetchJobs();
  }, [user]);

  // Check for jobId query parameter to auto-link cover letter to a job
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const jobIdParam = urlParams.get('jobId');
    
    if (jobIdParam) {
      const jobId = parseInt(jobIdParam);
      if (!isNaN(jobId)) {
        setFormData(prev => ({ ...prev, job_id: jobId }));
        console.log('Auto-linking cover letter to job:', jobId);
      }
    }
  }, []);

  const handleInputChange = (field: keyof CoverLetterFormState, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);

    if (!formData.title.trim()) {
      toast({ variant: "destructive", title: "Missing Title", description: "Cover Letter Title is required." });
      setIsSaving(false);
      return;
    }

    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Please log in to save cover letters.",
      });
      setIsSaving(false);
      return;
    }
    
    try {
      const coverLetterData = {
        title: formData.title,
        content: formData.content,
        userId: user.id,
        job_id: formData.job_id,
      };

      const response = await fetch('/api/cover-letters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(coverLetterData),
      });

      if (!response.ok) {
        throw new Error('Failed to save cover letter');
      }

      const savedCoverLetter = await response.json();
      console.log("Cover letter saved successfully:", savedCoverLetter);

      toast({
        title: "Cover Letter Saved Successfully!",
        description: `The cover letter "${formData.title}" has been saved.`,
      });
      
      router.push('/my-cover-letters');
    } catch (error) {
      console.error('Error saving cover letter:', error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save the cover letter. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const allFieldsDisabled = isSaving;

  return (
    <div className="space-y-8">
      <Button variant="outline" size="sm" asChild className="mb-4">
        <Link href="/my-cover-letters">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Cover Letters
        </Link>
      </Button>
      
      <Card className="w-full max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center">
            <FileTextIcon className="mr-3 h-7 w-7 text-accent" />
            Create New Cover Letter
          </CardTitle>
          <CardDescription>Fill in the details below to create a new cover letter. You can edit the template content as needed.</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="letterTitle" className="text-base">Cover Letter Title*</Label>
              <Input
                id="letterTitle"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter cover letter title..."
                required
                disabled={allFieldsDisabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobSelection" className="text-base">Associated Job (Optional)</Label>
              {formData.job_id && (
                <div className="p-3 bg-primary/10 border border-primary/30 rounded-md text-sm text-primary">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-4 w-4" />
                    <span className="font-medium">Auto-linked to job #{formData.job_id}</span>
                  </div>
                  <p className="text-primary/80 mt-1">This cover letter will be automatically associated with the selected job.</p>
                </div>
              )}
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
            <Button type="submit" disabled={allFieldsDisabled || !formData.title} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Cover Letter'}
                </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
