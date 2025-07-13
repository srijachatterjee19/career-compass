
"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, FileText, Mail, CheckCircle, CalendarClock, Send, ArrowRight, Building, BarChart3, PieChartIcon } from "lucide-react";
import type { Job, JobStatus } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bar, BarChart, Pie, PieChart as RechartsPieChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';

const initialStats = [
  { title: "Jobs Tracked", value: 0, icon: Briefcase, color: "text-primary" },
  { title: "Resumes Created", value: 0, icon: FileText, color: "text-blue-500" },
  { title: "Cover Letters", value: 0, icon: Mail, color: "text-green-500" },
  { title: "Applications Sent", value: 0, icon: CheckCircle, color: "text-yellow-500" },
];

// This data will be processed on the client side to avoid hydration errors from new Date()
const dashboardJobs: Job[] = [
  { 
    id: '1', 
    title: 'Software Engineer', 
    company: 'Creative Minds Inc.', 
    status: 'Applied', 
    applicationDate: new Date(new Date().setDate(new Date().getDate() - 65)).toISOString(), 
    deadline: new Date(new Date().setDate(new Date().getDate() + 12)).toISOString(), 
    url: 'https://example.com/job/',
  },
  { 
    id: '2', 
    title: 'UX Designer', 
    company: 'Creative Minds Inc.', 
    status: 'Saved', 
    applicationDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), 
    deadline: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(), 
    url: 'https://example.com/job/ux-creative',
  },
  { 
    id: 'demo-job-1', 
    title: 'Cloud Architect', 
    company: 'AlphaDev Innovations', 
    status: 'Applied', 
    applicationDate: new Date(new Date().setDate(new Date().getDate() - 35)).toISOString(),
    deadline: new Date(new Date().setDate(new Date().getDate() + 20)).toISOString(), 
    url: 'https://example.com/job/cloud-alpha',
  },
   { 
    id: '3', 
    title: 'Data Analyst', 
    company: 'Beta Solutions', 
    status: 'Interviewing', 
    applicationDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    deadline: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(), 
    url: 'https://example.com/job/da-beta',
  },
  { 
    id: '4', 
    title: 'Project Manager', 
    company: 'Gamma Corp', 
    status: 'Offer', 
    applicationDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
    deadline: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(), 
    url: 'https://example.com/job/pm-gamma',
  },
  { 
    id: '5', 
    title: 'Backend Developer', 
    company: 'Epsilon Systems', 
    status: 'Applied', 
    applicationDate: new Date(new Date().setDate(new Date().getDate() - 0)).toISOString(),
    url: 'https://example.com/job/be-epsilon',
  },
  { 
    id: '6', 
    title: 'Frontend Engineer', 
    company: 'Zeta Web', 
    status: 'Saved', 
    applicationDate: new Date(new Date().setDate(new Date().getDate() - 40)).toISOString(),
    deadline: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), 
    url: 'https://example.com/job/fe-zeta',
  },
  { 
    id: '7', 
    title: 'Data Scientist', 
    company: 'Innovate AI', 
    status: 'Applied', 
    applicationDate: new Date(new Date().setDate(new Date().getDate() - 40)).toISOString(),
    url: 'https://example.com/job/ds-innovate',
  },
  { 
    id: '8', 
    title: 'Marketing Manager', 
    company: 'AdWorks', 
    status: 'Rejected', 
    applicationDate: new Date(new Date().setDate(new Date().getDate() - 70)).toISOString(),
    url: 'https://example.com/job/mm-adworks',
  }
];

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
  const dateToShow = dateType === 'deadline' ? job.deadline : job.applicationDate;
  const dateLabel = dateType === 'deadline' ? 'Deadline' : 'Applied';

  return (
    <Link href={`/jobs/edit/${job.id}`} passHref>
      <Card className="p-3 space-y-1.5 hover:shadow-md transition-shadow cursor-pointer group bg-card/70">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{job.title}</h4>
            <p className="text-xs text-muted-foreground">{job.company}</p>
          </div>
          <Avatar className="h-9 w-9 border flex-shrink-0">
            <AvatarImage
              src={getLogoUrl(job.company) || ''}
              alt={job.company ? `${job.company} logo` : 'Company logo'}
            />
            <AvatarFallback className="text-xs">
              <Building className="h-4 w-4 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
        </div>
        {dateToShow && (
          <p className="text-xs text-muted-foreground pt-1">
            {dateLabel}: {new Date(dateToShow).toLocaleDateString()}
          </p>
        )}
      </Card>
    </Link>
  );
};

const jobStatusChartConfig = {
  Saved: { label: "Saved", color: "hsl(var(--chart-1))" },
  Applied: { label: "Applied", color: "hsl(var(--chart-2))" },
  Interviewing: { label: "Interviewing", color: "hsl(var(--chart-3))" },
  Offer: { label: "Offer", color: "hsl(var(--chart-4))" },
  Rejected: { label: "Rejected", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;


export default function DashboardPage() {
  const [stats, setStats] = useState(initialStats);
  const [upcomingDeadlineJobs, setUpcomingDeadlineJobs] = useState<Job[]>([]);
  const [recentlyAppliedJobs, setRecentlyAppliedJobs] = useState<Job[]>([]);
  const [monthlyStatusData, setMonthlyStatusData] = useState<any[]>([]);
  const [jobStatusDistributionData, setJobStatusDistributionData] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This logic now runs only on the client, after hydration, preventing mismatches.
    const now = new Date();

    const upcomingJobs = dashboardJobs
      .filter(job => 
        job.deadline && 
        new Date(job.deadline) >= now &&
        job.status !== 'Offer' && job.status !== 'Rejected'
      )
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
      .slice(0, 3);

    const recentJobs = dashboardJobs
      .filter(job => job.status === 'Applied' && job.applicationDate)
      .sort((a, b) => new Date(b.applicationDate!).getTime() - new Date(a.applicationDate!).getTime())
      .slice(0, 3);
    
    const chartStatusKeys = Object.keys(jobStatusChartConfig) as JobStatus[];

    const monthlyData = dashboardJobs
      .filter(job => job.applicationDate)
      .reduce((acc, job) => {
        const monthYear = format(parseISO(job.applicationDate!), 'MMM yyyy');
        let monthEntry = acc.find(entry => entry.month === monthYear);

        if (!monthEntry) {
          monthEntry = { month: monthYear };
          chartStatusKeys.forEach(statusKey => {
            monthEntry![statusKey] = 0;
          });
          acc.push(monthEntry);
        }
        
        if (job.status && chartStatusKeys.includes(job.status as JobStatus)) {
          monthEntry![job.status as JobStatus] = (monthEntry![job.status as JobStatus] || 0) + 1;
        }
        return acc;
      }, [] as Array<{ month: string; [key: string]: number | string }>)
      .sort((a, b) => new Date(a.month as string).getTime() - new Date(b.month as string).getTime());

    const statusDistribution = Object.entries(
      dashboardJobs.reduce((acc, job) => {
        acc[job.status as JobStatus] = (acc[job.status as JobStatus] || 0) + 1;
        return acc;
      }, {} as Record<JobStatus, number>)
    ).map(([name, value]) => ({
      name: name as JobStatus,
      value,
      fill: jobStatusChartConfig[name as JobStatus]?.color || 'hsl(var(--muted))',
    }));
    
    const trackedJobsCount = dashboardJobs.length;
    const applicationsSentCount = dashboardJobs.filter(job => job.status === 'Applied').length;
    
    const updatedStats = initialStats.map(stat => {
        if (stat.title === "Jobs Tracked") return { ...stat, value: trackedJobsCount };
        if (stat.title === "Applications Sent") return { ...stat, value: applicationsSentCount };
        return stat;
    });
    
    // Update all state at once
    setUpcomingDeadlineJobs(upcomingJobs);
    setRecentlyAppliedJobs(recentJobs);
    setMonthlyStatusData(monthlyData);
    setJobStatusDistributionData(statusDistribution);
    setStats(updatedStats);

    setIsClient(true);
  }, []);

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
          <CardContent className="space-y-3">
            {!isClient ? (
              <div className="space-y-3">
                <Skeleton className="h-[76px] w-full rounded-lg" />
                <Skeleton className="h-[76px] w-full rounded-lg" />
              </div>
            ) : upcomingDeadlineJobs.length > 0 ? (
              upcomingDeadlineJobs.map(job => <DashboardJobCard key={job.id} job={job} dateType="deadline" />)
            ) : (
              <p className="text-muted-foreground text-sm">No upcoming deadlines. Add jobs to track them here!</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-headline text-xl flex items-center">
              <Send className="mr-2 h-5 w-5 text-accent" />
              Recently Applied
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/jobs">
                See All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
             {!isClient ? (
              <div className="space-y-3">
                <Skeleton className="h-[76px] w-full rounded-lg" />
                <Skeleton className="h-[76px] w-full rounded-lg" />
              </div>
            ) : recentlyAppliedJobs.length > 0 ? (
              recentlyAppliedJobs.map(job => <DashboardJobCard key={job.id} job={job} dateType="applicationDate" />)
            ) : (
              <p className="text-muted-foreground text-sm">No recently applied jobs. Update job statuses in the tracker!</p>
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
