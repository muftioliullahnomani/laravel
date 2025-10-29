<?php
if (!defined('ABSPATH')) exit;

// Very basic session-like cart using cookies (placeholder)
function laravelecom_get_cart() {
  $raw = isset($_COOKIE['ecom_cart']) ? wp_unslash($_COOKIE['ecom_cart']) : '';
  $arr = json_decode($raw, true);
  return is_array($arr) ? $arr : [];
}
function laravelecom_put_cart($cart) {
  setcookie('ecom_cart', wp_json_encode($cart), time()+3600*24*7, COOKIEPATH ?: '/', COOKIE_DOMAIN ?: '', is_ssl(), true);
}

add_action('init', function(){
  if (!empty($_POST['ecom_action'])) {
    check_admin_referer('ecom_cart');
    $cart = laravelecom_get_cart();
    if ($_POST['ecom_action']==='add' && !empty($_POST['product_id'])) {
      $pid = (int)$_POST['product_id'];
      $qty = max(1, (int)($_POST['qty'] ?? 1));
      $cart[$pid] = ($cart[$pid] ?? 0) + $qty;
      laravelecom_put_cart($cart);
      wp_safe_redirect(wp_get_referer() ?: home_url('/'));
      exit;
    }
    if ($_POST['ecom_action']==='clear') {
      laravelecom_put_cart([]);
      wp_safe_redirect(wp_get_referer() ?: home_url('/'));
      exit;
    }
  }
});

add_shortcode('ecom_cart', function(){
  $cart = laravelecom_get_cart();
  ob_start();
  echo '<div class="ecom-cart"><h2>Your Cart</h2>';
  if (!$cart) { echo '<p>Cart is empty.</p></div>'; return ob_get_clean(); }
  echo '<form method="post">';
  wp_nonce_field('ecom_cart');
  echo '<input type="hidden" name="ecom_action" value="clear" />';
  echo '<button>Clear Cart</button>';
  echo '</form>';
  echo '<ul>';
  foreach ($cart as $pid=>$qty) {
    $p = get_post($pid);
    if ($p) echo '<li>'.esc_html($p->post_title).' x '.(int)$qty.'</li>';
  }
  echo '</ul>';
  echo '</div>';
  return ob_get_clean();
});

// [ecom_add_to_cart id="123"]
add_shortcode('ecom_add_to_cart', function($atts){
  $atts = shortcode_atts(['id' => 0], $atts, 'ecom_add_to_cart');
  $pid = (int)$atts['id'];
  if ($pid<=0) return '';
  $p = get_post($pid);
  if (!$p || $p->post_type!=='product') return '';
  $mode = get_option('button_mode', 'both');
  if (!in_array($mode, ['icon','text','both'], true)) $mode = 'both';
  ob_start();
  echo '<form method="post" style="display:inline-block">';
  wp_nonce_field('ecom_cart');
  echo '<input type="hidden" name="ecom_action" value="add" />';
  echo '<input type="hidden" name="product_id" value="'.(int)$pid.'" />';
  echo '<input type="number" name="qty" value="1" min="1" style="width:60px;margin-right:6px" />';
  echo '<button type="submit" style="display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border:1px solid #e5e7eb;border-radius:6px;background:#111;color:#fff">';
  if ($mode==='icon' || $mode==='both') {
    echo '<span aria-hidden="true" style="display:inline-block;width:16px;height:16px">'
      .'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">'
      .'<path d="M7 4h-2l-1 2h2l3.6 7.59-1.35 2.44A1.99 1.99 0 0 0 10 19h9v-2h-8.42c-.14 0-.25-.11-.25-.25l.03-.12L11.1 14h5.45a2 2 0 0 0 1.79-1.11l3.58-7.16A1 1 0 0 0 21 4H7zM7 20a2 2 0 1 0 .001 3.999A2 2 0 0 0 7 20zm10 0a2 2 0 1 0 .001 3.999A2 2 0 0 0 17 20z"/></svg>'
      .'</span>';
  }
  if ($mode==='text' || $mode==='both') {
    echo '<span>Add to cart</span>';
  } else {
    echo '<span class="screen-reader-text">Add to cart</span>';
  }
  echo '</button>';
  echo '</form>';
  return ob_get_clean();
});
