<?php
add_action('after_setup_theme', function () {
  add_theme_support('title-tag');
  add_theme_support('post-thumbnails');
  register_nav_menus([
    'primary' => __('Primary Menu', 'laravelecomtheme'),
  ]);
});

add_action('wp_enqueue_scripts', function () {
  wp_enqueue_style('laravelecomtheme-style', get_stylesheet_uri(), [], '1.0.0');
});

require_once __DIR__ . '/inc/helpers.php';
