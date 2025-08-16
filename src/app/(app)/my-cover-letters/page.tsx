
"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Download, MailCheck, Loader2, Briefcase, FileText as FileTextIcon } from "lucide-react";
import type { CoverLetter } from "@/types";
import { useAuth } from '@/hooks/useAuth';
import jsPDF from 'jspdf';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function MyCoverLettersPage() {
  const { user } = useAuth();
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Handle create new cover letter
  const handleCreateNew = () => {
    window.location.href = '/cover-letter-generator';
  };

  // Helper function to safely format dates
  const formatDate = (dateValue: any): string => {
    if (!dateValue) return 'N/A';
    
    try {
      // Handle different date formats
      let date: Date;
      
      if (typeof dateValue === 'string') {
        // If it's already a string, try to parse it
        date = new Date(dateValue);
      } else if (dateValue instanceof Date) {
        // If it's already a Date object
        date = dateValue;
      } else if (typeof dateValue === 'number') {
        // If it's a timestamp
        date = new Date(dateValue);
      } else {
        return 'N/A';
      }
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      
      // Format as "MMM DD, YYYY" (e.g., "Jan 15, 2024")
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', dateValue, error);
      return 'N/A';
    }
  };

  // Fetch real cover letters data from the database
  useEffect(() => {
    const fetchCoverLetters = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/cover-letters?userId=${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch cover letters');
        }
        
        const coverLettersData = await response.json();
        console.log('Cover letters data:', coverLettersData);
        console.log('Sample cover letter dates:', coverLettersData[0] ? {
          id: coverLettersData[0].id,
          name: coverLettersData[0].name,
          created_at: coverLettersData[0].created_at,
          updated_at: coverLettersData[0].updated_at,
          created_atType: typeof coverLettersData[0].created_at,
          updated_atType: typeof coverLettersData[0].updated_at
        } : 'No cover letters');
        setCoverLetters(coverLettersData);
      } catch (err) {
        console.error('Error fetching cover letters:', err);
        setError('Failed to load cover letters. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCoverLetters();
  }, [user]);

  const handleDownloadPdf = (letter: CoverLetter) => {
    if (!letter.content) {
      toast({
        variant: "destructive",
        title: "No Content",
        description: "This cover letter has no content to download.",
      });
      return;
    }

    try {
      const doc = new jsPDF();
      const pageHeight = doc.internal.pageSize.height;
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      const maxLineWidth = pageWidth - margin * 2;
      let y = margin;

      // Validate and sanitize text content
      const sanitizeText = (text: string) => {
        if (!text || typeof text !== 'string') return '';
        // Remove any null characters or invalid characters that might cause jsPDF issues
        return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
      };

      doc.setFontSize(18);
      const sanitizedName = sanitizeText(letter.title);
      doc.text(sanitizedName, pageWidth / 2, y);
      y += 10;

      if(letter.jobTitle && letter.companyName) {
        doc.setFontSize(12);
        const subtitle = sanitizeText(`${letter.jobTitle} at ${letter.companyName}`);
        if (subtitle) {
          doc.text(subtitle, pageWidth / 2, y);
          y += 8;
        }
      }
      y += 5; // Extra space before content

      doc.setFontSize(12);
      const sanitizedContent = sanitizeText(letter.content);
      const lines = doc.splitTextToSize(sanitizedContent, maxLineWidth);
      
      lines.forEach((line: string) => {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        if (line && line.trim()) {
          doc.text(line, margin, y);
        }
        y += 7; // Line height
      });

      // Generate filename using cover letter name
      const formattedFilename = sanitizedName
        .replace(/[^a-z0-9\s]/gi, '_') // Replace special characters with underscores
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .replace(/_+/g, '_') // Replace multiple underscores with single
        .replace(/^_|_$/g, '') // Remove leading/trailing underscores
        .toLowerCase();
      
      const finalFilename = `${formattedFilename}.pdf`;
      
      doc.save(finalFilename);
      toast({
        title: "Download Started",
        description: `Downloading "${finalFilename}".`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        variant: "destructive",
        title: "PDF Generation Failed",
        description: "Could not generate the PDF. Please try again.",
      });
    }
  };

  const handleDeleteCoverLetter = async (letterId: string) => {
    try {
      const response = await fetch(`/api/cover-letters/${letterId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete cover letter');
      }

      // Remove from local state after successful deletion
      setCoverLetters(prevLetters => prevLetters.filter(cl => cl.id !== letterId));
      
      toast({
        title: "Cover Letter Deleted",
        description: "Cover letter has been permanently deleted from the database.",
      });
    } catch (error) {
      console.error('Error deleting cover letter:', error);
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: "Could not delete the cover letter. Please try again.",
      });
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-foreground">Cover Letters</h1>
          <Button
            onClick={handleCreateNew}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Create New Cover Letter
          </Button>
        </div>

        <Card className="shadow-lg bg-card border-border">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-foreground">Saved Cover Letters</CardTitle>
            <p className="text-muted-foreground mb-4">Manage your saved cover letters. You can view, edit, or delete them.</p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="mx-auto h-16 w-16 text-primary animate-spin" />
                <p className="text-muted-foreground mb-4">Loading your cover letters...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-destructive">
                <p>{error}</p>
                <Button onClick={() => window.location.reload()} className="mt-4">
                  Retry
                </Button>
              </div>
            ) : coverLetters.length === 0 ? (
              <div className="text-center py-12">
                <MailCheck className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">You haven't saved any cover letters yet.</p>
                <Button onClick={handleCreateNew} variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Create Your First Cover Letter
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[30%] text-foreground">Cover Letter Name</TableHead>
                    <TableHead className="w-[40%] text-foreground">Associated Job</TableHead>
                    <TableHead className="text-foreground">Last Modified</TableHead>
                    <TableHead className="text-right text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coverLetters.map((letter) => (
                    <TableRow key={letter.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium text-foreground">
                        {letter.title || 'Untitled'}
                      </TableCell>
                      <TableCell>
                        {(letter as any).job ? (
                          <div className="flex items-center space-x-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium text-foreground">{(letter as any).job.title}</div>
                              <div className="text-sm text-muted-foreground">{(letter as any).job.company}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-muted-foreground">
                            <FileTextIcon className="h-4 w-4" />
                            <span>General</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(letter.updated_at || letter.created_at)}
                      </TableCell>
                      <TableCell className="text-right space-x-1 sm:space-x-2">
                        <Button variant="outline" size="sm" asChild className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                           <Link href={`/cover-letters/edit/${letter.id}`}>
                            <Edit className="mr-1 h-4 w-4" />
                            Edit
                          </Link>
                        </Button>
                         <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDownloadPdf(letter)}
                            disabled={!letter.content}
                            className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                          >
                          <Download className="mr-1 h-4 w-4" />
                          PDF
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              <Trash2 className="mr-1 h-4 w-4" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the cover letter
                              "{letter.title}" from the database.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteCoverLetter(letter.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

