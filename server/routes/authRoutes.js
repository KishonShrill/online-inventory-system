import e from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { User } from '../models/models.js';


const router = e.Router();

router.post('/api/register', async (req, res) => {
    if (!req.body || !req.body.email || !req.body.password) {
        return res.status(400).json({ message: "Email and password required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
        return res.status(400).json({ message: "Email already registered" });
    }

    // Determine role based on secret code
    const SECRET_CODES = {
        [process.env.SECRET_CODE_ADMIN]: 'admin',
        [process.env.SECRET_CODE_MANAGER]: 'manager',
        [process.env.SECRET_CODE_EMPLOYEE]: 'employee',
    };

    const role = SECRET_CODES[secret_code];
    if (!role) {
        return res.status(400).json({ message: "Invalid secret code. Contact the administrator." });
    }

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            role,
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
                userRole: user.role,
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