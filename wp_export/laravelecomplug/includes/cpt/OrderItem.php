<?php
add_action('init', function () {
  register_post_type('order_item', [
    'label' => 'Order Items',
    'public' => false,
    'show_ui' => false,
    'supports' => ['title'],
  ]);
});
