export interface Control {
  id: string;
  frameworkId: string;
  controlId: string; // e.g., "AC-1", "SOX-ITGC-01"
  title: string;
  description: string;
  requirements: string[]; // Array of requirement IDs mapped to this control
  category?: string;
  priority?: "Critical" | "High" | "Medium" | "Low";
  notes?: string;
}

export interface Framework {
  id: string;
  name: string;
  version: string;
  description: string;
  category: "Compliance" | "Security" | "Privacy" | "Quality" | "Other";
  controls: Control[];
  isActive: boolean;
  effectiveDate?: string;
  notes?: string;
}
