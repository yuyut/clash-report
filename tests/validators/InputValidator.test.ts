import { InputValidator } from '../../src/validators/InputValidator';
import { Building, SitePlan } from '../../src/models';

describe('InputValidator - Validation Rules', () => {
  let validator: InputValidator;

  beforeEach(() => {
    validator = new InputValidator();
  });

  it('valid input', () => {
    const sitePlan: SitePlan = { width: 1000, length: 500 };
    const buildings: Building[] = [
      { name: "Building A", type: "Office", width: 100, length: 100, x: 0, y: 0 }
    ];

    const errors = validator.validate(buildings, sitePlan);

    expect(errors.length).toBe(0);
  });


  it('missing building attributes', () => {
    const sitePlan: SitePlan = { width: 1000, length: 500 };
    const buildings: Building[] = [
      { name: "", type: undefined as any, width: 100, length: 100, x: 0, y: 0 }
    ];

    const errors = validator.validate(buildings, sitePlan);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.message.includes('missing a name'))).toBe(true);
    expect(errors.some(e => e.message.includes('missing a type'))).toBe(true);
  });


  it('invalid dimensions', () => {
    const sitePlan: SitePlan = { width: 1000, length: 500 };
    const buildings: Building[] = [
      { name: "Building", type: "Office", width: -50, length: 0, x: 0, y: 0 }
    ];

    const errors = validator.validate(buildings, sitePlan);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.message.includes('width must be positive'))).toBe(true);
    expect(errors.some(e => e.message.includes('length must be positive'))).toBe(true);
  });

  it('invalid positions', () => {
    const sitePlan: SitePlan = { width: 1000, length: 500 };
    const buildings: Building[] = [
      { name: "Building", type: "Office", width: 100, length: 100, x: -10, y: -5 }
    ];

    const errors = validator.validate(buildings, sitePlan);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.message.includes('x position must be >=0'))).toBe(true);
    expect(errors.some(e => e.message.includes('y position must be >=0'))).toBe(true);
  });


  it('invalid site plan dimensions', () => {
    const sitePlan: SitePlan = { width: 0, length: -100 };
    const buildings: Building[] = [];

    const errors = validator.validate(buildings, sitePlan);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.message.includes('Site plan width'))).toBe(true);
    expect(errors.some(e => e.message.includes('Site plan length'))).toBe(true);
  });
});
