-- Tuneng shared solar-assist bicycle database.
-- MySQL 5.7+ / 8.0+. Safe to run on a new database.
CREATE DATABASE IF NOT EXISTS tuneng_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tuneng_db;

-- The current app serves vehicle images from client/static, so the old asset
-- table is intentionally removed for the single-model database.
DROP TABLE IF EXISTS vehicle_model_assets;

CREATE TABLE IF NOT EXISTS users (
  user_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  openid VARCHAR(100) NOT NULL,
  nickname VARCHAR(50), avatar VARCHAR(255), phone VARCHAR(20),
  member_level VARCHAR(20) NOT NULL DEFAULT 'bronze',
  points INT NOT NULL DEFAULT 0, status TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id), UNIQUE KEY uq_users_openid (openid), UNIQUE KEY uq_users_phone (phone),
  KEY idx_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS vehicle_models (
  model_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  model_name VARCHAR(50) NOT NULL, model_desc TEXT, base_price INT NOT NULL DEFAULT 0,
  battery_capacity VARCHAR(20), solar_panel VARCHAR(50),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (model_id), UNIQUE KEY uq_vehicle_models_name (model_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS colors (
  color_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  color_name VARCHAR(20) NOT NULL, color_code VARCHAR(10),
  PRIMARY KEY (color_id), UNIQUE KEY uq_colors_name (color_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS vehicles (
  vehicle_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  bike_number VARCHAR(50) NOT NULL, model_id BIGINT UNSIGNED NOT NULL, color_id BIGINT UNSIGNED NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'available', current_lat DECIMAL(10,8), current_lng DECIMAL(11,8),
  battery_level TINYINT UNSIGNED NOT NULL DEFAULT 100, total_mileage INT UNSIGNED NOT NULL DEFAULT 0,
  last_maintenance DATETIME, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (vehicle_id), UNIQUE KEY uq_vehicles_bike_number (bike_number),
  KEY idx_vehicles_status_location (status, current_lat, current_lng),
  CONSTRAINT fk_vehicles_model FOREIGN KEY (model_id) REFERENCES vehicle_models(model_id),
  CONSTRAINT fk_vehicles_color FOREIGN KEY (color_id) REFERENCES colors(color_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS rental_orders (
  order_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL, vehicle_id BIGINT UNSIGNED NOT NULL,
  start_time DATETIME NOT NULL, end_time DATETIME, total_fee INT NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'ongoing', PRIMARY KEY (order_id),
  KEY idx_orders_user_time (user_id, start_time), KEY idx_orders_vehicle_status (vehicle_id, status),
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(user_id),
  CONSTRAINT fk_orders_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS points_transactions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, user_id BIGINT UNSIGNED NOT NULL,
  amount INT NOT NULL, type VARCHAR(20) NOT NULL, description VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (id),
  KEY idx_points_user_time (user_id, created_at),
  CONSTRAINT fk_points_user FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS parking_zones (
  zone_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, zone_name VARCHAR(100) NOT NULL,
  center_lat DECIMAL(10,8) NOT NULL, center_lng DECIMAL(11,8) NOT NULL,
  radius INT UNSIGNED NOT NULL DEFAULT 100, status TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(zone_id),
  UNIQUE KEY uq_parking_zones_name (zone_name), KEY idx_parking_zones_status(status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS vehicle_location_history (
  history_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, vehicle_id BIGINT UNSIGNED NOT NULL,
  lat DECIMAL(10,8) NOT NULL, lng DECIMAL(11,8) NOT NULL,
  recorded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(history_id),
  KEY idx_location_vehicle_time(vehicle_id, recorded_at),
  CONSTRAINT fk_location_vehicle FOREIGN KEY(vehicle_id) REFERENCES vehicles(vehicle_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS trip_tracks (
  track_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, order_id BIGINT UNSIGNED NOT NULL,
  lat DECIMAL(10,8) NOT NULL, lng DECIMAL(11,8) NOT NULL,
  recorded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(track_id),
  KEY idx_tracks_order_time(order_id, recorded_at),
  CONSTRAINT fk_tracks_order FOREIGN KEY(order_id) REFERENCES rental_orders(order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS admins (
  admin_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, username VARCHAR(50) NOT NULL,
  password_hash VARCHAR(255) NOT NULL, role VARCHAR(20) NOT NULL DEFAULT 'editor', status TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(admin_id),
  UNIQUE KEY uq_admins_username(username), KEY idx_admins_status(status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS merchants (
  merchant_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL, merchant_type VARCHAR(20) NOT NULL,
  contact_name VARCHAR(50) NOT NULL, contact_phone VARCHAR(30) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', cooperation_summary VARCHAR(1000),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (merchant_id), UNIQUE KEY uq_merchants_name (name), KEY idx_merchants_status (status), KEY idx_merchants_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO merchants (name, merchant_type, contact_name, contact_phone, status, cooperation_summary) VALUES
('无锡绿色出行经销中心', 'dealer', '张经理', '13800002222', 'active', '负责无锡区域整车销售与售后'),
('蠡湖生态景区', 'scenic', '王老师', '13900007654', 'pending', '申请部署 20 辆共享车辆'),
('江南大学骑行服务中心', 'campus', '李老师', '15100009088', 'frozen', '校园停车点运营合作')
ON DUPLICATE KEY UPDATE status=VALUES(status), cooperation_summary=VALUES(cooperation_summary);

CREATE TABLE IF NOT EXISTS admin_action_logs (
  log_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  admin_id BIGINT UNSIGNED NOT NULL, action VARCHAR(80) NOT NULL,
  resource_type VARCHAR(40) NOT NULL, resource_id VARCHAR(80), detail_json JSON,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (log_id), KEY idx_admin_logs_admin_time (admin_id, created_at),
  CONSTRAINT fk_admin_logs_admin FOREIGN KEY (admin_id) REFERENCES admins(admin_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO vehicle_models(model_name, model_desc, base_price, battery_capacity, solar_panel)
VALUES ('T87D', '途能旗舰太阳能助力车，支持弱光补能与智能电池管理。', 499900, '48V 20Ah', '高效单晶硅太阳能板')
ON DUPLICATE KEY UPDATE model_desc=VALUES(model_desc), base_price=VALUES(base_price), battery_capacity=VALUES(battery_capacity), solar_panel=VALUES(solar_panel);

INSERT INTO colors(color_name, color_code) VALUES
('珍珠白','#FFFFFF'),('粉','#FFB6C1'),('红','#FF4444'),('迈阿密蓝','#1E90FF')
ON DUPLICATE KEY UPDATE color_code=VALUES(color_code);

-- Replace the original demo Wuxi stations when this seed is rerun.
DELETE FROM parking_zones WHERE zone_name IN
('无锡站南广场','崇安寺步行街','南禅寺牌楼','清名桥古运河景区','无锡博物院','蠡湖公园');

INSERT INTO parking_zones(zone_name, center_lat, center_lng, radius) VALUES
('无锡站南广场',31.58500000,120.30500000,120),('崇安寺步行街停车点',31.58200000,120.30200000,100),
('南禅寺牌楼停车点',31.56600000,120.29800000,100),('清名桥古运河停车点',31.55200000,120.30600000,120),
('无锡博物院停车点',31.54300000,120.28600000,100),('蠡湖公园停车点',31.50300000,120.24600000,150)
ON DUPLICATE KEY UPDATE center_lat=VALUES(center_lat), center_lng=VALUES(center_lng), radius=VALUES(radius), status=1;

-- Demo vehicles are intentionally small and repeatable. Production fleets should be imported separately.
INSERT INTO vehicles(bike_number, model_id, color_id, status, current_lat, current_lng, battery_level)
SELECT s.bike_number, m.model_id, c.color_id, 'available', s.lat, s.lng, s.battery
FROM (SELECT 'TN001' bike_number,'珍珠白' color_name,31.58421000 lat,120.30268000 lng,92 battery
      UNION ALL SELECT 'TN002','粉',31.56881000,120.30856000,85
      UNION ALL SELECT 'TN003','红',31.55694000,120.31136000,96
      UNION ALL SELECT 'TN004','迈阿密蓝',31.53414000,120.24406000,81) s
JOIN vehicle_models m ON m.model_name='T87D' JOIN colors c ON c.color_name=s.color_name
ON DUPLICATE KEY UPDATE color_id=VALUES(color_id), current_lat=VALUES(current_lat), current_lng=VALUES(current_lng), battery_level=VALUES(battery_level), status='available';

-- Application data used by the shop, community, notifications and support pages.
CREATE TABLE IF NOT EXISTS user_addresses (
  address_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL, receiver_name VARCHAR(50) NOT NULL,
  phone VARCHAR(20) NOT NULL, province VARCHAR(50) NOT NULL, city VARCHAR(50) NOT NULL,
  district VARCHAR(50), detail_address VARCHAR(255) NOT NULL, is_default TINYINT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (address_id), KEY idx_addresses_user (user_id),
  CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS products (
  product_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_type VARCHAR(20) NOT NULL, name VARCHAR(120) NOT NULL, description TEXT,
  price_cents INT NOT NULL DEFAULT 0, points_price INT, image_url VARCHAR(700), status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (product_id), UNIQUE KEY uq_products_type_name (product_type, name), KEY idx_products_type_status (product_type, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS commerce_orders (
  order_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, order_no VARCHAR(40) NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL, order_type VARCHAR(20) NOT NULL, status VARCHAR(30) NOT NULL DEFAULT 'pending_payment',
  total_cents INT NOT NULL DEFAULT 0, points_used INT NOT NULL DEFAULT 0, address_id BIGINT UNSIGNED,
  remark VARCHAR(255), created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (order_id), UNIQUE KEY uq_commerce_order_no (order_no), KEY idx_commerce_orders_user (user_id, created_at),
  CONSTRAINT fk_commerce_orders_user FOREIGN KEY (user_id) REFERENCES users(user_id),
  CONSTRAINT fk_commerce_orders_address FOREIGN KEY (address_id) REFERENCES user_addresses(address_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS commerce_order_items (
  item_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED, product_name VARCHAR(120) NOT NULL, sku_label VARCHAR(120),
  quantity INT UNSIGNED NOT NULL DEFAULT 1, unit_price_cents INT NOT NULL DEFAULT 0, points_price INT,
  image_url VARCHAR(700), PRIMARY KEY (item_id), KEY idx_order_items_order (order_id),
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES commerce_orders(order_id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS order_payments (
  payment_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, order_id BIGINT UNSIGNED NOT NULL,
  provider VARCHAR(20) NOT NULL DEFAULT 'wechat', transaction_no VARCHAR(100), status VARCHAR(20) NOT NULL DEFAULT 'pending',
  amount_cents INT NOT NULL DEFAULT 0, prepay_id VARCHAR(255), paid_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (payment_id), UNIQUE KEY uq_payment_order (order_id),
  CONSTRAINT fk_order_payments_order FOREIGN KEY (order_id) REFERENCES commerce_orders(order_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS coupons (
  coupon_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, name VARCHAR(100) NOT NULL, coupon_type VARCHAR(20) NOT NULL,
  discount_cents INT NOT NULL DEFAULT 0, points_cost INT NOT NULL DEFAULT 0, valid_days INT NOT NULL DEFAULT 7,
  applicable_city VARCHAR(50), rules_json JSON, status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (coupon_id), UNIQUE KEY uq_coupons_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_coupons (
  user_coupon_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, user_id BIGINT UNSIGNED NOT NULL, coupon_id BIGINT UNSIGNED NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'available', claimed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, used_at DATETIME, used_order_id BIGINT UNSIGNED,
  expires_at DATETIME NOT NULL, PRIMARY KEY (user_coupon_id), UNIQUE KEY uq_user_coupon (user_id, coupon_id), KEY idx_user_coupons_status (user_id, status),
  CONSTRAINT fk_user_coupons_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_user_coupons_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(coupon_id),
  CONSTRAINT fk_user_coupons_order FOREIGN KEY (used_order_id) REFERENCES commerce_orders(order_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS community_posts (
  post_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, user_id BIGINT UNSIGNED NOT NULL,
  content TEXT NOT NULL, image_urls JSON, tags_json JSON, status VARCHAR(20) NOT NULL DEFAULT 'published',
  like_count INT UNSIGNED NOT NULL DEFAULT 0, comment_count INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id), KEY idx_posts_feed (status, created_at), KEY idx_posts_user (user_id, created_at),
  CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS community_comments (
  comment_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, post_id BIGINT UNSIGNED NOT NULL, user_id BIGINT UNSIGNED NOT NULL,
  content VARCHAR(1000) NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (comment_id), KEY idx_comments_post (post_id, created_at),
  CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES community_posts(post_id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS community_post_reactions (
  post_id BIGINT UNSIGNED NOT NULL, user_id BIGINT UNSIGNED NOT NULL, reaction_type VARCHAR(20) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (post_id, user_id, reaction_type),
  CONSTRAINT fk_reactions_post FOREIGN KEY (post_id) REFERENCES community_posts(post_id) ON DELETE CASCADE,
  CONSTRAINT fk_reactions_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notifications (
  notification_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, user_id BIGINT UNSIGNED,
  notification_type VARCHAR(20) NOT NULL, title VARCHAR(120) NOT NULL, summary VARCHAR(255), detail TEXT,
  payload_json JSON, is_read TINYINT NOT NULL DEFAULT 0, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (notification_id), KEY idx_notifications_user (user_id, is_read, created_at),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS repair_tickets (
  ticket_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, ticket_no VARCHAR(40) NOT NULL, user_id BIGINT UNSIGNED NOT NULL,
  vehicle_id BIGINT UNSIGNED, vehicle_identifier VARCHAR(50) NOT NULL, issue_types_json JSON NOT NULL, description TEXT,
  contact_phone VARCHAR(20) NOT NULL, photo_urls JSON, status VARCHAR(20) NOT NULL DEFAULT 'submitted', resolution TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (ticket_id), UNIQUE KEY uq_repair_ticket_no (ticket_no), KEY idx_repairs_user (user_id, created_at),
  CONSTRAINT fk_repairs_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_repairs_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS support_messages (
  message_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, user_id BIGINT UNSIGNED NOT NULL, role VARCHAR(20) NOT NULL,
  content VARCHAR(2000) NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (message_id), KEY idx_support_user_time (user_id, created_at),
  CONSTRAINT fk_support_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Concrete catalog and benefits used by the current T87D prototype.
INSERT INTO products (product_type, name, description, price_cents, points_price, image_url, status) VALUES
('vehicle', '途能 T87D 太阳能助力车', '旗舰太阳能助力车，支持弱光补能、NFC 解锁和北斗定位。', 499900, NULL, '/static/products/vehicles/t87d-moon-white-card.png', 'active'),
('accessory', '轻量骑行头盔', '一体成型，通风透气。', 29900, NULL, '/static/products/accessories/helmet.png', 'active'),
('accessory', '防水骑行包', '15L 容量，快拆固定。', 16900, NULL, '/static/products/accessories/waterproof-bag.png', 'active'),
('accessory', '智能车锁', '蓝牙解锁，异动提醒。', 19900, NULL, '/static/products/accessories/smart-lock.png', 'active'),
('accessory', '户外补能灯', 'USB-C 充电，三档亮度。', 12900, NULL, '/static/products/accessories/recharge-light.png', 'active')
ON DUPLICATE KEY UPDATE description=VALUES(description), price_cents=VALUES(price_cents), image_url=VALUES(image_url), status='active';

INSERT INTO coupons (name, coupon_type, discount_cents, points_cost, valid_days, applicable_city, rules_json, status) VALUES
('新用户首骑券', 'ride_discount', 600, 0, 7, '无锡市', JSON_OBJECT('firstRideOnly', true, 'stackable', false), 'active'),
('骑行优惠券', 'ride_discount', 200, 120, 30, '无锡市', JSON_OBJECT('stackable', false), 'active'),
('骑行月卡', 'ride_membership', 0, 980, 30, '无锡市', JSON_OBJECT('unlimitedRides', true), 'active')
ON DUPLICATE KEY UPDATE discount_cents=VALUES(discount_cents), points_cost=VALUES(points_cost), valid_days=VALUES(valid_days), applicable_city=VALUES(applicable_city), rules_json=VALUES(rules_json), status='active';
