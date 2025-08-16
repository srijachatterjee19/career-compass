
"use client";

import { useState, type FormEvent, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Save, XCircle, FileText as FilesIcon, User, Briefcase, GraduationCap, Sparkles, Lightbulb, Award, PlusCircle, Trash2, Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import type { Resume, ExperienceEntry, EducationEntry, TextEntry, ProjectEntry, Job } from "@/types";
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const generateId = () => crypto.randomUUID();

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

interface ResumeFormState {
  name: string;
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: TextEntry[];
  projects: ProjectEntry[];
  achievements: TextEntry[];
  job_id?: number;
}

const initialFormState: ResumeFormState = {
  name: '',
  summary: '',
  experience: [{ id: generateId(), jobTitle: '', companyName: '', dates: '', description: '' }],
  education: [{ id: generateId(), degree: '', institution: '', graduationYear: '', details: '' }],
  skills: [{ id: generateId(), value: '' }],
  projects: [{ id: generateId(), title: '', description: '' }],
  achievements: [{ id: generateId(), value: '' }],
  job_id: undefined,
};

// Validation functions
const validateField = (fieldName: string, value: any): string => {
  switch (fieldName) {
    case 'name':
      if (!value || value.trim().length === 0) return 'Resume name is required';
      if (value.trim().length < 3) return 'Resume name must be at least 3 characters';
      if (value.trim().length > 100) return 'Resume name must be less than 100 characters';
      return '';
    
    case 'summary':
      if (value && value.trim().length > 500) return 'Summary must be less than 500 characters';
      return '';
    
    case 'jobTitle':
      if (value && value.trim().length > 100) return 'Job title must be less than 100 characters';
      return '';
    
    case 'companyName':
      if (value && value.trim().length > 100) return 'Company name must be less than 100 characters';
      return '';
    
    case 'dates':
      if (value && value.trim().length > 50) return 'Dates must be less than 50 characters';
      return '';
    
    case 'description':
      if (value && value.trim().length > 5000) return 'Description must be less than 5000 characters';
      return '';
    
    case 'degree':
      if (value && value.trim().length > 100) return 'Degree must be less than 100 characters';
      return '';
    
    case 'institution':
      if (value && value.trim().length > 100) return 'Institution must be less than 100 characters';
      return '';
    
    case 'graduationYear':
      if (value && value.trim().length > 10) return 'Graduation year must be less than 10 characters';
      return '';
    
    case 'details':
      if (value && value.trim().length > 500) return 'Details must be less than 500 characters';
      return '';
    
    case 'title':
      if (value && value.trim().length > 100) return 'Title must be less than 100 characters';
      return '';
    
    case 'value':
      if (value && value.trim().length > 200) return 'Entry must be less than 200 characters';
      return '';
    
    default:
      return '';
  }
};

const validateForm = (formData: ResumeFormState): Record<string, string> => {
  const newErrors: Record<string, string> = {};
  
  // Validate basic fields
  newErrors.name = validateField('name', formData.name);
  newErrors.summary = validateField('summary', formData.summary);
  
  // Validate experience entries
  formData.experience.forEach((exp, index) => {
    if (exp.jobTitle || exp.companyName || exp.dates || exp.description) {
      if (!exp.jobTitle?.trim()) {
        newErrors[`exp-${index}-jobTitle`] = 'Job title is required if adding experience';
      }
      if (!exp.companyName?.trim()) {
        newErrors[`exp-${index}-companyName`] = 'Company name is required if adding experience';
      }
      if (!exp.dates?.trim()) {
        newErrors[`exp-${index}-dates`] = 'Dates are required if adding experience';
      }
      if (!exp.description?.trim()) {
        newErrors[`exp-${index}-description`] = 'Description is required if adding experience';
      }
    }
  });
  
  // Validate education entries
  formData.education.forEach((edu, index) => {
    if (edu.degree || edu.institution || edu.graduationYear || edu.details) {
      if (!edu.degree?.trim()) {
        newErrors[`edu-${index}-degree`] = 'Degree is required if adding education';
      }
      if (!edu.institution?.trim()) {
        newErrors[`edu-${index}-institution`] = 'Institution is required if adding education';
      }
      if (!edu.graduationYear?.trim()) {
        newErrors[`edu-${index}-graduationYear`] = 'Graduation year is required if adding education';
      }
    }
  });
  
  // Validate project entries
  formData.projects.forEach((proj, index) => {
    if (proj.title || proj.description) {
      if (!proj.title?.trim()) {
        newErrors[`proj-${index}-title`] = 'Project title is required if adding project';
      }
      if (!proj.description?.trim()) {
        newErrors[`proj-${index}-description`] = 'Project description is required if adding project';
      }
    }
  });
  
  // Validate skills and achievements
  formData.skills.forEach((skill, index) => {
    if (skill.value && !skill.value.trim()) {
      newErrors[`skill-${index}-value`] = 'Skill cannot be empty';
    }
  });
  
  formData.achievements.forEach((achievement, index) => {
    if (achievement.value && !achievement.value.trim()) {
      newErrors[`achievement-${index}-value`] = 'Achievement cannot be empty';
    }
  });
  
  return newErrors;
};

// API function to get resume details
const getResumeById = async (id: string): Promise<Resume | null> => {
  try {
    console.log("Fetching resume with ID:", id);
    const response = await fetch(`/api/resumes/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // Resume not found
      }
      throw new Error(`Failed to fetch resume: ${response.statusText}`);
    }
    
    const resume = await response.json();
    console.log("Fetched resume:", resume);
    return resume;
  } catch (error) {
    console.error("Error fetching resume:", error);
    return null;
  }
};

export default function EditResumePage() {
  const router = useRouter();
  const params = useParams();
  const resumeId = params.resumeId as string;
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState<ResumeFormState>(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Helper functions for validation
  const handleFieldChange = (field: keyof Pick<ResumeFormState, 'name' | 'summary'>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFieldBlur = (field: keyof Pick<ResumeFormState, 'name' | 'summary'>, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate field on blur
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleInputChange = (field: keyof Pick<ResumeFormState, 'name' | 'summary'>, value: string) => {
    handleFieldChange(field, value);
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

  const hasErrors = (): boolean => {
    return Object.values(errors).some(error => error.length > 0);
  };

  // Experience handlers
  const handleExperienceChange = (index: number, field: keyof Omit<ExperienceEntry, 'id'>, value: string) => {
    setFormData(prev => {
      const newExperience = [...prev.experience];
      newExperience[index] = { ...newExperience[index], [field]: value };
      return { ...prev, experience: newExperience };
    });
  };
  const handleAddExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, { id: generateId(), jobTitle: '', companyName: '', dates: '', description: '' }]
    }));
  };
  const handleRemoveExperience = (idToRemove: string) => {
    setFormData(prev => ({ ...prev, experience: prev.experience.filter(exp => exp.id !== idToRemove) }));
  };

  // Education handlers
  const handleEducationChange = (index: number, field: keyof Omit<EducationEntry, 'id'>, value: string) => {
    setFormData(prev => {
      const newEducation = [...prev.education];
      newEducation[index] = { ...newEducation[index], [field]: value };
      return { ...prev, education: newEducation };
    });
  };
  const handleAddEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { id: generateId(), degree: '', institution: '', graduationYear: '', details: '' }]
    }));
  };
  const handleRemoveEducation = (idToRemove: string) => {
    setFormData(prev => ({ ...prev, education: prev.education.filter(edu => edu.id !== idToRemove) }));
  };

  // Project handlers
  const handleProjectChange = (index: number, field: keyof Omit<ProjectEntry, 'id'>, value: string) => {
    setFormData(prev => {
      const newProjects = [...prev.projects];
      newProjects[index] = { ...newProjects[index], [field]: value };
      return { ...prev, projects: newProjects };
    });
  };
  const handleAddProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, { id: generateId(), title: '', description: '' }]
    }));
  };
  const handleRemoveProject = (idToRemove: string) => {
    setFormData(prev => ({ ...prev, projects: prev.projects.filter(proj => proj.id !== idToRemove) }));
  };

  // TextEntry handlers (Skills, Achievements)
  const handleTextEntryChange = (section: keyof Pick<ResumeFormState, 'skills' | 'achievements'>, index: number, value: string) => {
    setFormData(prev => {
      const newEntries = [...prev[section]];
      newEntries[index] = { ...newEntries[index], value };
      return { ...prev, [section]: newEntries };
    });
  };
  const handleAddTextEntry = (section: keyof Pick<ResumeFormState, 'skills' | 'achievements'>) => {
    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], { id: generateId(), value: '' }]
    }));
  };
  const handleRemoveTextEntry = (section: keyof Pick<ResumeFormState, 'skills' | 'achievements'>, idToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter(entry => entry.id !== idToRemove)
    }));
  };

  // Load resume data on component mount
  useEffect(() => {
    if (resumeId) {
      const fetchResumeData = async () => {
        setIsFetching(true);
        const resumeData = await getResumeById(resumeId);
        if (resumeData) {
          console.log('Raw resume data:', resumeData);
          console.log('Raw experience field:', resumeData.experience, typeof resumeData.experience);
          console.log('Raw education field:', resumeData.education, typeof resumeData.education);
          
          // Parse JSON data from database and ensure arrays exist
          const parseJsonField = (field: any) => {
            console.log('Parsing field:', field, typeof field);
            if (!field) return [];
            if (Array.isArray(field)) return field;
            try {
              const parsed = JSON.parse(field);
              console.log('Parsed result:', parsed, Array.isArray(parsed));
              return Array.isArray(parsed) ? parsed : [];
            } catch (error) {
              console.error('Error parsing JSON field:', error);
              return [];
            }
          };

          setFormData({
            name: resumeData.name,
            summary: resumeData.summary || '',
            experience: parseJsonField(resumeData.experience).length > 0 
              ? parseJsonField(resumeData.experience) 
              : [{ id: generateId(), jobTitle: '', companyName: '', dates: '', description: '' }],
            education: parseJsonField(resumeData.education).length > 0 
              ? parseJsonField(resumeData.education) 
              : [{ id: generateId(), degree: '', institution: '', graduationYear: '', details: '' }],
            skills: parseJsonField(resumeData.skills).length > 0 
              ? parseJsonField(resumeData.skills) 
              : [{ id: generateId(), value: '' }],
            projects: parseJsonField(resumeData.projects).length > 0 
              ? parseJsonField(resumeData.projects) 
              : [{ id: generateId(), title: '', description: '' }],
            achievements: parseJsonField(resumeData.achievements).length > 0 
              ? parseJsonField(resumeData.achievements) 
              : [{ id: generateId(), value: '' }],
            job_id: resumeData.job_id || undefined,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Resume Not Found",
            description: "Could not find the resume to edit.",
          });
          router.push('/resumes');
        }
        setIsFetching(false);
      };
      fetchResumeData();
    }
  }, [resumeId, router, toast]);

  // Ensure form data is always valid arrays
  useEffect(() => {
    const ensureValidArrays = () => {
      setFormData(prev => ({
        ...prev,
        experience: Array.isArray(prev.experience) ? prev.experience : [{ id: generateId(), jobTitle: '', companyName: '', dates: '', description: '' }],
        education: Array.isArray(prev.education) ? prev.education : [{ id: generateId(), degree: '', institution: '', graduationYear: '', details: '' }],
        skills: Array.isArray(prev.skills) ? prev.skills : [{ id: generateId(), value: '' }],
        projects: Array.isArray(prev.projects) ? prev.projects : [{ id: generateId(), title: '', description: '' }],
        achievements: Array.isArray(prev.achievements) ? prev.achievements : [{ id: generateId(), value: '' }],
      }));
    };

    ensureValidArrays();
  }, []);

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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    // Validate form before submission
    const formErrors = validateForm(formData);
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

    if (!formData.name.trim()) {
      toast({ variant: "destructive", title: "Missing Information", description: "Resume Name is required." });
      setIsLoading(false);
      return;
    }

    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Please log in to update resumes.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const updatedResumeData = {
        name: formData.name,
        summary: formData.summary,
        experience: formData.experience.filter(exp => exp.jobTitle || exp.companyName || exp.dates || exp.description),
        education: formData.education.filter(edu => edu.degree || edu.institution || edu.graduationYear || edu.details),
        skills: formData.skills.filter(skill => skill.value),
        projects: formData.projects.filter(proj => proj.title || proj.description),
        achievements: formData.achievements.filter(ach => ach.value),
        job_id: formData.job_id,
      };

      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedResumeData),
      });

      if (!response.ok) {
        throw new Error('Failed to update resume');
      }

      const savedResume = await response.json();
      console.log("Resume updated successfully:", savedResume);

      toast({
        title: "Resume Updated Successfully!",
        description: `The resume "${formData.name}" has been updated.`,
      });
      
      // Clear validation errors on success
      setErrors({});
      setTouched({});
      
      router.push('/resumes');
    } catch (error) {
      console.error('Error updating resume:', error);
      toast({ 
        variant: "destructive", 
        title: "Update Failed", 
        description: "Could not update the resume. Please try again." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete resume');
      }

      toast({
        title: "Resume Deleted Successfully!",
        description: "The resume has been permanently deleted.",
      });
      
      router.push('/resumes');
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Failed to delete the resume. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const textEntrySectionsConfig: Array<{
      field: keyof Pick<ResumeFormState, 'skills' | 'achievements'>;
      label: string;
      icon: React.ElementType;
      placeholder: string;
      addButtonLabel: string;
    }> = [
    { field: 'skills', label: 'Skills', icon: Sparkles, placeholder: 'e.g., JavaScript, React, Project Management', addButtonLabel: 'Add Skill' },
    { field: 'achievements', label: 'Achievements / Awards', icon: Award, placeholder: 'e.g., Employee of the Month, Dean\'s List', addButtonLabel: 'Add Achievement' },
  ];

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back to Resumes Button */}
      <div className="w-full max-w-3xl mx-auto">
        <Button
          variant="outline"
          size="default"
          onClick={() => router.push('/resumes')}
          className="mb-4 border-border text-foreground hover:bg-accent hover:text-accent-foreground flex items-center bg-background"
        >
          <FilesIcon className="mr-2 h-4 w-4" />
          Back to Resumes
        </Button>
      </div>
      
      <Card className="w-full max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center">
            <FilesIcon className="mr-3 h-7 w-7 text-accent" />
            Edit Resume
          </CardTitle>
          <CardDescription>Update your resume details below.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          {/* Validation Summary */}
          {Object.values(errors).some(error => error.length > 0) && (
            <div className="mb-4 p-4 border border-destructive bg-destructive/10 rounded-lg">
              <h3 className="font-semibold text-destructive mb-2">Please fix the following errors:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-destructive">
                {Object.entries(errors).map(([field, error]) => 
                  error && (
                    <li key={field}>
                      <span className="capitalize">{field.replace(/[-_]/g, ' ')}:</span> {error}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="resumeName" className="text-base">Resume Name*</Label>
              <Input
                id="resumeName"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onBlur={(e) => handleFieldBlur('name', e.target.value)}
                placeholder="e.g., Software Engineer - Job Application"
                required
                disabled={isLoading}
                className={errors.name && touched.name ? 'border-destructive' : ''}
              />
              <ErrorMessage fieldName="name" />
            </div>

            {/* Job Association Section */}
            <div className="space-y-2">
              <Label htmlFor="jobAssociation" className="text-base flex items-center">
                <Briefcase className="mr-2 h-5 w-5 text-muted-foreground" />
                Associate with Job 
              </Label>
              <Select
                value={formData.job_id?.toString() || "general"}
                onValueChange={(value) => {
                  if (value === "general") {
                    setFormData(prev => ({ ...prev, job_id: undefined }));
                  } else {
                    setFormData(prev => ({ ...prev, job_id: parseInt(value) }));
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
                value={formData.summary}
                onChange={(e) => handleInputChange('summary', e.target.value)}
                onBlur={(e) => handleFieldBlur('summary', e.target.value)}
                placeholder="A brief overview of your professional background..."
                className={`min-h-[120px] ${errors.summary && touched.summary ? 'border-destructive' : ''}`}
                disabled={isLoading}
              />
              <ErrorMessage fieldName="summary" />
            </div>

            {/* Work Experience Section */}
            <div className="space-y-4">
              <Label className="text-base flex items-center"><Briefcase className="mr-2 h-5 w-5 text-muted-foreground" />Work Experience</Label>
              {Array.isArray(formData.experience) && formData.experience.map((exp, index) => (
                <Card key={exp.id} className="p-4 space-y-3 bg-card/50 shadow-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor={`exp-jobTitle-${exp.id}`}>Job Title</Label>
                      <Input id={`exp-jobTitle-${exp.id}`} value={exp.jobTitle} onChange={(e) => handleExperienceChange(index, 'jobTitle', e.target.value)} placeholder="e.g., Senior Developer" disabled={isLoading} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`exp-companyName-${exp.id}`}>Company Name</Label>
                      <Input id={`exp-companyName-${exp.id}`} value={exp.companyName} onChange={(e) => handleExperienceChange(index, 'companyName', e.target.value)} placeholder="e.g., Tech Solutions Inc." disabled={isLoading} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`exp-dates-${exp.id}`}>Dates</Label>
                    <Input id={`exp-dates-${exp.id}`} value={exp.dates} onChange={(e) => handleExperienceChange(index, 'dates', e.target.value)} placeholder="e.g., Jan 2020 - Present" disabled={isLoading} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`exp-description-${exp.id}`}>Description</Label>
                    <Textarea id={`exp-description-${exp.id}`} value={exp.description} onChange={(e) => handleExperienceChange(index, 'description', e.target.value)} placeholder="Key responsibilities and achievements..." className="min-h-[100px]" disabled={isLoading} />
                  </div>
                  {Array.isArray(formData.experience) && formData.experience.length > 1 && (
                    <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveExperience(exp.id)} disabled={isLoading}>
                      <Trash2 className="mr-2 h-4 w-4" /> Remove 
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
                {Array.isArray(formData.education) && formData.education.map((edu, index) => (
                    <Card key={edu.id} className="p-4 space-y-3 bg-card/50 shadow-md">
                        <div className="space-y-2">
                            <Label htmlFor={`edu-degree-${edu.id}`}>Degree</Label>
                            <Input id={`edu-degree-${edu.id}`} value={edu.degree} onChange={(e) => handleEducationChange(index, 'degree', e.target.value)} placeholder="e.g., M.S. in Computer Science" disabled={isLoading} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`edu-institution-${edu.id}`}>Institution</Label>
                            <Input id={`edu-institution-${edu.id}`} value={edu.institution} onChange={(e) => handleEducationChange(index, 'institution', e.target.value)} placeholder="e.g., State University" disabled={isLoading} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`edu-graduationYear-${edu.id}`}>Graduation Year</Label>
                            <Input id={`edu-graduationYear-${edu.id}`} value={edu.graduationYear} onChange={(e) => handleEducationChange(index, 'graduationYear', e.target.value)} placeholder="e.g., 2018" disabled={isLoading} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`edu-details-${edu.id}`}>Details (Optional)</Label>
                            <Textarea id={`edu-details-${edu.id}`} value={edu.details || ''} onChange={(e) => handleEducationChange(index, 'details', e.target.value)} placeholder="e.g., Thesis, GPA, Honors..." className="min-h-[80px]" disabled={isLoading} />
                        </div>
                        {Array.isArray(formData.education) && formData.education.length > 1 && (
                            <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveEducation(edu.id)} disabled={isLoading}>
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
              {Array.isArray(formData.projects) && formData.projects.map((proj, index) => (
                <Card key={proj.id} className="p-4 space-y-3 bg-card/50 shadow-md">
                  <div className="space-y-1">
                    <Label htmlFor={`proj-title-${proj.id}`}>Project Title</Label>
                    <Input id={`proj-title-${proj.id}`} value={proj.title} onChange={(e) => handleProjectChange(index, 'title', e.target.value)} placeholder="e.g., Personal Portfolio Website" disabled={isLoading} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`proj-description-${proj.id}`}>Project Description</Label>
                    <Textarea id={`proj-description-${proj.id}`} value={proj.description} onChange={(e) => handleProjectChange(index, 'description', e.target.value)} placeholder="Describe the project, your role, and technologies used..." className="min-h-[100px]" disabled={isLoading} />
                  </div>
                  {Array.isArray(formData.projects) && formData.projects.length > 1 && (
                    <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveProject(proj.id)} disabled={isLoading}>
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
                {Array.isArray(formData[sectionConfig.field]) && formData[sectionConfig.field].map((entry, index) => (
                  <Card key={entry.id} className="p-4 space-y-3 bg-card/50 shadow-md">
                    <div className="space-y-1">
                      <Label htmlFor={`${sectionConfig.field}-value-${entry.id}`}>{sectionConfig.label} Entry #{index + 1}</Label>
                      <Textarea 
                        id={`${sectionConfig.field}-value-${entry.id}`} 
                        value={entry.value} 
                        onChange={(e) => handleTextEntryChange(sectionConfig.field, index, e.target.value)} 
                        placeholder={sectionConfig.placeholder} 
                        className="min-h-[80px]"
                        disabled={isLoading} 
                      />
                    </div>
                    {Array.isArray(formData[sectionConfig.field]) && formData[sectionConfig.field].length > 1 && (
                        <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveTextEntry(sectionConfig.field, entry.id)} disabled={isLoading}>
                        <Trash2 className="mr-2 h-4 w-4" /> Remove {sectionConfig.label.slice(0,-1)}
                        </Button>
                    )}
                  </Card>
                ))}
                <Button type="button" variant="outline" onClick={() => handleAddTextEntry(sectionConfig.field)} disabled={isLoading} className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
                  <PlusCircle className="mr-2 h-4 w-4" /> {sectionConfig.addButtonLabel}
                </Button>
              </div>
            ))}
            
          </CardContent>
          <CardFooter className="flex justify-between items-center space-x-3 pt-6">
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Resume
            </Button>
            <div className="flex space-x-3">
              <Button type="button" variant="outline" onClick={() => router.push('/resumes')} disabled={isLoading}>
                <XCircle className="mr-2 h-4 w-4" />
                Cancel
              </Button>
             
              <Button type="submit" disabled={isLoading || !formData.name || hasErrors()} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {isLoading ? 'Updating...' : 'Update Resume'}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
