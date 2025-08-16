"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import type { ExperienceEntry, EducationEntry, TextEntry, ProjectEntry } from '@/types';
import { EB_Garamond } from "next/font/google";

const ebGaramond = EB_Garamond({ subsets: ['latin'] });

interface ResumePreviewProps {
  resumeData: {
    name: string;
    summary: string;
    experience: ExperienceEntry[];
    education: EducationEntry[];
    skills: TextEntry[];
    projects: ProjectEntry[];
    achievements: TextEntry[];
  };
}

export function ResumePreview({ resumeData }: ResumePreviewProps) {
  // Helper function to format description text with bullet points
  const formatDescription = (description: string) => {
    if (!description) return null;
    
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
      return (
        <ul className="list-disc list-inside space-y-1">
          {lines.map((line, index) => {
            const cleanLine = line.trim();
            if (cleanLine.startsWith('•') || cleanLine.startsWith('-')) {
              const content = cleanLine.startsWith('•') ? cleanLine.substring(1).trim() : cleanLine.substring(1).trim();
              return <li key={index} className="text-xs text-black">{content}</li>;
            } else {
              return <li key={index} className="text-xs text-black">{cleanLine}</li>;
            }
          })}
        </ul>
      );
    }
    
    // Otherwise, return as regular paragraph
    return <p className="text-xs text-black">{description}</p>;
  };

  return (
    <div className={`space-y-6 ${ebGaramond.className}`}>
      <Card>
        <CardContent>
          <div className="mt-4">
            <div className="p-4 border rounded-lg bg-white min-h-[500px] text-black">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-black mb-2">
                    {resumeData.name || 'Your Name'}
                  </h1>
                  <p className="text-sm text-black">
                    {resumeData.summary}
                  </p>
                </div>

                {resumeData.experience.filter(exp => exp.jobTitle && exp.companyName).length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-black mb-3 border-b border-black pb-1">Experience</h2>
                    {resumeData.experience
                      .filter(exp => exp.jobTitle && exp.companyName && exp.dates && exp.description)
                      .map((exp, index) => (
                        <div key={index} className="mb-4 pl-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h3 className="text-xs font-semibold text-black mb-1">{exp.jobTitle}</h3>
                              <p className="text-xs font-medium text-black mb-2">{exp.companyName}</p>
                            </div>
                            <p className="text-xs text-black ml-5 whitespace-nowrap">{exp.dates}</p>
                          </div>
                          {formatDescription(exp.description)}
                        </div>
                      ))}
                  </div>
                )}

                {resumeData.education.filter(edu => edu.degree && edu.institution).length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-black mb-3 border-b border-black pb-1">Education</h2>
                    {resumeData.education
                      .filter(edu => edu.degree && edu.institution && edu.graduationYear)
                      .map((edu, index) => (
                        <div key={index} className="mb-4 pl-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h3 className="text-xs font-semibold text-black mb-1">{edu.degree}</h3>
                              <p className="text-xs font-medium text-black mb-2">{edu.institution}</p>
                            </div>
                            <p className="text-xs text-black ml-5 whitespace-nowrap">{edu.graduationYear}</p>
                          </div>
                          {edu.details && formatDescription(edu.details)}
                        </div>
                      ))}
                  </div>
                )}

                {resumeData.skills.filter(skill => skill.value).length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-black mb-3 border-b border-black pb-1">Skills</h2>
                    <div className="space-y-1">
                      {resumeData.skills
                        .filter(skill => skill.value)
                        .map((skill, index) => (
                          <div key={index} className="text-xs text-black font-medium">
                            {skill.value}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {resumeData.projects.filter(proj => proj.title && proj.description).length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-black mb-3 border-b border-black pb-1">Projects</h2>
                    {resumeData.projects
                      .filter(proj => proj.title && proj.description)
                      .map((proj, index) => (
                        <div key={index} className="mb-4 pl-4">
                          <h3 className="text-base font-semibold text-black">{proj.title}</h3>
                          {formatDescription(proj.description)}
                        </div>
                      ))}
                  </div>
                )}

                {resumeData.achievements.filter(ach => ach.value).length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-black mb-3 border-b border-black pb-1">Achievements</h2>
                    <ul className="list-disc list-inside space-y-1 pl-4">
                      {resumeData.achievements
                        .filter(ach => ach.value)
                        .map((ach, index) => (
                          <li key={index} className="text-xs text-black">{ach.value}</li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
