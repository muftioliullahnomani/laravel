<?php get_header(); ?>
<main class="container">
  <h1>laravelecomtheme</h1>
  <?php if (have_posts()): while (have_posts()): the_post(); ?>
    <article <?php post_class(); ?>>
      <h2><?php the_title(); ?></h2>
      <div><?php the_content(); ?></div>
    </article>
  <?php endwhile; endif; ?>
</main>
<?php get_footer(); ?>
