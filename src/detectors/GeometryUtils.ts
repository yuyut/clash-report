import { Building, BoundingBox } from '../models';

export class GeometryUtils {
    static getBoundingBox(building: Building): BoundingBox {
        return {
            xMin: building.x,
            xMax: building.x + building.width,
            yMin: building.y,
            yMax: building.y + building.length
        };
    }

    static getCenter(building: Building): { x: number; y: number } {
        return {
            x: building.x + building.width / 2,
            y: building.y + building.length / 2
        };
    }

    static intersects(bbox1: BoundingBox, bbox2: BoundingBox): boolean {
        return !(bbox2.xMin >= bbox1.xMax || // touching edges is not  intersecting
                 bbox2.xMax <= bbox1.xMin ||
                 bbox2.yMin >= bbox1.yMax ||
                 bbox2.yMax <= bbox1.yMin);
    }
    // distance between closest edges
    static getMinDistance(bbox1: BoundingBox, bbox2: BoundingBox): number {
        // horizontal
        let dx = 0;
        if (bbox1.xMax < bbox2.xMin) {
            dx = bbox2.xMin - bbox1.xMax;
        } else if (bbox2.xMax < bbox1.xMin) {
            dx = bbox1.xMin - bbox2.xMax;
        }

        // vertical 
        let dy = 0;
        if (bbox1.yMax < bbox2.yMin) {
            dy = bbox2.yMin - bbox1.yMax;
        } else if (bbox2.yMax < bbox1.yMin) {
            dy = bbox1.yMin - bbox2.yMax;
        }

        return Math.sqrt(dx * dx + dy * dy);
    }

    // compute combined bounds for boxes
    static computeBounds(bboxes: BoundingBox[]): BoundingBox {
        return {
            xMin: Math.min(...bboxes.map(b => b.xMin)),
            yMin: Math.min(...bboxes.map(b => b.yMin)),
            xMax: Math.max(...bboxes.map(b => b.xMax)),
            yMax: Math.max(...bboxes.map(b => b.yMax))
        };
    }

    
    static getMinDistanceBetweenBuildings(b1: Building, b2: Building): number {
        return this.getMinDistance(this.getBoundingBox(b1), this.getBoundingBox(b2));
    }
}
