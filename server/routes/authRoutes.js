import e from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { User } from '../models/models.js';

const SECRET_CODE = process.env.SECRET_CODE;
const router = e.Router();

router.post('/api/register', async (req, res) => {
    if (!req.body || !req.body.email || !req.body.password) {
        return res.status(400).json({ message: "Email and password required" });
    }

    if (req.body.secret_code !== SECRET_CODE) {
        return res.status(400).json({ message: "Your secret code doesn't match with our records. Contact the administrator for the secret code!" })
    }

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        });

        const result = await user.save();
        res.status(201).json({
            message: "User Created Successfully",
            result,
        });

    } catch (error) {
        res.status(500).json({
            error: "Error creating user",
            message: error.message,
        });
    }
});


router.post('/api/login', async (req, res) => {
    try {
        // check if email exists
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({
                message: "Email not found",
            });
        }

        // compare the password entered and the hashed password found
        const passwordCheck = await bcrypt.compare(req.body.password, user.password);

        if (!passwordCheck) {
            return res.status(400).json({
                message: "Passwords does not match",
            });
        }

        //   create JWT token
        const token = jwt.sign(
            {
                userName: user.name,
                userEmail: user.email,
            },
            process.env.JWT_SECRET || "RANDOM-TOKEN", // Use env variable for secret
            { expiresIn: "24h" }
        );

        //   return success res
        res.status(200).json({
            message: "Login Successful",
            email: user.email,
            token,
        });

    } catch (error) {
        res.status(500).json({
            message: "Error during login",
            error: error.message,
        });
    }
})

export default router;