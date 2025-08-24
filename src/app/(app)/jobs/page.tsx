
"use client";

import Link from 'next/link';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Briefcase, Eye, ExternalLink, Building, Loader2 } from "lucide-react";
import type { Job, JobStatus } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/hooks/useAuth';
import { getCompanyLogoUrl } from '@/lib/company-logos';

const jobStatusesForFilter: Array<JobStatus | "All Statuses"> = ['All Statuses', 'Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

const sortOptions = [
  { value: "none", label: "Sort by..." },
  { value: "appDateAsc", label: "Application Date (Oldest First)" },
  { value: "appDateDesc", label: "Application Date (Newest First)" },
  { value: "deadlineAsc", label: "Deadline (Soonest First)" },
  { value: "deadlineDesc", label: "Deadline (Latest First)" },
];

export default function JobTrackerPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedStatusFilter, setSelectedStatusFilter] = useState<JobStatus | "All Statuses">("All Statuses");
  const [sortBy, setSortBy] = useState<string>("none");
  const [companyNameFilter, setCompanyNameFilter] = useState<string>("");
  const [jobTitleFilter, setJobTitleFilter] = useState<string>("");

  // Fetch real jobs data from the database
  useEffect(() => {
    const fetchJobs = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/jobs?userId=${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }
        
        const jobsData = await response.json();
        setJobs(jobsData);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load jobs. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user]);

  const filteredJobs = jobs.filter(job => {
    const statusMatch = selectedStatusFilter === "All Statuses" || job.status === selectedStatusFilter;
    const companyMatch = !companyNameFilter.trim() || job.company.toLowerCase().includes(companyNameFilter.trim().toLowerCase());
    const titleMatch = !jobTitleFilter.trim() || job.title.toLowerCase().includes(jobTitleFilter.trim().toLowerCase());
    return statusMatch && companyMatch && titleMatch;
  });

  const sortJobs = (jobsToSort: Job[], currentSortBy: string): Job[] => {
    if (currentSortBy === "none") return jobsToSort;

    return [...jobsToSort].sort((a, b) => {
      let dateA: Date | null = null;
      let dateB: Date | null = null;

      if (currentSortBy.startsWith("appDate")) {
        dateA = a.application_date ? new Date(a.application_date) : null;
        dateB = b.application_date ? new Date(b.application_date) : null;
      } else if (currentSortBy.startsWith("deadline")) {
        dateA = a.deadline ? new Date(a.deadline) : null;
        dateB = b.deadline ? new Date(b.deadline) : null;
      }

      if (dateA === null && dateB === null) return 0;
      if (dateA === null) return 1; 
      if (dateB === null) return -1;
      
      if (currentSortBy.endsWith("Asc")) {
        return dateA.getTime() - dateB.getTime();
      } else { 
        return dateB.getTime() - dateA.getTime();
      }
    });
  };

  const filteredAndSortedJobs = sortJobs(filteredJobs, sortBy);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-semibold text-foreground">Job Tracker</h1>
        <Button asChild className="flex-shrink-0 w-full sm:w-auto sm:order-last">
          <Link href="/jobs/add">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add New Job
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
        <div>
            <Label htmlFor="job-title-filter" className="mb-1 block text-sm font-medium text-muted-foreground">Filter by Job Title</Label>
            <Input
                id="job-title-filter"
                placeholder="Enter job title..."
                value={jobTitleFilter}
                onChange={(e) => setJobTitleFilter(e.target.value)}
                className="w-full"
            />
        </div>
        <div>
            <Label htmlFor="company-filter" className="mb-1 block text-sm font-medium text-muted-foreground">Filter by Company</Label>
            <Input
                id="company-filter"
                placeholder="Enter company name..."
                value={companyNameFilter}
                onChange={(e) => setCompanyNameFilter(e.target.value)}
                className="w-full"
            />
        </div>
        <div>
            <Label htmlFor="status-filter" className="mb-1 block text-sm font-medium text-muted-foreground">Filter by Status</Label>
            <Select value={selectedStatusFilter} onValueChange={(value) => setSelectedStatusFilter(value as JobStatus | "All Statuses")}>
                <SelectTrigger id="status-filter" className="w-full">
                <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                {jobStatusesForFilter.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
                </SelectContent>
            </Select>
        </div>
        <div>
            <Label htmlFor="sort-by-filter" className="mb-1 block text-sm font-medium text-muted-foreground">Sort by</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort-by-filter" className="w-full">
                <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
                </SelectContent>
            </Select>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Loading jobs...</p>
        </div>
      ) : error ? (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-12">
            <Briefcase className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">
              Failed to load jobs. Please try again later.
            </p>
            <Button asChild variant="default">
              <Link href="/jobs/add">
                <PlusCircle className="mr-2 h-5 w-5" />
                Add Job
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : filteredAndSortedJobs.length === 0 ? (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl">
              {selectedStatusFilter === "All Statuses" && sortBy === "none" && !companyNameFilter.trim() && !jobTitleFilter.trim() ? "No Jobs Tracked Yet" : `No Jobs Matching Criteria`}
            </CardTitle>
            <CardDescription>
              {selectedStatusFilter === "All Statuses" && sortBy === "none" && !companyNameFilter.trim() && !jobTitleFilter.trim()
                ? "Start adding jobs you're interested in to keep everything organized."
                : `There are no jobs matching your current filter and sort settings. Try adjusting them or add a new job.`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-12">
            <Briefcase className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">
               {selectedStatusFilter === "All Statuses" && sortBy === "none" && !companyNameFilter.trim() && !jobTitleFilter.trim()
                ? "Click \"Add New Job\" to get started."
                : "Adjust your filters or add a job."
               }
            </p>
            <Button asChild variant="default">
              <Link href="/jobs/add">
                <PlusCircle className="mr-2 h-5 w-5" />
                Add Job
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedJobs.map((job) => (
            <Card key={job.id} className="shadow-lg hover:shadow-xl transition-shadow flex flex-col">
              <CardHeader className="flex flex-row justify-between items-start">
                <div>
                  <CardTitle className="font-headline text-lg">{job.title}</CardTitle>
                  <CardDescription>{job.company}</CardDescription>
                </div>
                <Avatar className="h-[50px] w-[50px] border flex-shrink-0">
                  <AvatarImage
                    src={getCompanyLogoUrl(job.company) || ''}
                    alt={job.company ? `${job.company} logo` : 'Company logo'}
                  />
                  <AvatarFallback>
                    <Building className="h-6 w-6 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
              </CardHeader>
              <CardContent className="flex-grow space-y-2 py-3">
                <p className="text-sm">
                  <span className="font-semibold">Status:</span> 
                  <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-secondary text-secondary-foreground">{job.status}</span>
                </p>
                {job.application_date && (
                  <p className="text-sm">
                    <span className="font-semibold">Applied:</span> {new Date(job.application_date).toLocaleDateString()}
                  </p>
                )}
                {job.deadline && (
                  <p className="text-sm">
                    <span className="font-semibold">Deadline:</span> {new Date(job.deadline).toLocaleDateString()}
                  </p>
                )}
                {(job.description ) && (
                  <div className="pt-2">
                    <p className="text-xs uppercase font-semibold text-muted-foreground">
                      {job.description ? 'Description:' : 'Notes:'}
                    </p>
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap line-clamp-3">
                      {job.description }
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end items-center mt-auto pt-3 pb-3 border-t space-x-2">
                {job.url && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild
                    >
                      <a href={job.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Open Link
                      </a>
                    </Button>
                )}
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/jobs/edit/${job.id}`}>
                    <Eye className="mr-2 h-4 w-4" /> 
                    View
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

