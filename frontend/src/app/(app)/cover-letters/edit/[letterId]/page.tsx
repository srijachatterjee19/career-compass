"use client";

import { useState, type FormEvent, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Save, XCircle, ArrowLeft, FileText as FileTextIcon, Sparkles, Loader2 as LoaderIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CoverLetter } from "@/types";
import { initialSavedCoverLetters, updateMockCoverLetter } from '@/lib/mock-data';
import { optimizeCoverLetter, type OptimizeCoverLetterInput } from '@/ai/flows/optimize-cover-letter';
import { cn } from '@/lib/utils';


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
  jobTitle: string;
  companyName: string;
  content: string;
  jobDescription: string;
  resumeSnippet: string;
}

const initialFormState: CoverLetterFormState = {
  name: '',
  jobTitle: '',
  companyName: '',
  content: '',
  jobDescription: '',
  resumeSnippet: '',
};

export default function EditCoverLetterPage() {
  const router = useRouter();
  const params = useParams();
  const letterId = params.letterId as string;
  const { toast } = useToast();

  const [formData, setFormData] = useState<CoverLetterFormState>(initialFormState);
  const [originalLetter, setOriginalLetter] = useState<CoverLetter | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    if (letterId) {
      const fetchLetterData = async () => {
        setIsFetching(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        const letterData = initialSavedCoverLetters.find(cl => cl.id === letterId);
        
        if (letterData) {
          setOriginalLetter(letterData);
          setFormData({
            name: letterData.name,
            jobTitle: letterData.jobTitle || '',
            companyName: letterData.companyName || '',
            content: letterData.content,
            jobDescription: letterData.jobDescription || '',
            resumeSnippet: letterData.resumeSnippet || '',
          });
        } else {
          toast({
            variant: "destructive",
            title: "Cover Letter Not Found",
            description: "Could not find the cover letter to edit.",
          });
          router.push('/my-cover-letters');
        }
        setIsFetching(false);
      };
      fetchLetterData();
    }
  }, [letterId, router, toast]);

  const handleInputChange = (field: keyof CoverLetterFormState, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOptimize = async () => {
    if (!formData.content.trim() || !formData.jobDescription.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Cover letter content and job description are needed for AI optimization.",
      });
      return;
    }
    setIsOptimizing(true);
    try {
      const input: OptimizeCoverLetterInput = {
        currentCoverLetter: formData.content,
        jobDescription: formData.jobDescription,
        resumeSnippet: formData.resumeSnippet || undefined,
      };
      const result = await optimizeCoverLetter(input);
      setFormData(prev => ({ ...prev, content: result.optimizedCoverLetter }));
      toast({
        title: "Cover Letter Optimized",
        description: "The AI has updated your cover letter content.",
      });
    } catch (error) {
      console.error("Error optimizing cover letter:", error);
      toast({
        variant: "destructive",
        title: "Optimization Failed",
        description: "Could not optimize the cover letter. Please try again.",
      });
    } finally {
      setIsOptimizing(false);
    }
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

    const updatedLetterData: CoverLetter = {
      ...originalLetter,
      name: formData.name,
      jobTitle: formData.jobTitle,
      companyName: formData.companyName,
      content: formData.content,
      jobDescription: formData.jobDescription,
      resumeSnippet: formData.resumeSnippet,
      updatedAt: new Date().toISOString(), // This will be overwritten by mock update
    };
    
    // Simulate API call for update
    await new Promise(resolve => setTimeout(resolve, 500));
    const success = updateMockCoverLetter(updatedLetterData);

    if (success) {
      toast({
        title: "Cover Letter Updated (Demo)",
        description: `The cover letter "${formData.name}" has been updated.`,
      });
      router.push('/my-cover-letters');
    } else {
      toast({ variant: "destructive", title: "Update Failed", description: "Could not update the cover letter in the mock data." });
    }
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
  
  const allFieldsDisabled = isSaving || isOptimizing;

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
            Edit Cover Letter
          </CardTitle>
          <CardDescription>Update the details for your cover letter below. You can also use AI to optimize the content.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="letterName" className="text-base">Cover Letter Name*</Label>
              <Input
                id="letterName"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Software Engineer Application for Acme Corp"
                required
                disabled={allFieldsDisabled}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Target Job Title</Label>
                <Input
                  id="jobTitle"
                  value={formData.jobTitle}
                  onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                  placeholder="e.g., Senior Software Engineer"
                  disabled={allFieldsDisabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Target Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="e.g., Acme Corporation"
                  disabled={allFieldsDisabled}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="letterContent" className="text-base">Cover Letter Content*</Label>
              <Textarea
                id="letterContent"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Paste or write your cover letter here..."
                className="min-h-[250px] lg:min-h-[300px]"
                required
                disabled={allFieldsDisabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobDescription" className="text-base">Target Job Description (for AI Optimization)*</Label>
              <Textarea
                id="jobDescription"
                value={formData.jobDescription}
                onChange={(e) => handleInputChange('jobDescription', e.target.value)}
                placeholder="Paste the job description here to help the AI optimize your letter..."
                className="min-h-[150px]"
                required
                disabled={allFieldsDisabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resumeSnippet" className="text-base">Relevant Resume Snippet (Optional, for AI)</Label>
              <Textarea
                id="resumeSnippet"
                value={formData.resumeSnippet}
                onChange={(e) => handleInputChange('resumeSnippet', e.target.value)}
                placeholder="Paste relevant parts of your resume for AI context..."
                className="min-h-[100px]"
                disabled={allFieldsDisabled}
              />
            </div>
            
            <div className="pt-2 text-center">
              <Button 
                type="button" 
                variant="default"
                onClick={handleOptimize}
                disabled={allFieldsDisabled || !formData.content.trim() || !formData.jobDescription.trim()}
              >
                {isOptimizing ? (
                  <LoaderIcon className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-5 w-5" />
                )}
                Optimize Current Cover Letter with AI
              </Button>
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
