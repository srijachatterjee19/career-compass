
import type { CoverLetter, Resume, ExperienceEntry, EducationEntry, TextEntry, ProjectEntry } from "@/types";

const generateId = () => crypto.randomUUID();

export let initialSavedCoverLetters: CoverLetter[] = [
  {
    id: "cl2",
    name: "UX Designer Application - Innovatech",
    jobTitle: "UX Designer",
    companyName: "Innovatech",
    content: "To the Hiring Team at Innovatech, I am writing to express my interest in the UX Designer role. My portfolio showcases my ability to create user-centric designs that drive engagement.",
    jobDescription: "Innovatech seeks a creative UX Designer to craft intuitive user experiences for our new mobile application. Strong portfolio and Figma skills required.",
    resumeSnippet: "UX Designer with 3 years of experience. Skilled in Figma, Adobe XD, user research, and prototyping. Passionate about creating accessible designs.",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
  },
];

export const updateMockCoverLetter = (updatedLetter: CoverLetter): boolean => {
  const index = initialSavedCoverLetters.findIndex(cl => cl.id === updatedLetter.id);
  if (index !== -1) {
    initialSavedCoverLetters[index] = { ...updatedLetter, updatedAt: new Date().toISOString() };
    return true;
  }
  return false;
};

export const deleteMockCoverLetter = (letterId: string): boolean => {
  const initialLength = initialSavedCoverLetters.length;
  initialSavedCoverLetters = initialSavedCoverLetters.filter(letter => letter.id !== letterId);
  return initialSavedCoverLetters.length < initialLength;
};


// --- Resume Mock Data ---
export let demoResumes: Resume[] = [
  {
    id: "demo-resume-1",
    name: "Software Engineer - General Purpose",
    summary: "Highly motivated Software Engineer with 5+ years of experience in full-stack development, specializing in JavaScript, React, Node.js, and Python. Proven ability to lead small teams and deliver high-quality software projects on time. Seeking a challenging role in a dynamic company to leverage expertise in cloud technologies and agile methodologies.",
    experience: [
      { id: generateId(), jobTitle: "Senior Developer", companyName: "Tech Solutions Inc.", dates: "2020-Present", description: "- Led a team of 3 developers in creating a new SaaS product.\n- Architected and implemented scalable backend services using Node.js and Express." },
      { id: generateId(), jobTitle: "Junior Developer", companyName: "Web Wizards LLC", dates: "2018-2020", description: "- Contributed to frontend development using React and Redux.\n- Participated in code reviews and agile sprint planning." }
    ],
    education: [
      { id: generateId(), degree: "M.S. in Computer Science", institution: "State University", graduationYear: "2018", details: "Thesis on Machine Learning applications." },
      { id: generateId(), degree: "B.S. in Information Technology", institution: "City College", graduationYear: "2016", details: "Graduated Summa Cum Laude." }
    ],
    skills: [
      { id: generateId(), value: "JavaScript & TypeScript" },
      { id: generateId(), value: "React, Next.js, Redux" },
      { id: generateId(), value: "Node.js, Express.js, Python" }
    ],
    projects: [
      { id: generateId(), title: "Personal Portfolio Website", description: "Developed a responsive personal website using React and Next.js to showcase projects, skills, and experience. Implemented SEO best practices and integrated with a headless CMS." },
      { id: generateId(), title: "E-commerce Platform (MERN Stack)", description: "Built a full-featured e-commerce site with user authentication, product listings, shopping cart, and Stripe payment integration. Designed and implemented RESTful APIs." }
    ],
    achievements: [
      { id: generateId(), value: "Employee of the Month, Tech Solutions Inc. (2021)" },
      { id: generateId(), value: "Dean's List, State University (2017, 2018)" }
    ],
    createdAt: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
  },
  {
    id: "demo-resume-2",
    name: "Frontend Developer - React Specialist",
    summary: "Creative and detail-oriented Frontend Developer with a passion for building intuitive and responsive user interfaces. Expertise in React, Redux, Next.js, and modern JavaScript (ES6+). Strong understanding of UI/UX principles and accessibility standards. Eager to contribute to innovative projects in a collaborative environment.",
    experience: [
      { id: generateId(), jobTitle: "Frontend Developer", companyName: "UI Masters Co.", dates: "2019-Present", description: "- Developed and maintained complex user interfaces for web applications using React and TypeScript.\n- Collaborated with UX designers to implement pixel-perfect designs." },
    ],
    education: [
      { id: generateId(), degree: "B.A. in Web Design & Development", institution: "Art Institute", graduationYear: "2018", details: "" }
    ],
    skills: [
      { id: generateId(), value: "HTML5, CSS3, SCSS" },
      { id: generateId(), value: "JavaScript (ES6+), TypeScript" },
    ],
    projects: [
      { id: generateId(), title: "Interactive Data Visualization Dashboard", description: "Created a dashboard using D3.js and React to visualize complex datasets for a non-profit organization." }
    ],
    achievements: [
       { id: generateId(), value: "Won 'Best Design' at University Hackathon (2017)" }
    ],
    createdAt: new Date(new Date().setDate(new Date().getDate() - 14)).toISOString(),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
  },
];

export const getMockResumeById = async (id: string): Promise<Resume | null> => {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async
  const resume = demoResumes.find(r => r.id === id);
  if (resume) {
    // Return a deep copy to avoid direct mutation of the mock data
    const deepCopiedResume: Resume = JSON.parse(JSON.stringify(resume));
    // Ensure all array items have IDs
    deepCopiedResume.experience = deepCopiedResume.experience.map((item: ExperienceEntry) => ({ ...item, id: item.id || generateId() }));
    deepCopiedResume.education = deepCopiedResume.education.map((item: EducationEntry) => ({ ...item, id: item.id || generateId() }));
    deepCopiedResume.skills = deepCopiedResume.skills.map((item: TextEntry) => ({ ...item, id: item.id || generateId() }));
    deepCopiedResume.projects = deepCopiedResume.projects.map((item: ProjectEntry) => ({ ...item, id: item.id || generateId() }));
    deepCopiedResume.achievements = deepCopiedResume.achievements.map((item: TextEntry) => ({ ...item, id: item.id || generateId() }));
    return deepCopiedResume;
  }
  return null;
};

export const addMockResume = async (newResume: Omit<Resume, 'id' | 'createdAt' | 'updatedAt'>): Promise<Resume> => {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async
  const fullResume: Resume = {
    ...newResume,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    experience: newResume.experience.map(exp => ({ ...exp, id: exp.id || generateId() })),
    education: newResume.education.map(edu => ({ ...edu, id: edu.id || generateId() })),
    skills: newResume.skills.map(skill => ({ ...skill, id: skill.id || generateId() })),
    projects: newResume.projects.map(proj => ({ ...proj, id: proj.id || generateId() })),
    achievements: newResume.achievements.map(ach => ({ ...ach, id: ach.id || generateId() })),
  };
  demoResumes.push(fullResume);
  return JSON.parse(JSON.stringify(fullResume)); // Return a copy
};

export const updateMockResume = async (updatedResume: Resume): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async
  const index = demoResumes.findIndex(r => r.id === updatedResume.id);
  if (index !== -1) {
    demoResumes[index] = { 
      ...updatedResume, 
      updatedAt: new Date().toISOString(),
      // Ensure sub-items have IDs
      experience: updatedResume.experience.map(exp => ({ ...exp, id: exp.id || generateId() })),
      education: updatedResume.education.map(edu => ({ ...edu, id: edu.id || generateId() })),
      skills: updatedResume.skills.map(skill => ({ ...skill, id: skill.id || generateId() })),
      projects: updatedResume.projects.map(proj => ({ ...proj, id: proj.id || generateId() })),
      achievements: updatedResume.achievements.map(ach => ({ ...ach, id: ach.id || generateId() })),
    };
    return true;
  }
  return false;
};

export const deleteMockResume = (resumeId: string): boolean => {
  const initialLength = demoResumes.length;
  demoResumes = demoResumes.filter(resume => resume.id !== resumeId);
  return demoResumes.length < initialLength;
};

