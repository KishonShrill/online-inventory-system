import express from 'express';
import { ResultAsync, errAsync } from 'neverthrow';
import { User } from '../models/index.js'; // Adjust path to your actual User model
import { user_verify, requireRole, ROLE_HIERARCHY } from '../helpers/auth.js';

const router = express.Router();

// ==========================================
// GET /api/users/me - Fetch my account
// ==========================================
router.get('/api/users/me', user_verify, async (req, res) => {
    // #swagger.tags = ['Users']
    // #swagger.description = 'Fetch information of the currently logged-in user'

    await ResultAsync.fromPromise(
        User.findOne({ email: req.user.user_email }).select('-password -__v').exec(),
        (error) => new Error(`Database fetch failed: ${error.message}`)
    )
        .match(
            (user) => res.status(200).json({ user }),
            (error) => {
                console.error('Error fetching user profile:', error);
                res.status(500).json({ message: 'Failed to retrieve profile.', error: error.message });
            }
        );
});

// ==========================================
// GET /api/users - Fetch all users
// ==========================================
router.get('/api/users', user_verify, requireRole('manager'), async (req, res) => {
    // #swagger.tags = ['Users']
    // #swagger.description = 'Fetch all registered users (Requires Manager or Admin clearance)'

    const currentUserRole = req.user.role || req.user.userRole;

    // Failsafe check to ensure viewer/operator cannot hit this endpoint
    if (ROLE_HIERARCHY[currentUserRole] < ROLE_HIERARCHY.manager) {
        return res.status(403).json({ message: "Access denied. Insufficient clearance." });
    }

    await ResultAsync.fromPromise(
        User.find({}).select('-password -__v').sort({ createdAt: -1 }).exec(),
        (error) => new Error(`Database fetch failed: ${error.message}`)
    )
        .match(
            (users) => res.status(200).json({ users }),
            (error) => {
                console.error('Error fetching system users:', error);
                res.status(500).json({ message: 'Failed to retrieve personnel registry.', error: error.message });
            }
        );
});

// ==========================================
// PUT /api/users/:id/role - Update user clearance level
// ==========================================
router.put('/api/users/:id/role', user_verify, requireRole('manager'), async (req, res) => {
    const { role: newRole } = req.body;
    const targetUserId = req.params.id;

    const currentUserId = req.user.userId || req.user.user_id;
    const currentUserRole = req.user.userRole || req.user.role;

    // 1. Base Validation Checks
    if (!ROLE_HIERARCHY[newRole]) {
        return res.status(400).json({ message: "Invalid clearance level specified." });
    }

    if (targetUserId === currentUserId.toString()) {
        return res.status(403).json({ message: "You cannot modify your own clearance level." });
    }

    // NEW: If the user is NOT an admin, they strictly cannot grant roles equal/higher to their own.
    if (currentUserRole !== 'admin') {
        if (ROLE_HIERARCHY[newRole] >= ROLE_HIERARCHY[currentUserRole]) {
            return res.status(403).json({ message: "You cannot grant a clearance level equal to or higher than your own." });
        }
    }

    // 2. Fetch and strictly validate against target's current role
    await ResultAsync.fromPromise(
        User.findById(targetUserId).exec(),
        (error) => new Error(`Database error: ${error.message}`)
    )
        .andThen((targetUser) => {
            if (!targetUser) return errAsync(new Error("NOT_FOUND"));

            // NEW: If the user is NOT an admin, they strictly cannot manage people equal/higher to them.
            // Admins, however, bypass this to manage peers.
            if (currentUserRole !== 'admin') {
                if (ROLE_HIERARCHY[targetUser.role] >= ROLE_HIERARCHY[currentUserRole]) {
                    return errAsync(new Error("FORBIDDEN"));
                }
            }

            targetUser.role = newRole;

            return ResultAsync.fromPromise(
                targetUser.save(),
                (error) => new Error(`Failed to save updated clearance: ${error.message}`)
            );
        })
        .match(
            (savedUser) => {
                res.status(200).json({
                    message: "Clearance level updated successfully.",
                    user: {
                        _id: savedUser._id,
                        name: savedUser.name,
                        email: savedUser.email,
                        role: savedUser.role
                    }
                });
            },
            (error) => {
                if (error.message === "NOT_FOUND") {
                    return res.status(404).json({ message: "Target personnel not found in registry." });
                }
                if (error.message === "FORBIDDEN") {
                    return res.status(403).json({ message: "You lack the required clearance to manage this user." });
                }
                console.error('Error updating clearance:', error);
                res.status(500).json({ message: 'Internal server error.', error: error.message });
            }
        );
});

// ==========================================
// PUT /api/users/:id/approve - Approve a pending user
// ==========================================
router.put('/api/users/:id/approve', user_verify, requireRole('manager'), async (req, res) => {
    const targetUserId = req.params.id;

    await ResultAsync.fromPromise(
        User.findById(targetUserId).exec(),
        (error) => new Error(`Database error: ${error.message}`)
    )
        .andThen((targetUser) => {
            if (!targetUser) return errAsync(new Error("NOT_FOUND"));

            targetUser.isApproved = true; // Grant access

            return ResultAsync.fromPromise(
                targetUser.save(),
                (error) => new Error(`Failed to save approval status: ${error.message}`)
            );
        })
        .match(
            (savedUser) => {
                res.status(200).json({
                    message: "User approved for system access.",
                    user: {
                        _id: savedUser._id,
                        name: savedUser.name,
                        isApproved: savedUser.isApproved
                    }
                });
            },
            (error) => {
                if (error.message === "NOT_FOUND") {
                    return res.status(404).json({ message: "Target personnel not found." });
                }
                console.error('Error approving user:', error);
                res.status(500).json({ message: 'Internal server error.', error: error.message });
            }
        );
});

// ==========================================
// DELETE /api/users/:id - Revoke Access / Delete User
// ==========================================
router.delete('/api/users/:id', user_verify, requireRole('admin'), async (req, res) => {
    // #swagger.tags = ['Users']
    // #swagger.description = 'Permanently delete a user from the CDIIS network (Admin Only)'

    const targetUserId = req.params.id;
    const currentUserId = req.user.userId || req.user.user_id;

    if (targetUserId === currentUserId.toString()) {
        return res.status(403).json({ message: "You cannot terminate your own administrative session." });
    }

    await ResultAsync.fromPromise(
        User.findByIdAndDelete(targetUserId).exec(),
        (error) => new Error(`Database error: ${error.message}`)
    )
        .match(
            (deletedUser) => {
                if (!deletedUser) {
                    return res.status(404).json({ message: "Target personnel not found or already removed." });
                }
                res.status(200).json({
                    message: `Network access for ${deletedUser.name || deletedUser.email} has been permanently revoked.`
                });
            },
            (error) => {
                console.error('Error terminating personnel access:', error);
                res.status(500).json({ message: 'Internal server error.', error: error.message });
            }
        );
});

export default router;
