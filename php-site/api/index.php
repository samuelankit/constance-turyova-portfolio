<?php
require_once __DIR__ . '/db.php';

// ── CORS headers (same-origin, but handy for local dev) ──────────────────────
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// ── Parse route ──────────────────────────────────────────────────────────────
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri    = rtrim($uri, '/');
$method = $_SERVER['REQUEST_METHOD'];

// Strip /api prefix
$path = preg_replace('#^/api#', '', $uri);   // e.g. /slides, /blog/3, /upload

// ── Route dispatch ───────────────────────────────────────────────────────────

// Health
if ($path === '/health' && $method === 'GET') {
    json_response(['status' => 'ok']);
}

// Serve uploaded files: /api/uploads/:filename
if (preg_match('#^/uploads/(.+)$#', $path, $m)) {
    $file = UPLOADS_DIR . basename($m[1]);
    if (!file_exists($file)) json_error('Not found', 404);
    $mime = mime_content_type($file) ?: 'application/octet-stream';
    header('Content-Type: ' . $mime);
    header('Content-Length: ' . filesize($file));
    readfile($file);
    exit;
}

// Upload
if ($path === '/upload' && $method === 'POST') {
    handle_upload();
}

// Slides
if ($path === '/slides') {
    if ($method === 'GET')  handle_slides_list();
    if ($method === 'POST') handle_slides_create();
}
if (preg_match('#^/slides/(\d+)$#', $path, $m)) {
    if ($method === 'DELETE') handle_slides_delete((int)$m[1]);
}

// Blog
if ($path === '/blog') {
    if ($method === 'GET')  handle_blog_list();
    if ($method === 'POST') handle_blog_create();
}
if (preg_match('#^/blog/(\d+)$#', $path, $m)) {
    if ($method === 'GET')    handle_blog_get((int)$m[1]);
    if ($method === 'PUT')    handle_blog_update((int)$m[1]);
    if ($method === 'DELETE') handle_blog_delete((int)$m[1]);
}
// Blog by slug
if (preg_match('#^/blog/([a-z0-9\-]+)$#', $path, $m)) {
    if ($method === 'GET') handle_blog_get_slug($m[1]);
}

// Settings
if ($path === '/settings') {
    if ($method === 'GET') handle_settings_get();
    if ($method === 'PUT') handle_settings_update();
}

json_error('Not found', 404);

// ─────────────────────────────────────────────────────────────────────────────
// SLIDES
// ─────────────────────────────────────────────────────────────────────────────

function handle_slides_list(): never {
    $rows = get_db()->query('SELECT id, image_url AS imageUrl, title AS altText, 0 AS sortOrder, created_at AS createdAt FROM slides ORDER BY created_at DESC')->fetchAll();
    json_response($rows);
}

function handle_slides_create(): never {
    $body     = get_json_body();
    $imageUrl = trim($body['imageUrl'] ?? '');
    $altText  = trim($body['altText'] ?? $body['title'] ?? '');
    if (!$imageUrl) json_error('imageUrl is required');

    $st = get_db()->prepare('INSERT INTO slides (image_url, title) VALUES (?, ?)');
    $st->execute([$imageUrl, $altText ?: null]);
    $id = (int)get_db()->lastInsertId();

    $row = get_db()->prepare('SELECT id, image_url AS imageUrl, title AS altText, 0 AS sortOrder, created_at AS createdAt FROM slides WHERE id = ?');
    $row->execute([$id]);
    json_response($row->fetch(), 201);
}

function handle_slides_delete(int $id): never {
    $row = get_db()->prepare('SELECT image_url FROM slides WHERE id = ?');
    $row->execute([$id]);
    $slide = $row->fetch();
    if (!$slide) json_error('Not found', 404);

    // Delete physical file if it lives in our uploads dir
    $url = $slide['image_url'];
    if (preg_match('#/uploads/(.+)$#', $url, $m)) {
        $file = UPLOADS_DIR . basename($m[1]);
        if (file_exists($file)) @unlink($file);
    }

    $st = get_db()->prepare('DELETE FROM slides WHERE id = ?');
    $st->execute([$id]);
    json_response(['success' => true]);
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOG
// ─────────────────────────────────────────────────────────────────────────────

function handle_blog_list(): never {
    $published = isset($_GET['published']) ? (bool)(int)$_GET['published'] : null;
    if ($published !== null) {
        $st = get_db()->prepare('SELECT id, title, slug, excerpt, published, created_at AS createdAt, updated_at AS updatedAt FROM blog_posts WHERE published = ? ORDER BY created_at DESC');
        $st->execute([$published ? 1 : 0]);
    } else {
        $st = get_db()->query('SELECT id, title, slug, excerpt, published, created_at AS createdAt, updated_at AS updatedAt FROM blog_posts ORDER BY created_at DESC');
    }
    json_response($st->fetchAll());
}

function handle_blog_get(int $id): never {
    $st = get_db()->prepare('SELECT id, title, slug, content, excerpt, published, created_at AS createdAt, updated_at AS updatedAt FROM blog_posts WHERE id = ?');
    $st->execute([$id]);
    $row = $st->fetch();
    if (!$row) json_error('Not found', 404);
    json_response($row);
}

function handle_blog_get_slug(string $slug): never {
    $st = get_db()->prepare('SELECT id, title, slug, content, excerpt, published, created_at AS createdAt, updated_at AS updatedAt FROM blog_posts WHERE slug = ?');
    $st->execute([$slug]);
    $row = $st->fetch();
    if (!$row) json_error('Not found', 404);
    json_response($row);
}

function handle_blog_create(): never {
    $body    = get_json_body();
    $title   = trim($body['title'] ?? '');
    $content = trim($body['content'] ?? '');
    $excerpt = trim($body['excerpt'] ?? '');
    $published = isset($body['published']) ? (bool)$body['published'] : false;
    if (!$title) json_error('title is required');

    $slug = make_slug($title);
    // Ensure uniqueness
    $count = 0;
    $base  = $slug;
    while (true) {
        $check = get_db()->prepare('SELECT COUNT(*) FROM blog_posts WHERE slug = ?');
        $check->execute([$slug]);
        if ((int)$check->fetchColumn() === 0) break;
        $slug = $base . '-' . (++$count);
    }

    $st = get_db()->prepare('INSERT INTO blog_posts (title, slug, content, excerpt, published) VALUES (?, ?, ?, ?, ?)');
    $st->execute([$title, $slug, $content ?: null, $excerpt ?: null, $published ? 1 : 0]);
    $id = (int)get_db()->lastInsertId();

    handle_blog_get($id);
}

function handle_blog_update(int $id): never {
    $row = get_db()->prepare('SELECT id FROM blog_posts WHERE id = ?');
    $row->execute([$id]);
    if (!$row->fetch()) json_error('Not found', 404);

    $body    = get_json_body();
    $fields  = [];
    $params  = [];

    if (array_key_exists('title', $body)) {
        $fields[] = 'title = ?'; $params[] = trim($body['title']);
    }
    if (array_key_exists('content', $body)) {
        $fields[] = 'content = ?'; $params[] = $body['content'];
    }
    if (array_key_exists('excerpt', $body)) {
        $fields[] = 'excerpt = ?'; $params[] = trim($body['excerpt']);
    }
    if (array_key_exists('published', $body)) {
        $fields[] = 'published = ?'; $params[] = $body['published'] ? 1 : 0;
    }
    if (array_key_exists('slug', $body)) {
        $fields[] = 'slug = ?'; $params[] = trim($body['slug']);
    }

    if (!empty($fields)) {
        $fields[]  = 'updated_at = NOW()';
        $params[]  = $id;
        $sql = 'UPDATE blog_posts SET ' . implode(', ', $fields) . ' WHERE id = ?';
        get_db()->prepare($sql)->execute($params);
    }

    handle_blog_get($id);
}

function handle_blog_delete(int $id): never {
    $row = get_db()->prepare('SELECT id FROM blog_posts WHERE id = ?');
    $row->execute([$id]);
    if (!$row->fetch()) json_error('Not found', 404);
    get_db()->prepare('DELETE FROM blog_posts WHERE id = ?')->execute([$id]);
    json_response(['success' => true]);
}

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────────────────────────────────────────

function handle_settings_get(): never {
    $rows = get_db()->query('SELECT `key`, value FROM site_settings')->fetchAll();
    $out  = [];
    foreach ($rows as $r) $out[$r['key']] = $r['value'];
    // Ensure about fields always exist with defaults
    if (!isset($out['aboutHeading'])) $out['aboutHeading'] = 'Character-driven storytelling across stage and screen.';
    if (!isset($out['aboutBody']))    $out['aboutBody']    = '';
    json_response($out);
}

function handle_settings_update(): never {
    $body    = get_json_body();
    $db      = get_db();
    $allowed = ['siteName','tagline','email','instagramUrl','metaDescription','metaKeywords','aboutHeading','aboutBody'];
    foreach ($body as $key => $value) {
        if (!in_array($key, $allowed, true)) continue;
        $st = $db->prepare('INSERT INTO site_settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)');
        $st->execute([trim($key), $value]);
    }
    handle_settings_get();
}

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD
// ─────────────────────────────────────────────────────────────────────────────

function handle_upload(): never {
    if (empty($_FILES['file'])) json_error('No file uploaded');
    $file  = $_FILES['file'];
    if ($file['error'] !== UPLOAD_ERR_OK) json_error('Upload error: ' . $file['error']);

    $allowed = ['image/jpeg','image/png','image/gif','image/webp'];
    $mime    = mime_content_type($file['tmp_name']);
    if (!in_array($mime, $allowed, true)) json_error('Invalid file type: ' . $mime);

    if (!is_dir(UPLOADS_DIR)) mkdir(UPLOADS_DIR, 0755, true);

    $ext      = pathinfo($file['name'], PATHINFO_EXTENSION) ?: 'jpg';
    $filename = uniqid('slide_', true) . '.' . strtolower($ext);
    $dest     = UPLOADS_DIR . $filename;

    if (!move_uploaded_file($file['tmp_name'], $dest)) json_error('Failed to save file');

    json_response(['url' => '/api/uploads/' . $filename], 201);
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function make_slug(string $text): string {
    $text = strtolower(trim($text));
    $text = preg_replace('/[^a-z0-9\s-]/', '', $text);
    $text = preg_replace('/[\s-]+/', '-', $text);
    return trim($text, '-');
}
