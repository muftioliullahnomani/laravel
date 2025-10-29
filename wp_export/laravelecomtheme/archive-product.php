<?php
get_header();
?>
<main class="container" style="max-width:1200px;margin:20px auto;padding:0 16px">
  <h1>Products</h1>
  <?php echo do_shortcode('[ecom_products limit="24"]'); ?>
</main>
<?php get_footer(); ?>
