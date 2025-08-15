
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ResumePreview } from '@/components/ui/latex-resume-editor';
import { useAuth } from '@/hooks/useAuth';
import type { Resume, ExperienceEntry, EducationEntry, TextEntry, ProjectEntry } from '@/types';
import { PlusCircle, Edit, Trash2, FileText as FilesIcon, Loader2, Briefcase, Eye, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

export default function ResumesPage() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const { toast } = useToast();

  // Form state for resume data
  const [resumeData, setResumeData] = useState({
    name: '',
    summary: '',
    experience: [] as ExperienceEntry[],
    education: [] as EducationEntry[],
    skills: [] as TextEntry[],
    projects: [] as ProjectEntry[],
    achievements: [] as TextEntry[]
  });

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

  // Helper function to safely parse JSON or return empty array - used by both editor and PDF generation
  const safeParseArray = (data: any): any[] => {
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        console.log('Parsed JSON data:', parsed);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        return [];
      }
    }
    return [];
  };

  // Helper function to convert resume data to the format expected by generateHTMLContent
  const convertResumeForPDF = (resume: Resume) => {
    console.log('Converting resume for PDF:', resume.name);
    console.log('Raw experience:', resume.experience);
    console.log('Raw education:', resume.education);
    console.log('Raw skills:', resume.skills);
    console.log('Raw projects:', resume.projects);
    console.log('Raw achievements:', resume.achievements);
    
    const converted = {
      name: resume.name || '',
      summary: resume.summary || '',
      experience: safeParseArray(resume.experience),
      education: safeParseArray(resume.education),
      skills: safeParseArray(resume.skills),
      projects: safeParseArray(resume.projects),
      achievements: safeParseArray(resume.achievements)
    };
    
    console.log('Converted data:', converted);
    return converted;
  };

  // Fetch real resumes data from the database
  useEffect(() => {
    const fetchResumes = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/resumes?userId=${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch resumes');
        }
        
        const resumesData = await response.json();
        console.log('Resumes data:', resumesData);
        console.log('Sample resume dates:', resumesData[0] ? {
          id: resumesData[0].id,
          name: resumesData[0].name,
          created_at: resumesData[0].created_at,
          updated_at: resumesData[0].updated_at,
          created_atType: typeof resumesData[0].created_at,
          updated_atType: typeof resumesData[0].updated_at
        } : 'No resumes');
        setResumes(resumesData);
      } catch (err) {
        console.error('Error fetching resumes:', err);
        setError('Failed to load resumes. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, [user]);

  const handleDeleteResume = async (resumeId: string) => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete resume');
      }

      // Remove from local state after successful deletion
      setResumes(prevResumes => prevResumes.filter(resume => resume.id !== resumeId));
      
      toast({
        title: "Resume Deleted",
        description: "Resume has been permanently deleted from the database.",
      });
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: "Could not delete the resume. Please try again.",
      });
    }
  };

  const handleEditResume = (resume: Resume) => {
    console.log('Raw resume data from database:', resume);
    setSelectedResume(resume);
    
    const parsedData = convertResumeForPDF(resume);
    
    console.log('Parsed resume data for form:', parsedData);
    setResumeData(parsedData);
    
    setShowEditor(true);
  };

  const handleCreateNew = () => {
    setSelectedResume(null);
    setResumeData({
      name: '',
      summary: '',
      experience: [],
      education: [],
      skills: [],
      projects: [],
      achievements: []
    });
    setShowEditor(true);
  };

  // Handle saving resume to database
  const handleSaveResume = async () => {
    try {
      if (!resumeData.name.trim()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter a resume name.",
        });
        return;
      }

      // Prepare resume data for database
      const resumeToSave = {
        name: resumeData.name,
        summary: resumeData.summary,
        experience: resumeData.experience,
        education: resumeData.education,
        skills: resumeData.skills,
        projects: resumeData.projects,
        achievements: resumeData.achievements,
        job_id: selectedResume?.job_id || null,
        userId: user?.id,
      };

      console.log('Saving resume data:', resumeToSave);
      console.log('User ID:', user?.id);

      let response;
      if (selectedResume) {
        // Update existing resume
        console.log('Updating existing resume:', selectedResume.id);
        response = await fetch(`/api/resumes/${selectedResume.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(resumeToSave),
        });
      } else {
        // Create new resume
        console.log('Creating new resume');
        response = await fetch('/api/resumes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(resumeToSave),
        });
      }

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`Failed to save resume: ${errorText}`);
      }

      const savedResume = await response.json();
      console.log('Saved resume response:', savedResume);

      toast({
        title: "Resume Saved",
        description: selectedResume 
          ? "Resume has been updated successfully." 
          : "Resume has been created successfully.",
      });

      // Refresh resumes list
      if (selectedResume) {
        // Update existing resume in the list
        setResumes(prev => prev.map(r => r.id === savedResume.id ? savedResume : r));
      } else {
        // Add new resume to the list
        setResumes(prev => [savedResume, ...prev]);
      }

      // If this was a new resume, set it as selected for editing
      if (!selectedResume) {
        setSelectedResume(savedResume);
      }

    } catch (error) {
      console.error('Error saving resume:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save resume. Please try again.",
      });
    }
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, { id: Date.now().toString(), jobTitle: '', companyName: '', dates: '', description: '' }]
    }));
  };

  const updateExperience = (index: number, field: keyof ExperienceEntry, value: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, { id: Date.now().toString(), degree: '', institution: '', graduationYear: '', details: '' }]
    }));
  };

  const updateEducation = (index: number, field: keyof EducationEntry, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const addSkill = () => {
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, { id: Date.now().toString(), value: '' }]
    }));
  };

  const updateSkill = (index: number, value: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => 
        i === index ? { ...skill, value } : skill
      )
    }));
  };

  const removeSkill = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, { id: Date.now().toString(), title: '', description: '' }]
    }));
  };

  const updateProject = (index: number, field: keyof ProjectEntry, value: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map((proj, i) => 
        i === index ? { ...proj, [field]: value } : proj
      )
    }));
  };

  const removeProject = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  const addAchievement = () => {
    setResumeData(prev => ({
      ...prev,
      achievements: [...prev.achievements, { id: Date.now().toString(), value: '' }]
    }));
  };

  const updateAchievement = (index: number, value: string) => {
    setResumeData(prev => ({
      ...prev,
      achievements: prev.achievements.map((ach, i) => 
        i === index ? { ...ach, value } : ach
      )
    }));
  };

  const removeAchievement = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };

  // Generate HTML content for PDF generation - EXACT match to preview
  const generateHTMLContent = (data: {
    name: string;
    summary: string;
    experience: ExperienceEntry[];
    education: EducationEntry[];
    skills: TextEntry[];
    projects: ProjectEntry[];
    achievements: TextEntry[];
  }) => {
    console.log('generateHTMLContent called with resumeData:', data);
    console.log('Experience count:', data.experience.length);
    console.log('Education count:', data.education.length);
    console.log('Skills count:', data.skills.length);
    
    // Helper function to convert description text to bullet points
    const formatDescription = (description: string) => {
      if (!description) return '';
      
      // Split by newlines and filter out empty lines
      let lines = description.split('\n').filter(line => line.trim());
      
      // If no newlines but contains bullet points, split by bullet points
      if (lines.length === 1 && description.includes('•')) {
        lines = description.split('•').filter(line => line.trim());
        // Add bullet point back to each line
        lines = lines.map(line => '•' + line.trim());
      }
      
      // If any line starts with "•" or "-", format as bullet points
      if (lines.some(line => line.trim().startsWith('•') || line.trim().startsWith('-'))) {
        return `<ul class="description-bullets">
          ${lines.map(line => {
            const cleanLine = line.trim();
            if (cleanLine.startsWith('•') || cleanLine.startsWith('-')) {
              const content = cleanLine.startsWith('•') ? cleanLine.substring(1).trim() : cleanLine.substring(1).trim();
              return `<li>${content}</li>`;
            } else {
              return `<li>${cleanLine}</li>`;
            }
          }).join('')}
        </ul>`;
      }
      
      // Otherwise, return as regular paragraph
      return `<p class="description">${description}</p>`;
    };
    
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${data.name || 'Resume'}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap');
            
            body {
              font-family: 'EB Garamond', serif;
              line-height: 1.4;
              color: #000000;
              margin: 0;
              padding: 30px;
              background: white;
              font-size: 12px;
            }
            
            .resume-container {
              padding: 16px;
              border: 1px solid #d1d5db;
              border-radius: 8px;
              background: white;
              min-height: 500px;
            }
            
            .header {
              text-align: center;
              margin-bottom: 24px;
            }
            
            .name {
              font-size: 24px;
              font-weight: 700;
              color: #000000;
              margin: 0 0 8px 0;
            }
            
            .summary {
              font-size: 14px;
              color: #000000;
              margin: 0;
            }
            
            .section {
              margin-bottom: 24px;
            }
            
            .section-title {
              font-size: 18px;
              font-weight: 700;
              color: #000000;
              border-bottom: 1px solid #000000;
              padding-bottom: 4px;
              margin-bottom: 12px;
            }
            
            .experience-item, .education-item, .project-item {
              margin-bottom: 16px;
              padding-left: 16px;
            }
            
            .experience-header, .education-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 8px;
            }
            
            .experience-title, .education-title {
              flex: 1;
            }
            
            .job-title, .degree-title {
              font-size: 12px;
              font-weight: 600;
              color: #000000;
              margin: 0 0 4px 0;
            }
            
            .company-name, .institution-name {
              font-size: 12px;
              font-weight: 500;
              color: #000000;
              margin: 0 0 8px 0;
            }
            
            .dates {
              font-size: 12px;
              color: #000000;
              margin: 0;
              text-align: right;
              white-space: nowrap;
              margin-left: 20px;
            }
            
            .description {
              font-size: 11px;
              color: #000000;
              margin: 8px 0;
              line-height: 1.3;
            }
            
            .description-bullets {
              margin: 8px 0;
              padding-left: 16px;
              list-style-type: disc;
              list-style: disc outside;
            }
            
            .description-bullets li {
              font-size: 11px;
              color: #000000;
              margin-bottom: 3px;
              line-height: 1.3;
              display: list-item;
              list-style-position: outside;
              list-style-type: disc;
              margin-left: 16px;
            }
            
            .skills-list {
              margin: 0;
              padding: 0;
            }
            
            .skill-item {
              color: #000000;
              padding: 2px 0;
              font-size: 11px;
              font-weight: 500;
              border: none;
              background: none;
              border-radius: 0;
            }
            
            .project-title {
              font-size: 14px;
              font-weight: 600;
              color: #000000;
              margin: 0 0 8px 0;
            }
            
            .achievements-list {
              margin: 0;
              padding-left: 16px;
            }
            
            .achievement-item {
              margin-bottom: 6px;
              color: #000000;
              font-size: 11px;
            }
          </style>
        </head>
        <body>
          <div class="resume-container">
            <div class="header">
              <h1 class="name">${data.name || 'Your Name'}</h1>
              <p class="summary">${data.summary || 'Professional Summary'}</p>
            </div>
            
            ${data.experience.filter(exp => exp.jobTitle && exp.companyName).length > 0 ? `
            <div class="section">
              <h2 class="section-title">Experience</h2>
              ${data.experience
                .filter(exp => exp.jobTitle && exp.companyName && exp.dates && exp.description)
                .map(exp => `
                <div class="experience-item">
                  <div class="experience-header">
                    <div class="experience-title">
                      <h3 class="job-title">${exp.jobTitle}</h3>
                      <p class="company-name">${exp.companyName}</p>
                    </div>
                    <p class="dates">${exp.dates}</p>
                  </div>
                  ${formatDescription(exp.description)}
                </div>
              `).join('')}
            </div>
            ` : ''}
            
            ${data.education.filter(edu => edu.degree && edu.institution).length > 0 ? `
            <div class="section">
              <h2 class="section-title">Education</h2>
              ${data.education
                .filter(edu => edu.degree && edu.institution && edu.graduationYear)
                .map(edu => `
                <div class="education-item">
                  <div class="education-header">
                    <div class="education-title">
                      <h3 class="degree-title">${edu.degree}</h3>
                      <p class="institution-name">${edu.institution}</p>
                    </div>
                    <p class="dates">${edu.graduationYear}</p>
                  </div>
                  ${edu.details ? formatDescription(edu.details) : ''}
                </div>
              `).join('')}
            </div>
            ` : ''}
            
            ${data.skills.filter(skill => skill.value).length > 0 ? `
            <div class="section">
              <h2 class="section-title">Skills</h2>
              <div class="skills-list">
                ${data.skills
                  .filter(skill => skill.value)
                  .map(skill => `<div class="skill-item">${skill.value}</div>`)
                  .join('')}
              </div>
            </div>
            ` : ''}
            
            ${data.projects.filter(proj => proj.title && proj.description).length > 0 ? `
            <div class="section">
              <h2 class="section-title">Projects</h2>
              ${data.projects
                .filter(proj => proj.title && proj.description)
                .map(proj => `
                <div class="project-item">
                  <h3 class="project-title">${proj.title}</h3>
                  ${formatDescription(proj.description)}
                </div>
              `).join('')}
            </div>
            ` : ''}
            
            ${data.achievements.filter(ach => ach.value).length > 0 ? `
            <div class="section">
              <h2 class="section-title">Achievements</h2>
              <ul class="achievements-list">
                ${data.achievements
                  .filter(ach => ach.value)
                  .map(ach => `<li class="achievement-item">${ach.value}</li>`)
                  .join('')}
              </ul>
            </div>
            ` : ''}
          </div>
        </body>
      </html>
    `;
    
    return htmlTemplate;
  };

  // Handle PDF download using jsPDF in the browser
  const handleDownloadPDF = async (resume: Resume) => {
    try {
      console.log('Generating PDF for resume:', resume);
      console.log('Raw resume data:', JSON.stringify(resume, null, 2));
      
      // Convert resume data to the format expected by generateHTMLContent
      const resumeDataForPDF = convertResumeForPDF(resume);
      
      console.log('Resume data for PDF:', resumeDataForPDF);
      console.log('Experience entries:', resumeDataForPDF.experience);
      console.log('Education entries:', resumeDataForPDF.education);
      console.log('Skills:', resumeDataForPDF.skills);
      console.log('Projects:', resumeDataForPDF.projects);
      console.log('Achievements:', resumeDataForPDF.achievements);
      
      const htmlContent = generateHTMLContent(resumeDataForPDF);
      console.log('Generated HTML content length:', htmlContent.length);
      console.log('Generated HTML content preview:', htmlContent.substring(0, 500));
      
      // Create a temporary div to render the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '210mm';
      tempDiv.style.height = '297mm';
      tempDiv.style.background = 'white';
      document.body.appendChild(tempDiv);
      
      // Wait a bit for content to render
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use html2canvas to capture the div content
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(tempDiv, {
        width: 794, // A4 width in pixels (72 DPI)
        height: 1123, // A4 height in pixels (72 DPI)
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      console.log('Canvas created:', canvas.width, 'x', canvas.height);
      
      // Convert canvas to PDF using jsPDF
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      // Add first page
      pdf.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Download the PDF
      pdf.save(`${resume.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_resume.pdf`);
      
      // Clean up
      document.body.removeChild(tempDiv);
      
      toast({
        title: "PDF Generated Successfully!",
        description: "Your resume has been compiled to PDF and downloaded.",
      });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // Fallback: download HTML file and show instructions
      const resumeDataForPDF = convertResumeForPDF(resume);
      
      const htmlContent = generateHTMLContent(resumeDataForPDF);
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resume.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_resume.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        variant: "destructive",
        title: "PDF Generation Failed",
        description: "HTML file downloaded instead. Open in browser and use 'Print to PDF'.",
      });
    }
  };

  // Wrapper function for resume editor PDF generation
  const handleEditorPDFDownload = async () => {
    // Create a mock resume object from current resumeData for PDF generation
    const mockResume: Resume = {
      id: 'editor',
      name: resumeData.name,
      summary: resumeData.summary,
      experience: resumeData.experience,
      education: resumeData.education,
      skills: resumeData.skills,
      projects: resumeData.projects,
      achievements: resumeData.achievements,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Use the same conversion function for consistency
    const resumeDataForPDF = convertResumeForPDF(mockResume);
    console.log('Editor PDF data:', resumeDataForPDF);
    
    await handleDownloadPDF(mockResume);
  };

  if (showEditor) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-headline text-3xl font-semibold text-foreground">
              {selectedResume ? 'Edit Resume' : 'Create New Resume'}
            </h1>
            <div className="flex gap-2">
              <Button onClick={handleSaveResume} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Save Resume
              </Button>
              <Button
                onClick={handleEditorPDFDownload}
                className="bg-green-600 text-white border-green-600 hover:bg-green-700"
              >
                Generate PDF
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Side - Form Fields */}
            <div className="space-y-6">
              <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-foreground">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-foreground">Name</Label>
                    <Input
                      id="name"
                      value={resumeData.name}
                      onChange={(e) => setResumeData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Your full name"
                      className="bg-background text-foreground border-border placeholder-muted-foreground focus:border-ring focus:ring-ring"
                    />
                  </div>
                  <div>
                    <Label htmlFor="summary" className="text-foreground">Professional Summary</Label>
                    <Textarea
                      id="summary"
                      value={resumeData.summary}
                      onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                      placeholder="Brief professional summary"
                      rows={3}
                      className="bg-background text-foreground border-border placeholder-muted-foreground focus:border-ring focus:ring-ring"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-foreground">Experience</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(resumeData.experience || []).map((exp, index) => (
                    <div key={index} className="p-4 border border-border rounded-lg space-y-3 bg-muted/50">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-foreground">Job Title</Label>
                          <Input
                            value={exp.jobTitle}
                            onChange={(e) => updateExperience(index, 'jobTitle', e.target.value)}
                            placeholder="Software Engineer"
                            className="bg-background text-foreground border-border placeholder-muted-foreground focus:border-ring focus:ring-ring"
                          />
                        </div>
                        <div>
                          <Label className="text-foreground">Company</Label>
                          <Input
                            value={exp.companyName}
                            onChange={(e) => updateExperience(index, 'companyName', e.target.value)}
                            placeholder="Company Name"
                            className="bg-background text-foreground border-border placeholder-muted-foreground focus:border-ring focus:ring-ring"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-foreground">Dates</Label>
                        <Input
                          value={exp.dates}
                          onChange={(e) => updateExperience(index, 'dates', e.target.value)}
                          placeholder="Jan 2023 - Present"
                          className="bg-background text-foreground border-border placeholder-muted-foreground focus:border-ring focus:ring-ring"
                        />
                      </div>
                      <div>
                        <Label className="text-foreground">Description</Label>
                        <Textarea
                          value={exp.description}
                          onChange={(e) => updateExperience(index, 'description', e.target.value)}
                          placeholder="Describe your role and achievements"
                          rows={3}
                          className="bg-background text-foreground border-border placeholder-muted-foreground focus:border-ring focus:ring-ring"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeExperience(index)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Remove 
                      </Button>
                    </div>
                  ))}
                  <Button
                    onClick={addExperience}
                    variant="outline"
                    className="w-full border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Experience
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-foreground">Education</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resumeData.education.map((edu, index) => (
                    <div key={index} className="p-4 border border-border rounded-lg space-y-3 bg-muted/50">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-foreground">Degree</Label>
                          <Input
                            value={edu.degree}
                            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                            placeholder="Bachelor of Science"
                            className="bg-background text-foreground border-border placeholder-muted-foreground"
                          />
                        </div>
                        <div>
                          <Label className="text-foreground">Institution</Label>
                          <Input
                            value={edu.institution}
                            onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                            placeholder="University Name"
                            className="bg-background text-foreground border-border placeholder-muted-foreground"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-foreground">Graduation Year</Label>
                          <Input
                            value={edu.graduationYear}
                            onChange={(e) => updateEducation(index, 'graduationYear', e.target.value)}
                            placeholder="2023"
                            className="bg-background text-foreground border-border placeholder-muted-foreground"
                          />
                        </div>
                        <div>
                          <Label className="text-foreground">Details</Label>
                          <Input
                            value={edu.details}
                            onChange={(e) => updateEducation(index, 'details', e.target.value)}
                            placeholder="GPA, honors, etc."
                            className="bg-background text-foreground border-border placeholder-muted-foreground"
                          />
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeEducation(index)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addEducation} className="bg-muted/50 text-foreground border-border hover:bg-muted/70">
                    Add Education
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-foreground">Skills</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resumeData.skills.map((skill, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={skill.value}
                        onChange={(e) => updateSkill(index, e.target.value)}
                        placeholder="Skill name"
                        className="bg-background text-foreground border-border placeholder-muted-foreground focus:border-ring focus:ring-ring"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeSkill(index)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    onClick={addSkill}
                    variant="outline"
                    className="w-full border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Skill
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-foreground">Projects</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resumeData.projects.map((proj, index) => (
                    <div key={index} className="p-4 border border-border rounded-lg space-y-3 bg-muted/50">
                      <div>
                        <Label className="text-foreground">Project Title</Label>
                        <Input
                          value={proj.title}
                          onChange={(e) => updateProject(index, 'title', e.target.value)}
                          placeholder="Project Name"
                          className="bg-background text-foreground border-border placeholder-muted-foreground focus:border-ring focus:ring-ring"
                        />
                      </div>
                      <div>
                        <Label className="text-foreground">Description</Label>
                        <Textarea
                          value={proj.description}
                          onChange={(e) => updateProject(index, 'description', e.target.value)}
                          placeholder="Describe the project"
                          rows={3}
                          className="bg-background text-foreground border-border placeholder-muted-foreground focus:border-ring focus:ring-ring"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeProject(index)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    onClick={addProject}
                    variant="outline"
                    className="w-full border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Project
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-foreground">Achievements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resumeData.achievements.map((ach, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={ach.value}
                        onChange={(e) => updateAchievement(index, e.target.value)}
                        placeholder="Achievement description"
                        className="bg-background text-foreground border-border placeholder-muted-foreground focus:border-ring focus:ring-ring"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeAchievement(index)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    onClick={addAchievement}
                    variant="outline"
                    className="w-full border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Achievement
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Resume Preview */}
            <div className="sticky top-6">
              <ResumePreview 
                resumeData={resumeData}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-foreground">Resumes</h1>
          <Button
            onClick={() => setShowEditor(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Resume
          </Button>
        </div>

      <Card className="shadow-lg bg-card border-border">
        <CardHeader>
          <CardTitle className="font-headline text-xl text-foreground">Saved Resumes</CardTitle>
          <p className="text-muted-foreground mb-4">Manage your saved resumes. You can view, edit, or delete them.</p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="mx-auto h-16 w-16 text-primary animate-spin" />
              <p className="text-muted-foreground mb-4">Loading your resumes...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              <p>{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Retry
              </Button>
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-12">
              <FilesIcon className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-4">You haven't saved any resumes yet.</p>
              <Button onClick={handleCreateNew} variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90">
                 <PlusCircle className="mr-2 h-5 w-5" />
                 Create Your First Resume
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[30%] text-foreground">Name</TableHead>
                  <TableHead className="w-[40%] text-foreground">Associated Job</TableHead>
                  <TableHead className="text-foreground">Last Modified</TableHead>
                  <TableHead className="text-right text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resumes.map((resume) => (
                  <TableRow key={resume.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium text-foreground">{resume.name}</TableCell>
                    <TableCell>
                      {(resume as any).job ? (
                        <div className="flex items-center space-x-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-foreground">{(resume as any).job.title}</div>
                            <div className="text-sm text-muted-foreground">{(resume as any).job.company}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <FilesIcon className="h-4 w-4" />
                          <span>General</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(resume.updated_at || resume.created_at)}
                    </TableCell>
                    <TableCell className="text-right space-x-1 sm:space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditResume(resume)} className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                        <Edit className="mr-1 h-4 w-4" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDownloadPDF(resume)} 
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
                              This action cannot be undone. This will permanently delete the resume
                              "{resume.name}" from the database.
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
    </div>
  );
}
