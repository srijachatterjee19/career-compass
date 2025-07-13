
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
import type { Job, ChecklistItem } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RichTextEditor } from '@/components/ui/rich-text-editor';

const baseJobStatuses: string[] = ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'];
const MAX_STATUSES = 20;

const generateId = () => crypto.randomUUID();

// Mock function to get job details - replace with actual data fetching
const getJobById = async (id: string): Promise<Job | null> => {
  console.log("Fetching job with ID:", id);
  await new Promise(resolve => setTimeout(resolve, 300));
  const jobs: Job[] = [
     {
      id: '1',
      title: 'Software Engineer',
      company: '', 
      status: 'Applied',
      applicationDate: new Date('2024-07-15').toISOString(),
      deadline: new Date('2024-08-30').toISOString(),
      url: '',
      notes: '',
      companyDescription: '',
      referrals: '',
      checklist: [
        { id: generateId(), text: 'Draft thank you email template for after interviews.', isChecked: false },
      ],
      roleDetails: ''
    },
  ];
  const job = jobs.find(job => job.id === id) || null;
  if (job && typeof job.checklist === 'string') {
    // Basic migration for string checklist to ChecklistItem[]
    job.checklist = (job.checklist as string).split('\\n').filter(line => line.trim() !== '').map(line => {
        const isChecked = /^- \[[xX]\] /.test(line); // Checks for "- [x] " or "- [X] "
        const text = line.replace(/^- \[[ xX]?\]? /, '').trim(); // Removes the checkbox part
        return { id: generateId(), text, isChecked };
    });
  } else if (job && !job.checklist) {
    job.checklist = [];
  } else if (job && Array.isArray(job.checklist)) {
    job.checklist = job.checklist.map(item => ({...item, id: item.id || generateId()}));
  }
  return job;
};

const sectionKeys = {
  JOB_DETAILS: 'jobDetails',
  COMPANY_INSIGHTS: 'companyInsights',
  ROLE_SPECIFICS: 'roleSpecifics',
  APPLICATION_TRACKING: 'applicationTracking',
  REFERRALS: 'referrals',
  PREPARATION_CHECKLIST: 'preparationChecklist',
};

const sections = [
  { id: sectionKeys.JOB_DETAILS, label: 'Job Details', icon: JobDetailsIcon },
  { id: sectionKeys.COMPANY_INSIGHTS, label: 'Company Insights', icon: Building },
  { id: sectionKeys.ROLE_SPECIFICS, label: 'Role Specifics', icon: FileTextIcon },
  { id: sectionKeys.APPLICATION_TRACKING, label: 'Application Tracking', icon: Info },
  { id: sectionKeys.REFERRALS, label: 'Referrals', icon: Users },
  { id: sectionKeys.PREPARATION_CHECKLIST, label: 'Prep Checklist', icon: ClipboardList },
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
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [roleDetails, setRoleDetails] = useState('');

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
          setApplicationDate(jobData.applicationDate ? new Date(jobData.applicationDate) : undefined);
          setDeadline(jobData.deadline ? new Date(jobData.deadline) : undefined);

          setCurrentJobStatus(jobData.status);
          const initialStatuses = [...baseJobStatuses];
          if (jobData.status && !initialStatuses.some(s => s.toLowerCase() === jobData.status.toLowerCase())) {
            initialStatuses.push(jobData.status);
          }
          setDisplayedStatuses(initialStatuses.slice(0, MAX_STATUSES));


          setNotes(jobData.notes || '');
          setCompanyDescription(jobData.companyDescription || '');
          setReferrals(jobData.referrals || '');

          if (typeof jobData.checklist === 'string') {
                const parsedChecklist = (jobData.checklist as string)
                    .split('\\n')
                    .filter(line => line.trim() !== '')
                    .map(line => {
                        const isChecked = /^- \[[xX]\] /.test(line);
                        const text = line.replace(/^- \[[ xX]?\]? /, '').trim();
                        return { id: generateId(), text, isChecked };
                    });
                setChecklist(parsedChecklist);
            } else if (Array.isArray(jobData.checklist)) {
                 setChecklist(jobData.checklist.map(item => ({...item, id: item.id || generateId()})));
            } else {
                setChecklist([]);
            }

          setRoleDetails(jobData.roleDetails || '');
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

  const handleAddChecklistItem = () => {
    setChecklist(prev => [...prev, { id: generateId(), text: '', isChecked: false }]);
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  };

  const handleChecklistItemTextChange = (id: string, newText: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, text: newText } : item));
  };

  const handleChecklistItemToggle = (id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, isChecked: !item.isChecked } : item));
  };

  const handleAddCustomStatus = () => {
    const trimmedNewStatus = newCustomStatusInput.trim();
    if (!trimmedNewStatus) {
      toast({ variant: "destructive", title: "Invalid Input", description: "Status name cannot be empty." });
      return;
    }

    const existingStatus = displayedStatuses.find(s => s.toLowerCase() === trimmedNewStatus.toLowerCase());

    if (existingStatus) {
      setCurrentJobStatus(existingStatus);
      toast({ title: "Status Selected", description: `"${existingStatus}" selected.` });
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

    const updatedJob: Job = {
      id: jobId,
      title,
      company,
      url: url || '',
      status: currentJobStatus,
      applicationDate: applicationDate ? applicationDate.toISOString() : undefined,
      deadline: deadline ? deadline.toISOString() : undefined,
      notes,
      companyDescription,
      referrals,
      checklist: checklist.filter(item => item.text.trim() !== ''),
      roleDetails,
    };

    console.log("Updating job:", updatedJob);
    await new Promise(resolve => setTimeout(resolve, 700));

    toast({
      title: "Job Updated (Demo)",
      description: `The job "${title}" at ${company} has been updated.`,
    });
    setIsLoading(false);
    router.push('/jobs');
  };

  const handleDelete = async () => {
    setIsLoading(true);
    console.log("Deleting job with ID:", jobId);
    await new Promise(resolve => setTimeout(resolve, 700));
     toast({
      title: "Job Deleted (Demo)",
      description: `The job "${title}" at ${company} has been deleted.`,
    });
    setIsLoading(false);
    router.push('/jobs');
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
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Software Engineer" required disabled={allInputsDisabled} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company*</Label>
                <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g., FutureTech Solutions" required disabled={allInputsDisabled} />
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
                        {applicationDate ? format(applicationDate, "PPP") : <span>Pick a date</span>}
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
            </CardContent>
          </Card>
        );
      case sectionKeys.COMPANY_INSIGHTS:
        return (
          <Card>
            <CardHeader><CardTitle className="font-headline text-xl flex items-center"><Building className="mr-2 h-5 w-5 text-accent" /> Company Insights</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="companyDescription">About the Company</Label>
              <Textarea id="companyDescription" value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)} placeholder="What does the company do? Mission, values, etc." disabled={allInputsDisabled} className="min-h-[50vh]" />
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
                <Select value={currentJobStatus} onValueChange={setCurrentJobStatus} disabled={allInputsDisabled}>
                  <SelectTrigger id="status"><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    {displayedStatuses.map(s => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                  </SelectContent>
                </Select>
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
                  />
                  <Button
                    type="button"
                    onClick={handleAddCustomStatus}
                    disabled={allInputsDisabled || !newCustomStatusInput.trim() || !canAddNewStatus}
                    variant="outline"
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
                <Textarea ref={notesRef} id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Contacts, next steps, or any other relevant info..." disabled={allInputsDisabled} style={{overflowY: 'hidden'}} />
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
              <Textarea id="referrals" value={referrals} onChange={(e) => setReferrals(e.target.value)} placeholder="e.g., John Doe (john@example.com) - Team Lead, referred by Jane Smith" disabled={allInputsDisabled} className="min-h-[25vh]" />
            </CardContent>
          </Card>
        );
      case sectionKeys.PREPARATION_CHECKLIST:
        return (
          <Card>
            <CardHeader><CardTitle className="font-headline text-xl flex items-center"><ClipboardList className="mr-2 h-5 w-5 text-accent" /> Preparation Checklist</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {checklist.map((item) => (
                <div key={item.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`checklist-${item.id}`}
                    checked={item.isChecked}
                    onCheckedChange={() => handleChecklistItemToggle(item.id)}
                    disabled={allInputsDisabled}
                  />
                  <Input
                    type="text"
                    value={item.text}
                    onChange={(e) => handleChecklistItemTextChange(item.id, e.target.value)}
                    placeholder="Checklist item..."
                    className="flex-grow"
                    disabled={allInputsDisabled}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveChecklistItem(item.id)}
                    disabled={allInputsDisabled}
                    aria-label="Remove checklist item"
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={handleAddChecklistItem} disabled={allInputsDisabled} className="mt-2">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Item
              </Button>
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
                <Button type="submit" variant="default" disabled={allInputsDisabled || !title || !company} className="flex-1 sm:flex-initial">
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

