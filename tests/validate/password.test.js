import { describe, it, expect } from "vitest";
import { validatePassword } from "../../src/helpers/validate";

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