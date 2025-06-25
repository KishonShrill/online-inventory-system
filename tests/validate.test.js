import { describe, test, it, expect } from "vitest";
import { validateEmail, validatePassword } from "../src/helpers/validate";

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

describe('validatePassword', () => {

    it('should return isFullyValid: true for a password that meets all criteria', () => {
        const result = validatePassword('StrongP@ss1');
        expect(result.isFullyValid).toBe(true);
        expect(result).toEqual({
            hasMinLength: true,
            hasUppercase: true,
            hasLowercase: true,
            hasNumber: true,
            hasSpecialChar: true,
            isFullyValid: true,
        });
    });

    it('should return correct flags for a password that is too short', () => {
        const result = validatePassword('Sh0rt@');
        expect(result.isFullyValid).toBe(false);
        expect(result.hasMinLength).toBe(false);
        expect(result.hasUppercase).toBe(true);
        expect(result.hasLowercase).toBe(true);
        expect(result.hasNumber).toBe(true);
        expect(result.hasSpecialChar).toBe(true);
    });

    it('should return correct flags for a password missing an uppercase letter', () => {
        const result = validatePassword('nouppercase1@');
        expect(result.isFullyValid).toBe(false);
        expect(result.hasUppercase).toBe(false);
    });

    it('should return correct flags for a password missing a lowercase letter', () => {
        const result = validatePassword('NOLOWERCASE1@');
        expect(result.isFullyValid).toBe(false);
        expect(result.hasLowercase).toBe(false);
    });

    it('should return correct flags for a password missing a number', () => {
        const result = validatePassword('NoNumberPass@');
        expect(result.isFullyValid).toBe(false);
        expect(result.hasNumber).toBe(false);
    });

    it('should return correct flags for a password missing a special character', () => {
        const result = validatePassword('NoSpecial123');
        expect(result.isFullyValid).toBe(false);
        expect(result.hasSpecialChar).toBe(false);
    });

    it('should return all false flags (except length) for a weak password', () => {
        const result = validatePassword('weakpassword');
        expect(result.isFullyValid).toBe(false);
        expect(result).toEqual({
            hasMinLength: true,
            hasUppercase: false,
            hasLowercase: true,
            hasNumber: false,
            hasSpecialChar: false,
            isFullyValid: false,
        });
    });

    it('should handle empty or null passwords gracefully', () => {
        const result = validatePassword('');
        expect(result.isFullyValid).toBe(false);
        expect(result.hasMinLength).toBe(false);
        expect(result.hasUppercase).toBe(false);
        expect(result.hasLowercase).toBe(false);
        expect(result.hasNumber).toBe(false);
        expect(result.hasSpecialChar).toBe(false);

        const nullResult = validatePassword(null);
        expect(nullResult.isFullyValid).toBe(false);
    });
});