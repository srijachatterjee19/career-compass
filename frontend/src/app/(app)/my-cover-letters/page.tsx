
"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Eye, Download, MailCheck } from "lucide-react";
import type { CoverLetter } from "@/types";
import { initialSavedCoverLetters, deleteMockCoverLetter } from '@/lib/mock-data'; 
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
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setCoverLetters(initialSavedCoverLetters);
  }, []);

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

      doc.setFontSize(18);
      doc.text(letter.name, pageWidth / 2, y, { align: 'center' });
      y += 10;

      if(letter.jobTitle && letter.companyName) {
        doc.setFontSize(12);
        doc.text(`${letter.jobTitle} at ${letter.companyName}`, pageWidth / 2, y, {align: 'center'});
        y += 8;
      }
      y += 5; // Extra space before content

      doc.setFontSize(12);
      const lines = doc.splitTextToSize(letter.content, maxLineWidth);
      
      lines.forEach((line: string) => {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += 7; // Line height
      });

      doc.save(`${letter.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
      toast({
        title: "Download Started",
        description: `Downloading "${letter.name}.pdf".`,
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

  const handleDeleteCoverLetter = (letterId: string) => {
    const letterToDelete = coverLetters.find(cl => cl.id === letterId);
    const success = deleteMockCoverLetter(letterId);
    if (success) {
      setCoverLetters(prevLetters => prevLetters.filter(cl => cl.id !== letterId));
      toast({
        title: "Cover Letter Deleted (Demo)",
        description: `"${letterToDelete?.name || 'The cover letter'}" has been removed.`,
      });
    } else {
       toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: "Could not delete the cover letter from the mock data.",
      });
    }
  };


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold text-foreground">My Saved Cover Letters</h1>
        <Button asChild>
          <Link href="/cover-letter-generator">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create New Cover Letter
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Your Cover Letters</CardTitle>
          <CardDescription>Manage your saved cover letters. You can view, edit, download, or delete them.</CardDescription>
        </CardHeader>
        <CardContent>
          {coverLetters.length === 0 ? (
            <div className="text-center py-12">
              <MailCheck className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-4">You haven't saved any cover letters yet.</p>
              <Button asChild variant="default">
                <Link href="/cover-letter-generator">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Create Your First Cover Letter
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[35%]">Name / Role</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coverLetters.map((letter) => (
                  <TableRow key={letter.id}>
                    <TableCell className="font-medium">
                      {letter.name}
                      {letter.jobTitle && <span className="block text-xs text-muted-foreground">{letter.jobTitle}</span>}
                    </TableCell>
                    <TableCell>{letter.companyName || 'N/A'}</TableCell>
                    <TableCell>{new Date(letter.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-1 sm:space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/cover-letters/view/${letter.id}`}>
                          <Eye className="mr-1 h-4 w-4" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
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
                        >
                        <Download className="mr-1 h-4 w-4" />
                        PDF
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="mr-1 h-4 w-4" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the cover letter
                              "{letter.name}". This is a demo and will only remove it from the current view.
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
  );
}

