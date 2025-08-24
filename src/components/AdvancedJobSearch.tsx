"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Search, Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Job, JobStatus } from "@/types";

interface SearchFilters {
  query: string;
  title: string;
  company: string;
  location: string;
  status: JobStatus | "All Statuses";
  salaryMin: number;
  salaryMax: number;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  deadlineFrom: Date | undefined;
  deadlineTo: Date | undefined;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface SearchResults {
  jobs: Job[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
  };
  filters: any;
}

interface AdvancedJobSearchProps {
  userId: number;
  onSearchResults: (results: SearchResults) => void;
  onLoadingChange: (loading: boolean) => void;
}

const jobStatuses: Array<JobStatus | "All Statuses"> = ['All Statuses', 'Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

const sortOptions = [
  { value: "created_at", label: "Date Created" },
  { value: "application_date", label: "Application Date" },
  { value: "deadline", label: "Deadline" },
  { value: "title", label: "Job Title" },
  { value: "company", label: "Company" },
  { value: "salary_min", label: "Salary" },
];

export default function AdvancedJobSearch({ userId, onSearchResults, onLoadingChange }: AdvancedJobSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    title: '',
    company: '',
    location: '',
    status: 'All Statuses',
    salaryMin: 0,
    salaryMax: 500000,
    dateFrom: undefined,
    dateTo: undefined,
    deadlineFrom: undefined,
    deadlineTo: undefined,
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('jobSearchHistory');
    if (saved) {
      setSearchHistory(JSON.parse(saved));
    }
  }, []);

  const saveSearchHistory = (query: string) => {
    if (query.trim()) {
      const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('jobSearchHistory', JSON.stringify(newHistory));
    }
  };

  const handleSearch = async (resetPage: boolean = true) => {
    if (!userId) return;

    setIsSearching(true);
    onLoadingChange(true);

    try {
      const searchParams = {
        ...filters,
        userId: userId.toString(),
        page: resetPage ? 1 : 1, // Reset to first page on new search
      };

      // Save search query to history
      if (filters.query.trim()) {
        saveSearchHistory(filters.query);
      }

      const response = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const results: SearchResults = await response.json();
      onSearchResults(results);

    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
      onLoadingChange(false);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      title: '',
      company: '',
      location: '',
      status: 'All Statuses',
      salaryMin: 0,
      salaryMax: 500000,
      dateFrom: undefined,
      dateTo: undefined,
      deadlineFrom: undefined,
      deadlineTo: undefined,
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
  };

  const hasActiveFilters = () => {
    return filters.query || 
           filters.title || 
           filters.company || 
           filters.location || 
           filters.status !== 'All Statuses' ||
           filters.salaryMin > 0 || 
           filters.salaryMax < 500000 ||
           filters.dateFrom || 
           filters.dateTo || 
           filters.deadlineFrom || 
           filters.deadlineTo;
  };

  const formatSalary = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Advanced Job Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Search */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search jobs, companies, descriptions..."
              value={filters.query}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button 
            onClick={() => handleSearch()} 
            disabled={isSearching}
            className="min-w-[100px]"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            size="sm"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Filters
          </Button>
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Recent searches:</span>
            {searchHistory.slice(0, 5).map((query, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => {
                  handleFilterChange('query', query);
                  handleSearch();
                }}
              >
                {query}
              </Badge>
            ))}
          </div>
        )}

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            {/* Row 1: Title, Company, Location */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  placeholder="Software Engineer"
                  value={filters.title}
                  onChange={(e) => handleFilterChange('title', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  placeholder="Google"
                  value={filters.company}
                  onChange={(e) => handleFilterChange('company', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="San Francisco, CA"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>
            </div>

            {/* Row 2: Status, Sort */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {jobStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="sortBy">Sort By</Label>
                  <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sortOrder">Order</Label>
                  <Select value={filters.sortOrder} onValueChange={(value) => handleFilterChange('sortOrder', value as 'asc' | 'desc')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Descending</SelectItem>
                      <SelectItem value="asc">Ascending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Row 3: Salary Range */}
            <div>
              <Label>Salary Range</Label>
              <div className="space-y-2">
                <Slider
                  value={[filters.salaryMin, filters.salaryMax]}
                  onValueChange={([min, max]) => {
                    handleFilterChange('salaryMin', min);
                    handleFilterChange('salaryMax', max);
                  }}
                  max={500000}
                  step={1000}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{formatSalary(filters.salaryMin)}</span>
                  <span>{formatSalary(filters.salaryMax)}</span>
                </div>
              </div>
            </div>

            {/* Row 4: Date Ranges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Application Date Range</Label>
                <div className="flex gap-2 mt-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateFrom ? format(filters.dateFrom, "PPP") : "From"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.dateFrom}
                        onSelect={(date) => handleFilterChange('dateFrom', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateTo ? format(filters.dateTo, "PPP") : "To"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.dateTo}
                        onSelect={(date) => handleFilterChange('dateTo', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <Label>Deadline Range</Label>
                <div className="flex gap-2 mt-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.deadlineFrom ? format(filters.deadlineFrom, "PPP") : "From"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.deadlineFrom}
                        onSelect={(date) => handleFilterChange('deadlineFrom', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.deadlineTo ? format(filters.deadlineTo, "PPP") : "To"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.deadlineTo}
                        onSelect={(date) => handleFilterChange('deadlineTo', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button onClick={() => handleSearch()} disabled={isSearching}>
                {isSearching ? 'Searching...' : 'Apply Filters'}
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters() && (
              <div className="pt-2 border-t">
                <Label className="text-sm text-muted-foreground">Active Filters:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {filters.query && (
                    <Badge variant="secondary" className="gap-1">
                      Query: {filters.query}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange('query', '')} />
                    </Badge>
                  )}
                  {filters.title && (
                    <Badge variant="secondary" className="gap-1">
                      Title: {filters.title}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange('title', '')} />
                    </Badge>
                  )}
                  {filters.company && (
                    <Badge variant="secondary" className="gap-1">
                      Company: {filters.company}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange('company', '')} />
                    </Badge>
                  )}
                  {filters.status !== 'All Statuses' && (
                    <Badge variant="secondary" className="gap-1">
                      Status: {filters.status}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange('status', 'All Statuses')} />
                    </Badge>
                  )}
                  {(filters.salaryMin > 0 || filters.salaryMax < 500000) && (
                    <Badge variant="secondary" className="gap-1">
                      Salary: {formatSalary(filters.salaryMin)} - {formatSalary(filters.salaryMax)}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => {
                        handleFilterChange('salaryMin', 0);
                        handleFilterChange('salaryMax', 500000);
                      }} />
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
