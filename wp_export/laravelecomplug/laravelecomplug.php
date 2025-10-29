<?php
/**
 * Plugin Name: laravelecomplug
 * Description: Custom ecommerce core (products, orders, cart/checkout COD, menu align, styles, import endpoints)
 * Version: 1.0.0
 * Author: You
 */
if (!defined('ABSPATH')) exit;

define('LARAVELECOMPLUG_PATH', __DIR__);
define('LARAVELECOMPLUG_URL', plugin_dir_url(__FILE__));

require_once __DIR__ . '/includes/bootstrap.php';
