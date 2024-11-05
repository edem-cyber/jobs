export interface Company {
  id: string;
  name: string;
  careerPageUrl: string;
}

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  applicationUrl: string;
}

export interface JobApplication {
  cv: File;
  knowledgeBase: string;
}

export interface ApplicationStatus {
  jobId: string;
  company: string;
  status: 'pending' | 'submitted' | 'failed';
  error?: string;
}