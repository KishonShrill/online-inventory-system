import { describe, test, expect } from "vitest";
import { validateRecord } from "../../src/helpers/validate";

describe("validateRecord", () => {

    test("valid full name without middle initial", () => {
        const result = validateRecord("Juan Cruz", "09123456789", "2099-01-01");
        expect(result.validUserName).toBe(true);
    });

    test("valid full name without middle initial (<2 words)", () => {
        const result = validateRecord("Juan Dela Cruz", "09123456789", "2099-01-01");
        expect(result.validUserName).toBe(true);
    });

    test("valid full name with middle initial (no dot)", () => {
        const result = validateRecord("Juan D Cruz", "09123456789", "2099-01-01");
        expect(result.validUserName).toBe(true);
    });

    test("valid full name with middle initial (with dot)", () => {
        const result = validateRecord("Juan D. Cruz", "09123456789", "2099-01-01");
        expect(result.validUserName).toBe(true);
    });

    test("invalid - lowercase first name", () => {
        const result = validateRecord("juan Cruz", "09123456789", "2099-01-01");
        expect(result.validUserName).toBe(false);
    });

    test("invalid - only one word", () => {
        const result = validateRecord("Juan", "09123456789", "2099-01-01");
        expect(result.validUserName).toBe(false);
    });

    test("invalid - name with more than 3 parts", () => {
        const result = validateRecord("Juan D. de la Cruz", "09123456789", "2099-01-01");
        expect(result.validUserName).toBe(false);
    });

    test("invalid - name without spaces", () => {
        const result = validateRecord("JuanD.Cruz", "09123456789", "2099-01-01");
        expect(result.validUserName).toBe(false);
    });


    test("valid name, phone number, and future date", () => {
        const result = validateRecord("Chriscent Pingol", "09123456789", "2099-01-01");
        expect(result).toEqual({
            validUserName: true,
            validUserContact: true,
            validDate: true,
            isFullyValid: true,
        });
    });

    test("valid name, invalid phone/email, and future date", () => {
        const result = validateRecord("Chriscent Pingol", "notAContact", "2099-01-01");
        expect(result.validUserContact).toBe(false);
        expect(result.isFullyValid).toBe(false);
    });

    test("valid everything but date is today", () => {
        const today = new Date().toISOString().split("T")[0];
        const result = validateRecord("Chriscent Pingol", "09123456789", today);
        expect(result.validDate).toBe(false);
        expect(result.isFullyValid).toBe(false);
    });

    test("invalid name format", () => {
        const result = validateRecord("chriscent", "09123456789", "2099-01-01");
        expect(result.validUserName).toBe(false);
        expect(result.isFullyValid).toBe(false);
    });
});