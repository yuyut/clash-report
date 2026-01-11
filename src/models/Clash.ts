export type ClashType = 
'OutOfBounds'
| 'Overlap'
| 'ClearanceViolation'
| 'ZoningViolation';

export interface Clash {
  type: ClashType;
  buildings: string[]; 
  description?: string;
  details?: any; 
}

export interface ClashDetectionResult {
  validationErrors?: string[];
  summary?: {
    totalClashes: number;
    byType: Record<ClashType, number>; // how many of each type
  };
  clashes?: Clash[];
}