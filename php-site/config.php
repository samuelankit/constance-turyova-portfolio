<?php
$password = 'constance2024';
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

$config = [
    'site_name' => 'Constance Turyova',
    'tagline' => 'Actor',
    'email' => 'contact@constanceturyova.com',
    'instagram_url' => 'https://www.instagram.com/constanceturyova/',
    'meta_description' => 'Constance Turyova is an actor dedicated to character-driven storytelling.',
    'admin_password_hash' => $hashed_password
];
?>
