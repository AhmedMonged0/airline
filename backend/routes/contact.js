const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const router = express.Router();

// Get all contact messages
router.get('/', async (req, res) => {
    try {
        const rows = await db.all(`
            SELECT * FROM contact_messages 
            ORDER BY created_at DESC
        `);
        
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching contact messages:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب رسائل التواصل'
        });
    }
});

// Get contact message by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const row = await db.get(`
            SELECT * FROM contact_messages WHERE id = ?
        `, [id]);
        
        if (!row) {
            return res.status(404).json({
                success: false,
                message: 'الرسالة غير موجودة'
            });
        }
        
        res.json({
            success: true,
            data: row
        });
    } catch (error) {
        console.error('Error fetching contact message:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب الرسالة'
        });
    }
});

// Create new contact message
router.post('/', [
    body('name').notEmpty().withMessage('الاسم مطلوب'),
    body('email').isEmail().withMessage('البريد الإلكتروني غير صحيح'),
    body('subject').notEmpty().withMessage('الموضوع مطلوب'),
    body('message').notEmpty().withMessage('الرسالة مطلوبة')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'بيانات غير صحيحة',
                errors: errors.array()
            });
        }

        const { name, email, subject, message } = req.body;

        // Insert message into database
        const result = await db.run(`
            INSERT INTO contact_messages (name, email, subject, message)
            VALUES (?, ?, ?, ?)
        `, [name, email, subject, message]);

        // Get the created message
        const newMessage = await db.get(`
            SELECT * FROM contact_messages WHERE id = ?
        `, [result.id]);

        res.status(201).json({
            success: true,
            message: 'تم إرسال الرسالة بنجاح',
            data: newMessage
        });

    } catch (error) {
        console.error('Error creating contact message:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء إرسال الرسالة'
        });
    }
});

// Update message status
router.put('/:id', [
    body('status').optional().isIn(['unread', 'read', 'replied']).withMessage('حالة الرسالة غير صحيحة')
], async (req, res) => {
    try {
        const { id } = req.params;
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'بيانات غير صحيحة',
                errors: errors.array()
            });
        }

        // Check if message exists
        const existingMessage = await db.get(`
            SELECT * FROM contact_messages WHERE id = ?
        `, [id]);

        if (!existingMessage) {
            return res.status(404).json({
                success: false,
                message: 'الرسالة غير موجودة'
            });
        }

        // Update message status
        await db.run(`
            UPDATE contact_messages SET status = ? WHERE id = ?
        `, [req.body.status, id]);

        // Get updated message
        const updatedMessage = await db.get(`
            SELECT * FROM contact_messages WHERE id = ?
        `, [id]);

        res.json({
            success: true,
            message: 'تم تحديث حالة الرسالة بنجاح',
            data: updatedMessage
        });

    } catch (error) {
        console.error('Error updating message status:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تحديث حالة الرسالة'
        });
    }
});

// Delete contact message
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if message exists
        const existingMessage = await db.get(`
            SELECT * FROM contact_messages WHERE id = ?
        `, [id]);

        if (!existingMessage) {
            return res.status(404).json({
                success: false,
                message: 'الرسالة غير موجودة'
            });
        }

        // Delete message
        await db.run(`
            DELETE FROM contact_messages WHERE id = ?
        `, [id]);

        res.json({
            success: true,
            message: 'تم حذف الرسالة بنجاح'
        });

    } catch (error) {
        console.error('Error deleting contact message:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء حذف الرسالة'
        });
    }
});

// Get messages by status
router.get('/status/:status', async (req, res) => {
    try {
        const { status } = req.params;
        const validStatuses = ['unread', 'read', 'replied'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'حالة الرسالة غير صحيحة'
            });
        }

        const rows = await db.all(`
            SELECT * FROM contact_messages 
            WHERE status = ?
            ORDER BY created_at DESC
        `, [status]);

        res.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error('Error fetching messages by status:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب الرسائل'
        });
    }
});

// Get messages statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const totalMessages = await db.get(`
            SELECT COUNT(*) as total FROM contact_messages
        `);

        const unreadMessages = await db.get(`
            SELECT COUNT(*) as unread FROM contact_messages WHERE status = 'unread'
        `);

        const readMessages = await db.get(`
            SELECT COUNT(*) as read FROM contact_messages WHERE status = 'read'
        `);

        const repliedMessages = await db.get(`
            SELECT COUNT(*) as replied FROM contact_messages WHERE status = 'replied'
        `);

        const recentMessages = await db.get(`
            SELECT COUNT(*) as recent FROM contact_messages 
            WHERE created_at >= datetime('now', '-7 days')
        `);

        res.json({
            success: true,
            data: {
                total: totalMessages.total,
                unread: unreadMessages.unread,
                read: readMessages.read,
                replied: repliedMessages.replied,
                recent: recentMessages.recent
            }
        });

    } catch (error) {
        console.error('Error fetching message stats:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب الإحصائيات'
        });
    }
});

module.exports = router;