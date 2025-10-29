<?php
if (!defined('ABSPATH')) exit;

// [ecom_products limit="12" cat="slug"]
add_shortcode('ecom_products', function($atts){
  $atts = shortcode_atts(['limit' => 12, 'cat' => ''], $atts, 'ecom_products');
  $args = [
    'post_type' => 'product',
    'posts_per_page' => (int)$atts['limit'],
  ];
  if ($atts['cat']) {
    $args['tax_query'] = [[
      'taxonomy' => 'product_cat',
      'field' => 'slug',
      'terms' => sanitize_text_field($atts['cat']),
    ]];
  }
  $q = new WP_Query($args);
  ob_start();
  echo '<div class="ecom-products" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px">';
  if ($q->have_posts()) {
    while ($q->have_posts()) { $q->the_post();
      $pid = get_the_ID();
      $price = get_post_meta($pid, '_price', true);
      echo '<div class="ecom-card" style="border:1px solid #e5e7eb;border-radius:8px;padding:12px">';
      if (has_post_thumbnail()) {
        echo '<div class="thumb" style="aspect-ratio:1/1;overflow:hidden;border-radius:6px;margin-bottom:8px">'.get_the_post_thumbnail($pid, 'medium').'</div>';
      }
      echo '<h3 style="font-size:14px;margin:0 0 6px"><a href="'.esc_url(get_permalink()).'">'.esc_html(get_the_title()).'</a></h3>';
      echo '<div style="color:#111;font-weight:600;margin-bottom:8px">'.esc_html($price !== '' ? '$'.number_format((float)$price, 2) : '') . '</div>';
      echo do_shortcode('[ecom_add_to_cart id="'.$pid.'"]');
      echo '</div>';
    }
    wp_reset_postdata();
  } else {
    echo '<p>No products found.</p>';
  }
  echo '</div>';
  return ob_get_clean();
});
