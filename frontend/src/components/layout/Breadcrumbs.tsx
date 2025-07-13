
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrent: boolean;
}

const staticPathLabels: Record<string, string> = {
  'dashboard': 'Dashboard',
  'resume-optimizer': 'Resume Optimizer',
  'resumes': 'Resumes',
  'my-cover-letters': 'Cover Letters',
  'add': 'Add New',
};

const getContextualLabel = (segment: string, prevFriendlyLabel?: string): string => {
  if (segment === 'edit') {
    if (prevFriendlyLabel === 'Resumes') return 'Edit Resume';
    if (prevFriendlyLabel === 'Cover Letters') return 'Edit Cover Letter';
    return 'Edit';
  }
  if (segment === 'view') {
    if (prevFriendlyLabel === 'My Resumes') return 'View Resume';
    if (prevFriendlyLabel === 'Cover Letters') return 'View Cover Letter';
    return 'View';
  }
  return staticPathLabels[segment.toLowerCase()] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
};

// Heuristic to identify segments that are likely dynamic IDs (e.g., 'cl1', 'resume-abc-123')
// These ID segments themselves don't get a label in the breadcrumb.
const isLikelyIdSegment = (segment: string): boolean => {
  const lowerSegment = segment.toLowerCase();
  // Not a known static path, not 'edit', not 'view', not 'add'.
  // And matches a general pattern of IDs used in this app or typical UUID-like structures.
  return !staticPathLabels[lowerSegment] &&
         !['edit', 'view', 'add'].includes(lowerSegment) &&
         (/^[a-zA-Z0-9-]+$/.test(segment) && (segment.includes('-') || segment.length > 2 || !isNaN(Number(segment.charAt(0)))));
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const breadcrumbItems: BreadcrumbItem[] = [];

  // Paths starting with these prefixes will NOT show breadcrumbs.
  const excludedBasePaths = ['/dashboard', '/jobs', '/profile'];
  if (excludedBasePaths.some(basePath => pathname === basePath || pathname.startsWith(basePath + '/'))) {
    return null;
  }

  const pathSegments = pathname.split('/').filter(segment => segment);

  // Always add "Dashboard" as the root, unless we are on /dashboard itself (handled by above exclusion)
  breadcrumbItems.push({ label: 'Dashboard', href: '/dashboard', isCurrent: false });

  let currentHref = '';
  let lastFriendlyLabel = 'Dashboard';

  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i];
    const isLastSegmentInPath = i === pathSegments.length - 1;
    
    // If this segment is an ID, and it's preceded by 'edit' or 'view',
    // it doesn't get its own breadcrumb. The 'edit'/'view' becomes the current item.
    if (isLikelyIdSegment(segment) && i > 0 && (pathSegments[i-1].toLowerCase() === 'edit' || pathSegments[i-1].toLowerCase() === 'view')) {
      if (breadcrumbItems.length > 0 && isLastSegmentInPath) {
        breadcrumbItems[breadcrumbItems.length - 1].isCurrent = true;
      }
      currentHref += `/${segment}`; // still add to href for potential next segments if any (though unlikely after ID)
      continue; 
    }

    currentHref += `/${segment}`;
    const label = getContextualLabel(segment, lastFriendlyLabel);
    
    let isCurrentPage = isLastSegmentInPath;
    // If current segment is 'edit' or 'view' and the NEXT segment is an ID and is the LAST segment,
    // then this 'edit'/'view' is the current breadcrumb.
    if ((segment.toLowerCase() === 'edit' || segment.toLowerCase() === 'view') && 
        (i + 1 < pathSegments.length) && 
        isLikelyIdSegment(pathSegments[i+1]) && 
        (i + 1 === pathSegments.length - 1)) {
      isCurrentPage = true;
    }

    breadcrumbItems.push({ label, href: currentHref, isCurrent: isCurrentPage });
    
    if (!isLikelyIdSegment(segment)) { // Only update lastFriendlyLabel if it wasn't an ID.
        lastFriendlyLabel = label;
    }
  }
  
  // Clean up: Ensure only the very last identified page is marked 'isCurrent'
  let foundCurrent = false;
  for (let i = breadcrumbItems.length - 1; i >= 0; i--) {
    if (breadcrumbItems[i].isCurrent) {
      if (foundCurrent) {
        breadcrumbItems[i].isCurrent = false; // Unset if multiple were marked
      }
      foundCurrent = true;
    }
  }
  // If no current was specifically set (e.g. path ends in /add), mark the last one.
  if (!foundCurrent && breadcrumbItems.length > 0) {
     breadcrumbItems[breadcrumbItems.length - 1].isCurrent = true;
  }


  // Don't show breadcrumbs if it's just "Dashboard" or empty.
  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center space-x-1.5 text-sm">
        {breadcrumbItems.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
            <Link
              href={item.href}
              className={cn(
                "ml-1.5 hover:text-foreground",
                item.isCurrent ? "font-medium text-foreground pointer-events-none" : "text-muted-foreground"
              )}
              aria-current={item.isCurrent ? "page" : undefined}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
