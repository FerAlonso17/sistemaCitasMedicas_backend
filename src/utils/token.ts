export const generateToken = () => {
    // Generate random token string.
    const randomToken = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiry time to 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    return { token: randomToken, expiresAt };
};