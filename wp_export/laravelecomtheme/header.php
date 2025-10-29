<!doctype html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<header>
  <nav>
    <?php
    $locations = get_nav_menu_locations();
    if (!empty($locations['primary'])) {
      $menu = wp_get_nav_menu_object($locations['primary']);
      $items = $menu ? wp_get_nav_menu_items($menu->term_id) : [];
      $left = [];
      $right = [];
      if ($items) {
        foreach ($items as $it) {
          $align = get_post_meta($it->ID, '_menu_item_align', true) ?: 'left';
          if ($align === 'right') $right[] = $it; else $left[] = $it;
        }
        echo '<div class="menu-row" style="display:flex;justify-content:space-between;gap:20px;align-items:center">';
        echo '<ul class="menu-left" style="display:flex;gap:12px;list-style:none;margin:0;padding:0">';
        foreach ($left as $it) {
          echo '<li><a href="'.esc_url($it->url).'">'.esc_html($it->title).'</a></li>';
        }
        echo '</ul>';
        echo '<ul class="menu-right" style="display:flex;gap:12px;list-style:none;margin:0;padding:0">';
        foreach ($right as $it) {
          echo '<li><a href="'.esc_url($it->url).'">'.esc_html($it->title).'</a></li>';
        }
        echo '</ul>';
        echo '</div>';
      } else {
        wp_nav_menu(['theme_location' => 'primary']);
      }
    } else {
      wp_nav_menu(['theme_location' => 'primary']);
    }
    ?>
  </nav>
</header>
