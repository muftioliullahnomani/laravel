<?php
add_action('init', function () {
  register_post_type('homepage_section', [
    'label' => 'Homepage Sections',
    'public' => false,
    'show_ui' => true,
    'supports' => ['title', 'editor'],
    'menu_icon' => 'dashicons-screenoptions',
  ]);
});
