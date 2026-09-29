import { describe, it, expect } from 'vitest';
import { validateMayottePhone } from '../utils/phoneValidator';

describe('validateMayottePhone', () => {
  it('should accept valid local mobile numbers', () => {
    expect(validateMayottePhone('0639123456').isValid).toBe(true);
    expect(validateMayottePhone('06 39 12 34 56').isValid).toBe(true);
    expect(validateMayottePhone('06.39.12.34.56').isValid).toBe(true);
    expect(validateMayottePhone('06-39-12-34-56').isValid).toBe(true);
  });

  it('should accept valid local landline numbers', () => {
    expect(validateMayottePhone('0269123456').isValid).toBe(true);
    expect(validateMayottePhone('02 69 12 34 56').isValid).toBe(true);
  });

  it('should accept valid international numbers', () => {
    expect(validateMayottePhone('+262639123456').isValid).toBe(true);
    expect(validateMayottePhone('+262 639 12 34 56').isValid).toBe(true);
    expect(validateMayottePhone('00262639123456').isValid).toBe(true);
    expect(validateMayottePhone('00262 639 12 34 56').isValid).toBe(true);
  });

  it('should reject invalid formats and non-Mayotte prefixes', () => {
    // France mainland mobile
    expect(validateMayottePhone('0612345678').isValid).toBe(false);
    // France mainland landline
    expect(validateMayottePhone('0123456789').isValid).toBe(false);
    // Réunion landline
    expect(validateMayottePhone('0262123456').isValid).toBe(false);
    // Non-Mayotte international indicatives
    expect(validateMayottePhone('+33612345678').isValid).toBe(false);
    expect(validateMayottePhone('0033612345678').isValid).toBe(false);
  });

  it('should reject letters and invalid characters', () => {
    expect(validateMayottePhone('063912345a').isValid).toBe(false);
    expect(validateMayottePhone('06391234@6').isValid).toBe(false);
  });

  it('should reject incorrect digit counts', () => {
    // Too short
    expect(validateMayottePhone('063912345').isValid).toBe(false);
    // Too long
    expect(validateMayottePhone('06391234567').isValid).toBe(false);
  });

  it('should handle optional empty input', () => {
    expect(validateMayottePhone('').isValid).toBe(true);
    expect(validateMayottePhone(null).isValid).toBe(true);
    expect(validateMayottePhone(undefined).isValid).toBe(true);
  });
});
