import { describe, expect, it } from 'vitest';
import { getNumberFieldValidations } from './form';
import { PropertyFormat, RawPropertyWithValue } from '../models';

describe('getNumberFieldValidations', () => {
  it('should return empty object for empty properties array', () => {
    const validations = getNumberFieldValidations([]);
    expect(validations).toEqual({});
  });

  it('should return empty object when no number properties exist', () => {
    const properties: RawPropertyWithValue[] = [
      { id: '1', key: 'name', name: 'Name', format: PropertyFormat.Text, text: 'Test' },
      { id: '2', key: 'email', name: 'Email', format: PropertyFormat.Email, email: 'test@example.com' },
      { id: '3', key: 'date', name: 'Date', format: PropertyFormat.Date, date: '2024-01-01' },
    ];
    const validations = getNumberFieldValidations(properties);
    expect(validations).toEqual({});
  });

  it('should create validators for number properties', () => {
    const properties: RawPropertyWithValue[] = [
      { id: '1', key: 'age', name: 'Age', format: PropertyFormat.Number, number: 25 },
      { id: '2', key: 'price', name: 'Price', format: PropertyFormat.Number, number: 99.99 },
      { id: '3', key: 'name', name: 'Name', format: PropertyFormat.Text, text: 'Test' },
    ];
    const validations = getNumberFieldValidations(properties);
    
    expect(Object.keys(validations)).toEqual(['age', 'price']);
    expect(typeof validations.age).toBe('function');
    expect(typeof validations.price).toBe('function');
  });

  it('should validate valid number strings', () => {
    const properties: RawPropertyWithValue[] = [
      { id: '1', key: 'amount', name: 'Amount', format: PropertyFormat.Number, number: 0 },
    ];
    const validations = getNumberFieldValidations(properties);
    
    expect(validations.amount('123')).toBeUndefined();
    expect(validations.amount('0')).toBeUndefined();
    expect(validations.amount('-45')).toBeUndefined();
    expect(validations.amount('12.34')).toBeUndefined();
    expect(validations.amount('-99.99')).toBeUndefined();
    expect(validations.amount('1e5')).toBeUndefined(); // Scientific notation
  });

  it('should return error for invalid number strings', () => {
    const properties: RawPropertyWithValue[] = [
      { id: '1', key: 'amount', name: 'Amount', format: PropertyFormat.Number, number: 0 },
    ];
    const validations = getNumberFieldValidations(properties);
    
    expect(validations.amount('abc')).toBe('Value must be a number');
    expect(validations.amount('12abc')).toBe('Value must be a number');
    expect(validations.amount('12.34.56')).toBe('Value must be a number');
    expect(validations.amount('')).toBeUndefined(); // Empty string is valid
    expect(validations.amount('NaN')).toBe('Value must be a number');
    expect(validations.amount('Infinity')).toBeUndefined(); // Infinity is a valid number
  });

  it('should handle non-string values', () => {
    const properties: RawPropertyWithValue[] = [
      { id: '1', key: 'amount', name: 'Amount', format: PropertyFormat.Number, number: 0 },
    ];
    const validations = getNumberFieldValidations(properties);
    
    expect(validations.amount(123)).toBeUndefined();
    expect(validations.amount(null)).toBeUndefined();
    expect(validations.amount(undefined)).toBeUndefined();
    expect(validations.amount(true)).toBeUndefined();
    expect(validations.amount(false)).toBeUndefined();
    expect(validations.amount({})).toBeUndefined();
    expect(validations.amount([])).toBeUndefined();
  });

  it('should handle whitespace in number strings', () => {
    const properties: RawPropertyWithValue[] = [
      { id: '1', key: 'amount', name: 'Amount', format: PropertyFormat.Number, number: 0 },
    ];
    const validations = getNumberFieldValidations(properties);
    
    expect(validations.amount(' 123 ')).toBeUndefined(); // Trimmed by Number()
    expect(validations.amount('  45.67  ')).toBeUndefined();
    expect(validations.amount(' ')).toBeUndefined(); // Number(' ') === 0, which is valid
  });

  it('should handle multiple number properties independently', () => {
    const properties: RawPropertyWithValue[] = [
      { id: '1', key: 'price', name: 'Price', format: PropertyFormat.Number, number: 100 },
      { id: '2', key: 'quantity', name: 'Quantity', format: PropertyFormat.Number, number: 5 },
      { id: '3', key: 'discount', name: 'Discount', format: PropertyFormat.Number, number: 0.15 },
    ];
    const validations = getNumberFieldValidations(properties);
    
    expect(validations.price('100')).toBeUndefined();
    expect(validations.price('abc')).toBe('Value must be a number');
    
    expect(validations.quantity('5')).toBeUndefined();
    expect(validations.quantity('five')).toBe('Value must be a number');
    
    expect(validations.discount('0.15')).toBeUndefined();
    expect(validations.discount('15%')).toBe('Value must be a number');
  });
});