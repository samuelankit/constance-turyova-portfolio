<?php
// ─────────────────────────────────────────────────────────────────────────────
// Database configuration
// After deploying, edit these values in cPanel File Manager or via FTP.
// ─────────────────────────────────────────────────────────────────────────────
define('DB_HOST', 'localhost');
define('DB_NAME', 'YOUR_DB_NAME');      // e.g. lcprnqhq_portfolio
define('DB_USER', 'YOUR_DB_USER');      // e.g. lcprnqhq_admin
define('DB_PASS', 'YOUR_DB_PASSWORD');
define('DB_CHARSET', 'utf8mb4');

// Admin password for CMS
define('ADMIN_PASSWORD', 'constance2024');

// Uploads directory (relative to this file's location = public_html root)
define('UPLOADS_DIR', __DIR__ . '/uploads/');
define('UPLOADS_URL', '/uploads/');
