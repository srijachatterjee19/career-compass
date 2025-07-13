
"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Eye, FileText as FilesIcon } from "lucide-react";
import type { Resume } from "@/types"; 
import { useState, useEffect } from "react";
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
import { demoResumes, deleteMockResume } from '@/lib/mock-data'; // Updated import

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, fetch from API. For now, use mock data.
    // Ensure IDs are present for all sub-items if needed by child components
    const loadedResumes = demoResumes.map(r => ({
      ...r,
      experience: r.experience.map(e => ({ ...e, id: e.id || crypto.randomUUID() })),
      education: r.education.map(e => ({ ...e, id: e.id || crypto.randomUUID() })),
      skills: r.skills.map(s => ({ ...s, id: s.id || crypto.randomUUID() })),
      projects: r.projects.map(p => ({ ...p, id: p.id || crypto.randomUUID() })),
      achievements: r.achievements.map(a => ({ ...a, id: a.id || crypto.randomUUID() })),
    }));
    setResumes(loadedResumes);
  }, []);


  const handleDeleteResume = (resumeId: string) => {
    const resumeToDelete = resumes.find(resume => resume.id === resumeId);
    const success = deleteMockResume(resumeId);
    if (success) {
      setResumes(prevResumes => prevResumes.filter(resume => resume.id !== resumeId));
      toast({
        title: "Resume Deleted (Demo)",
        description: `"${resumeToDelete?.name || 'The resume'}" has been removed.`,
      });
    } else {
       toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: "Could not delete the resume from the mock data.",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold text-foreground">My Resumes</h1>
        <Button asChild> 
          <Link href="/resumes/add">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create New Resume
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Saved Resumes</CardTitle>
          <CardDescription>Manage your saved resumes. You can view, edit, or delete them.</CardDescription>
        </CardHeader>
        <CardContent>
          {resumes.length === 0 ? (
            <div className="text-center py-12">
              <FilesIcon className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-4">You haven't saved any resumes yet.</p>
              <Button asChild variant="default">
                 <Link href="/resumes/add">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Create Your First Resume
                 </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Name</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resumes.map((resume) => (
                  <TableRow key={resume.id}>
                    <TableCell className="font-medium">{resume.name}</TableCell>
                    <TableCell>{new Date(resume.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-1 sm:space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/resumes/view/${resume.id}`}>
                          <Eye className="mr-1 h-4 w-4" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/resumes/edit/${resume.id}`}>
                          <Edit className="mr-1 h-4 w-4" />
                          Edit
                        </Link>
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
                              This action cannot be undone. This will permanently delete the resume
                              "{resume.name}". This is a demo and will only remove it from the current view.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteResume(resume.id)}
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
