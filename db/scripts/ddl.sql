-- nida_smart_energy.`action` definition

CREATE TABLE `action` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `label` varchar(256) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;


-- nida_smart_energy.building definition

CREATE TABLE `building` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `label` text NOT NULL,
  `floors` int(11) NOT NULL DEFAULT 0,
  `color_code` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `building_UN` (`label`) USING HASH
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4;


-- nida_smart_energy.etc definition

CREATE TABLE `etc` (
  `id` varchar(256) NOT NULL,
  `value` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- nida_smart_energy.permission definition

CREATE TABLE `permission` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `label` varchar(1024) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permission_UN` (`label`) USING HASH
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4;


-- nida_smart_energy.`system` definition

CREATE TABLE `system` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `label` varchar(256) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;


-- nida_smart_energy.user_type definition

CREATE TABLE `user_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `label` varchar(256) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_type_UN` (`label`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4;


-- nida_smart_energy.device definition

CREATE TABLE `device` (
  `id` varchar(256) NOT NULL,
  `building_id` int(11) DEFAULT NULL,
  `system_id` int(11) DEFAULT NULL,
  `brand_model` text DEFAULT NULL,
  `location` text DEFAULT NULL,
  `site` text DEFAULT NULL,
  `activated_datetime` datetime DEFAULT NULL,
  `floor` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `building_id` (`building_id`),
  KEY `system_id` (`system_id`),
  CONSTRAINT `device_ibfk_1` FOREIGN KEY (`building_id`) REFERENCES `building` (`id`),
  CONSTRAINT `device_ibfk_2` FOREIGN KEY (`system_id`) REFERENCES `system` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- nida_smart_energy.log_iaq definition

CREATE TABLE `log_iaq` (
  `data_datetime` datetime NOT NULL,
  `device_id` varchar(256) NOT NULL,
  `humidity` double DEFAULT NULL,
  `temperature` double DEFAULT NULL,
  PRIMARY KEY (`data_datetime`,`device_id`),
  KEY `device_id` (`device_id`),
  CONSTRAINT `log_iaq_ibfk_1` FOREIGN KEY (`device_id`) REFERENCES `device` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- nida_smart_energy.log_power_meter definition

CREATE TABLE `log_power_meter` (
  `data_datetime` datetime NOT NULL,
  `device_id` varchar(256) NOT NULL,
  `current_l1` double DEFAULT NULL,
  `current_l2` double DEFAULT NULL,
  `current_l3` double DEFAULT NULL,
  `hz` double DEFAULT NULL,
  `kwh` double DEFAULT NULL,
  `kw_l1` double DEFAULT NULL,
  `kw_l2` double DEFAULT NULL,
  `kw_l3` double DEFAULT NULL,
  `demand_kw` double DEFAULT NULL,
  `kva_total` double DEFAULT NULL,
  `kvar_total` double DEFAULT NULL,
  `kw_total` double DEFAULT NULL,
  `pf` double DEFAULT NULL,
  `pf1` double DEFAULT NULL,
  `pf2` double DEFAULT NULL,
  `pf3` double DEFAULT NULL,
  `voltage_l1_l2` double DEFAULT NULL,
  `voltage_l2_l3` double DEFAULT NULL,
  `voltage_l3_l1` double DEFAULT NULL,
  `kva_l1` double DEFAULT NULL,
  `kva_l2` double DEFAULT NULL,
  `kva_l3` double DEFAULT NULL,
  `kvar_l1` double DEFAULT NULL,
  `kvar_l2` double DEFAULT NULL,
  `kvar_l3` double DEFAULT NULL,
  `thd_current_avg` double DEFAULT NULL,
  `thd_current_l1` double DEFAULT NULL,
  `thd_current_l2` double DEFAULT NULL,
  `thd_current_l3` double DEFAULT NULL,
  `thd_voltage_avg` double DEFAULT NULL,
  `thd_voltage_l1` double DEFAULT NULL,
  `thd_voltage_l2` double DEFAULT NULL,
  `thd_voltage_l3` double DEFAULT NULL,
  `voltage_l1_N` double DEFAULT NULL,
  `voltage_l2_N` double DEFAULT NULL,
  `voltage_l3_N` double DEFAULT NULL,
  `kvah` double DEFAULT NULL,
  `kvarh` double DEFAULT NULL,
  `peak_kw_max_demand` double DEFAULT NULL,
  PRIMARY KEY (`data_datetime`,`device_id`),
  KEY `device_id` (`device_id`),
  CONSTRAINT `log_power_meter_ibfk_1` FOREIGN KEY (`device_id`) REFERENCES `device` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- nida_smart_energy.log_solar definition

CREATE TABLE `log_solar` (
  `data_datetime` datetime NOT NULL,
  `device_id` varchar(256) NOT NULL,
  `current_l1` double DEFAULT NULL,
  `current_l2` double DEFAULT NULL,
  `current_l3` double DEFAULT NULL,
  `hz` double DEFAULT NULL,
  `kwh` double DEFAULT NULL,
  `kw_l1` double DEFAULT NULL,
  `kw_l2` double DEFAULT NULL,
  `kw_l3` double DEFAULT NULL,
  `demand` double DEFAULT NULL,
  `kva` double DEFAULT NULL,
  `kvar` double DEFAULT NULL,
  `kw` double DEFAULT NULL,
  `pf` double DEFAULT NULL,
  `pf_l1` double DEFAULT NULL,
  `pf_l2` double DEFAULT NULL,
  `pf_l3` double DEFAULT NULL,
  `voltage_l1` double DEFAULT NULL,
  `voltage_l2` double DEFAULT NULL,
  `voltage_l3` double DEFAULT NULL,
  PRIMARY KEY (`data_datetime`,`device_id`),
  KEY `device_id` (`device_id`),
  CONSTRAINT `log_solar_ibfk_1` FOREIGN KEY (`device_id`) REFERENCES `device` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- nida_smart_energy.target definition

CREATE TABLE `target` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `building_id` int(11) NOT NULL,
  `month` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `electricity_bill` double DEFAULT NULL,
  `amount_people` double DEFAULT NULL,
  `tariff` double DEFAULT NULL,
  `energy_usage` double DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `target_UN` (`month`,`year`,`building_id`),
  KEY `target_ibfk_1` (`building_id`),
  CONSTRAINT `target_ibfk_1` FOREIGN KEY (`building_id`) REFERENCES `building` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;


-- nida_smart_energy.`user` definition

CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_type_id` int(11) NOT NULL,
  `username` text NOT NULL,
  `email` text DEFAULT NULL,
  `salt` text NOT NULL,
  `hash_password` text NOT NULL,
  `is_email_verified` tinyint(4) NOT NULL DEFAULT 0,
  `activated_timestamp` timestamp NULL DEFAULT NULL,
  `last_login_timestamp` timestamp NULL DEFAULT NULL,
  `profile_image` blob DEFAULT NULL,
  `is_user_type_approved` tinyint(4) NOT NULL DEFAULT 0,
  `is_deactivated` tinyint(4) NOT NULL DEFAULT 0,
  `profile_image_content_type` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_UNIQUE_username` (`username`) USING HASH,
  UNIQUE KEY `user_UNIQUE_email` (`email`) USING HASH,
  KEY `user_type_id` (`user_type_id`),
  CONSTRAINT `user_ibfk_1` FOREIGN KEY (`user_type_id`) REFERENCES `user_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4;


-- nida_smart_energy.user_action definition

CREATE TABLE `user_action` (
  `logged_timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_id` int(11) NOT NULL,
  `action_id` int(11) NOT NULL,
  UNIQUE KEY `user_action_UN` (`user_id`,`action_id`,`logged_timestamp`),
  KEY `user_action_ibfk_2` (`action_id`),
  CONSTRAINT `user_action_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_action_ibfk_2` FOREIGN KEY (`action_id`) REFERENCES `action` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- nida_smart_energy.user_type_permission definition

CREATE TABLE `user_type_permission` (
  `user_type_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  UNIQUE KEY `user_type_permission_UN` (`user_type_id`,`permission_id`),
  KEY `user_type_permission_ibfk_2` (`permission_id`),
  CONSTRAINT `user_type_permission_ibfk_1` FOREIGN KEY (`user_type_id`) REFERENCES `user_type` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_type_permission_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permission` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- nida_smart_energy.activity definition

CREATE TABLE `activity` (
  `datetime` datetime NOT NULL DEFAULT current_timestamp(),
  `user_id` int(11) NOT NULL,
  `action_id` int(11) NOT NULL,
  KEY `user_id` (`user_id`),
  CONSTRAINT `activity_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- nida_smart_energy.hash_email definition

CREATE TABLE `hash_email` (
  `user_id` int(11) NOT NULL,
  `hash` text NOT NULL,
  KEY `user_id` (`user_id`),
  CONSTRAINT `hash_email_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;