<?php
add_action('init', function () {
  register_taxonomy('product_cat', 'product', [
    'label' => 'Product Categories',
    'hierarchical' => true,
    'show_in_rest' => true,
    'rewrite' => ['slug' => 'product-category'],
  ]);
});
