
"use client";

import React, { useState, type FormEvent, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Save, XCircle, ArrowLeft, Trash2, Building, ClipboardList, Users, Info, FileText as FileTextIcon, Briefcase as JobDetailsIcon, PlusCircle, ExternalLink, Edit3, Check, Eye } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import type { Job } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const baseJobStatuses: string[] = ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

// Status progression rules - defines which statuses are available based on current status
const getAvailableStatuses = (currentStatus: string): string[] => {
  switch (currentStatus) {
    case 'Saved':
      // From Saved, can move to Applied, Interviewing, Offer, or Rejected
      return ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'];
    
    case 'Applied':
      // From Applied, cannot go back to Saved, can move forward or to Rejected
      return ['Applied', 'Interviewing', 'Offer', 'Rejected'];
    
    case 'Interviewing':
      // From Interviewing, cannot go back to Saved or Applied, can move forward or to Rejected
      return ['Interviewing', 'Offer', 'Rejected'];
    
    case 'Offer':
      // From Offer, cannot go back to previous statuses, only Rejected
      return ['Offer', 'Rejected'];
    
    case 'Rejected':
      // From Rejected, no other statuses available (final state)
      return ['Rejected'];
    
    default:
      // For custom statuses or unknown statuses, allow all options
      return baseJobStatuses;
  }
};

const generateId = () => crypto.randomUUID();

// Helper function to safely parse dates
const safeParseDate = (dateString: string | null | undefined): Date | undefined => {
  console.log('safeParseDate input:', dateString, typeof dateString);
  
  if (!dateString) {
    console.log('No date string provided');
    return undefined;
  }
  
  try {
    const date = new Date(dateString);
    console.log('Parsed date:', date, 'isValid:', !isNaN(date.getTime()));
    
    if (!isNaN(date.getTime())) {
      return date;
    } else {
      console.warn('Invalid date result:', date);
      return undefined;
    }
  } catch (error) {
    console.error('Error parsing date:', dateString, error);
    return undefined;
  }
};



// Real API function to get job details from database
const getJobById = async (id: string): Promise<Job | null> => {
  try {
    console.log("Fetching job with ID:", id);
    const response = await fetch(`/api/jobs/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // Job not found
      }
      throw new Error(`Failed to fetch job: ${response.statusText}`);
    }
    
    const job = await response.json();
    console.log("Fetched job:", job);
    return job;
  } catch (error) {
    console.error("Error fetching job:", error);
    return null;
  }
};

const sectionKeys = {
  JOB_DETAILS: 'jobDetails',
  COMPANY_INSIGHTS: 'companyInsights',
  ROLE_SPECIFICS: 'roleSpecifics',
  APPLICATION_TRACKING: 'applicationTracking',
  REFERRALS: 'referrals',
  ASSOCIATED_DOCUMENTS: 'associatedDocuments',
};

const sections = [
  { id: sectionKeys.JOB_DETAILS, label: 'Job Details', icon: JobDetailsIcon },
  { id: sectionKeys.COMPANY_INSIGHTS, label: 'Company Insights', icon: Building },
  { id: sectionKeys.ROLE_SPECIFICS, label: 'Role Specifics', icon: FileTextIcon },
  { id: sectionKeys.APPLICATION_TRACKING, label: 'Application Tracking', icon: Info },
  { id: sectionKeys.REFERRALS, label: 'Referrals', icon: Users },
  { id: sectionKeys.ASSOCIATED_DOCUMENTS, label: 'Associated Documents', icon: FileTextIcon },
];


export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;
  const { toast } = useToast();
  const { user } = useAuth();

  // Core job details
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [applicationDate, setApplicationDate] = useState<Date | undefined>();
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [isEditingUrl, setIsEditingUrl] = useState(false);

  // Fields for sidebar sections
  const [currentJobStatus, setCurrentJobStatus] = useState<string>('');
  const [originalDatabaseStatus, setOriginalDatabaseStatus] = useState<string>('');

  const [notes, setNotes] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [referrals, setReferrals] = useState('');
  const [roleDetails, setRoleDetails] = useState('');
  const [location, setLocation] = useState<string>('');
  const [salaryMin, setSalaryMin] = useState<number | undefined>();
  const [salaryMax, setSalaryMax] = useState<number | undefined>();
  const [description, setDescription] = useState<string>('');

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [activeSection, setActiveSection] = useState<string>(sectionKeys.JOB_DETAILS);
  
  // Associated documents state
  const [associatedResumes, setAssociatedResumes] = useState<any[]>([]);
  const [associatedCoverLetters, setAssociatedCoverLetters] = useState<any[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const notesRef = useRef<HTMLTextAreaElement>(null);

  // Validation functions
  const validateField = (fieldName: string, value: any): string => {
    switch (fieldName) {
      case 'title':
        if (!value || value.trim().length === 0) return 'Job title is required';
        if (value.trim().length < 2) return 'Job title must be at least 2 characters';
        if (value.trim().length > 100) return 'Job title must be less than 100 characters';
        return '';
      
      case 'company':
        if (!value || value.trim().length === 0) return 'Company name is required';
        if (value.trim().length < 1) return 'Company name must be at least 1 character';
        if (value.trim().length > 100) return 'Company name must be less than 100 characters';
        return '';
      
      case 'url':
        if (value && value.trim().length > 0) {
          try {
            new URL(value);
          } catch {
            return 'Please enter a valid URL';
          }
        }
        return '';
      
      case 'salary_min':
        if (value !== undefined && value !== null && value !== '') {
          if (isNaN(Number(value))) return 'Salary must be a valid number';
          if (Number(value) < 0) return 'Salary cannot be negative';
          if (Number(value) > 10000000) return 'Salary seems too high';
        }
        return '';
      
      case 'salary_max':
        if (value !== undefined && value !== null && value !== '') {
          if (isNaN(Number(value))) return 'Salary must be a valid number';
          if (Number(value) < 0) return 'Salary cannot be negative';
          if (Number(value) > 10000000) return 'Salary seems too high';
        }
        return '';
      
      case 'location':
        if (value && value.trim().length > 200) return 'Location must be less than 200 characters';
        return '';
      
      case 'description':
        if (value && value.trim().length > 5000) return 'Description must be less than 5000 characters';
        return '';
      
      case 'company_description':
        if (value && value.trim().length > 5000) return 'Company description must be less than 5000 characters';
        return '';
      
      case 'role_details':
        if (value && value.trim().length > 10000) return 'Role details must be less than 10000 characters';
        return '';
      
      case 'notes':
        if (value && value.trim().length > 2000) return 'Notes must be less than 2000 characters';
        return '';
      
      case 'referrals':
        if (value && value.trim().length > 1000) return 'Referrals must be less than 1000 characters';
        return '';
      
      default:
        return '';
    }
  };

  const validateSalaryRange = (min: number | undefined, max: number | undefined): string => {
    if (min !== undefined && max !== undefined && min > max) {
      return 'Minimum salary cannot be greater than maximum salary';
    }
    return '';
  };

  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    
    // Validate individual fields
    newErrors.title = validateField('title', title);
    newErrors.company = validateField('company', company);
    newErrors.url = validateField('url', url);
    newErrors.salary_min = validateField('salary_min', salaryMin);
    newErrors.salary_max = validateField('salary_max', salaryMax);
    newErrors.location = validateField('location', location);
    newErrors.description = validateField('description', description);
    newErrors.company_description = validateField('company_description', companyDescription);
    newErrors.role_details = validateField('role_details', roleDetails);
    newErrors.notes = validateField('notes', notes);
    newErrors.referrals = validateField('referrals', referrals);
    
    // Validate salary range
    const salaryRangeError = validateSalaryRange(salaryMin, salaryMax);
    if (salaryRangeError) {
      newErrors.salary_range = salaryRangeError;
    }
    
    return newErrors;
  };

  // Helper functions for validation
  const handleFieldChange = (fieldName: string, value: any, setter: (value: any) => void) => {
    setter(value);
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const newErrors = validateForm();
      if (Object.values(newErrors).every(error => error.length === 0)) {
        setErrors({});
      }
    }
  }, [title, company, url, salaryMin, salaryMax, location, description, companyDescription, roleDetails, notes, referrals]);

  const handleFieldBlur = (fieldName: string, value: any) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    // Validate field on blur
    const error = validateField(fieldName, value);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const hasErrors = (): boolean => {
    return Object.values(errors).some(error => error.length > 0);
  };

  // Error display component
  const ErrorMessage = ({ fieldName }: { fieldName: string }) => {
    const error = errors[fieldName];
    const isTouched = touched[fieldName];
    
    if (!error || !isTouched) return null;
    
    return (
      <p className="text-sm text-destructive mt-1">
        {error}
      </p>
    );
  };

  const adjustTextareaHeight = (textareaRef: React.RefObject<HTMLTextAreaElement>, maxHeight: number = 200) => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height to allow it to shrink
      const scrollHeight = textareaRef.current.scrollHeight;
      if (scrollHeight > maxHeight) {
        textareaRef.current.style.height = `${maxHeight}px`;
        textareaRef.current.style.overflowY = 'auto';
      } else {
        textareaRef.current.style.height = `${scrollHeight}px`;
        textareaRef.current.style.overflowY = 'hidden';
      }
    }
  };

  useEffect(() => {
    if (activeSection === sectionKeys.APPLICATION_TRACKING) {
        adjustTextareaHeight(notesRef, 200);
    }
  }, [notes, activeSection]);


  useEffect(() => {
    if (jobId) {
      const fetchJobData = async () => {
        setIsFetching(true);
        const jobData = await getJobById(jobId);
        if (jobData) {
          console.log('Raw job data:', jobData);
          console.log('Raw application_date:', jobData.application_date);
          console.log('Raw deadline:', jobData.deadline);
          
          setTitle(jobData.title);
          setCompany(jobData.company); 
          setUrl(jobData.url || '');
          // Handle dates with safe parsing
          const parsedAppDate = safeParseDate(jobData.application_date);
          const parsedDeadline = safeParseDate(jobData.deadline);
          
          console.log('Parsed application date:', parsedAppDate);
          console.log('Parsed deadline:', parsedDeadline);
          
          setApplicationDate(parsedAppDate);
          setDeadline(parsedDeadline);

          setCurrentJobStatus(jobData.status);
          setOriginalDatabaseStatus(jobData.status); // Store original status
          const initialStatuses = [...baseJobStatuses];
          if (jobData.status && !initialStatuses.some(s => s.toLowerCase() === jobData.status.toLowerCase())) {
            initialStatuses.push(jobData.status);
          }
          // setDisplayedStatuses(initialStatuses.slice(0, MAX_STATUSES)); // Removed as per edit hint
          // setNewCustomStatusInput(''); // Removed as per edit hint

          setNotes(jobData.notes || '');
          setCompanyDescription(jobData.company_description || '');
          setReferrals(jobData.referrals || '');
          setLocation(jobData.location || '');
          setSalaryMin(jobData.salary_min);
          setSalaryMax(jobData.salary_max);
          setDescription(jobData.description || '');

          setRoleDetails(jobData.role_details || '');
        } else {
          toast({
            variant: "destructive",
            title: "Job Not Found",
            description: "Could not find the job to edit.",
          });
          router.push('/jobs');
        }
        setIsFetching(false);
      };
      fetchJobData();
    }
  }, [jobId, router, toast]);

  // Effect for fetching company logo
  useEffect(() => {
    if (company && company.trim() !== "") {
      const potentialDomain = company.trim().toLowerCase().replace(/[^a-z0-9-.]/gi, '').split(' ')[0] + ".com";
      setCompanyLogo(`https://logo.clearbit.com/${potentialDomain}`);
    } else {
      setCompanyLogo(null);
    }
  }, [company]);

  useEffect(() => {
    if (!isFetching && activeSection === sectionKeys.APPLICATION_TRACKING) { 
      adjustTextareaHeight(notesRef, 200);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetching, activeSection]);

  // Debug effect for date state changes
  useEffect(() => {
    console.log('Application date state changed:', applicationDate);
  }, [applicationDate]);

  useEffect(() => {
    console.log('Deadline state changed:', deadline);
  }, [deadline]);

  // Fetch associated documents when job data is loaded
  useEffect(() => {
    if (jobId && !isFetching) {
      const fetchAssociatedDocuments = async () => {
        setIsLoadingDocuments(true);
        try {
          // Fetch associated resumes
          const resumesResponse = await fetch(`/api/resumes?userId=${user?.id}`);
          if (resumesResponse.ok) {
            const resumesData = await resumesResponse.json();
            const jobResumes = resumesData.filter((resume: any) => resume.job_id === parseInt(jobId));
            setAssociatedResumes(jobResumes);
          }
          
          // Fetch associated cover letters
          const coverLettersResponse = await fetch(`/api/cover-letters?userId=${user?.id}`);
          if (coverLettersResponse.ok) {
            const coverLettersData = await coverLettersResponse.json();
            const jobCoverLetters = coverLettersData.filter((letter: any) => letter.job_id === parseInt(jobId));
            setAssociatedCoverLetters(jobCoverLetters);
          }
        } catch (error) {
          console.error('Error fetching associated documents:', error);
        } finally {
          setIsLoadingDocuments(false);
        }
      };
      
      fetchAssociatedDocuments();
    }
  }, [jobId, isFetching, user?.id]); 

  // Removed handleAddCustomStatus as per edit hint


  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    // Validate form before submission
    const formErrors = validateForm();
    setErrors(formErrors);

    if (Object.values(formErrors).some(error => error.length > 0)) {
      toast({
        variant: "destructive",
        title: "Validation Errors",
        description: "Please fix the errors in the form before submitting.",
      });
      setIsLoading(false);
      return;
    }

    if (!title || !company) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Job Title and Company (in Job Details section) are required.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const updatedJob = {
        title,
        company,
        url: url || undefined,
        status: currentJobStatus,
        application_date: applicationDate ? applicationDate.toISOString() : undefined,
        deadline: deadline ? deadline.toISOString() : undefined,
        notes,
        company_description: companyDescription,
        referrals,
        role_details: roleDetails,
        location: location || undefined,
        salary_min: salaryMin !== undefined && salaryMin !== null ? salaryMin : undefined,
        salary_max: salaryMax !== undefined && salaryMax !== null ? salaryMax : undefined,
        description: description || undefined,
      };

      console.log("Updating job:", updatedJob);
      console.log("Application date:", applicationDate, "ISO:", applicationDate ? applicationDate.toISOString() : undefined);
      console.log("Deadline:", deadline, "ISO:", deadline ? deadline.toISOString() : undefined);
      
      // Send the update to the API
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedJob),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Failed to update job: ${response.status}`;
        throw new Error(errorMessage);
      }

      toast({
        title: "Job Updated Successfully!",
        description: `The job "${title}" at ${company} has been updated.`,
      });
      
      // Clear validation errors on success
      setErrors({});
      setTouched({});
      
      router.push('/jobs');
    } catch (error: any) {
      console.error('Error updating job:', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update the job. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    console.log("Deleting job with ID:", jobId);
    
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete job');
      }

      toast({
        title: "Job Deleted Successfully!",
        description: `The job "${title}" at ${company} has been deleted.`,
      });
      router.push('/jobs');
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Failed to delete the job. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading job details...</p>
      </div>
    );
  }

  const allInputsDisabled = isLoading || isFetching;
  // Removed canAddNewStatus as per edit hint


  const renderSectionContent = () => {
    switch (activeSection) {
      case sectionKeys.JOB_DETAILS:
        return (
          <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="font-headline text-xl flex items-center">
                    <JobDetailsIcon className="mr-2 h-5 w-5 text-accent" /> Job Details
                    </CardTitle>
                    {company && (
                    <Avatar className="h-[50px] w-[50px] border">
                        <AvatarImage
                            src={companyLogo || ''}
                            alt={company ? `${company} logo` : 'Company logo'}
                        />
                        <AvatarFallback>
                            <Building className="h-6 w-6 text-muted-foreground" />
                        </AvatarFallback>
                    </Avatar>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title*</Label>
                <Input 
                  id="title" 
                  value={title} 
                  onChange={(e) => handleFieldChange('title', e.target.value, setTitle)} 
                  onBlur={(e) => handleFieldBlur('title', e.target.value)}
                  placeholder="e.g., Software Engineer" 
                  required 
                  disabled={allInputsDisabled}
                  data-testid="job-title-input"
                  className={errors.title && touched.title ? 'border-destructive' : ''}
                />
                <ErrorMessage fieldName="title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company*</Label>
                <Input 
                  id="company" 
                  value={company} 
                  onChange={(e) => handleFieldChange('company', e.target.value, setCompany)} 
                  onBlur={(e) => handleFieldBlur('company', e.target.value)}
                  placeholder="e.g., FutureTech Solutions" 
                  required 
                  disabled={allInputsDisabled}
                  data-testid="company-input"
                  className={errors.company && touched.company ? 'border-destructive' : ''}
                />
                <ErrorMessage fieldName="company" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Job Posting URL</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(e) => handleFieldChange('url', e.target.value, setUrl)}
                    onBlur={(e) => handleFieldBlur('url', e.target.value)}
                    placeholder="https://example.com/job/123"
                    disabled={!isEditingUrl || allInputsDisabled}
                    className={`flex-grow ${errors.url && touched.url ? 'border-destructive' : ''}`}
                  />
                  {!isEditingUrl ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => { if (url) window.open(url, '_blank'); }}
                        disabled={!url || allInputsDisabled}
                        aria-label="Open job posting link"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setIsEditingUrl(true)}
                        disabled={allInputsDisabled}
                        aria-label="Edit job posting URL"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setIsEditingUrl(false)}
                      disabled={allInputsDisabled}
                      aria-label="Done editing URL"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <ErrorMessage fieldName="url" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="applicationDate">Application Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !applicationDate && "text-muted-foreground")} disabled={allInputsDisabled}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {(() => {
                          try {
                            if (applicationDate && !isNaN(applicationDate.getTime())) {
                              return format(applicationDate, "PPP");
                            }
                            return <span>Pick a date</span>;
                          } catch (error) {
                            console.error('Error formatting application date:', error);
                            return <span>Pick a date</span>;
                          }
                        })()}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar 
                        mode="single" 
                        selected={applicationDate && !isNaN(applicationDate.getTime()) ? applicationDate : undefined} 
                        onSelect={setApplicationDate} 
                        initialFocus 
                        disabled={allInputsDisabled} 
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Application Deadline</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !deadline && "text-muted-foreground")} disabled={allInputsDisabled}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {(() => {
                          try {
                            if (deadline && !isNaN(deadline.getTime())) {
                              return format(deadline, "PPP");
                            }
                            return <span>Pick a date</span>;
                          } catch (error) {
                            console.error('Error formatting deadline:', error);
                            return <span>Pick a date</span>;
                          }
                        })()}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar 
                        mode="single" 
                        selected={deadline && !isNaN(deadline.getTime()) ? deadline : undefined} 
                        onSelect={setDeadline} 
                        initialFocus 
                        disabled={allInputsDisabled} 
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              {/* New fields section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="location">Job Location</Label>
                  <Input 
                    id="location" 
                    value={location || ''} 
                    onChange={(e) => handleFieldChange('location', e.target.value, setLocation)} 
                    onBlur={(e) => handleFieldBlur('location', e.target.value)}
                    placeholder="e.g., San Francisco, CA or Remote" 
                    disabled={allInputsDisabled} 
                    data-testid="location-input"
                    className={errors.location && touched.location ? 'border-destructive' : ''}
                  />
                  <ErrorMessage fieldName="location" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaryMin">Salary Range (Min)</Label>
                  <Input 
                    id="salaryMin" 
                    type="number" 
                    value={salaryMin || ''} 
                    onChange={(e) => handleFieldChange('salary_min', e.target.value ? parseInt(e.target.value) : undefined, setSalaryMin)} 
                    onBlur={(e) => handleFieldBlur('salary_min', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="e.g., 80000" 
                    data-testid="salary-min-input"
                    disabled={allInputsDisabled} 
                    className={errors.salary_min && touched.salary_min ? 'border-destructive' : ''}
                  />
                  <ErrorMessage fieldName="salary_min" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaryMax">Salary Range (Max)</Label>
                  <Input 
                    id="salaryMax" 
                    type="number" 
                    value={salaryMax || ''} 
                    onChange={(e) => handleFieldChange('salary_max', e.target.value ? parseInt(e.target.value) : undefined, setSalaryMax)} 
                    onBlur={(e) => handleFieldBlur('salary_max', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="e.g., 120000" 
                    data-testid="salary-max-input"
                    disabled={allInputsDisabled} 
                    className={errors.salary_max && touched.salary_max ? 'border-destructive' : ''}
                  />
                  <ErrorMessage fieldName="salary_max" />
                </div>
              </div>
              {errors.salary_range && (
                <div className="col-span-3">
                  <p className="text-sm text-destructive mt-1">
                    {errors.salary_range}
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="description">Job Description</Label>
                <Textarea 
                  id="description" 
                  value={description || ''} 
                  onChange={(e) => handleFieldChange('description', e.target.value, setDescription)} 
                  onBlur={(e) => handleFieldBlur('description', e.target.value)}
                  placeholder="Brief job description or summary..." 
                  disabled={allInputsDisabled} 
                  className={`min-h-[100px] ${errors.description && touched.description ? 'border-destructive' : ''}`}
                  data-testid="job-description-input"
                />
                <ErrorMessage fieldName="description" />
              </div>
            </CardContent>
          </Card>
        );
      case sectionKeys.COMPANY_INSIGHTS:
        return (
          <Card>
            <CardHeader><CardTitle className="font-headline text-xl flex items-center"><Building className="mr-2 h-5 w-5 text-accent" /> Company Insights</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="companyDescription">About the Company</Label>
              <Textarea 
                id="companyDescription" 
                value={companyDescription} 
                onChange={(e) => handleFieldChange('company_description', e.target.value, setCompanyDescription)} 
                onBlur={(e) => handleFieldBlur('company_description', e.target.value)}
                placeholder="What does the company do? Mission, values, etc." 
                disabled={allInputsDisabled} 
                className={`min-h-[50vh] ${errors.company_description && touched.company_description ? 'border-destructive' : ''}`}
                data-testid="company-description-input"
              />
              <ErrorMessage fieldName="company_description" />
            </CardContent>
          </Card>
        );
      case sectionKeys.ROLE_SPECIFICS:
        return (
          <Card>
            <CardHeader><CardTitle className="font-headline text-xl flex items-center"><FileTextIcon className="mr-2 h-5 w-5 text-accent" /> Role Specifics</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="roleDetails">Key Responsibilities / Skills</Label>
              <Textarea
                  id="roleDetails"
                  value={roleDetails}
                  onChange={(e) => handleFieldChange('role_details', e.target.value, setRoleDetails)}
                  onBlur={(e) => handleFieldBlur('role_details', e.target.value)}
                  placeholder="e.g., Develop and maintain web applications, collaborate with cross-functional teams..."
                  disabled={allInputsDisabled}
                  className={`min-h-[50vh] ${errors.role_details && touched.role_details ? 'border-destructive' : ''}`}
                  data-testid="role-details-input"
                />
              <ErrorMessage fieldName="role_details" />
            </CardContent>
          </Card>
        );
      case sectionKeys.APPLICATION_TRACKING:
        return (
          <Card>
            <CardHeader><CardTitle className="font-headline text-xl flex items-center"><Info className="mr-2 h-5 w-5 text-accent" /> Application Tracking</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
           
                <Select 
                  value={currentJobStatus} 
                  onValueChange={(newStatus) => {
                    // Check if the new status is allowed based on progression rules from the original database status
                    const availableStatuses = getAvailableStatuses(originalDatabaseStatus);
                    if (availableStatuses.includes(newStatus)) {
                      setCurrentJobStatus(newStatus);
                    } else {
                      toast({
                        variant: "destructive",
                        title: "Invalid Status Change",
                        description: `Cannot change from "${originalDatabaseStatus}" to "${newStatus}". This violates the status progression rules.`
                      });
                    }
                  }} 
                  disabled={allInputsDisabled}
                >
                  <SelectTrigger id="status" data-testid="status-select"><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent data-testid="status-select-content">
                    {getAvailableStatuses(originalDatabaseStatus).map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {currentJobStatus && (
                  <div className="space-y-2">
                    {/* Status progression indicator */}
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-muted-foreground">Progress:</span>
                      {['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'].map((statusOption, index) => (
                        <div key={statusOption} className="flex items-center">
                          <div className={`w-2 h-2 rounded-full ${
                            statusOption === currentJobStatus 
                              ? 'bg-primary' 
                              : getAvailableStatuses(originalDatabaseStatus).includes(statusOption)
                                ? 'bg-muted'
                                : 'bg-muted-foreground/30'
                          }`} />
                          {index < 4 && (
                            <div className={`w-4 h-px mx-1 ${
                              getAvailableStatuses(originalDatabaseStatus).includes(statusOption) && 
                              getAvailableStatuses(originalDatabaseStatus).includes(['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'][index + 1])
                                ? 'bg-muted'
                                : 'bg-muted-foreground/30'
                            }`} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">General Notes</Label>
                <Textarea 
                  ref={notesRef} 
                  id="notes" 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="Contacts, next steps, or any other relevant info..." 
                  disabled={allInputsDisabled} 
                  style={{overflowY: 'hidden'}}
                  data-testid="notes-input"
                />
              </div>
            </CardContent>
          </Card>
        );
      case sectionKeys.REFERRALS:
        return (
          <Card>
            <CardHeader><CardTitle className="font-headline text-xl flex items-center"><Users className="mr-2 h-5 w-5 text-accent" /> Referrals</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="referrals">Referral Information</Label>
              <Textarea 
                id="referrals" 
                value={referrals} 
                onChange={(e) => setReferrals(e.target.value)} 
                placeholder="e.g., John Doe (john@example.com) - Team Lead, referred by Jane Smith" 
                disabled={allInputsDisabled} 
                className="min-h-[25vh]"
                data-testid="referrals-input"
              />
            </CardContent>
          </Card>
        );
      case sectionKeys.ASSOCIATED_DOCUMENTS:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center">
                <FileTextIcon className="mr-2 h-5 w-5 text-accent" /> 
                Associated Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Associated Resumes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Associated Resumes</Label>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/resumes/add?jobId=${jobId}`}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Resume
                    </Link>
                  </Button>
                </div>
                {isLoadingDocuments ? (
                  <div className="text-center py-8">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">Loading documents...</p>
                  </div>
                ) : associatedResumes.length > 0 ? (
                  <div className="space-y-3">
                    {associatedResumes.map((resume) => (
                      <div key={resume.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                        <div className="flex items-center space-x-3">
                          <FileTextIcon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{resume.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Last modified: {new Date(resume.updated_at || resume.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/resumes/edit/${resume.id}`} onClick={() => console.log('Navigating to resume edit:', `/resumes/edit/${resume.id}`)}>
                              <Edit3 className="mr-1 h-4 w-4" />
                              Edit
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileTextIcon className="mx-auto h-16 w-16 mb-4 opacity-50" />
                    <p>No resumes associated with this job</p>
                    <p className="text-sm mt-1">Create a resume and link it to this job</p>
                  </div>
                )}
              </div>

              {/* Associated Cover Letters */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Associated Cover Letters</Label>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/cover-letter-generator?jobId=${jobId}`}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Cover Letter
                    </Link>
                  </Button>
                </div>
                {isLoadingDocuments ? (
                  <div className="text-center py-8">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">Loading documents...</p>
                  </div>
                ) : associatedCoverLetters.length > 0 ? (
                  <div className="space-y-3">
                    {associatedCoverLetters.map((letter) => (
                      <div key={letter.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                        <div className="flex items-center space-x-3">
                          <FileTextIcon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{letter.title}</div>
                            <div className="text-sm text-muted-foreground">
                              Last modified: {new Date(letter.updated_at || letter.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/cover-letters/edit/${letter.id}`} onClick={() => console.log('Navigating to cover letter edit:', `/cover-letters/edit/${letter.id}`)}>
                              <Edit3 className="mr-1 h-4 w-4" />
                              Edit
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileTextIcon className="mx-auto h-16 w-16 mb-4 opacity-50" />
                    <p>No cover letters associated with this job</p>
                    <p className="text-sm mt-1">Create a cover letter and link it to this job</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;  
    }
  };

  return (
    <div className="space-y-4">
      <Button variant="outline" size="sm" asChild className="mb-4 print:hidden">
        <Link href="/jobs">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Job Tracker
        </Link>
      </Button>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8 min-h-[calc(100vh-12rem)]">
        <nav className="md:w-64 p-1 md:p-0 space-y-1 bg-card md:bg-transparent rounded-lg md:rounded-none md:border-r md:pr-4">
          {sections.map(section => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "secondary" : "ghost"}
              onClick={() => setActiveSection(section.id)}
              className="w-full justify-start text-left h-auto py-2 px-3"
              disabled={allInputsDisabled}
              data-testid={`${section.id}-section`}
            >
              <section.icon className="mr-2 h-4 w-4 flex-shrink-0" />
              {section.label}
            </Button>
          ))}
        </nav>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="flex-grow space-y-6 overflow-y-auto p-1 md:p-0">
            {renderSectionContent()}
          </div>
          <div className="flex justify-between items-center space-x-3 pt-4 mt-auto print:hidden p-1 md:p-0">
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={allInputsDisabled} className="sm:w-auto">
              <Trash2 className="mr-2 h-4 w-4" />
              {isLoading ? 'Deleting...' : 'Delete Job'}
            </Button>
            <div className="flex space-x-3">
                <Button type="button" variant="outline" onClick={() => router.push('/jobs')} disabled={allInputsDisabled} className="flex-1 sm:flex-initial">
                <XCircle className="mr-2 h-4 w-4" />
                Cancel
                </Button>
                <Button type="submit" variant="default" disabled={allInputsDisabled || !title || !company} className="flex-1 sm:flex-initial" data-testid="save-job-button">
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

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
