import { Building, SitePlan, ClashDetectionResult, Clash, ClashType } from "./models";
import { InputValidator } from "./validators/InputValidator";
import { ProximityDetector, ZoningDetector, BoundsDetector } from "./detectors/ClashDetector";

export interface ClashDetectionInput {
    sitePlan: SitePlan;
    buildings: Building[];
}

export class ClashDetectionService {
    private validator = new InputValidator();
    private boundsDetector = new BoundsDetector();
    private proximityDetector = new ProximityDetector(); // includes both overlap and clearance
    private zoningDetector = new ZoningDetector();

    async detectClashes(input: ClashDetectionInput): Promise<ClashDetectionResult> {

        // Validate input
        const validationErrors = this.validator.validate(input.buildings, input.sitePlan);
        if (validationErrors.length > 0) {
            return {
                validationErrors: validationErrors.map(err => err.message),
            };
        }
        // Detect clashes
        const clashes: Clash[] = [];

        //chcek boundaries first
        const boundsClashes = this.boundsDetector.detect(input.buildings, input.sitePlan);
        clashes.push(...boundsClashes);
        //check overlaps and clearance
        const proximityClashes = this.proximityDetector.detect(input.buildings);
        clashes.push(...proximityClashes);
        //check zoning violations
        const zoningClashes = this.zoningDetector.detect(input.buildings);
        clashes.push(...zoningClashes);
        
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
    
