export type BuildingType =  
'School' 
| 'Nightclub' 
| 'Stadium' 
| 'ResidentialBuilding' 
| 'Office';

export interface Building {
    name: string;
    type: BuildingType;
    width: number;
    length: number;
    x: number;
    y: number;
}

export interface BoundingBox {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
}
