<?php
if (!defined('ABSPATH')) exit;

// Add 'align' meta to menu items: left|right
add_action('wp_nav_menu_item_custom_fields', function ($item_id, $item) {
  $align = get_post_meta($item_id, '_menu_item_align', true) ?: 'left';
  ?>
  <p class="description description-wide">
    <label for="edit-menu-item-align-<?php echo $item_id; ?>">
      Align (left/right)<br>
      <input type="text" id="edit-menu-item-align-<?php echo $item_id; ?>" name="menu-item-align[<?php echo $item_id; ?>]" value="<?php echo esc_attr($align); ?>" />
    </label>
  </p>
  <?php
}, 10, 2);

add_action('wp_update_nav_menu_item', function ($menu_id, $menu_item_db_id) {
  if (isset($_POST['menu-item-align'][$menu_item_db_id])) {
    update_post_meta($menu_item_db_id, '_menu_item_align', sanitize_text_field($_POST['menu-item-align'][$menu_item_db_id]));
  }
}, 10, 2);
