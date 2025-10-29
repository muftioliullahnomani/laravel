<?php
if (!defined('ABSPATH')) exit;

// Row quick actions for orders
add_filter('post_row_actions', function($actions, $post){
  if ($post->post_type !== 'order') return $actions;
  $base = admin_url('admin-post.php');
  $nonce = wp_create_nonce('ecom_order_action');
  $actions['ecom_cancel'] = '<a href="'.esc_url(add_query_arg(['action'=>'ecom_order_action','do'=>'cancel','order_id'=>$post->ID,'_wpnonce'=>$nonce], $base)).'">Cancel</a>';
  $actions['ecom_paid'] = '<a href="'.esc_url(add_query_arg(['action'=>'ecom_order_action','do'=>'mark-paid','order_id'=>$post->ID,'_wpnonce'=>$nonce], $base)).'">Mark Paid</a>';
  $actions['ecom_shipped'] = '<a href="'.esc_url(add_query_arg(['action'=>'ecom_order_action','do'=>'mark-shipped','order_id'=>$post->ID,'_wpnonce'=>$nonce], $base)).'">Mark Shipped</a>';
  $actions['ecom_completed'] = '<a href="'.esc_url(add_query_arg(['action'=>'ecom_order_action','do'=>'mark-completed','order_id'=>$post->ID,'_wpnonce'=>$nonce], $base)).'">Mark Completed</a>';
  return $actions;
}, 10, 2);

// Handle row actions
add_action('admin_post_ecom_order_action', function(){
  if (!current_user_can('edit_posts')) wp_die('Unauthorized');
  if (!isset($_GET['_wpnonce']) || !wp_verify_nonce($_GET['_wpnonce'], 'ecom_order_action')) wp_die('Bad nonce');
  $order_id = isset($_GET['order_id']) ? (int)$_GET['order_id'] : 0;
  $do = sanitize_text_field($_GET['do'] ?? '');
  if ($order_id<=0 || get_post_type($order_id)!=='order') wp_die('Invalid order');
  switch ($do) {
    case 'cancel':
      update_post_meta($order_id, '_status', 'cancelled');
      if (!get_post_meta($order_id, '_payment_status', true)) update_post_meta($order_id, '_payment_status', 'unpaid');
      break;
    case 'mark-paid':
      update_post_meta($order_id, '_payment_status', 'paid');
      $status = get_post_meta($order_id, '_status', true);
      if ($status==='pending' || !$status) update_post_meta($order_id, '_status', 'paid');
      break;
    case 'mark-shipped':
      update_post_meta($order_id, '_status', 'shipped');
      break;
    case 'mark-completed':
      update_post_meta($order_id, '_status', 'completed');
      if (get_post_meta($order_id, '_payment_status', true)!=='paid') update_post_meta($order_id, '_payment_status', 'paid');
      break;
  }
  wp_safe_redirect(wp_get_referer() ?: admin_url('edit.php?post_type=order'));
  exit;
});

// Bulk actions
add_filter('bulk_actions-edit-order', function($bulk_actions){
  $bulk_actions['ecom_cancel'] = 'Mark Cancelled';
  $bulk_actions['ecom_mark_paid'] = 'Mark Paid';
  $bulk_actions['ecom_mark_shipped'] = 'Mark Shipped';
  $bulk_actions['ecom_mark_completed'] = 'Mark Completed';
  return $bulk_actions;
});

add_filter('handle_bulk_actions-edit-order', function($redirect_to, $doaction, $post_ids){
  if (!current_user_can('edit_posts')) return $redirect_to;
  foreach ($post_ids as $order_id) {
    if (get_post_type($order_id)!=='order') continue;
    switch ($doaction) {
      case 'ecom_cancel':
        update_post_meta($order_id, '_status', 'cancelled');
        if (!get_post_meta($order_id, '_payment_status', true)) update_post_meta($order_id, '_payment_status', 'unpaid');
        break;
      case 'ecom_mark_paid':
        update_post_meta($order_id, '_payment_status', 'paid');
        $status = get_post_meta($order_id, '_status', true);
        if ($status==='pending' || !$status) update_post_meta($order_id, '_status', 'paid');
        break;
      case 'ecom_mark_shipped':
        update_post_meta($order_id, '_status', 'shipped');
        break;
      case 'ecom_mark_completed':
        update_post_meta($order_id, '_status', 'completed');
        if (get_post_meta($order_id, '_payment_status', true)!=='paid') update_post_meta($order_id, '_payment_status', 'paid');
        break;
    }
  }
  return add_query_arg('ecom_bulk_done', '1', $redirect_to);
}, 10, 3);
