export type RosterStatus = "available" | "busy" | "offline";

export interface SupportIssue {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  guideUrl?: string;
}

export interface SupportSpecialist {
  name: string;
  role: string;
  rosterStatus: RosterStatus;
  teamsUrl?: string;
}

export interface SupportServiceItem {
  id: string;
  name: string;
  description: string;
  remedyUrl?: string;
  specialist: SupportSpecialist;
  issues: SupportIssue[];
}

export interface SupportData {
  generatedAt: string;
  dspSupport: SupportSpecialist;
  services: SupportServiceItem[];
}
