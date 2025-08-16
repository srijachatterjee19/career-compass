"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Save, XCircle, ArrowLeft, FileText as FilesIcon, FileText, User, Briefcase, GraduationCap, Sparkles, Lightbulb, Award, PlusCircle, Trash2, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import type { Resume, ExperienceEntry, EducationEntry, TextEntry, ProjectEntry, Job } from "@/types";
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const generateId = () => crypto.randomUUID();

// Enhanced validation schema using Zod with better field-level validation
const resumeFormSchema = z.object({
  name: z.string()
    .min(1, 'Resume name is required')
    .min(3, 'Resume name must be at least 3 characters')
    .max(100, 'Resume name must be less than 100 characters')
    .refine(val => val.trim().length > 0, 'Resume name cannot be empty'),
  summary: z.string()
    .max(500, 'Summary must be less than 500 characters')
    .optional(),
  experience: z.array(z.object({
    id: z.string(),
    jobTitle: z.string()
      .max(100, 'Job title must be less than 100 characters')
      .optional(),
    companyName: z.string()
      .max(100, 'Company name must be less than 100 characters')
      .optional(),
    dates: z.string()
      .max(50, 'Dates must be less than 50 characters')
      .refine(val => !val || !val.toLowerCase().includes('null'), 'Please enter valid dates (e.g., "Jan 2020 - Present")')
      .refine(val => !val || !val.toLowerCase().includes('undefined'), 'Please enter valid dates (e.g., "Jan 2020 - Present")')
      .refine(val => !val || !val.toLowerCase().includes('nan'), 'Please enter valid dates (e.g., "Jan 2020 - Present")')
      .optional(),
    description: z.string()
      .max(5000, 'Description must be less than 5000 characters')
      .optional()
  })).refine((entries) => {
    // If any experience entry has partial content, show a warning but don't block submission
    return entries.every(entry => {
      const hasContent = entry.jobTitle || entry.companyName || entry.dates || entry.description;
      if (hasContent) {
        // Allow partial content - don't require all fields
        return true;
      }
      return true;
    });
  }, {
    message: 'Experience entries can be partially filled',
    path: ['experience']
  }),
  education: z.array(z.object({
    id: z.string(),
    degree: z.string()
      .max(100, 'Degree must be less than 100 characters')
      .optional(),
    institution: z.string()
      .max(100, 'Institution must be less than 100 characters')
      .optional(),
    graduationYear: z.string()
      .max(20, 'Graduation year must be less than 20 characters')
      .refine(val => !val || !val.toLowerCase().includes('null'), 'Please enter a valid graduation year')
      .refine(val => !val || !val.toLowerCase().includes('undefined'), 'Please enter a valid graduation year')
      .refine(val => !val || !val.toLowerCase().includes('nan'), 'Please enter a valid graduation year')
      .optional(),
    details: z.string()
      .max(500, 'Details must be less than 500 characters')
      .optional()
  })).refine((entries) => {
    // If any education entry has partial content, show a warning but don't block submission
    return entries.every(entry => {
      const hasContent = entry.degree || entry.institution || entry.graduationYear || entry.details;
      if (hasContent) {
        // Allow partial content - don't require all fields
        return true;
      }
      return true;
      });
    }, {
      message: 'Education entries can be partially filled',
      path: ['education']
    }),
  skills: z.array(z.object({
    id: z.string(),
    value: z.string()
      .max(200, 'Skill must be less than 200 characters')
      .optional()
  })),
  projects: z.array(z.object({
    id: z.string(),
    title: z.string()
      .max(100, 'Title must be less than 100 characters')
      .optional(),
    description: z.string()
      .max(5000, 'Description must be less than 5000 characters')
      .optional()
  })).refine((entries) => {
    // If any project entry has partial content, show a warning but don't block submission
    return entries.every(entry => {
      const hasContent = entry.title || entry.description;
      if (hasContent) {
        // Allow partial content - don't require all fields
        return true;
      }
      return true;
    });
  }, {
    message: 'Project entries can be partially filled',
    path: ['projects']
  }),
  achievements: z.array(z.object({
    id: z.string(),
    value: z.string()
      .max(200, 'Achievement must be less than 200 characters')
      .optional()
  })),
  job_id: z.number().nullable().optional(),
});

type ResumeFormData = z.infer<typeof resumeFormSchema>;

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



const initialFormState: ResumeFormData = {
  name: 'My Professional Resume',
  summary: '',
  experience: [{ 
    id: generateId(), 
    jobTitle: '', 
    companyName: '', 
    dates: '', 
    description: '' 
  }],
  education: [{ 
    id: generateId(), 
    degree: '', 
    institution: '', 
    graduationYear: '', 
    details: '' 
  }],
  skills: [
    { id: generateId(), value: '' }
  ],
  projects: [{ 
    id: generateId(), 
    title: '', 
    description: '' 
  }],
  achievements: [
    { id: generateId(), value: '' }
  ],
  job_id: null,
};

export default function AddResumePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  
  // React Hook Form setup with Zod validation
  const form = useForm<ResumeFormData>({
    resolver: zodResolver(resumeFormSchema),
    defaultValues: initialFormState,
    mode: 'onChange', // Validate on change for immediate feedback
    reValidateMode: 'onChange', // Re-validate on change
  });

  // Clear errors when user starts typing
  const handleFieldChange = (fieldPath: keyof ResumeFormData | `experience.${number}.${keyof ResumeFormData['experience'][0]}` | `education.${number}.${keyof ResumeFormData['education'][0]}` | `skills.${number}.${keyof ResumeFormData['skills'][0]}` | `projects.${number}.${keyof ResumeFormData['projects'][0]}` | `achievements.${number}.${keyof ResumeFormData['achievements'][0]}`) => {
    const fieldError = form.getFieldState(fieldPath);
    if (fieldError.error) {
      form.clearErrors(fieldPath);
    }
  };

  const { 
    control, 
    handleSubmit, 
    formState: { errors, isValid, isDirty }, 
    watch, 
    setValue,
    trigger 
  } = form;

  // Field arrays for dynamic sections
  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control,
    name: 'experience',
  });

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control,
    name: 'education',
  });

  const { fields: skillsFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control,
    name: 'skills',
  });

  const { fields: projectsFields, append: appendProject, remove: removeProject } = useFieldArray({
    control,
    name: 'projects',
  });

  const { fields: achievementsFields, append: appendAchievement, remove: removeAchievement } = useFieldArray({
    control,
    name: 'achievements',
  });

  // Watch form values for real-time validation
  const watchedValues = watch();

  // Experience handlers
  const handleAddExperience = () => {
    appendExperience({ id: generateId(), jobTitle: '', companyName: '', dates: '', description: '' });
  };

  const handleRemoveExperience = (index: number) => {
    removeExperience(index);
  };

  // Education handlers
  const handleAddEducation = () => {
    appendEducation({ id: generateId(), degree: '', institution: '', graduationYear: '', details: '' });
  };

  const handleRemoveEducation = (index: number) => {
    removeEducation(index);
  };

  // Project handlers
  const handleAddProject = () => {
    appendProject({ id: generateId(), title: '', description: '' });
  };

  const handleRemoveProject = (index: number) => {
    removeProject(index);
  };

  // TextEntry handlers (Skills, Achievements)
  const handleAddSkill = () => {
    appendSkill({ id: generateId(), value: '' });
  };

  const handleRemoveSkill = (index: number) => {
    removeSkill(index);
  };

  const handleAddAchievement = () => {
    appendAchievement({ id: generateId(), value: '' });
  };

  const handleRemoveAchievement = (index: number) => {
    removeAchievement(index);
  };

  // Fetch jobs for job selection
  useEffect(() => {
    const fetchJobs = async () => {
      if (!user) return;
      
      setIsLoadingJobs(true);
      try {
        const response = await fetch(`/api/jobs?userId=${user.id}`);
        if (response.ok) {
          const jobsData = await response.json();
          setJobs(jobsData);
        }
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setIsLoadingJobs(false);
      }
    };

    fetchJobs();
  }, [user]);


  // Form submission handler
  const onSubmit = async (data: ResumeFormData) => {
    // Trigger validation to show all errors
    const isValid = await form.trigger();
    if (!isValid) {
      toast({
        variant: "destructive",
        title: "Validation Errors",
        description: "Please fix the errors in the form before submitting.",
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Please log in to create resumes.",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Filter out empty entries before submission
      const cleanedData = {
        ...data,
        experience: data.experience.filter(exp => 
          exp.jobTitle?.trim() || exp.companyName?.trim() || exp.dates?.trim() || exp.description?.trim()
        ) || [],
        education: data.education.filter(edu => 
          edu.degree?.trim() || edu.institution?.trim() || edu.graduationYear?.trim() || edu.details?.trim()
        ) || [],
        skills: data.skills.filter(skill => skill.value?.trim()) || [],
        projects: data.projects.filter(proj => 
          proj.title?.trim() || proj.description?.trim()
        ) || [],
        achievements: data.achievements.filter(ach => ach.value?.trim()) || [],
        // Ensure job_id is properly handled
        job_id: data.job_id || null,
      };

      // Debug logging
      console.log('Original form data:', data);
      console.log('Cleaned data:', cleanedData);

      const resumeData = {
        ...cleanedData,
        userId: user.id,
      };

      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resumeData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error Response:', errorData);
        throw new Error(errorData.error || 'Failed to create resume');
      }

      const savedResume = await response.json();
      console.log("Resume created successfully:", savedResume);

            toast({
        title: "Resume Created Successfully!",
        description: `The resume "${data.name}" has been created and saved.`,
      });
      
      router.push('/resumes');
    } catch (error) {
      console.error('Error creating resume:', error);
      toast({ 
        variant: "destructive", 
        title: "Creation Failed", 
        description: "Could not create the resume. Please try again." 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const textEntrySectionsConfig: Array<{
      field: 'skills' | 'achievements';
      label: string;
      icon: React.ElementType;
      placeholder: string;
      addButtonLabel: string;
      addHandler: () => void;
      removeHandler: (index: number) => void;
      fields: any[];
    }> = [
    { 
      field: 'skills', 
      label: 'Skills', 
      icon: Sparkles, 
      placeholder: 'e.g., JavaScript, React, Project Management', 
      addButtonLabel: 'Add Skill',
      addHandler: handleAddSkill,
      removeHandler: handleRemoveSkill,
      fields: skillsFields
    },
    { 
      field: 'achievements', 
      label: 'Achievements / Awards', 
      icon: Award, 
      placeholder: 'e.g., Employee of the Month, Dean\'s List', 
      addButtonLabel: 'Add Achievement',
      addHandler: handleAddAchievement,
      removeHandler: handleRemoveAchievement,
      fields: achievementsFields
    },
  ];

  return (
    <div className="space-y-8">
      <Button variant="outline" size="sm" asChild className="mb-4">
        <Link href="/resumes">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Resumes
        </Link>
      </Button>
      <Card className="w-full max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center">
            <FilesIcon className="mr-3 h-7 w-7 text-accent" />
            Create New Resume
          </CardTitle>
          <CardDescription>
            Fill in the details to build your new resume. All sections are optional - you can create a basic resume with just a name, or add as much detail as you'd like.
          </CardDescription>
          <div className="flex justify-end mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => form.reset(initialFormState)}
              className="text-xs"
            >
              Reset Form
            </Button>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Validation Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-4 p-4 border border-destructive bg-destructive/10 rounded-lg">
              <h3 className="font-semibold text-destructive mb-2 flex items-center">
                <AlertCircle className="mr-2 h-4 w-4" />
                Please fix the following errors:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-destructive">
                {Object.entries(errors).map(([field, error]) => {
                  if (!error) return null;
                  
                  // Handle array field errors (experience, education, etc.)
                  if (Array.isArray(error)) {
                    return error.map((item, index) => 
                      item && Object.entries(item).map(([subField, subError]) => 
                        subError && (
                          <li key={`${field}-${index}-${subField}`}>
                            <span className="capitalize">
                              {field.replace(/[-_]/g, ' ')} #{index + 1} - {subField.replace(/[-_]/g, ' ')}:
                            </span> {(subError as any)?.message || String(subError)}
                          </li>
                        )
                      )
                    );
                  }
                  
                  // Handle simple field errors
                  return (
                    <li key={field}>
                      <span className="capitalize">{field.replace(/[-_]/g, ' ')}:</span> {(error as any)?.message || String(error)}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="resumeName" className="text-base">Resume Name*</Label>
              <Input
                id="resumeName"
                {...form.register('name')}
                onChange={(e) => {
                  form.setValue('name', e.target.value);
                  handleFieldChange('name');
                }}
                placeholder="e.g., Software Engineer - Job Application"
                required
                disabled={isLoading}
                className={cn(errors.name && 'border-destructive')}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1 flex items-center">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Job Association Section */}
            <div className="space-y-2">
              <Label htmlFor="jobAssociation" className="text-base flex items-center">
                <Briefcase className="mr-2 h-5 w-5 text-muted-foreground" />
                Associate with Job (Optional)
              </Label>
              

              
              <Select
                value={watchedValues.job_id?.toString() || "general"}
                onValueChange={(value) => {
                  if (value === "general") {
                    setValue('job_id', null);
                  } else {
                    setValue('job_id', parseInt(value));
                  }
                }}
                disabled={isLoading || isLoadingJobs}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a job or make it general" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">
                    <div className="flex items-center space-x-2">
                      <FilesIcon className="h-4 w-4" />
                      <span>General Resume</span>
                    </div>
                  </SelectItem>
                  {jobs.length > 0 && (
                    <>
                      <Separator />
                      <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                        Saved Jobs
                      </div>
                      {jobs.map((job) => (
                        <SelectItem key={job.id} value={job.id.toString()}>
                          <div className="flex items-center space-x-2">
                            <Briefcase className="h-4 w-4" />
                            <div className="text-left">
                              <div className="font-medium">{job.title}</div>
                              <div className="text-xs text-muted-foreground">{job.company}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Link this resume to a specific job application or keep it as a general resume.
              </p>
            </div>

            {/* Summary Section */}
            <div className="space-y-2">
              <Label htmlFor="summary" className="text-base flex items-center">
                <User className="mr-2 h-5 w-5 text-muted-foreground" />
                Summary / About Me
              </Label>
              <Textarea
                id="summary"
                {...form.register('summary')}
                placeholder="A brief overview of your professional background..."
                className={cn('min-h-[120px]', errors.summary && 'border-destructive')}
                disabled={isLoading}
              />
              {errors.summary && (
                <p className="text-sm text-destructive mt-1 flex items-center">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  {errors.summary.message}
                </p>
              )}
            </div>

            {/* Work Experience Section */}
            <div className="space-y-4">
              <Label className="text-base flex items-center"><Briefcase className="mr-2 h-5 w-5 text-muted-foreground" />Work Experience</Label>
              {experienceFields.map((field, index) => (
                <Card key={field.id} className="p-4 space-y-3 bg-card/50 shadow-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor={`exp-jobTitle-${field.id}`}>Job Title</Label>
                      <Input 
                        id={`exp-jobTitle-${field.id}`} 
                        {...form.register(`experience.${index}.jobTitle`)}
                        placeholder="e.g., Senior Developer" 
                        disabled={isLoading}
                        className={cn(errors.experience?.[index]?.jobTitle && 'border-destructive')}
                      />
                      {errors.experience?.[index]?.jobTitle && (
                        <p className="text-sm text-destructive mt-1 flex items-center">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          {errors.experience[index]?.jobTitle?.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`exp-companyName-${field.id}`}>Company Name</Label>
                      <Input 
                        id={`exp-companyName-${field.id}`} 
                        {...form.register(`experience.${index}.companyName`)}
                        placeholder="e.g., Tech Solutions Inc." 
                        disabled={isLoading}
                        className={cn(errors.experience?.[index]?.companyName && 'border-destructive')}
                      />
                      {errors.experience?.[index]?.companyName && (
                        <p className="text-sm text-destructive mt-1 flex items-center">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          {errors.experience[index]?.companyName?.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`exp-dates-${field.id}`}>Dates</Label>
                    <Input 
                      id={`exp-dates-${field.id}`} 
                      {...form.register(`experience.${index}.dates`)}
                      placeholder="e.g., Jan 2020 - Present" 
                      disabled={isLoading}
                      className={cn(errors.experience?.[index]?.dates && 'border-destructive')}
                    />
                    {errors.experience?.[index]?.dates && (
                      <p className="text-sm text-destructive mt-1 flex items-center">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        {errors.experience[index]?.dates?.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`exp-description-${field.id}`}>Description</Label>
                    <Textarea 
                      id={`exp-description-${field.id}`} 
                      {...form.register(`experience.${index}.description`)}
                      placeholder="Key responsibilities and achievements..." 
                      className={cn('min-h-[100px]', errors.experience?.[index]?.description && 'border-destructive')}
                      disabled={isLoading} 
                    />
                    {errors.experience?.[index]?.description && (
                      <p className="text-sm text-destructive mt-1 flex items-center">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        {errors.experience[index]?.description?.message}
                      </p>
                    )}
                  </div>
                  {experienceFields.length > 1 && (
                    <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveExperience(index)} disabled={isLoading}>
                      <Trash2 className="mr-2 h-4 w-4" /> Remove Experience
                    </Button>
                  )}
                </Card>
              ))}
              <Button type="button" variant="outline" onClick={handleAddExperience} disabled={isLoading} className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Work Experience
              </Button>
            </div>

            {/* Education Section */}
            <div className="space-y-4">
                <Label className="text-base flex items-center"><GraduationCap className="mr-2 h-5 w-5 text-muted-foreground" />Education</Label>
                {educationFields.map((field, index) => (
                    <Card key={field.id} className="p-4 space-y-3 bg-card/50 shadow-md">
                        <div className="space-y-2">
                            <Label htmlFor={`edu-degree-${field.id}`}>Degree</Label>
                            <Input 
                                id={`edu-degree-${field.id}`} 
                                {...form.register(`education.${index}.degree`)}
                                placeholder="e.g., M.S. in Computer Science" 
                                disabled={isLoading}
                                className={cn(errors.education?.[index]?.degree && 'border-destructive')}
                            />
                            {errors.education?.[index]?.degree && (
                                <p className="text-sm text-destructive mt-1 flex items-center">
                                    <AlertCircle className="mr-1 h-3 w-3" />
                                    {errors.education[index]?.degree?.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`edu-institution-${field.id}`}>Institution</Label>
                            <Input 
                                id={`edu-institution-${field.id}`} 
                                {...form.register(`education.${index}.institution`)}
                                placeholder="e.g., State University" 
                                disabled={isLoading}
                                className={cn(errors.education?.[index]?.institution && 'border-destructive')}
                            />
                            {errors.education?.[index]?.institution && (
                                <p className="text-sm text-destructive mt-1 flex items-center">
                                    <AlertCircle className="mr-1 h-3 w-3" />
                                    {errors.education[index]?.institution?.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`edu-graduationYear-${field.id}`}>Graduation Year</Label>
                            <Input 
                                id={`edu-graduationYear-${field.id}`} 
                                {...form.register(`education.${index}.graduationYear`)}
                                placeholder="e.g., 2018" 
                                disabled={isLoading}
                                className={cn(errors.education?.[index]?.graduationYear && 'border-destructive')}
                            />
                            {errors.education?.[index]?.graduationYear && (
                                <p className="text-sm text-destructive mt-1 flex items-center">
                                    <AlertCircle className="mr-1 h-3 w-3" />
                                    {errors.education[index]?.graduationYear?.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`edu-details-${field.id}`}>Details (Optional)</Label>
                            <Textarea 
                                id={`edu-details-${field.id}`} 
                                {...form.register(`education.${index}.details`)}
                                placeholder="e.g., Thesis, GPA, Honors..." 
                                className={cn('min-h-[80px]', errors.education?.[index]?.details && 'border-destructive')}
                                disabled={isLoading} 
                            />
                        </div>
                        {educationFields.length > 1 && (
                            <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveEducation(index)} disabled={isLoading}>
                                <Trash2 className="mr-2 h-4 w-4" /> Remove Education
                            </Button>
                        )}
                    </Card>
                ))}
                <Button type="button" variant="outline" onClick={handleAddEducation} disabled={isLoading} className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Education
                </Button>
            </div>

            {/* Projects Section */}
            <div className="space-y-4">
              <Label className="text-base flex items-center"><Lightbulb className="mr-2 h-5 w-5 text-muted-foreground" />Projects</Label>
              {projectsFields.map((field, index) => (
                <Card key={field.id} className="p-4 space-y-3 bg-card/50 shadow-md">
                  <div className="space-y-1">
                    <Label htmlFor={`proj-title-${field.id}`}>Project Title</Label>
                    <Input 
                      id={`proj-title-${field.id}`} 
                      {...form.register(`projects.${index}.title`)}
                      placeholder="e.g., Personal Portfolio Website" 
                      disabled={isLoading}
                      className={cn(errors.projects?.[index]?.title && 'border-destructive')}
                    />
                    {errors.projects?.[index]?.title && (
                      <p className="text-sm text-destructive mt-1 flex items-center">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        {errors.projects[index]?.title?.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`proj-description-${field.id}`}>Project Description</Label>
                    <Textarea 
                      id={`proj-description-${field.id}`} 
                      {...form.register(`projects.${index}.description`)}
                      placeholder="Describe the project, your role, and technologies used..." 
                      className={cn('min-h-[100px]', errors.projects?.[index]?.description && 'border-destructive')}
                      disabled={isLoading} 
                    />
                    {errors.projects?.[index]?.description && (
                      <p className="text-sm text-destructive mt-1 flex items-center">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        {errors.projects[index]?.description?.message}
                      </p>
                    )}
                  </div>
                  {projectsFields.length > 1 && (
                    <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveProject(index)} disabled={isLoading}>
                      <Trash2 className="mr-2 h-4 w-4" /> Remove Project
                    </Button>
                  )}
                </Card>
              ))}
              <Button type="button" variant="outline" onClick={handleAddProject} disabled={isLoading} className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Project
              </Button>
            </div>
            
            {/* Skills, Achievements Sections (TextEntry) */}
            {textEntrySectionsConfig.map(sectionConfig => (
              <div key={sectionConfig.field} className="space-y-4">
                <Label className="text-base flex items-center">
                  <sectionConfig.icon className="mr-2 h-5 w-5 text-muted-foreground" />
                  {sectionConfig.label}
                </Label>
                {sectionConfig.fields.map((field, index) => (
                  <Card key={field.id} className="p-4 space-y-3 bg-card/50 shadow-md">
                    <div className="space-y-1">
                      <Label htmlFor={`${sectionConfig.field}-value-${field.id}`}>{sectionConfig.label} Entry #{index + 1}</Label>
                      <Textarea 
                        id={`${sectionConfig.field}-value-${field.id}`} 
                        {...form.register(`${sectionConfig.field}.${index}.value`)}
                        placeholder={sectionConfig.placeholder} 
                        className={cn('min-h-[80px]', errors[sectionConfig.field]?.[index]?.value && 'border-destructive')}
                        disabled={isLoading} 
                      />
                      {errors[sectionConfig.field]?.[index]?.value && (
                        <p className="text-sm text-destructive mt-1 flex items-center">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          {errors[sectionConfig.field]?.[index]?.value?.message}
                        </p>
                      )}
                    </div>
                    {sectionConfig.fields.length > 1 && (
                        <Button type="button" variant="destructive" size="sm" onClick={() => sectionConfig.removeHandler(index)} disabled={isLoading}>
                        <Trash2 className="mr-2 h-4 w-4" /> Remove {sectionConfig.label.slice(0,-1)}
                        </Button>
                    )}
                  </Card>
                ))}
                <Button type="button" variant="outline" onClick={sectionConfig.addHandler} disabled={isLoading} className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
                  <PlusCircle className="mr-2 h-4 w-4" /> {sectionConfig.addButtonLabel}
                </Button>
              </div>
            ))}
            
          </CardContent>
          <CardFooter className="flex justify-end space-x-3 pt-6">
            <Button type="button" variant="outline" onClick={() => router.push('/resumes')} disabled={isLoading}>
              <XCircle className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !isValid || !isDirty} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isLoading ? 'Saving...' : 'Save Resume'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
