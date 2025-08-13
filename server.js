const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static('public'));

// Database connection
const db = require('./backend/config/database');

// Routes
app.use('/api/bookings', require('./backend/routes/bookings'));
app.use('/api/contact', require('./backend/routes/contact'));
app.use('/api/admin', require('./backend/routes/admin'));

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/destinations', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'destinations.html'));
});

app.get('/booking', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'booking.html'));
});

app.get('/news', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'news.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.get('/admin', (req, res) => {
  // Redirect to admin dashboard or show a simple admin page
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>لوحة الإدارة - SkyLine International</title>
        <link rel="stylesheet" href="/css/style.css">
    </head>
    <body>
        <div style="text-align: center; padding: 50px;">
            <h1>لوحة الإدارة</h1>
            <p>قريباً...</p>
            <a href="/" style="color: #007bff; text-decoration: none;">العودة للصفحة الرئيسية</a>
        </div>
    </body>
    </html>
  `);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>الصفحة غير موجودة - SkyLine International</title>
        <link rel="stylesheet" href="/css/style.css">
        <style>
            .error-page {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                text-align: center;
                padding: 20px;
            }
            .error-code {
                font-size: 6rem;
                font-weight: bold;
                color: #007bff;
                margin-bottom: 20px;
            }
            .error-message {
                font-size: 1.5rem;
                margin-bottom: 30px;
                color: #333;
            }
            .back-home {
                background: #007bff;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                transition: background 0.3s;
            }
            .back-home:hover {
                background: #0056b3;
            }
        </style>
    </head>
    <body>
        <div class="error-page">
            <div class="error-code">404</div>
            <div class="error-message">عذراً، الصفحة التي تبحث عنها غير موجودة</div>
            <a href="/" class="back-home">العودة للصفحة الرئيسية</a>
        </div>
    </body>
    </html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
});

module.exports = app; 