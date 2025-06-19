const { validateToken } = require("../services/authentication");

function checkAuthenticationCookie(cookieName) {
    return (req, res, next) => {
        const tokenCookieVal = req.cookies[cookieName];
        if (!tokenCookieVal) return next();
        try {
            const userPayload = validateToken(tokenCookieVal);
            console.log("User from cookie middleware:", req.user);

            req.user = userPayload;
        }
        catch (error) { };
        return next();
    }
}

module.exports = {
    checkAuthenticationCookie,
} 