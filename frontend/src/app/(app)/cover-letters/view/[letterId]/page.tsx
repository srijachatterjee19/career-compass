
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText as FileTextIcon, Briefcase, StickyNote, Info } from 'lucide-react';
import type { CoverLetter } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { initialSavedCoverLetters } from '@/lib/mock-data';
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

interface SectionDisplayProps {
  title: string;
  content?: string;
  icon?: React.ElementType;
  isPreformatted?: boolean;
}

const SectionDisplay: React.FC<SectionDisplayProps> = ({ title, content, icon: Icon, isPreformatted = false }) => {
  if (!content || content.trim() === "") return null;
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2 text-foreground flex items-center">
        {Icon && <Icon className="mr-2 h-5 w-5 text-accent" />}
        {title}
      </h3>
      <div className={cn("p-4 border rounded-md bg-muted/30 min-h-[60px] text-sm", isPreformatted && "whitespace-pre-wrap")}>
        {content}
      </div>
    </div>
  );
};


export default function ViewCoverLetterPage() {
  const router = useRouter();
  const params = useParams();
  const letterId = params.letterId as string;
  const { toast } = useToast();

  const [letter, setLetter] = useState<CoverLetter | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (letterId) {
      setIsLoading(true);
      // Simulate fetching data
      const foundLetter = initialSavedCoverLetters.find(cl => cl.id === letterId);
      if (foundLetter) {
        setLetter(foundLetter);
      } else {
        toast({
          variant: "destructive",
          title: "Cover Letter Not Found",
          description: "Could not find the specified cover letter.",
        });
        router.push('/my-cover-letters');
      }
      setIsLoading(false);
    }
  }, [letterId, router, toast]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Loading cover letter...</p>
      </div>
    );
  }

  if (!letter) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center">
        <FileTextIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold text-destructive">Cover Letter Not Found</h2>
        <Button variant="outline" onClick={() => router.push('/my-cover-letters')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Cover Letters
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Button variant="outline" size="sm" onClick={() => router.push('/my-cover-letters')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to My Cover Letters
      </Button>

      <Card className="w-full max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center">
            <FileTextIcon className="mr-3 h-7 w-7 text-accent" />
            {letter.title}
          </CardTitle>
          <CardDescription>
            {letter.jobTitle && letter.companyName && `${letter.jobTitle} at ${letter.companyName} | `}
            Last Updated: {new Date(letter.updated_at).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cover Letter Content - No heading */}
          <div className="p-4 border rounded-md bg-muted/30 min-h-[200px] text-sm whitespace-pre-wrap">
            {letter.content}
          </div>
          
          <SectionDisplay title="Target Job Description" content={letter.jobDescription} icon={Briefcase} isPreformatted />
          <SectionDisplay title="Relevant Resume Snippet" content={letter.resumeSnippet} icon={StickyNote} isPreformatted />
        </CardContent>
      </Card>
    </div>
  );
}
