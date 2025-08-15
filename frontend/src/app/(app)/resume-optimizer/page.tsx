
// src/app/(app)/resume-optimizer/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label"; // ShadCN Label
import { cn } from "@/lib/utils";
import { FileText, Upload, Sparkles, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// import { optimizeResumeSection, type OptimizeResumeSectionInput } from "@/ai/flows/optimize-resume-section"; 

interface ResumeSection {
  id: string;
  title: string;
  content: string;
  placeholder: string;
  isLoading?: boolean;
}

const initialSections: ResumeSection[] = [
  { id: 'summary', title: 'Summary / About Me', content: '', placeholder: 'A brief overview of your professional background and career goals...', isLoading: false },
  { id: 'experience', title: 'Work Experience', content: '', placeholder: 'Detail your relevant work experience, starting with the most recent...', isLoading: false },
  { id: 'education', title: 'Education', content: '', placeholder: 'List your degrees, institutions, and graduation dates...', isLoading: false },
  { id: 'skills', title: 'Skills', content: '', placeholder: 'List your technical and soft skills relevant to the job...', isLoading: false },
  { id: 'projects', title: 'Projects', content: '', placeholder: 'Describe personal or professional projects that showcase your abilities...', isLoading: false },
  { id: 'achievements', title: 'Achievements / Awards', content: '', placeholder: 'Highlight any notable achievements or awards received...', isLoading: false },
];

export default function ResumeOptimizerPage() {
  const [jobDescription, setJobDescription] = useState('');
  const [sections, setSections] = useState<ResumeSection[]>(initialSections);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSectionContentChange = (sectionId: string, newContent: string) => {
    setSections(prevSections =>
      prevSections.map(section =>
        section.id === sectionId ? { ...section, content: newContent } : section
      )
    );
  };

  const handleOptimizeSection = async (sectionId: string) => {
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) return;

    const currentSection = sections[sectionIndex];

    if (!currentSection.content.trim()) {
      toast({
        variant: "destructive",
        title: "Empty Section",
        description: `Please enter some content in the "${currentSection.title}" section before optimizing.`,
      });
      return;
    }
    
    setSections(prevSections =>
      prevSections.map(s => (s.id === sectionId ? { ...s, isLoading: true } : s))
    );

    // try {
    //   const input: OptimizeResumeSectionInput = {
    //     sectionTitle: currentSection.title,
    //     sectionContent: currentSection.content,
    //     jobDescription: jobDescription || undefined,
    //   };
    //   const result = await optimizeResumeSection(input);
    //   setSections(prevSections =>
    //     prevSections.map(s =>
    //       s.id === sectionId ? { ...s, content: result.optimizedSectionContent, isLoading: false } : s
    //     )
    //   );
    //   toast({
    //     title: "Section Optimized",
    //     description: `"${currentSection.title}" has been updated with AI suggestions.`,
    //   });
    // } catch (error) {
    //   console.error("Error optimizing section:", error);
    //   toast({
    //     variant: "destructive",
    //     title: "Optimization Failed",
    //     description: "Could not optimize the section. Please try again.",
    //   });
    //   setSections(prevSections =>
    //     prevSections.map(s => (s.id === sectionId ? { ...s, isLoading: false } : s))
    //   );
    // }
  };
  
  const handleSaveResume = async () => {
    setIsSaving(true);
    // Simulate saving
    const fullResumeContent = sections.map(s => `## ${s.title}\n${s.content}`).join('\n\n');
    console.log("Saving resume:", fullResumeContent); 
    // In a real app, you'd save this to a backend or local storage
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Resume Saved (Demo)",
      description: "Your resume content has been logged to the console.",
    });
    setIsSaving(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold text-foreground">AI Resume Optimizer</h1>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Optimize Your Resume Section by Section</CardTitle>
          <CardDescription>
            Enter your resume details into the sections below. Use the "Target Job Description" field to tailor the AI's suggestions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="job-description" className="mb-2 block font-medium text-lg">Target Job Description (Optional but Recommended)</Label>
            <Textarea 
              id="job-description" 
              placeholder="Paste the job description here to tailor your resume optimizations..." 
              className="min-h-[150px]"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <div className="space-y-6">
            {sections.map(section => (
              <Card key={section.id} className="bg-card/50 p-2 rounded-lg shadow-md">
                <CardHeader className="pb-2 pt-3 px-3">
                   <Label htmlFor={section.id} className="text-base font-semibold">{section.title}</Label>
                </CardHeader>
                <CardContent className="px-3 pb-3">
                  <Textarea 
                    id={section.id} 
                    placeholder={section.placeholder}
                    className="min-h-[150px] lg:min-h-[200px] bg-background"
                    value={section.content}
                    onChange={(e) => handleSectionContentChange(section.id, e.target.value)}
                    disabled={section.isLoading}
                  />
                  <div className="mt-3 flex items-center justify-between">
                     <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => handleOptimizeSection(section.id)} 
                      disabled={section.isLoading || !section.content.trim()}
                    >
                      {section.isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                      )}
                      Optimize Section
                    </Button>
                    {/* Optional: Could add clear section button or other actions here */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-2 text-center border-t pt-6">
            <Button 
              size="lg" 
              onClick={handleSaveResume}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Save className="mr-2 h-5 w-5" />
              )}
              Save Resume (Demo)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
