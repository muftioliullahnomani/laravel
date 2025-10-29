<?php
if (!defined('ABSPATH')) exit;

add_action('rest_api_init', function () {
  register_rest_route('ecom/v1', '/import/categories', [
    'methods'  => 'POST',
    'callback' => function ($req) {
      $payload = is_callable([$req, 'get_json_params']) ? $req->get_json_params() : null;
      if (!is_array($payload)) return ['ok'=>false,'error'=>'Invalid JSON'];
      $created = 0; $updated = 0; $errors = [];
      foreach ($payload as $row) {
        $name = isset($row['name']) ? sanitize_text_field($row['name']) : '';
        $slug = isset($row['slug']) ? sanitize_title($row['slug']) : sanitize_title($name);
        if (!$name || !$slug) { $errors[] = 'Missing name/slug'; continue; }
        $term = get_term_by('slug', $slug, 'product_cat');
        if ($term) {
          wp_update_term($term->term_id, 'product_cat', ['name'=>$name, 'slug'=>$slug]);
          $updated++;
        } else {
          $res = wp_insert_term($name, 'product_cat', ['slug'=>$slug]);
          if (is_wp_error($res)) { $errors[] = $res->get_error_message(); } else { $created++; }
        }
      }
      return ['ok'=>true,'created'=>$created,'updated'=>$updated,'errors'=>$errors];
    },
    'permission_callback' => function () { return current_user_can('manage_options'); }
  ]);

  register_rest_route('ecom/v1', '/import/products', [
    'methods'  => 'POST',
    'callback' => function ($req) {
      $payload = is_callable([$req, 'get_json_params']) ? $req->get_json_params() : null;
      if (!is_array($payload)) return ['ok'=>false,'error'=>'Invalid JSON'];
      $created = 0; $updated = 0; $errors = [];
      foreach ($payload as $row) {
        $title = isset($row['title']) ? sanitize_text_field($row['title']) : '';
        if (!$title) { $errors[]='Missing title'; continue; }
        $slug = isset($row['slug']) ? sanitize_title($row['slug']) : sanitize_title($title);
        $content = isset($row['content']) ? wp_kses_post($row['content']) : '';
        $price = isset($row['price']) ? (float)$row['price'] : null;
        $cats = isset($row['categories']) && is_array($row['categories']) ? array_map('sanitize_title', $row['categories']) : [];
        $image = isset($row['image']) ? esc_url_raw($row['image']) : '';

        $existing = get_page_by_path($slug, OBJECT, 'product');
        $postarr = [
          'post_type' => 'product',
          'post_title' => $title,
          'post_name' => $slug,
          'post_content' => $content,
          'post_status' => 'publish',
        ];
        if ($existing) {
          $postarr['ID'] = $existing->ID;
          $pid = wp_update_post($postarr, true);
          if (is_wp_error($pid)) { $errors[] = $pid->get_error_message(); continue; }
          $updated++;
        } else {
          $pid = wp_insert_post($postarr, true);
          if (is_wp_error($pid)) { $errors[] = $pid->get_error_message(); continue; }
          $created++;
        }
        if ($price !== null) update_post_meta($pid, '_price', $price);
        if ($cats) {
          $term_ids = [];
          foreach ($cats as $slug_cat) {
            $term = get_term_by('slug', $slug_cat, 'product_cat');
            if ($term) $term_ids[] = (int)$term->term_id;
          }
          if ($term_ids) wp_set_post_terms($pid, $term_ids, 'product_cat');
        }
        if ($image) {
          // Try sideload feature image
          if (!function_exists('media_sideload_image')) require_once ABSPATH.'wp-admin/includes/media.php';
          if (!function_exists('download_url')) require_once ABSPATH.'wp-admin/includes/file.php';
          if (!function_exists('wp_read_image_metadata')) require_once ABSPATH.'wp-admin/includes/image.php';
          $att_id = 0;
          $tmp = download_url($image);
          if (!is_wp_error($tmp)) {
            $file = [
              'name' => basename(parse_url($image, PHP_URL_PATH)),
              'type' => mime_content_type($tmp),
              'tmp_name' => $tmp,
              'error' => 0,
              'size' => filesize($tmp),
            ];
            $overrides = ['test_form' => false];
            $results = wp_handle_sideload($file, $overrides);
            if (!isset($results['error'])) {
              $att = [
                'post_mime_type' => $results['type'],
                'post_title' => sanitize_file_name($results['file']),
                'post_content' => '',
                'post_status' => 'inherit'
              ];
              $att_id = wp_insert_attachment($att, $results['file'], $pid);
              if (!is_wp_error($att_id)) {
                require_once ABSPATH.'wp-admin/includes/image.php';
                $attach_data = wp_generate_attachment_metadata($att_id, $results['file']);
                wp_update_attachment_metadata($att_id, $attach_data);
                set_post_thumbnail($pid, $att_id);
              }
            } else { $errors[] = 'Image sideload error: '.$results['error']; }
          } else { $errors[] = 'Download failed: '.$tmp->get_error_message(); }
        }
      }
      return ['ok'=>true,'created'=>$created,'updated'=>$updated,'errors'=>$errors];
    },
    'permission_callback' => function () { return current_user_can('manage_options'); }
  ]);

  register_rest_route('ecom/v1', '/import/orders', [
    'methods'  => 'POST',
    'callback' => function ($req) {
      $payload = is_callable([$req, 'get_json_params']) ? $req->get_json_params() : null;
      if (!is_array($payload)) return ['ok'=>false,'error'=>'Invalid JSON'];
      $created=0;$updated=0;$errors=[];
      foreach ($payload as $o) {
        $order_key = isset($o['key']) ? sanitize_text_field($o['key']) : '';
        $status = isset($o['status']) ? sanitize_text_field($o['status']) : 'pending';
        $payment_status = isset($o['payment_status']) ? sanitize_text_field($o['payment_status']) : 'unpaid';
        $subtotal = isset($o['subtotal']) ? (float)$o['subtotal'] : 0;
        $tax = isset($o['tax']) ? (float)$o['tax'] : 0;
        $shipping = isset($o['shipping']) ? (float)$o['shipping'] : 0;
        $total = isset($o['total']) ? (float)$o['total'] : ($subtotal+$tax+$shipping);
        $customer_name = isset($o['customer_name']) ? sanitize_text_field($o['customer_name']) : '';
        $customer_email = isset($o['customer_email']) ? sanitize_email($o['customer_email']) : '';
        $items = isset($o['items']) && is_array($o['items']) ? $o['items'] : [];

        // find existing by meta _external_key if provided
        $existing_id = 0;
        if ($order_key) {
          $q = new WP_Query([
            'post_type'=>'order', 'meta_key'=>'_external_key', 'meta_value'=>$order_key, 'fields'=>'ids', 'posts_per_page'=>1
          ]);
          if ($q->have_posts()) $existing_id = (int)$q->posts[0];
        }
        if ($existing_id) {
          $order_id = $existing_id;
          $updated++;
        } else {
          $order_id = wp_insert_post([
            'post_type'=>'order','post_status'=>'publish','post_title'=>'Order - '.current_time('mysql')
          ], true);
          if (is_wp_error($order_id)) { $errors[]=$order_id->get_error_message(); continue; }
          $created++;
        }
        update_post_meta($order_id, '_status', $status);
        update_post_meta($order_id, '_payment_status', $payment_status);
        update_post_meta($order_id, '_subtotal', $subtotal);
        update_post_meta($order_id, '_tax', $tax);
        update_post_meta($order_id, '_shipping', $shipping);
        update_post_meta($order_id, '_total', $total);
        update_post_meta($order_id, '_customer_name', $customer_name);
        update_post_meta($order_id, '_customer_email', $customer_email);
        if ($order_key) update_post_meta($order_id, '_external_key', $order_key);

        // Clear previous items if updating
        $existing_items = get_posts(['post_type'=>'order_item','post_status'=>'any','meta_key'=>'_order_id','meta_value'=>$order_id,'numberposts'=>-1,'fields'=>'ids']);
        if ($existing_items) { foreach ($existing_items as $iid) wp_delete_post($iid, true); }

        foreach ($items as $it) {
          $product_id = isset($it['product_id']) ? (int)$it['product_id'] : 0;
          $quantity = isset($it['quantity']) ? (int)$it['quantity'] : 1;
          $unit_price = isset($it['unit_price']) ? (float)$it['unit_price'] : (float)get_post_meta($product_id, '_price', true);
          $line_total = $unit_price * $quantity;
          wp_insert_post([
            'post_type'=>'order_item','post_status'=>'publish','post_title'=>'Item '.$product_id,
            'meta_input'=>[
              '_order_id'=>$order_id,
              '_product_id'=>$product_id,
              '_quantity'=>$quantity,
              '_unit_price'=>$unit_price,
              '_total'=>$line_total,
            ]
          ]);
        }
      }
      return ['ok'=>true,'created'=>$created,'updated'=>$updated,'errors'=>$errors];
    },
    'permission_callback' => function () {
      return current_user_can('manage_options');
    }
  ]);

  register_rest_route('ecom/v1', '/import/menus', [
    'methods'  => 'POST',
    'callback' => function ($req) {
      $payload = is_callable([$req, 'get_json_params']) ? $req->get_json_params() : null;
      if (!is_array($payload)) return ['ok'=>false,'error'=>'Invalid JSON'];
      $created=0;$updated=0;$errors=[];
      foreach ($payload as $row) {
        $location = isset($row['location']) ? sanitize_key($row['location']) : 'primary';
        $items = isset($row['items']) && is_array($row['items']) ? $row['items'] : [];
        // ensure menu exists and assigned
        $menu_name = 'primary';
        $menu_id = 0;
        if (!empty($location)) {
          $locations = get_theme_mod('nav_menu_locations');
          $loc_obj = get_nav_menu_locations();
          if (!empty($loc_obj[$location])) { $menu_id = $loc_obj[$location]; }
        }
        if (!$menu_id) {
          $res = wp_get_nav_menu_object($menu_name);
          if (!$res) { $menu_id = wp_create_nav_menu($menu_name); }
          else { $menu_id = $res->term_id; }
          $locs = get_theme_mod('nav_menu_locations');
          if (!is_array($locs)) $locs = [];
          $locs[$location] = $menu_id;
          set_theme_mod('nav_menu_locations', $locs);
        }
        if (!$menu_id) { $errors[]='Menu not available'; continue; }
        // clear existing items
        $existing = wp_get_nav_menu_items($menu_id);
        if ($existing) { foreach ($existing as $it) wp_delete_post($it->ID, true); }
        foreach ($items as $it) {
          $title = isset($it['title']) ? sanitize_text_field($it['title']) : '';
          $url = isset($it['url']) ? esc_url_raw($it['url']) : home_url('/');
          $align = isset($it['align']) ? sanitize_text_field($it['align']) : 'left';
          $mid = wp_update_nav_menu_item($menu_id, 0, [
            'menu-item-title' => $title,
            'menu-item-url' => $url,
            'menu-item-status' => 'publish',
          ]);
          if (!is_wp_error($mid)) {
            update_post_meta($mid, '_menu_item_align', $align);
            $created++;
          } else { $errors[]=$mid->get_error_message(); }
        }
      }
      return ['ok'=>true,'created'=>$created,'updated'=>$updated,'errors'=>$errors];
    },
    'permission_callback' => function () {
      return current_user_can('manage_options');
    }
  ]);

  register_rest_route('ecom/v1', '/options/styles', [
    'methods'  => 'POST',
    'callback' => function ($req) {
      $data = is_callable([$req, 'get_json_params']) ? $req->get_json_params() : null;
      if (is_array($data)) {
        if (isset($data['home_style'])) update_option('home_style', wp_json_encode($data['home_style']));
        if (isset($data['section_style'])) update_option('section_style', wp_json_encode($data['section_style']));
      }
      return ['ok' => true];
    },
    'permission_callback' => function () {
      return current_user_can('manage_options');
    }
  ]);
});
