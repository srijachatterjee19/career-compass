
"use client";

import { useState, type FormEvent, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Save, XCircle, ArrowLeft, FileText as FilesIcon, User, Briefcase, GraduationCap, Sparkles, Lightbulb, Award, PlusCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Resume, ExperienceEntry, EducationEntry, TextEntry, ProjectEntry } from "@/types";
import { cn } from '@/lib/utils';
import { getMockResumeById, updateMockResume } from '@/lib/mock-data'; // Updated imports

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
}

const initialFormState: ResumeFormState = {
  name: '',
  summary: '',
  experience: [],
  education: [],
  skills: [],
  projects: [],
  achievements: [],
};

export default function EditResumePage() {
  const router = useRouter();
  const params = useParams();
  const resumeId = params.resumeId as string;
  const { toast } = useToast();

  const [formData, setFormData] = useState<ResumeFormState>(initialFormState);
  const [originalResume, setOriginalResume] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (resumeId) {
      const fetchResumeData = async () => {
        setIsFetching(true);
        const resumeData = await getMockResumeById(resumeId); // Use centralized mock data
        if (resumeData) {
          setOriginalResume(resumeData);
          setFormData({
            name: resumeData.name,
            summary: resumeData.summary,
            experience: resumeData.experience.map(exp => ({ ...exp, id: exp.id || generateId() })),
            education: resumeData.education.map(edu => ({ ...edu, id: edu.id || generateId() })),
            skills: resumeData.skills.map(skill => ({ ...skill, id: skill.id || generateId() })),
            projects: resumeData.projects.map(proj => ({ ...proj, id: proj.id || generateId() })),
            achievements: resumeData.achievements.map(ach => ({ ...ach, id: ach.id || generateId() })),
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

  const handleInputChange = (field: keyof Pick<ResumeFormState, 'name' | 'summary'>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    if (!formData.name.trim()) {
      toast({ variant: "destructive", title: "Missing Information", description: "Resume Name is required." });
      setIsLoading(false);
      return;
    }
    if (!originalResume) {
       toast({ variant: "destructive", title: "Error", description: "Original resume data not found." });
       setIsLoading(false);
       return;
    }

    const updatedResumeData: Resume = {
      ...originalResume, 
      name: formData.name,
      summary: formData.summary,
      experience: formData.experience.filter(exp => exp.jobTitle || exp.companyName || exp.dates || exp.description),
      education: formData.education.filter(edu => edu.degree || edu.institution || edu.graduationYear || edu.details),
      skills: formData.skills.filter(skill => skill.value),
      projects: formData.projects.filter(proj => proj.title || proj.description),
      achievements: formData.achievements.filter(ach => ach.value),
      updatedAt: new Date().toISOString(), // This will be set by updateMockResume
    };

    const success = await updateMockResume(updatedResumeData); // Use centralized mock data

    if (success) {
      toast({
        title: "Resume Updated (Demo)",
        description: `The resume "${formData.name}" has been updated.`,
      });
      router.push('/resumes');
    } else {
      toast({ variant: "destructive", title: "Update Failed", description: "Could not update the resume." });
    }
    setIsLoading(false);
  };

  if (isFetching) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Loading resume for editing...</p>
      </div>
    );
  }
  
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
            Edit Resume
          </CardTitle>
          <CardDescription>Update the details for your resume: {originalResume?.name}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="resumeName" className="text-base">Resume Name*</Label>
              <Input
                id="resumeName"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Software Engineer - General"
                required
                disabled={isLoading}
              />
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
                placeholder="A brief overview of your professional background..."
                className="min-h-[120px]"
                disabled={isLoading}
              />
            </div>

            {/* Work Experience Section */}
            <div className="space-y-4">
              <Label className="text-base flex items-center"><Briefcase className="mr-2 h-5 w-5 text-muted-foreground" />Work Experience</Label>
              {formData.experience.map((exp, index) => (
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
                  <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveExperience(exp.id)} disabled={isLoading}>
                    <Trash2 className="mr-2 h-4 w-4" /> Remove Experience
                  </Button>
                </Card>
              ))}
              <Button type="button" variant="outline" onClick={handleAddExperience} disabled={isLoading} className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Work Experience
              </Button>
            </div>

            {/* Education Section */}
            <div className="space-y-4">
                <Label className="text-base flex items-center"><GraduationCap className="mr-2 h-5 w-5 text-muted-foreground" />Education</Label>
                {formData.education.map((edu, index) => (
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
                        <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveEducation(edu.id)} disabled={isLoading}>
                            <Trash2 className="mr-2 h-4 w-4" /> Remove Education
                        </Button>
                    </Card>
                ))}
                <Button type="button" variant="outline" onClick={handleAddEducation} disabled={isLoading} className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Education
                </Button>
            </div>

            {/* Projects Section */}
            <div className="space-y-4">
              <Label className="text-base flex items-center"><Lightbulb className="mr-2 h-5 w-5 text-muted-foreground" />Projects</Label>
              {formData.projects.map((proj, index) => (
                <Card key={proj.id} className="p-4 space-y-3 bg-card/50 shadow-md">
                  <div className="space-y-1">
                    <Label htmlFor={`proj-title-${proj.id}`}>Project Title</Label>
                    <Input id={`proj-title-${proj.id}`} value={proj.title} onChange={(e) => handleProjectChange(index, 'title', e.target.value)} placeholder="e.g., Personal Portfolio Website" disabled={isLoading} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`proj-description-${proj.id}`}>Project Description</Label>
                    <Textarea id={`proj-description-${proj.id}`} value={proj.description} onChange={(e) => handleProjectChange(index, 'description', e.target.value)} placeholder="Describe the project, your role, and technologies used..." className="min-h-[100px]" disabled={isLoading} />
                  </div>
                  <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveProject(proj.id)} disabled={isLoading}>
                    <Trash2 className="mr-2 h-4 w-4" /> Remove Project
                  </Button>
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
                {formData[sectionConfig.field].map((entry, index) => (
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
                    <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveTextEntry(sectionConfig.field, entry.id)} disabled={isLoading}>
                      <Trash2 className="mr-2 h-4 w-4" /> Remove {sectionConfig.label.slice(0,-1)}
                    </Button>
                  </Card>
                ))}
                <Button type="button" variant="outline" onClick={() => handleAddTextEntry(sectionConfig.field)} disabled={isLoading} className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
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
            <Button type="submit" disabled={isLoading || !formData.name} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :<Save className="mr-2 h-4 w-4" />}
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
