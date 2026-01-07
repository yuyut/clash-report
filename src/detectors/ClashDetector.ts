import { Building, Clash, SitePlan, BoundingBox } from '../models';
import { GeometryUtils } from './GeometryUtils';

interface RTreeNode<building> {
    bbox: BoundingBox;
    item?: building; //leaf node
    children?: RTreeNode<building>[];
}

class RTree<T> {
    private root: RTreeNode<T> | null = null;
    private maxChildren = 4; //max children per node

    //bulk load
    load(items: Array<{ bbox: BoundingBox; data: T }>): void {
        if (items.length === 0) {
            this.root = null;
            return;
        }

        // create leaf nodes
        const leafNodes: RTreeNode<T>[] = items.map(item => ({
            bbox: item.bbox,
            item: item.data
        }));

        //sort nodes
        const sorted = this.sortNodesSpatially(leafNodes);

        // build tree bottom-up
        this.root = this.buildTree(sorted);
    }

    private buildTree(nodes: RTreeNode<T>[]): RTreeNode<T> {
        if (nodes.length === 1) {
            return nodes[0]!;
        }

        //group nodes
        const grouped: RTreeNode<T>[][] = [];
        for (let i = 0; i < nodes.length; i += this.maxChildren) {
            grouped.push(nodes.slice(i, i + this.maxChildren));
        }

        const parentNodes: RTreeNode<T>[] = grouped.map(group => ({
            bbox: GeometryUtils.computeBounds(group.map(n => n.bbox)),
            children: group
        }));
        //recursively build higher levels
        return this.buildTree(parentNodes);
    }

    //search for intersection with bbox
    search(bbox: BoundingBox): T[] {
        if (!this.root) return [];

        const results: T[] = [];
        this.searchNode(this.root, bbox, results);
        return results;
    }

    private sortNodesSpatially(nodes: RTreeNode<T>[]): RTreeNode<T>[] {
        //sort by x and then y
        return [...nodes].sort((a, b) => {
            const aCenterX = (a.bbox.xMin + a.bbox.xMax) / 2;
            const bCenterX = (b.bbox.xMin + b.bbox.xMax) / 2;

            if (Math.abs(aCenterX - bCenterX) > 0.001) {
                return aCenterX - bCenterX; //sort by x first
            }
            //if x close enough, sort by y
            const aCenterY = (a.bbox.yMin + a.bbox.yMax) / 2;
            const bCenterY = (b.bbox.yMin + b.bbox.yMax) / 2;
            return aCenterY - bCenterY; //sort by y second
        });
    }

    private searchNode(node: RTreeNode<T>, querybox: BoundingBox, results: T[]): void {
        if (!GeometryUtils.intersects(node.bbox, querybox)) {
            return;
        }

        if (node.item !== undefined) {
            results.push(node.item);
            return
        }

        if (node.children) {
            for (const child of node.children) {
                this.searchNode(child, querybox, results);
            }
        }
    }
}


export class ProximityDetector {
    private readonly MIN_CLEARANCE = 10;

    detect(buildings: Building[]): Clash[] {
        const rtree = new RTree<Building>();
        const items = buildings.map(building => {
            const bbox = GeometryUtils.getBoundingBox(building);
            return {
                bbox: bbox,
                data: building
            };
        });
        // build tree
        rtree.load(items);

        // find overlaps and clearance issues
        const clashes: Clash[] = [];
        const processed = new Set<string>();
        buildings.forEach(building => {
            const bbox = GeometryUtils.getBoundingBox(building);

            // search with expanded box for clearance checks
            const searchBox: BoundingBox = {
                xMin: bbox.xMin - this.MIN_CLEARANCE,
                yMin: bbox.yMin - this.MIN_CLEARANCE,
                xMax: bbox.xMax + this.MIN_CLEARANCE,
                yMax: bbox.yMax + this.MIN_CLEARANCE
            };
            const candidates: Building[] = rtree.search(searchBox);

            candidates.forEach(other => {
                if (other.name === building.name) return; //skip self

                //avoid duplicate clash reports
                const pairKey = [building.name, other.name].sort().join('|');
                if (processed.has(pairKey)) return;

                const otherBbox = GeometryUtils.getBoundingBox(other);

                // check for overlap first
                if (GeometryUtils.intersects(bbox, otherBbox)) {
                    const clash: Clash = {
                        buildings: [building.name, other.name],
                        description: `Buildings "${building.name}" and "${other.name}" overlap.`,
                        type: 'Overlap'
                    };
                    clashes.push(clash);
                    processed.add(pairKey);
                } else {
                    // check for clearance violation
                    const distance = GeometryUtils.getMinDistance(bbox, otherBbox);
                    // only report clearance if there is no overlap
                    if (distance > 0 && distance < this.MIN_CLEARANCE) {
                        const clash: Clash = {
                            type: 'ClearanceViolation',
                            description: `Buildings "${building.name}" and "${other.name}" are closer than minimum clearance of ${this.MIN_CLEARANCE} units.`,
                            buildings: [building.name, other.name],
                            details: { distance }
                        };
                        clashes.push(clash);
                        processed.add(pairKey);
                    }
                }
            });
        });

        return clashes;
    }

}

export class BoundsDetector {
    detect(buildings: Building[], sitePlan: SitePlan): Clash[] {
        const clashes: Clash[] = [];

        buildings.forEach(building => {
            const bbox = GeometryUtils.getBoundingBox(building);

            //check if building is outside site plan bounds

            const violationDetails: string[] = [];

            if (bbox.xMin < 0) violationDetails.push('left edge (x < 0)');
            if (bbox.yMin < 0) violationDetails.push('bottom edge (y < 0)');
            if (bbox.xMax > sitePlan.width) violationDetails.push(`right edge (x = ${bbox.xMax} > ${sitePlan.width})`);
            if (bbox.yMax > sitePlan.length) violationDetails.push(`top edge (y = ${bbox.yMax} > ${sitePlan.length})`);

            if (violationDetails.length > 0) {
                clashes.push({
                    type: 'OutOfBounds',
                    description: `Building "${building.name}" outside site boundaries: ${violationDetails.join(', ')}`,
                    buildings: [building.name],
                    details: { violationDetails: violationDetails, bbox, sitePlan }
                });
            }
        });

        return clashes;
    }
}

export class ZoningDetector {
    private readonly NIGHTCLUB_SCHOOL_DISTANCE = 200;
    private readonly RESIDENTIAL_STADIUM_DISTANCE = 150;
    private readonly RESIDENTIAL_NIGHTCLUB_DISTANCE = 150;

    detect(buildings: Building[]): Clash[] {
        const clashes: Clash[] = [];

        //group buildings by type
        const schools = buildings.filter(b => b.type === 'School');
        const nightclubs = buildings.filter(b => b.type === 'Nightclub');
        const stadiums = buildings.filter(b => b.type === 'Stadium');
        const residentials = buildings.filter(b => b.type === 'ResidentialBuilding');

        //Rule 1: Nightclubs must be 200+ units from schools
        nightclubs.forEach(nightclub => {
            schools.forEach(school => {
                const distance = GeometryUtils.getMinDistanceBetweenBuildings(nightclub, school);
                if (distance < this.NIGHTCLUB_SCHOOL_DISTANCE) {
                    clashes.push({
                        type: 'ZoningViolation',
                        description: `Nightclub "${nightclub.name}" is too close to school "${school.name}" (${distance.toFixed(1)} units, minimum ${this.NIGHTCLUB_SCHOOL_DISTANCE} required).`,
                        buildings: [nightclub.name, school.name],
                        details: { distance, required: this.NIGHTCLUB_SCHOOL_DISTANCE }
                    });
                }
            });
        });

        //Rule 2: Stadiums must be 150+ units from residential buildings
        stadiums.forEach(stadium => {
            residentials.forEach(residential => {
                const distance = GeometryUtils.getMinDistanceBetweenBuildings(stadium, residential);
                if (distance < this.RESIDENTIAL_STADIUM_DISTANCE) {
                    clashes.push({
                        type: 'ZoningViolation',
                        description: `Stadium "${stadium.name}" is too close to residential building "${residential.name}" (${distance.toFixed(1)} units, minimum ${this.RESIDENTIAL_STADIUM_DISTANCE} required).`,
                        buildings: [stadium.name, residential.name],
                        details: { distance, required: this.RESIDENTIAL_STADIUM_DISTANCE }
                    });
                }
            });
        });

        //Rule 3: Nightclubs must be 150+ units from residential buildings
        nightclubs.forEach(nightclub => {
            residentials.forEach(residential => {
                const distance = GeometryUtils.getMinDistanceBetweenBuildings(nightclub, residential);
                if (distance < this.RESIDENTIAL_NIGHTCLUB_DISTANCE) {
                    clashes.push({
                        type: 'ZoningViolation',
                        description: `Nightclub "${nightclub.name}" is too close to residential building "${residential.name}" (${distance.toFixed(1)} units, minimum ${this.RESIDENTIAL_NIGHTCLUB_DISTANCE} required).`,
                        buildings: [nightclub.name, residential.name],
                        details: { distance, required: this.RESIDENTIAL_NIGHTCLUB_DISTANCE }
                    });
                }
            });
        });

        return clashes;
    }
}


