import { ProximityDetector } from '../../src/detectors/ClashDetector';
import { Building } from '../../src/models';

describe('ProximityDetector', () => {
  let detector: ProximityDetector;

  beforeEach(() => {
    detector = new ProximityDetector();
  });

  it('buildings overlap', () => {
    const buildings: Building[] = [
      { name: "Building A", type: "Office", width: 100, length: 100, x: 0, y: 0 },
      { name: "Building B", type: "Office", width: 100, length: 100, x: 50, y: 50 }
    ];

    const clashes = detector.detect(buildings);

    expect(clashes.length).toBe(1);
    expect(clashes[0]!.type).toBe('Overlap');
    expect(clashes[0]!.buildings).toContain('Building A');
    expect(clashes[0]!.buildings).toContain('Building B');
    expect(clashes[0]!.description).toContain('overlap');
  });

 
  it('buildings are too close', () => {
    const buildings: Building[] = [
      { name: "Building A", type: "Office", width: 100, length: 100, x: 0, y: 0 },
      { name: "Building B", type: "Office", width: 100, length: 100, x: 105, y: 0 }
    ];

    const clashes = detector.detect(buildings);

    expect(clashes.length).toBe(1);
    expect(clashes[0]!.type).toBe('ClearanceViolation');
    expect(clashes[0]!.buildings).toContain('Building A');
    expect(clashes[0]!.buildings).toContain('Building B');
    expect(clashes[0]!.details?.distance).toBeLessThan(10);
  });


  it(' proper clearance no clash', () => {
    const buildings: Building[] = [
      { name: "Building A", type: "Office", width: 100, length: 100, x: 0, y: 0 },
      { name: "Building B", type: "Office", width: 100, length: 100, x: 110, y: 0 }
    ];

    const clashes = detector.detect(buildings);

    expect(clashes.length).toBe(0);
  });

  it('multiple clashes with multiple buildings', () => {
    const buildings: Building[] = [
      { name: "Building A", type: "Office", width: 100, length: 100, x: 0, y: 0 },
      { name: "Building B", type: "Office", width: 100, length: 100, x: 50, y: 0 },  // a b overlap
      { name: "Building C", type: "Office", width: 100, length: 100, x: 145, y: 0 }  // clearance with b
    ];

    const clashes = detector.detect(buildings);

    expect(clashes.length).toBeGreaterThan(0);
    

    const hasOverlap = clashes.some(c => c.type === 'Overlap');
    const hasClearance = clashes.some(c => c.type === 'ClearanceViolation');

    expect(hasOverlap || hasClearance).toBe(true);
  });


  it('no duplicate clashes for the same building pair', () => {
    const buildings: Building[] = [
      { name: "Building A", type: "Office", width: 100, length: 100, x: 0, y: 0 },
      { name: "Building B", type: "Office", width: 100, length: 100, x: 50, y: 50 }
    ];

    const clashes = detector.detect(buildings);

    expect(clashes.length).toBe(1);
  });

  it('empty list', () => {
    const buildings: Building[] = [];

    const clashes = detector.detect(buildings);

    expect(clashes.length).toBe(0);
  });

 

  it('single building no clash', () => {
    const buildings: Building[] = [
      { name: "Solo Building", type: "Office", width: 100, length: 100, x: 0, y: 0 }
    ];

    const clashes = detector.detect(buildings);

    expect(clashes.length).toBe(0);
  });
});
