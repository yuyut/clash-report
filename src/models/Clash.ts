export type ClashType = 
'OutOfBounds'
| 'Overlap'
| 'ClearanceViolation'
| 'ZoningViolation';

export interface Clash {
  type: ClashType;
  buildings: string[]; // Building names involved
  description?: string;
  details?: any; // Optional additional context
}

export interface ClashDetectionResult {
  validationErrors?: string[];
  summary?: {
    totalClashes: number;
    byType: Record<ClashType, number>; // how many of each type e.g., { 'Overlap': 3, 'OutOfBounds': 1 } 
  };
  clashes?: Clash[];
}