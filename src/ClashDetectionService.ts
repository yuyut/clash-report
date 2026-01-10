import { Building, SitePlan, ClashDetectionResult, Clash, ClashType } from "./models";
import { InputValidator } from "./validators/InputValidator";
import { Detector } from "./detectors/ClashDetector";

export interface ClashDetectionInput {
    sitePlan: SitePlan;
    buildings: Building[];
}

export class ClashDetectionService {
    constructor(
        private detectors: Detector[],
        private validator: InputValidator = new InputValidator()
    ) {}

    async detectClashes(input: ClashDetectionInput): Promise<ClashDetectionResult> {

        // Validate input
        const validationErrors = this.validator.validate(input.buildings, input.sitePlan);
        if (validationErrors.length > 0) {
            return {
                validationErrors: validationErrors.map(err => err.message),
            };
        }
        // Detect clashes using all injected detectors
        const clashes: Clash[] = [];

        for (const detector of this.detectors) {
            const detectedClashes = detector.detect(input.buildings, input.sitePlan);
            clashes.push(...detectedClashes);
        }
        
        //summarize
        const summary = {
            totalClashes: clashes.length,
            byType : clashes.reduce((acc, clash) => {
                acc[clash.type] = (acc[clash.type] || 0) + 1;
                return acc;
            }, {} as Record<ClashType, number>)
        };

        return {
            summary: summary,
            clashes: clashes           
        };
    }
}
    
