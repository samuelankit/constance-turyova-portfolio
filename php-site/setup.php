<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Portfolio Setup</title>
<style>
  body { font-family: sans-serif; max-width: 640px; margin: 60px auto; padding: 0 20px; color: #333; }
  h1   { font-size: 1.4rem; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
  .ok  { color: #2a7a2a; background: #e8f5e9; padding: 8px 12px; border-radius: 4px; margin: 6px 0; }
  .err { color: #b00; background: #fdecea; padding: 8px 12px; border-radius: 4px; margin: 6px 0; }
  pre  { background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto; font-size: 0.85rem; }
</style>
</head>
<body>
<h1>Constance Turyova — Portfolio Setup</h1>

<?php
require_once __DIR__ . '/config.php';

// ── Security: require a token to prevent accidental public runs ───────────────
if (!isset($_GET['token']) || $_GET['token'] !== ADMIN_PASSWORD) {
    echo '<p class="err">Access denied. Append <code>?token=constance2024</code> to the URL.</p>';
    echo '</body></html>';
    exit;
}

$steps = [];
$ok = true;

// ── Connect ───────────────────────────────────────────────────────────────────
try {
    $dsn = 'mysql:host=' . DB_HOST . ';charset=utf8mb4';
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    $steps[] = ['ok', 'Connected to MySQL as ' . DB_USER];
} catch (PDOException $e) {
    $steps[] = ['err', 'MySQL connection failed: ' . $e->getMessage()];
    $ok = false;
}

if ($ok) {
    // Create database if needed
    try {
        $pdo->exec('CREATE DATABASE IF NOT EXISTS `' . DB_NAME . '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        $pdo->exec('USE `' . DB_NAME . '`');
        $steps[] = ['ok', 'Database <strong>' . DB_NAME . '</strong> ready'];
    } catch (PDOException $e) {
        $steps[] = ['err', 'Could not create database: ' . $e->getMessage()];
        $ok = false;
    }
}

if ($ok) {
    $tables = [
        'slides' => "CREATE TABLE IF NOT EXISTS slides (
            id         INT AUTO_INCREMENT PRIMARY KEY,
            image_url  VARCHAR(255) NOT NULL,
            title      VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        'blog_posts' => "CREATE TABLE IF NOT EXISTS blog_posts (
            id         INT AUTO_INCREMENT PRIMARY KEY,
            title      VARCHAR(255) NOT NULL,
            slug       VARCHAR(255) NOT NULL UNIQUE,
            content    LONGTEXT,
            excerpt    TEXT,
            published  TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        'site_settings' => "CREATE TABLE IF NOT EXISTS site_settings (
            id    INT AUTO_INCREMENT PRIMARY KEY,
            `key` VARCHAR(100) NOT NULL UNIQUE,
            value TEXT
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
    ];

    foreach ($tables as $name => $sql) {
        try {
            $pdo->exec($sql);
            $steps[] = ['ok', "Table <strong>{$name}</strong> ready"];
        } catch (PDOException $e) {
            $steps[] = ['err', "Failed to create {$name}: " . $e->getMessage()];
            $ok = false;
        }
    }
}

// ── Default settings ──────────────────────────────────────────────────────────
if ($ok) {
    $defaults = [
        'siteName'        => 'Constance Turyova',
        'tagline'         => 'Actor',
        'email'           => 'contact@constanceturyova.com',
        'instagramUrl'    => 'https://www.instagram.com/constanceturyova/',
        'metaDescription' => 'Constance Turyova is an actor dedicated to character-driven storytelling.',
    ];
    try {
        $pdo->exec('USE `' . DB_NAME . '`');
        $st = $pdo->prepare("INSERT IGNORE INTO site_settings (`key`, value) VALUES (?, ?)");
        foreach ($defaults as $k => $v) $st->execute([$k, $v]);
        $steps[] = ['ok', 'Default site settings seeded'];
    } catch (PDOException $e) {
        $steps[] = ['err', 'Could not seed settings: ' . $e->getMessage()];
    }
}

// ── Uploads dir ───────────────────────────────────────────────────────────────
$uploadsDir = __DIR__ . '/uploads/';
if (!is_dir($uploadsDir)) {
    mkdir($uploadsDir, 0755, true) ? $steps[] = ['ok', 'Created /uploads/ directory'] : $steps[] = ['err', 'Could not create /uploads/ directory'];
} else {
    $steps[] = ['ok', '/uploads/ directory exists'];
}

// ── Output ────────────────────────────────────────────────────────────────────
foreach ($steps as [$type, $msg]) {
    echo "<p class=\"{$type}\">" . ($type === 'ok' ? '✅ ' : '❌ ') . $msg . "</p>\n";
}

if ($ok): ?>
<p class="ok" style="margin-top:20px; font-weight:bold">✅ Setup complete! Your portfolio is ready.</p>
<p><strong>Next step:</strong> Delete or rename <code>setup.php</code> from your server for security.</p>
<?php else: ?>
<p class="err" style="margin-top:20px; font-weight:bold">❌ Setup failed. Fix the errors above and retry.</p>
<p>Check that <code>config.php</code> has your correct MySQL credentials (DB_NAME, DB_USER, DB_PASS).</p>
<?php endif; ?>

</body>
</html>
