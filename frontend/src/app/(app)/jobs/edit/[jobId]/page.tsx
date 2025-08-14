
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
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { CalendarIcon, Save, XCircle, ArrowLeft, Trash2, Building, ClipboardList, Users, Info, FileText as FileTextIcon, Briefcase as JobDetailsIcon, PlusCircle, ExternalLink, Edit3, Check } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { Job } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RichTextEditor } from '@/components/ui/rich-text-editor';

const baseJobStatuses: string[] = ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'];
const MAX_STATUSES = 20;

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
};

const sections = [
  { id: sectionKeys.JOB_DETAILS, label: 'Job Details', icon: JobDetailsIcon },
  { id: sectionKeys.COMPANY_INSIGHTS, label: 'Company Insights', icon: Building },
  { id: sectionKeys.ROLE_SPECIFICS, label: 'Role Specifics', icon: FileTextIcon },
  { id: sectionKeys.APPLICATION_TRACKING, label: 'Application Tracking', icon: Info },
  { id: sectionKeys.REFERRALS, label: 'Referrals', icon: Users },
];


export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;
  const { toast } = useToast();

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
  const [displayedStatuses, setDisplayedStatuses] = useState<string[]>([...baseJobStatuses]);
  const [newCustomStatusInput, setNewCustomStatusInput] = useState('');

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

  const notesRef = useRef<HTMLTextAreaElement>(null);


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
          setTitle(jobData.title);
          setCompany(jobData.company); 
          setUrl(jobData.url || '');
          setApplicationDate(jobData.application_date ? new Date(jobData.application_date) : undefined);
          setDeadline(jobData.deadline ? new Date(jobData.deadline) : undefined);

          setCurrentJobStatus(jobData.status);
          const initialStatuses = [...baseJobStatuses];
          if (jobData.status && !initialStatuses.some(s => s.toLowerCase() === jobData.status.toLowerCase())) {
            initialStatuses.push(jobData.status);
          }
          setDisplayedStatuses(initialStatuses.slice(0, MAX_STATUSES));

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

  const handleAddCustomStatus = () => {
    const trimmedNewStatus = newCustomStatusInput.trim();
    if (!trimmedNewStatus) {
      toast({ variant: "destructive", title: "Invalid Input", description: "Status name cannot be empty." });
      return;
    }

    // Check if current status is Rejected (no changes allowed)
    if (currentJobStatus === 'Rejected') {
      toast({ 
        variant: "destructive", 
        title: "Status Change Not Allowed", 
        description: "Cannot change status from Rejected. This is a final state." 
      });
      return;
    }

    const existingStatus = displayedStatuses.find(s => s.toLowerCase() === trimmedNewStatus.toLowerCase());

    if (existingStatus) {
      // Check if the existing status is available based on progression rules
      const availableStatuses = getAvailableStatuses(currentJobStatus);
      if (availableStatuses.includes(existingStatus)) {
        setCurrentJobStatus(existingStatus);
        toast({ title: "Status Selected", description: `"${existingStatus}" selected.` });
      } else {
        toast({ 
          variant: "destructive", 
          title: "Status Not Available", 
          description: `Cannot change to "${existingStatus}" from current status "${currentJobStatus}".` 
        });
      }
    } else {
      if (displayedStatuses.length >= MAX_STATUSES) {
        toast({ variant: "destructive", title: "Status Limit Reached", description: `Cannot add more than ${MAX_STATUSES} statuses.` });
        return;
      }
      setDisplayedStatuses(prev => [...prev, trimmedNewStatus]);
      setCurrentJobStatus(trimmedNewStatus);
      toast({ title: "Status Added & Selected", description: `New status "${trimmedNewStatus}" added and selected.` });
    }
    setNewCustomStatusInput('');
  };


  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

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
        salary_min: salaryMin,
        salary_max: salaryMax,
        description: description || undefined,
      };

      console.log("Updating job:", updatedJob);
      
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
  const canAddNewStatus = displayedStatuses.length < MAX_STATUSES || displayedStatuses.some(s => s.toLowerCase() === newCustomStatusInput.trim().toLowerCase());


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
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g., Software Engineer" 
                  required 
                  disabled={allInputsDisabled}
                  data-testid="job-title-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company*</Label>
                <Input 
                  id="company" 
                  value={company} 
                  onChange={(e) => setCompany(e.target.value)} 
                  placeholder="e.g., FutureTech Solutions" 
                  required 
                  disabled={allInputsDisabled}
                  data-testid="company-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Job Posting URL</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/job/123"
                    disabled={!isEditingUrl || allInputsDisabled}
                    className="flex-grow"
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
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="applicationDate">Application Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !applicationDate && "text-muted-foreground")} disabled={allInputsDisabled}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {deadline ? format(deadline, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={applicationDate} onSelect={setApplicationDate} initialFocus disabled={allInputsDisabled} /></PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Application Deadline</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !deadline && "text-muted-foreground")} disabled={allInputsDisabled}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {deadline ? format(deadline, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={deadline} onSelect={setDeadline} initialFocus disabled={allInputsDisabled} /></PopoverContent>
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
                    onChange={(e) => setLocation(e.target.value)} 
                    placeholder="e.g., San Francisco, CA or Remote" 
                    disabled={allInputsDisabled} 
                    data-testid="location-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaryMin">Salary Range (Min)</Label>
                  <Input 
                    id="salaryMin" 
                    type="number" 
                    value={salaryMin || ''} 
                    onChange={(e) => setSalaryMin(e.target.value ? parseInt(e.target.value) : undefined)} 
                    placeholder="e.g., 80000" 
                    data-testid="salary-min-input"
                    disabled={allInputsDisabled} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaryMax">Salary Range (Max)</Label>
                  <Input 
                    id="salaryMax" 
                    type="number" 
                    value={salaryMax || ''} 
                    onChange={(e) => setSalaryMax(e.target.value ? parseInt(e.target.value) : undefined)} 
                    placeholder="e.g., 120000" 
                    data-testid="salary-max-input"
                    disabled={allInputsDisabled} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Job Description</Label>
                <Textarea 
                  id="description" 
                  value={description || ''} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Brief job description or summary..." 
                  disabled={allInputsDisabled} 
                  className="min-h-[100px]"
                  data-testid="job-description-input"
                />
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
                onChange={(e) => setCompanyDescription(e.target.value)} 
                placeholder="What does the company do? Mission, values, etc." 
                disabled={allInputsDisabled} 
                className="min-h-[50vh]"
                data-testid="company-description-input"
              />
            </CardContent>
          </Card>
        );
      case sectionKeys.ROLE_SPECIFICS:
        return (
          <Card>
            <CardHeader><CardTitle className="font-headline text-xl flex items-center"><FileTextIcon className="mr-2 h-5 w-5 text-accent" /> Role Specifics</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="roleDetails">Key Responsibilities / Skills</Label>
              <RichTextEditor
                  value={roleDetails}
                  onChange={setRoleDetails}
                  disabled={allInputsDisabled}
                  minHeight="50vh"
                  data-testid="role-details-input"
                />
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
                    // Check if the new status is allowed based on progression rules
                    const availableStatuses = getAvailableStatuses(currentJobStatus);
                    if (availableStatuses.includes(newStatus)) {
                      setCurrentJobStatus(newStatus);
                    } else {
                      toast({
                        variant: "destructive",
                        title: "Invalid Status Change",
                        description: `Cannot change from "${currentJobStatus}" to "${newStatus}". This violates the status progression rules.`
                      });
                    }
                  }} 
                  disabled={allInputsDisabled}
                >
                  <SelectTrigger id="status" data-testid="status-select"><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent data-testid="status-select-content">
                    {getAvailableStatuses(currentJobStatus).map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {currentJobStatus && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      {currentJobStatus === 'Rejected' 
                        ? 'Job has been rejected. No further status changes allowed.'
                        : `Available statuses based on current status: ${getAvailableStatuses(currentJobStatus).join(', ')}`
                      }
                    </p>
                    {/* Status progression indicator */}
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-muted-foreground">Progress:</span>
                      {['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'].map((statusOption, index) => (
                        <div key={statusOption} className="flex items-center">
                          <div className={`w-2 h-2 rounded-full ${
                            statusOption === currentJobStatus 
                              ? 'bg-primary' 
                              : getAvailableStatuses(currentJobStatus).includes(statusOption)
                                ? 'bg-muted'
                                : 'bg-muted-foreground/30'
                          }`} />
                          {index < 4 && (
                            <div className={`w-4 h-px mx-1 ${
                              getAvailableStatuses(currentJobStatus).includes(statusOption) && 
                              getAvailableStatuses(currentJobStatus).includes(['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'][index + 1])
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
                <Label htmlFor="newCustomStatusInput">Add or Select Custom Status (Max {MAX_STATUSES})</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="newCustomStatusInput"
                    value={newCustomStatusInput}
                    onChange={(e) => setNewCustomStatusInput(e.target.value)}
                    placeholder="Type new status name"
                    disabled={allInputsDisabled}
                    className="flex-grow"
                    data-testid="new-custom-status-input"
                  />
                  <Button
                    type="button"
                    onClick={handleAddCustomStatus}
                    disabled={allInputsDisabled || !newCustomStatusInput.trim() || !canAddNewStatus}
                    variant="outline"
                    data-testid="add-custom-status-button"
                  >
                    Add & Select
                  </Button>
                </div>
                { displayedStatuses.length >= MAX_STATUSES && !displayedStatuses.some(s => s.toLowerCase() === newCustomStatusInput.trim().toLowerCase()) && newCustomStatusInput.trim() &&
                    <p className="text-xs text-destructive">Status limit reached. Cannot add new unique status.</p>
                }
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

