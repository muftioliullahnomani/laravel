<?php
add_action('init', function () {
  register_post_type('product', [
    'label' => 'Products',
    'public' => true,
    'show_in_rest' => true,
    'supports' => ['title', 'editor', 'thumbnail'],
    'has_archive' => true,
    'rewrite' => ['slug' => 'product'],
    'menu_icon' => 'dashicons-cart',
  ]);
});

add_action('add_meta_boxes', function () {
  add_meta_box('product_meta', 'Product Data', function ($post) {
    $price = get_post_meta($post->ID, '_price', true) ?: '';
    echo '<label>Price</label><br />';
    echo '<input type="number" step="0.01" name="product_price" value="'.esc_attr($price).'" style="width:100%">';
  }, 'product', 'side');
});

add_action('save_post_product', function ($post_id) {
  if (isset($_POST['product_price'])) {
    update_post_meta($post_id, '_price', sanitize_text_field($_POST['product_price']));
  }
});
