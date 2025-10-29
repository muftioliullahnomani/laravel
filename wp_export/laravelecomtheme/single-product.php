<?php
get_header();
$pid = get_the_ID();
$price = get_post_meta($pid, '_price', true);
?>
<main class="container" style="max-width:1000px;margin:20px auto;padding:0 16px">
  <?php if (have_posts()): while (have_posts()): the_post(); ?>
    <article <?php post_class('product-single'); ?> style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
      <div>
        <?php if (has_post_thumbnail()) { the_post_thumbnail('large', ['style'=>'border-radius:8px;width:100%;height:auto']); } ?>
      </div>
      <div>
        <h1 style="margin-top:0"><?php the_title(); ?></h1>
        <?php if ($price !== ''): ?>
          <div style="font-size:20px;font-weight:700;margin:8px 0">$<?php echo number_format((float)$price, 2); ?></div>
        <?php endif; ?>
        <div style="margin:16px 0"><?php the_content(); ?></div>
        <div><?php echo do_shortcode('[ecom_add_to_cart id="'.intval($pid).'"]'); ?></div>
      </div>
    </article>
  <?php endwhile; endif; ?>
</main>
<?php get_footer(); ?>
