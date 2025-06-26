import jwt from 'jsonwebtoken';

const auth = async (req, res, next) => {
    try {
        const token = await req.headers.authorization.split(" ")[1];
        const decodedToken = await jwt.verify(token, "RANDOM-TOKEN");
        const user = await decodedToken;
        req.user = user;
        next();

    } catch (err) {
        res.status(401).json({
            error: new Error("Invalid request!"),
            message: err.message,
        });
    }
};

export default auth;