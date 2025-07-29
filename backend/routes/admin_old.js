const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'رمز الوصول مطلوب'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'رمز الوصول غير صحيح'
            });
        }
        req.user = user;
        next();
    });
};

// Admin login
router.post('/login', [
    body('username').notEmpty().withMessage('اسم المستخدم مطلوب'),
    body('password').notEmpty().withMessage('كلمة المرور مطلوبة')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'بيانات غير صحيحة',
                errors: errors.array()
            });
        }

        const { username, password } = req.body;

        // Get admin user
        const [users] = await pool.execute(`
            SELECT * FROM admin_users WHERE username = ?
        `, [username]);

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
            });
        }

        const user = users[0];

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'تم تسجيل الدخول بنجاح',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                },
                token
            }
        });

    } catch (error) {
        console.error('Error during admin login:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تسجيل الدخول'
        });
    }
});

// Get dashboard statistics
router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        // Get booking statistics
        const [bookingStats] = await pool.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
            FROM bookings
        `);

        // Get contact message statistics
        const [contactStats] = await pool.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'unread' THEN 1 ELSE 0 END) as unread,
                SUM(CASE WHEN status = 'read' THEN 1 ELSE 0 END) as read,
                SUM(CASE WHEN status = 'replied' THEN 1 ELSE 0 END) as replied
            FROM contact_messages
        `);

        // Get recent bookings
        const [recentBookings] = await pool.execute(`
            SELECT * FROM bookings 
            ORDER BY created_at DESC 
            LIMIT 5
        `);

        // Get recent contact messages
        const [recentMessages] = await pool.execute(`
            SELECT * FROM contact_messages 
            ORDER BY created_at DESC 
            LIMIT 5
        `);

        // Get monthly booking trends
        const [monthlyTrends] = await pool.execute(`
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as count
            FROM bookings 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month DESC
        `);

        res.json({
            success: true,
            data: {
                bookings: bookingStats[0],
                contacts: contactStats[0],
                recentBookings,
                recentMessages,
                monthlyTrends
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب بيانات لوحة التحكم'
        });
    }
});

// Get admin profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const [users] = await pool.execute(`
            SELECT id, username, email, role, created_at 
            FROM admin_users WHERE id = ?
        `, [req.user.id]);

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }

        res.json({
            success: true,
            data: users[0]
        });

    } catch (error) {
        console.error('Error fetching admin profile:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب الملف الشخصي'
        });
    }
});

// Update admin profile
router.put('/profile', authenticateToken, [
    body('username').optional().notEmpty().withMessage('اسم المستخدم مطلوب'),
    body('email').optional().isEmail().withMessage('البريد الإلكتروني غير صحيح')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'بيانات غير صحيحة',
                errors: errors.array()
            });
        }

        const { username, email } = req.body;
        const updateFields = [];
        const updateValues = [];

        if (username) {
            updateFields.push('username = ?');
            updateValues.push(username);
        }

        if (email) {
            updateFields.push('email = ?');
            updateValues.push(email);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'لا توجد بيانات للتحديث'
            });
        }

        updateValues.push(req.user.id);
        await pool.execute(`
            UPDATE admin_users SET ${updateFields.join(', ')} WHERE id = ?
        `, updateValues);

        // Get updated profile
        const [updatedUser] = await pool.execute(`
            SELECT id, username, email, role, created_at 
            FROM admin_users WHERE id = ?
        `, [req.user.id]);

        res.json({
            success: true,
            message: 'تم تحديث الملف الشخصي بنجاح',
            data: updatedUser[0]
        });

    } catch (error) {
        console.error('Error updating admin profile:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تحديث الملف الشخصي'
        });
    }
});

// Change admin password
router.put('/change-password', authenticateToken, [
    body('currentPassword').notEmpty().withMessage('كلمة المرور الحالية مطلوبة'),
    body('newPassword').isLength({ min: 6 }).withMessage('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'بيانات غير صحيحة',
                errors: errors.array()
            });
        }

        const { currentPassword, newPassword } = req.body;

        // Get current user
        const [users] = await pool.execute(`
            SELECT * FROM admin_users WHERE id = ?
        `, [req.user.id]);

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }

        const user = users[0];

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: 'كلمة المرور الحالية غير صحيحة'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await pool.execute(`
            UPDATE admin_users SET password = ? WHERE id = ?
        `, [hashedPassword, req.user.id]);

        res.json({
            success: true,
            message: 'تم تغيير كلمة المرور بنجاح'
        });

    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تغيير كلمة المرور'
        });
    }
});

// Create new admin user (super admin only)
router.post('/users', authenticateToken, [
    body('username').notEmpty().withMessage('اسم المستخدم مطلوب'),
    body('email').isEmail().withMessage('البريد الإلكتروني غير صحيح'),
    body('password').isLength({ min: 6 }).withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
    body('role').isIn(['admin', 'moderator']).withMessage('الدور غير صحيح')
], async (req, res) => {
    try {
        // Check if user is super admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'ليس لديك صلاحية لإنشاء مستخدمين جدد'
            });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'بيانات غير صحيحة',
                errors: errors.array()
            });
        }

        const { username, email, password, role } = req.body;

        // Check if username or email already exists
        const [existingUsers] = await pool.execute(`
            SELECT * FROM admin_users WHERE username = ? OR email = ?
        `, [username, email]);

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'اسم المستخدم أو البريد الإلكتروني مستخدم بالفعل'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new admin user
        const [result] = await pool.execute(`
            INSERT INTO admin_users (username, email, password, role)
            VALUES (?, ?, ?, ?)
        `, [username, email, hashedPassword, role]);

        // Get created user
        const [newUser] = await pool.execute(`
            SELECT id, username, email, role, created_at 
            FROM admin_users WHERE id = ?
        `, [result.insertId]);

        res.status(201).json({
            success: true,
            message: 'تم إنشاء المستخدم بنجاح',
            data: newUser[0]
        });

    } catch (error) {
        console.error('Error creating admin user:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء إنشاء المستخدم'
        });
    }
});

// Get all admin users
router.get('/users', authenticateToken, async (req, res) => {
    try {
        const [users] = await pool.execute(`
            SELECT id, username, email, role, created_at 
            FROM admin_users 
            ORDER BY created_at DESC
        `);

        res.json({
            success: true,
            data: users
        });

    } catch (error) {
        console.error('Error fetching admin users:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب المستخدمين'
        });
    }
});

// Logout (client-side token removal)
router.post('/logout', authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: 'تم تسجيل الخروج بنجاح'
    });
});

// Verify token
router.get('/verify', authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: 'الرمز صحيح',
        user: req.user
    });
});

module.exports = router; 