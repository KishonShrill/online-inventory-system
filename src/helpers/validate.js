import PropTypes from "prop-types";

/**
 * @param {string} email
 * @returns {boolean}
 */
export const validateEmail = (email) => {
    if (typeof email !== 'string') return false;
    // A commonly used and practical regex for email validation.
    const regex = /^(?!.*\.\.)(?!.*["'“”‘’])(?!.*@.*@)[a-zA-Z0-9]+(?:[._-][a-zA-Z0-9]+)*@[a-zA-Z][^\s@."']*(\.[^\s@"']+)+$/;
    return regex.test(String(email).toLowerCase());
};

/**
 * @param {string} password
 * @returns {{hasMinLength: boolean, hasUppercase: boolean, hasLowercase: boolean, hasNumber: boolean, hasSpecialChar: boolean, isFullyValid: boolean}}
 */
export const validatePassword = (password) => {
    const p = String(password || ''); // Ensure password is a string and handle null/undefined
    const validations = {
        hasMinLength: p.length >= 8,
        hasUppercase: /[A-Z]/.test(p),
        hasLowercase: /[a-z]/.test(p),
        hasNumber: /\d/.test(p),
        hasSpecialChar: /[@$!%*?&]/.test(p),
    };
    // Add a convenience property to check if all validations passed
    validations.isFullyValid = Object.values(validations).every(Boolean);

    return validations;
};

validateEmail.propTypes = {email: PropTypes.string.isRequired}
validatePassword.propTypes = {password: PropTypes.string.isRequired}
