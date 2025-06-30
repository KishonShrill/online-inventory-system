import { describe, test, expect } from "vitest";
import { validateEmail } from "../../src/helpers/validate";

describe('validateEmail', () => {

    test('should return true for valid email addresses', () => {
        expect(validateEmail('test@example.com')).toBe(true);
        expect(validateEmail('firstname.lastname@example.co.uk')).toBe(true);
        expect(validateEmail('email@subdomain.example.com')).toBe(true);
        expect(validateEmail('1234567890@example.com')).toBe(true);
        expect(validateEmail('email@example-one.com')).toBe(true);
        expect(validateEmail('email@example.name')).toBe(true);
        expect(validateEmail('email@example.museum')).toBe(true);
        expect(validateEmail('email@example.co.jp')).toBe(true);
    });

    test('should return false for invalid email addresses', () => {
        expect(validateEmail('_______@example.com')).toBe(false);
        expect(validateEmail('plainaddress')).toBe(false);
        expect(validateEmail('#@%^%#$@#$@#.com')).toBe(false);
        expect(validateEmail('@example.com')).toBe(false);
        expect(validateEmail('email.example.com')).toBe(false);
        expect(validateEmail('email@example@example.com')).toBe(false);
        expect(validateEmail('.email@example.com')).toBe(false);
        expect(validateEmail('email.@example.com')).toBe(false);
        expect(validateEmail('email..email@example.com')).toBe(false);
        expect(validateEmail('email@example.com (Joe Smith)')).toBe(false);
        expect(validateEmail('email@example')).toBe(false);
        expect(validateEmail('email@-example.com')).toBe(false);
        expect(validateEmail('email@111.222.333.44445')).toBe(false);
        expect(validateEmail('email@example..com')).toBe(false);
        expect(validateEmail('Abc..123@example.com')).toBe(false);
        expect(validateEmail('“email”@example.com')).toBe(false);
        expect(validateEmail('Joe Smith <email@example.com>')).toBe(false);
        expect(validateEmail(' ')).toBe(false);
        expect(validateEmail('')).toBe(false);
    });

    test('should return false for non-string inputs', () => {
        expect(validateEmail(null)).toBe(false);
        expect(validateEmail(undefined)).toBe(false);
        expect(validateEmail(12345)).toBe(false);
        expect(validateEmail({})).toBe(false);
        expect(validateEmail([])).toBe(false);
    });
})