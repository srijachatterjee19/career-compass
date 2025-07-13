
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Download, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateCoverLetter, type GenerateCoverLetterInput } from "@/ai/flows/generate-cover-letter";
import { Label } from "@/components/ui/label";

export default function CoverLetterGeneratorPage() {
  const [resumeSnippet, setResumeSnippet] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { toast } = useToast();

  const handleGenerateCoverLetter = async () => {
    if (!resumeSnippet.trim() || !jobDescription.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide both resume snippets and the job description.",
      });
      return;
    }
    setIsGenerating(true);
    setGeneratedCoverLetter("");
    try {
      const input: GenerateCoverLetterInput = {
        resume: resumeSnippet,
        jobDescription: jobDescription,
      };
      const result = await generateCoverLetter(input);
      setGeneratedCoverLetter(result.coverLetter);
      toast({
        title: "Cover Letter Generated!",
        description: "Your AI-powered cover letter is ready. You can edit it below.",
      });
    } catch (error) {
      console.error("Error generating cover letter:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate the cover letter. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!generatedCoverLetter.trim()) {
      toast({
        variant: "destructive",
        title: "Empty Cover Letter",
        description: "Nothing to save. Please generate a cover letter first.",
      });
      return;
    }
    setIsSaving(true);
    // Simulate saving - in a real app, this would go to a backend or update shared state
    // For this demo, we just show a toast. The actual list is on /my-cover-letters
    await new Promise(resolve => setTimeout(resolve, 700));
    
    toast({
      title: "Draft Saved (Demo)",
      description: "Your cover letter would be saved. Check 'My Cover Letters' section to manage it.",
    });
    // In a real app, you might do:
    // const newLetter: CoverLetter = { id: Date.now().toString(), name: "New Draft", content: generatedCoverLetter, jobDescription, resumeSnippet, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    // updateMockCoverLetter(newLetter); // This would require initialSavedCoverLetters to be in a shared state/context
    setIsSaving(false);
  };


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold text-foreground">AI Cover Letter Generator</h1>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Generate a Tailored Cover Letter</CardTitle>
          <CardDescription>Provide your resume snippet and the job description to let AI craft a compelling cover letter.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <Label htmlFor="resume-snippet" className="mb-2 block font-medium">Relevant Resume Parts</Label>
              <Textarea 
                id="resume-snippet" 
                placeholder="Paste relevant parts of your resume (e.g., summary, key experiences)..." 
                className="min-h-[150px] lg:min-h-[200px]"
                value={resumeSnippet}
                onChange={(e) => setResumeSnippet(e.target.value)}
                disabled={isGenerating}
              />
            </div>
            <div>
              <Label htmlFor="job-description-cl" className="mb-2 block font-medium">Job Description</Label>
              <Textarea 
                id="job-description-cl" 
                placeholder="Paste the full job description here..." 
                className="min-h-[150px] lg:min-h-[200px]"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={isGenerating}
              />
            </div>
          </div>
          
          <div className="text-center">
            <Button 
              variant="default"
              size="lg" 
              onClick={handleGenerateCoverLetter}
              disabled={isGenerating || !resumeSnippet.trim() || !jobDescription.trim()}
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-5 w-5" />
              )}
              Generate Cover Letter
            </Button>
          </div>

          <div>
            <Label htmlFor="generated-cover-letter" className="mb-2 block font-medium">Generated Cover Letter</Label>
            <Textarea 
              id="generated-cover-letter" 
              placeholder="Your AI-generated cover letter will appear here. You can edit it before saving." 
              className="min-h-[250px] lg:min-h-[300px] bg-muted/30"
              value={generatedCoverLetter}
              onChange={(e) => setGeneratedCoverLetter(e.target.value)}
              disabled={isGenerating && !generatedCoverLetter}
            />
            <div className="mt-4 flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleSaveDraft} 
                  disabled={isSaving || !generatedCoverLetter.trim()}
                >
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Draft (Demo)
                </Button>
                <Button disabled> {/* TODO: Implement PDF download for generated letter */}
                  <Download className="mr-2 h-4 w-4" /> Download PDF
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
