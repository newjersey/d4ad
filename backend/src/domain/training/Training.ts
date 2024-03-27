// import { CalendarLength } from "../CalendarLength";
import { Occupation } from "../occupations/Occupation";
export interface Training {
  id?: string;
  name?: string;
  cipCode: string;
  provider: Provider;
  description?: string;
  certifications: string;
  prerequisites?: (string | undefined)[];
  // calendarLength: CalendarLength;
  totalClockHours: number;
  occupations: Occupation[];
  inDemand: boolean;
  localExceptionCounty: string[];
  tuitionCost: number;
  feesCost: number;
  booksMaterialsCost: number;
  suppliesToolsCost: number;
  otherCost: number;
  totalCost: number;
  online: boolean;
  percentEmployed: number | null;
  averageSalary: number | null;
  hasEveningCourses: boolean;
  languages: string | null;
  isWheelchairAccessible: boolean;
  hasJobPlacementAssistance: boolean;
  hasChildcareAssistance: boolean;
}

export interface Provider {
  id: string;
  url?: string;
  contactName?: string;
  contactTitle?: string;
  phoneNumber?: string;
  county?: string;
  phoneExtension?: string;
  email?: string;
  addresses?: Address;
  name: string;
  targetContactPoints?: ContactPoint[];
}

export interface Address {
  street_address?: string;
  city?: string;
  zipCode?: string;
}

export interface ContactPoint {
  alternateName?: string;
  contactType?: string;
  faxNumber?: string[];
  name?: string;
  socialMedia?: string[];
  email?: string[];
  telephone?: string[];
}

export interface ConditionProfile {
  name?: string;
  experience?: string;
  description?: string;
  yearsOfExperience?: string;
  targetAssessment: ConditionProfileItem[];
  targetCompetency: ConditionProfileItem[];
  targetCredential: ConditionProfileItem[];
  targetLearningOpportunity: ConditionProfileItem[];
}

export interface ConditionProfileItem {
  name?: string;
  provider?: Provider;
  description?: string;
}
