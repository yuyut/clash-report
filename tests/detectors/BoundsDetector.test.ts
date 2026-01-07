import { BoundsDetector } from '../../src/detectors/ClashDetector';
import { Building, SitePlan } from '../../src/models';

describe('BoundsDetector', () => {
  let detector: BoundsDetector;
  let sitePlan: SitePlan;

  beforeEach(() => {
    detector = new BoundsDetector();
    sitePlan = { width: 1000, length: 500 };
  });

  it('within bounds', () => {
    const buildings: Building[] = [
      { name: "Building A", type: "Office", width: 100, length: 100, x: 100, y: 100 }
    ];

    const clashes = detector.detect(buildings, sitePlan);
    expect(clashes.length).toBe(0);
  });


  it('exceeds boundary', () => {
    const buildings: Building[] = [
      { name: "Building A", type: "Office", width: 2000, length: 1000, x: 100, y: 100 }
    ];

    const clashes = detector.detect(buildings, sitePlan);

    expect(clashes.length).toBe(1);
    expect(clashes[0]!.type).toBe('OutOfBounds');
  });


  it('negative position', () => {
    const buildings: Building[] = [
      { name: "Building A", type: "Office", width: 100, length: 100, x: -10, y: -100 }
    ];

    const clashes = detector.detect(buildings, sitePlan);

    expect(clashes.length).toBe(1);
    expect(clashes[0]!.type).toBe('OutOfBounds');
  });

  

  it('multiple buildings with some exceed boundary', () => {
    const buildings: Building[] = [
      { name: "Building A", type: "Office", width: 2000, length: 1000, x: -100, y: 100 }, 
      { name: "Building B", type: "Office", width: 1000, length: 100, x: 100, y: 100 }, 
      { name: "Building C", type: "Office", width: 100, length: 100, x: 100, y: 100 }   // OK
    ];

    const clashes = detector.detect(buildings, sitePlan);

    expect(clashes.length).toBe(2);
    const buildingsWithClashes = clashes.flatMap(c => c.buildings);
    expect(buildingsWithClashes).toContain('Building A');
    expect(buildingsWithClashes).toContain('Building B');
    expect(buildingsWithClashes).not.toContain('Building C');
  });

 
  it('at border, should be okay', () => {
    const buildings: Building[] = [
      { name: "Edge Building", type: "Office", width: 1000, length: 500, x: 0, y: 0 }
    ];

    const clashes = detector.detect(buildings, sitePlan);

    expect(clashes.length).toBe(0);
  });

  it('empty list', () => {
    const buildings: Building[] = [];

    const clashes = detector.detect(buildings, sitePlan);

    expect(clashes.length).toBe(0);
  });
});
