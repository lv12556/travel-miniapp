-- Tuneng shared solar-assist bicycle database.
-- MySQL 5.7+ / 8.0+. Safe to run on a new database.
CREATE DATABASE IF NOT EXISTS tuneng_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tuneng_db;

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

CREATE TABLE IF NOT EXISTS vehicle_model_assets (
  asset_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, model_id BIGINT UNSIGNED NOT NULL,
  color_id BIGINT UNSIGNED, asset_type VARCHAR(20) NOT NULL, asset_name VARCHAR(255) NOT NULL,
  asset_path VARCHAR(700) NOT NULL, sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(asset_id),
  UNIQUE KEY uq_model_assets_path(model_id, asset_path),
  CONSTRAINT fk_model_assets_model FOREIGN KEY(model_id) REFERENCES vehicle_models(model_id),
  CONSTRAINT fk_model_assets_color FOREIGN KEY(color_id) REFERENCES colors(color_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS admins (
  admin_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, username VARCHAR(50) NOT NULL,
  password_hash VARCHAR(255) NOT NULL, role VARCHAR(20) NOT NULL DEFAULT 'editor',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(admin_id),
  UNIQUE KEY uq_admins_username(username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO vehicle_models(model_name, model_desc, base_price, battery_capacity, solar_panel)
VALUES ('T87D', '途能旗舰太阳能助力车，支持弱光补能与智能电池管理。', 299900, '48V 20Ah', '高效单晶硅太阳能板')
ON DUPLICATE KEY UPDATE model_desc=VALUES(model_desc), base_price=VALUES(base_price), battery_capacity=VALUES(battery_capacity), solar_panel=VALUES(solar_panel);

INSERT INTO colors(color_name, color_code) VALUES
('珍珠白','#FFFFFF'),('粉','#FFB6C1'),('红','#FF4444'),('迈阿密蓝','#1E90FF')
ON DUPLICATE KEY UPDATE color_code=VALUES(color_code);

INSERT INTO parking_zones(zone_name, center_lat, center_lng, radius) VALUES
('无锡站南广场',31.58410000,120.30250000,120),('崇安寺步行街',31.57560000,120.30750000,100),
('南禅寺牌楼',31.56865000,120.30840000,100),('清名桥古运河景区',31.55790000,120.30750000,120),
('无锡博物院',31.55680000,120.31120000,100),('蠡湖公园',31.53400000,120.24390000,150)
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
