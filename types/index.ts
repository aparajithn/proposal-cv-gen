export interface Consultant {
  id: string;
  user_id: string;
  name: string;
  title: string;
  summary?: string;
  skills: string[];
  certifications: string[];
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  consultant_id: string;
  client_name?: string;
  role: string;
  duration?: string;
  tech_stack: string[];
  description_technical?: string;
  description_executive?: string;
  description_functional?: string;
  outcomes?: string;
  created_at: string;
}

export interface CVExport {
  id: string;
  consultant_id: string;
  rfp_name?: string;
  format: 'pdf' | 'word-table' | 'word-bullets';
  exported_at: string;
}

export interface CVGenerationRequest {
  consultantId: string;
  rfpKeywords: string[];
  format: 'pdf' | 'word-table' | 'word-bullets';
  rfpName?: string;
}

export interface TailoredProject extends Project {
  tailored_description?: string;
}
