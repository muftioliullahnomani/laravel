<?php
if (!defined('ABSPATH')) exit;

require_once __DIR__ . '/Cart.php';

function laravelecom_create_order_from_cart($customer_name = 'Guest', $customer_email = '') {
  $cart = laravelecom_get_cart();
  if (!$cart) return new WP_Error('empty_cart', 'Cart is empty');

  // Create order post
  $order_id = wp_insert_post([
    'post_type' => 'order',
    'post_status' => 'publish',
    'post_title' => 'Order - ' . current_time('mysql'),
  ]);
  if (is_wp_error($order_id)) return $order_id;

  $subtotal = 0;
  foreach ($cart as $pid=>$qty) {
    $price = (float)get_post_meta($pid, '_price', true);
    $line_total = $price * (int)$qty;
    $subtotal += $line_total;
    // create order item
    wp_insert_post([
      'post_type' => 'order_item',
      'post_status' => 'publish',
      'post_title' => 'Item ' . $pid,
      'meta_input' => [
        '_order_id' => $order_id,
        '_product_id' => $pid,
        '_quantity' => (int)$qty,
        '_unit_price' => $price,
        '_total' => $line_total,
      ],
    ]);
  }

  update_post_meta($order_id, '_status', 'placed');
  update_post_meta($order_id, '_payment_method', 'COD');
  update_post_meta($order_id, '_payment_status', 'unpaid');
  update_post_meta($order_id, '_subtotal', $subtotal);
  update_post_meta($order_id, '_tax', 0);
  update_post_meta($order_id, '_shipping', 0);
  update_post_meta($order_id, '_total', $subtotal);
  update_post_meta($order_id, '_customer_name', $customer_name);
  update_post_meta($order_id, '_customer_email', $customer_email);
  update_post_meta($order_id, '_placed_at', current_time('mysql'));

  // clear cart
  laravelecom_put_cart([]);

  return $order_id;
}

add_shortcode('ecom_checkout', function(){
  $msg = '';
  if ($_SERVER['REQUEST_METHOD']==='POST') {
    check_admin_referer('ecom_checkout');
    $name = sanitize_text_field($_POST['customer_name'] ?? 'Guest');
    $email = sanitize_email($_POST['customer_email'] ?? '');
    $res = laravelecom_create_order_from_cart($name, $email);
    if (is_wp_error($res)) {
      $msg = '<div class="error"><p>'.esc_html($res->get_error_message()).'</p></div>';
    } else {
      $msg = '<div class="updated"><p>Order placed successfully.</p></div>';
    }
  }
  ob_start();
  echo $msg;
  echo '<form method="post">';
  wp_nonce_field('ecom_checkout');
  echo '<p><label>Name<br><input type="text" name="customer_name" /></label></p>';
  echo '<p><label>Email<br><input type="email" name="customer_email" /></label></p>';
  echo '<p><button type="submit">Checkout (COD)</button></p>';
  echo '</form>';
  return ob_get_clean();
});
