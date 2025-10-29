<?php
if (!defined('ABSPATH')) exit;

add_action('admin_menu', function () {
  add_menu_page('Ecom Settings', 'Ecom Settings', 'manage_options', 'ecom-settings', function () {
    if ($_SERVER['REQUEST_METHOD']==='POST' && check_admin_referer('ecom_save_styles')) {
      // Dynamic fields take precedence; then fall back to raw JSON textareas
      $home_card = sanitize_text_field($_POST['home_card'] ?? '');
      $home_ratio = sanitize_text_field($_POST['home_image_ratio'] ?? '');
      $section_card = sanitize_text_field($_POST['section_card'] ?? '');
      $section_ratio = sanitize_text_field($_POST['section_image_ratio'] ?? '');

      if ($home_card || $home_ratio) {
        $home_arr = [];
        if ($home_card) $home_arr['card'] = $home_card;
        if ($home_ratio) $home_arr['image_ratio'] = $home_ratio;
        update_option('home_style', wp_json_encode($home_arr));
      } else {
        update_option('home_style', wp_unslash($_POST['home_style'] ?? ''));
      }

      if ($section_card || $section_ratio) {
        $sec_arr = [];
        if ($section_card) $sec_arr['card'] = $section_card;
        if ($section_ratio) $sec_arr['image_ratio'] = $section_ratio;
        update_option('section_style', wp_json_encode($sec_arr));
      } else {
        update_option('section_style', wp_unslash($_POST['section_style'] ?? ''));
      }
      $mode = in_array(($_POST['button_mode'] ?? 'both'), ['icon','text','both'], true) ? $_POST['button_mode'] : 'both';
      update_option('button_mode', $mode);
      echo '<div class="updated"><p>Saved.</p></div>';
    }
    $home = get_option('home_style', '');
    $section = get_option('section_style', '');
    $button_mode = get_option('button_mode', 'both');
    // Prefill dynamic fields from saved JSON if present
    $home_dec = json_decode($home, true);
    $section_dec = json_decode($section, true);
    $home_card = is_array($home_dec) && isset($home_dec['card']) ? $home_dec['card'] : '';
    $home_ratio = is_array($home_dec) && isset($home_dec['image_ratio']) ? $home_dec['image_ratio'] : '';
    $section_card = is_array($section_dec) && isset($section_dec['card']) ? $section_dec['card'] : '';
    $section_ratio = is_array($section_dec) && isset($section_dec['image_ratio']) ? $section_dec['image_ratio'] : '';
    echo '<div class="wrap"><h1>Ecom Styles</h1>';
    echo '<form method="post">';
    wp_nonce_field('ecom_save_styles');
    // Dynamic Home fields
    echo '<h2>Home Style</h2>';
    echo '<p><label>Card classes<br/><input type="text" name="home_card" value="'.esc_attr($home_card).'" style="width:100%" placeholder="e.g., rounded-lg shadow-sm" /></label></p>';
    echo '<p><label>Image ratio<br/><input type="text" name="home_image_ratio" value="'.esc_attr($home_ratio).'" style="width:100%" placeholder="e.g., 1/1 or 4/3" /></label></p>';
    echo '<details style="margin:12px 0"><summary>Advanced: Home Style (raw JSON)</summary>';
    echo '<p><textarea name="home_style" rows="6" style="width:100%">' . esc_textarea($home) . '</textarea></p>';
    echo '</details>';

    // Dynamic Section fields
    echo '<h2>Section Style</h2>';
    echo '<p><label>Card classes<br/><input type="text" name="section_card" value="'.esc_attr($section_card).'" style="width:100%" placeholder="e.g., rounded-md border" /></label></p>';
    echo '<p><label>Image ratio<br/><input type="text" name="section_image_ratio" value="'.esc_attr($section_ratio).'" style="width:100%" placeholder="e.g., 1/1 or 4/3" /></label></p>';
    echo '<details style="margin:12px 0"><summary>Advanced: Section Style (raw JSON)</summary>';
    echo '<p><textarea name="section_style" rows="6" style="width:100%">' . esc_textarea($section) . '</textarea></p>';
    echo '</details>';
    echo '<p><label>Button Mode</label><br/>';
    echo '<select name="button_mode">';
    foreach ([['icon','Icon'],['text','Text'],['both','Icon + Text']] as $opt) {
      $sel = $button_mode===$opt[0] ? ' selected' : '';
      echo '<option value="'.$opt[0].'"'.$sel.'>'.$opt[1].'</option>';
    }
    echo '</select></p>';
    echo '<p><button class="button button-primary">Save</button></p>';
    echo '</form></div>';
  }, 'dashicons-admin-customizer', 58);
});
