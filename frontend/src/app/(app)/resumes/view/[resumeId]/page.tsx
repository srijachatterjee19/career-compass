
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText as FilesIcon, User, Briefcase, GraduationCap, Sparkles, Lightbulb, Award } from 'lucide-react';
import type { Resume, ExperienceEntry, EducationEntry, TextEntry, ProjectEntry } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getMockResumeById } from '@/lib/mock-data'; // Updated import

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

interface ResumeSectionDisplayProps {
  title: string;
  content?: string | null;
  icon?: React.ElementType;
}

const SummaryDisplay: React.FC<ResumeSectionDisplayProps> = ({ title, content, icon: Icon }) => {
  if (!content || content.trim() === "") return null;
  return (
    <div>
      <h3 className="text-xl font-semibold mb-2 text-foreground flex items-center">
        {Icon && <Icon className="mr-2 h-5 w-5 text-accent" />}
        {title}
      </h3>
      <div className="p-4 border rounded-md bg-muted/30 min-h-[60px] whitespace-pre-wrap text-sm">
        {content}
      </div>
    </div>
  );
};

interface ExperienceDisplayProps {
  experience: ExperienceEntry[];
}
const ExperienceSectionDisplay: React.FC<ExperienceDisplayProps> = ({ experience }) => {
  if (!experience || experience.length === 0) return null;
  return (
    <div>
      <h3 className="text-xl font-semibold mb-3 text-foreground flex items-center">
        <Briefcase className="mr-2 h-5 w-5 text-accent" />
        Work Experience
      </h3>
      <div className="space-y-4">
        {experience.map((exp) => (
          <div key={exp.id} className="p-4 border rounded-md bg-muted/30">
            <h4 className="text-lg font-medium text-foreground">{exp.jobTitle}</h4>
            <p className="text-md text-muted-foreground">{exp.companyName} | {exp.dates}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm">{exp.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

interface EducationDisplayProps {
  education: EducationEntry[];
}
const EducationSectionDisplay: React.FC<EducationDisplayProps> = ({ education }) => {
  if (!education || education.length === 0) return null;
  return (
    <div>
      <h3 className="text-xl font-semibold mb-3 text-foreground flex items-center">
        <GraduationCap className="mr-2 h-5 w-5 text-accent" />
        Education
      </h3>
      <div className="space-y-4">
        {education.map((edu) => (
          <div key={edu.id} className="p-4 border rounded-md bg-muted/30">
            <h4 className="text-lg font-medium text-foreground">{edu.degree}</h4>
            <p className="text-md text-muted-foreground">{edu.institution} - {edu.graduationYear}</p>
            {edu.details && <p className="mt-2 whitespace-pre-wrap text-sm">{edu.details}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

interface ProjectSectionDisplayProps {
  projects: ProjectEntry[];
}
const ProjectSectionDisplay: React.FC<ProjectSectionDisplayProps> = ({ projects }) => {
  if (!projects || projects.length === 0) return null;
  return (
    <div>
      <h3 className="text-xl font-semibold mb-3 text-foreground flex items-center">
        <Lightbulb className="mr-2 h-5 w-5 text-accent" />
        Projects
      </h3>
      <div className="space-y-4">
        {projects.map((proj) => (
          <div key={proj.id} className="p-4 border rounded-md bg-muted/30">
            <h4 className="text-lg font-medium text-foreground">{proj.title}</h4>
            <p className="mt-1 whitespace-pre-wrap text-sm">{proj.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};


interface TextEntryListDisplayProps {
  title: string;
  entries: TextEntry[];
  icon?: React.ElementType;
}
const TextEntryListDisplay: React.FC<TextEntryListDisplayProps> = ({ title, entries, icon: Icon }) => {
  if (!entries || entries.length === 0) return null;
  return (
    <div>
      <h3 className="text-xl font-semibold mb-3 text-foreground flex items-center">
        {Icon && <Icon className="mr-2 h-5 w-5 text-accent" />}
        {title}
      </h3>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className="p-4 border rounded-md bg-muted/30 whitespace-pre-wrap text-sm">
            {entry.value}
          </div>
        ))}
      </div>
    </div>
  );
};


export default function ViewResumePage() {
  const router = useRouter();
  const params = useParams();
  const resumeId = params.resumeId as string;
  const { toast } = useToast();

  const [resume, setResume] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (resumeId) {
      const fetchResumeData = async () => {
        setIsLoading(true);
        const resumeData = await getMockResumeById(resumeId); // Use centralized mock data
        if (resumeData) {
          setResume({ // Ensure IDs for sub-items for key props
            ...resumeData,
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
            description: "Could not find the resume.",
          });
          router.push('/resumes');
        }
        setIsLoading(false);
      };
      fetchResumeData();
    }
  }, [resumeId, router, toast]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Loading resume details...</p>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center">
        <FilesIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold text-destructive">Resume Not Found</h2>
        <p className="text-muted-foreground mb-4">The resume you are looking for does not exist or could not be loaded.</p>
        <Button variant="outline" onClick={() => router.push('/resumes')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Resumes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Button variant="outline" size="sm" onClick={() => router.push('/resumes')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to My Resumes
      </Button>

      <Card className="w-full max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl flex items-center">
            <FilesIcon className="mr-3 h-8 w-8 text-accent" />
            {resume.name}
          </CardTitle>
          <CardDescription>
            Created: {new Date(resume.createdAt).toLocaleDateString()} | Last Updated: {new Date(resume.updatedAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <SummaryDisplay title="Summary" content={resume.summary} icon={User} />
          <ExperienceSectionDisplay experience={resume.experience} />
          <EducationSectionDisplay education={resume.education} />
          <ProjectSectionDisplay projects={resume.projects} />
          <TextEntryListDisplay title="Skills" entries={resume.skills} icon={Sparkles} />
          <TextEntryListDisplay title="Achievements" entries={resume.achievements} icon={Award} />
        </CardContent>
      </Card>
    </div>
  );
}
