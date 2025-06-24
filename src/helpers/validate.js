
export const validateEmail = (email) => {
    const validDomains = ['gmail.com', '@yahoo.com', 'outlook.com'];
    return validDomains.some(domain => email.endsWith(domain));
};

export const validatePassword = (password) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(password);
};