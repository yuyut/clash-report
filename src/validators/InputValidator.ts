import type { Building } from '../models/Building';
import type { SitePlan } from '../models/SitePlan';
export class InputValidator {
    validate(buildings: Building[], sitePlan: SitePlan): ValidationError[] {
        const errors: ValidationError[] = [];

        //site plan
        if (!sitePlan.width || sitePlan.width <= 0) {
            errors.push(new ValidationError("Site plan width must be a positive number"));
        }
        if (!sitePlan.length || sitePlan.length <= 0) {     
            errors.push(new ValidationError("Site plan length must be a positive number"));
        }

        //buildings
        buildings.forEach((building, index) => {
            const name = building.name || `Building at index ${index}`;

            if (!building.name) {
                errors.push(new ValidationError(`Building at index ${index} is missing a name`));
            }
            if (!building.type) {
                errors.push(new ValidationError(`Building "${name}" is missing a type`));
            }
            if (!building.width || building.width <= 0) {
                errors.push(new ValidationError(`Building "${name}" width must be positive`));
            }
            if (!building.length || building.length <= 0) {
                errors.push(new ValidationError(`Building "${name}" length must be positive`));
            }
            if (building.x === undefined || building.x < 0) {
                errors.push(new ValidationError(`Building "${name}" x position must be >=0`));
            }
            if (building.y === undefined || building.y < 0) {
                errors.push(new ValidationError(`Building "${name}" y position must be >=0`));
            }
        });

        return errors;
    }
    
}

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ValidationError";
    }
}