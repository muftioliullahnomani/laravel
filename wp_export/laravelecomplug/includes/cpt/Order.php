<?php
add_action('init', function () {
  register_post_type('order', [
    'label' => 'Orders',
    'public' => false,
    'show_ui' => true,
    'supports' => ['title'],
    'menu_icon' => 'dashicons-clipboard',
  ]);
});

// Basic columns for admin list
add_filter('manage_order_posts_columns', function($cols){
  $cols['status'] = 'Status';
  $cols['total'] = 'Total';
  return $cols;
});
add_action('manage_order_posts_custom_column', function($col, $post_id){
  if ($col==='status') echo esc_html(get_post_meta($post_id, '_status', true) ?: 'pending');
  if ($col==='total') echo esc_html(get_post_meta($post_id, '_total', true) ?: '0');
}, 10, 2);
