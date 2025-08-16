
"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, FileText, Mail, CheckCircle, CalendarClock, Send, ArrowRight, Building, BarChart3, PieChartIcon, Plus } from "lucide-react";
import type { Job, JobStatus } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bar, BarChart, Pie, PieChart as RechartsPieChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

const initialStats = [
  { title: "Jobs Tracked", value: 0, icon: Briefcase, color: "text-primary" },
  { title: "Resumes Created", value: 0, icon: FileText, color: "text-blue-500" },
  { title: "Cover Letters", value: 0, icon: Mail, color: "text-green-500" },
  { title: "Applications Sent", value: 0, icon: CheckCircle, color: "text-yellow-500" }, // Counts Applied, Offer, Interviewing, Rejected
];

// Job status chart configuration with consistent colors
// Applied: Blue, Interviewing: Amber/Orange, Offer: Green, Rejected: Red, Saved: Gray
const jobStatusChartConfig = {
  Applied: { color: '#3b82f6', label: 'Applied' }, // Blue
  Interviewing: { color: '#f59e0b', label: 'Interviewing' }, // Amber/Orange
  Offer: { color: '#10b981', label: 'Offer' }, // Green
  Rejected: { color: '#ef4444', label: 'Rejected' }, // Red
  Saved: { color: '#6b7280', label: 'Saved' }, // Gray
} satisfies ChartConfig;

const getLogoUrl = (companyName: string) => {
  if (!companyName || companyName.trim() === "") return null;
  const potentialDomain = companyName.trim().toLowerCase().replace(/[^a-z0-9-.]/gi, '').split(' ')[0] + ".com";
  return `https://logo.clearbit.com/${potentialDomain}`;
};

interface DashboardJobCardProps {
  job: Job;
  dateType: 'deadline' | 'applicationDate';
}

const DashboardJobCard: React.FC<DashboardJobCardProps> = ({ job, dateType }) => {
  const dateToShow = dateType === 'deadline' ? job.deadline : job.application_date;
  const dateLabel = dateType === 'deadline' ? 'Deadline' : 'Applied';

  return (
    <Link href={`/jobs/edit/${job.id}`} passHref>
      <Card className="p-3 space-y-1.5 hover:shadow-md transition-shadow cursor-pointer group bg-card/70 border border-border/50">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{job.title}</h4>
            <p className="text-xs text-muted-foreground">{job.company}</p>
          </div>
          <Avatar className="h-9 w-9 border flex-shrink-0">
            <AvatarImage
              src={getLogoUrl(job.company) || undefined}
              alt={job.company}
            />
            <AvatarFallback className="text-xs bg-muted">
              {job.company.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            job.status === 'Applied' ? 'bg-blue-100 text-blue-700' :
            job.status === 'Interviewing' ? 'bg-amber-100 text-amber-700' :
            job.status === 'Offer' ? 'bg-green-100 text-green-700' :
            job.status === 'Rejected' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {job.status}
          </span>
          {dateToShow && (
            <span className="text-muted-foreground">
              {dateLabel}: {format(parseISO(dateToShow), 'MMM dd')}
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [resumes, setResumes] = useState<any[]>([]);
  const [coverLetters, setCoverLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dashboard state
  const [stats, setStats] = useState(initialStats);
  const [upcomingDeadlineJobs, setUpcomingDeadlineJobs] = useState<Job[]>([]);
  const [recentlyAppliedJobs, setRecentlyAppliedJobs] = useState<Job[]>([]);
  const [monthlyStatusData, setMonthlyStatusData] = useState<any[]>([]);
  const [jobStatusDistributionData, setJobStatusDistributionData] = useState<any[]>([]);

  // Fetch real data from the database
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch jobs
        const jobsResponse = await fetch(`/api/jobs?userId=${user.id}`);
        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();
          setJobs(jobsData);
        }
        
        // Fetch resumes
        const resumesResponse = await fetch(`/api/resumes?userId=${user.id}`);
        if (resumesResponse.ok) {
          const resumesData = await resumesResponse.json();
          setResumes(resumesData);
        }
        
        // Fetch cover letters
        const coverLettersResponse = await fetch(`/api/cover-letters?userId=${user.id}`);
        if (coverLettersResponse.ok) {
          const coverLettersData = await coverLettersResponse.json();
          setCoverLetters(coverLettersData);
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
        setIsClient(true);
      }
    };

    fetchData();
  }, [user]);

  // Process data for dashboard
  useEffect(() => {
    if (!isClient || loading) return;

    // Update stats with real data
    const updatedStats = initialStats.map(stat => {
      if (stat.title === "Jobs Tracked") return { ...stat, value: jobs.length };
      if (stat.title === "Resumes Created") return { ...stat, value: resumes.length };
      if (stat.title === "Cover Letters") return { ...stat, value: coverLetters.length };
      if (stat.title === "Applications Sent") return { ...stat, value: jobs.filter(job => ['Applied', 'Offer', 'Interviewing', 'Rejected'].includes(job.status)).length }; // Count jobs where applications have been sent
      return stat;
    });
    setStats(updatedStats);

    // Process jobs for dashboard sections
    const jobsWithDeadlines = jobs.filter(job => job.deadline);
    const upcomingJobs = jobsWithDeadlines
      .filter(job => new Date(job.deadline!) > new Date())
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
      .slice(0, 5);

    // Get jobs that are just applied (not progressed to other statuses)
    const appliedJobs = jobs.filter(job => job.status === 'Applied'); // Only jobs that are just applied
    const recentJobs = appliedJobs
      .filter(job => job.application_date)
      .sort((a, b) => new Date(b.application_date!).getTime() - new Date(a.application_date!).getTime())
      .slice(0, 5);

    setUpcomingDeadlineJobs(upcomingJobs);
    setRecentlyAppliedJobs(recentJobs);

    // Process chart data only if there are jobs
    if (jobs.length > 0) {
      // Monthly status data
      const monthlyData = jobs
        .filter(job => job.application_date)
        .reduce((acc, job) => {
          const month = format(parseISO(job.application_date!), 'MMM yyyy');
          let monthEntry = acc.find(entry => entry.month === month);
          
          if (!monthEntry) {
            monthEntry = { month };
            Object.keys(jobStatusChartConfig).forEach(status => {
              monthEntry![status as JobStatus] = 0;
            });
            acc.push(monthEntry);
          }
          
          monthEntry![job.status as JobStatus] = (Number(monthEntry![job.status as JobStatus]) || 0) + 1;
          return acc;
        }, [] as Array<{ month: string; [key: string]: number | string }>)
        .sort((a, b) => new Date(a.month as string).getTime() - new Date(b.month as string).getTime());

      // Status distribution
      const statusDistribution = Object.entries(
        jobs.reduce((acc, job) => {
          acc[job.status as JobStatus] = (acc[job.status as JobStatus] || 0) + 1;
          return acc;
        }, {} as Record<JobStatus, number>)
      ).map(([name, value]) => ({
        name: name as JobStatus,
        value,
        fill: jobStatusChartConfig[name as JobStatus]?.color || 'hsl(var(--muted))',
      }));

      setMonthlyStatusData(monthlyData);
      setJobStatusDistributionData(statusDistribution);
    } else {
      setMonthlyStatusData([]);
      setJobStatusDistributionData([]);
    }
  }, [jobs, resumes, coverLetters, isClient, loading]);

  return (
    <div className="space-y-8">
      <h1 className="font-headline text-3xl font-semibold text-foreground">Dashboard</h1>
      
      <section>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                {isClient ? (
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                ) : (
                  <Skeleton className="h-8 w-1/4" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-headline text-xl flex items-center">
              <CalendarClock className="mr-2 h-5 w-5 text-accent" />
              Upcoming Deadlines
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/jobs">
                See All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isClient ? (
              <div className="space-y-4">
                <Skeleton className="h-[76px] w-full rounded-lg" />
                <Skeleton className="h-[76px] w-full rounded-lg" />
              </div>
            ) : upcomingDeadlineJobs.length > 0 ? (
              upcomingDeadlineJobs.map(job => <DashboardJobCard key={job.id} job={job} dateType="deadline" />)
            ) : (
              <div className="text-center py-8">
                <CalendarClock className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm mb-2">No upcoming deadlines yet</p>
                <p className="text-muted-foreground text-xs">Add jobs with deadlines to see them here</p>
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link href="/jobs/add">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Job
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-headline text-xl flex items-center">
              <Send className="mr-2 h-4 w-4 text-accent" />
              Recently Applied
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/jobs">
                See All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
             {!isClient ? (
              <div className="space-y-4">
                <Skeleton className="h-[76px] w-full rounded-lg" />
                <Skeleton className="h-[76px] w-full rounded-lg" />
              </div>
            ) : recentlyAppliedJobs.length > 0 ? (
              recentlyAppliedJobs.map(job => <DashboardJobCard key={job.id} job={job} dateType="applicationDate" />)
            ) : (
              <div className="text-center py-8">
                <Send className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm mb-2">No applications yet</p>
                <p className="text-muted-foreground text-xs">Track your job applications to see them here</p>
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link href="/jobs/add">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Job
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
      
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-accent" />
              Monthly Activity by Application Date & Status
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] sm:h-[350px] pr-0">
            {!isClient ? (
               <div className="flex h-full w-full items-center justify-center">
                 <Skeleton className="h-[90%] w-full" />
               </div>
            ) : monthlyStatusData.length > 0 ? (
              <ChartContainer config={jobStatusChartConfig} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyStatusData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      content={<ChartTooltipContent labelClassName="text-sm" />}
                      cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                    />
                    <Legend content={<ChartLegendContent nameKey="name"/>} />
                    {Object.keys(jobStatusChartConfig).map((statusKey) => (
                       <Bar
                          key={statusKey}
                          dataKey={statusKey}
                          stackId="a"
                          fill={jobStatusChartConfig[statusKey as JobStatus]?.color || 'hsl(var(--muted))'}
                          radius={[4, 4, 0, 0]}
                       />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground text-sm">No application data to display yet.</p>
                <p className="text-muted-foreground text-xs">Mark jobs with an application date to see this chart.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center">
              <PieChartIcon className="mr-2 h-5 w-5 text-accent" />
              Job Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] sm:h-[350px] flex items-center justify-center">
            {!isClient ? (
               <div className="flex h-full w-full items-center justify-center">
                 <Skeleton className="h-48 w-48 rounded-full" />
               </div>
            ) : jobStatusDistributionData.length > 0 ? (
              <ChartContainer
                config={jobStatusChartConfig}
                className="mx-auto aspect-square h-full max-h-[90%]"
              >
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Tooltip 
                        content={<ChartTooltipContent nameKey="name" hideLabel />} 
                      />
                      <Pie
                        data={jobStatusDistributionData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={"80%"}
                        labelLine={false}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                            if ((percent * 100) < 5) return null;
                            return (
                                <text x={x} y={y} fill="hsl(var(--primary-foreground))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10}>
                                    {`${(percent * 100).toFixed(0)}%`}
                                </text>
                            );
                        }}
                      >
                        {jobStatusDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
                        ))}
                      </Pie>
                      <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                    </RechartsPieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
               <div className="flex flex-col items-center justify-center h-full">
                <PieChartIcon className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground text-sm">No job status data to display yet.</p>
                <p className="text-muted-foreground text-xs">Add jobs to your tracker to see their status distribution.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
