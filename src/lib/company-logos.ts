/**
 * Utility functions for fetching company logos
 */

export const getCompanyLogoUrl = (companyName: string): string | null => {
  if (!companyName || companyName.trim() === "") return null;
  
  // Clean company name and extract potential domain
  const cleanName = companyName.trim().toLowerCase().replace(/[^a-z0-9-.]/gi, '');
  const words = cleanName.split(/[\s-]+/);
  
  // Try different domain combinations for better logo matching
  const potentialDomains = [
    `${words[0]}.com`,
    `${words.join('')}.com`,
    `${words[0]}${words[1] || ''}.com`,
    `${words[0]}.org`,
    `${words[0]}.net`
  ];
  
  // Use Clearbit's logo API (free tier available)
  const primaryDomain = potentialDomains[0];
  return `https://logo.clearbit.com/${primaryDomain}`;
};

export const getCompanyLogoUrlWithFallback = (companyName: string): string | null => {
  if (!companyName || companyName.trim() === "") return null;
  
  // Clean company name and extract potential domain
  const cleanName = companyName.trim().toLowerCase().replace(/[^a-z0-9-.]/gi, '');
  const words = cleanName.split(/[\s-]+/);
  
  // Try different domain combinations for better logo matching
  const potentialDomains = [
    `${words[0]}.com`,
    `${words.join('')}.com`,
    `${words[0]}${words[1] || ''}.com`,
    `${words[0]}.org`,
    `${words[0]}.net`
  ];
  
  // Use Clearbit's logo API (free tier available)
  const primaryDomain = potentialDomains[0];
  return `https://logo.clearbit.com/${primaryDomain}`;
};
