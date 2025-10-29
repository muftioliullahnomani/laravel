<?php
// Floating cart button if cart not empty
$cartCount = 0;
if (isset($_COOKIE['ecom_cart'])) {
  $arr = json_decode(stripslashes($_COOKIE['ecom_cart']), true);
  if (is_array($arr)) {
    foreach ($arr as $qty) { $cartCount += (int)$qty; }
  }
}
?>
<footer>
  <p>&copy; <?php echo date('Y'); ?></p>
</footer>

<?php if ($cartCount > 0): ?>
  <a href="<?php echo esc_url(home_url('/cart')); ?>" style="position:fixed;right:16px;bottom:16px;background:#10b981;color:#fff;padding:12px 14px;border-radius:999px;box-shadow:0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -4px rgba(0,0,0,.1);text-decoration:none;font-weight:600">
    Go to cart (<?php echo (int)$cartCount; ?>)
  </a>
<?php endif; ?>

<?php wp_footer(); ?>
</body>
</html>
