-- MySQL dump 10.13  Distrib 5.7.33, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: forwarding
-- ------------------------------------------------------
-- Server version	5.7.36

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `consolidation_groups`
--

DROP TABLE IF EXISTS `consolidation_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `consolidation_groups` (
  `con_group_id` int(11) NOT NULL AUTO_INCREMENT,
  `con_group_color` varchar(45) DEFAULT NULL,
  `con_group_ex` int(11) DEFAULT NULL,
  `con_group_to` int(11) DEFAULT NULL,
  `con_group_active` tinyint(4) DEFAULT NULL,
  `con_group_confirmation_date` datetime DEFAULT NULL,
  `con_group_cost` double DEFAULT NULL,
  `con_group_local_cost` double DEFAULT NULL,
  `con_group_savings` double DEFAULT NULL,
  `con_group_forwarder` varchar(155) DEFAULT NULL,
  `con_group_deadline` varchar(45) DEFAULT NULL,
  `con_group_mode` varchar(45) DEFAULT NULL,
  `con_group_service_type` int(11) DEFAULT NULL,
  `con_group_currency` varchar(45) DEFAULT NULL,
  `con_group_rate` double DEFAULT NULL,
  `con_group_notes` text,
  PRIMARY KEY (`con_group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consolidation_groups`
--

LOCK TABLES `consolidation_groups` WRITE;
/*!40000 ALTER TABLE `consolidation_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `consolidation_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `products` (
  `product_id` int(11) NOT NULL AUTO_INCREMENT,
  `product_description` text COLLATE utf8_bin NOT NULL,
  `product_division_id` tinyint(4) NOT NULL,
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Certificate',1),(2,'Crew Mail',1),(3,'Endorsement',1),(4,'Stamp',1),(5,'Helmepa Material (Posters, Picture Frames, Etc.)',2),(6,'Metalic & Plastic Environmental Seals',2),(7,'Various Posters (Open Reporting System, Garbage ,etc.)',2),(8,'Flags',3),(9,'IMO Signs',3),(10,'Overalls',3),(11,'Publications - Log Book',3),(12,'Gas meters',4),(13,'Manuals',4),(14,'Normal Mail & Stationary',4),(15,'Publications',4),(16,'Computers / Servers',5),(17,'Satellite Equipment (Antenna, Cables, Terminal)',5),(18,'UPS System',5),(19,'Whole Infinity System (Racks,Servers,Cables)',5),(20,'CD For Charts - Publications Corrections',6),(21,'EPIRB - Radar Magnetrons - VHF',6),(22,'Mooring Ropes',6),(23,'Navigational Equipment',6),(24,'Paints',6),(25,'Bottles For Lub Oil Analysis',7),(26,'Spare Parts',7),(27,'Cabin Stores',8),(28,'Chemicals',8),(29,'Deck Stores',8),(30,'Engine Stores (Including Gasses)',8),(31,'Provisions',8),(32,'Documents',9),(33,'Fuel Additives',9),(34,'Items For Repair / Recondition',9),(35,'Materials For Labatory Analysis',9);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `colors`
--

DROP TABLE IF EXISTS `colors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `colors` (
  `color_id` int(11) NOT NULL AUTO_INCREMENT,
  `color_code` varchar(45) NOT NULL,
  PRIMARY KEY (`color_id`)
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `colors`
--

LOCK TABLES `colors` WRITE;
/*!40000 ALTER TABLE `colors` DISABLE KEYS */;
INSERT INTO `colors` VALUES (32,'#00FFFF'),(33,'#7FFFD4'),(34,'#DEB887'),(35,'#5F9EA0'),(36,'#D2691E'),(37,'#FF7F50'),(38,'#6495ED'),(39,'#DC143C'),(40,'#BDB76B'),(41,'#8FBC8F'),(42,'#FF00FF'),(43,'#808080'),(44,'#ADFF2F'),(45,'#CD5C5C'),(46,'#FFFACD'),(47,'#90EE90'),(48,'#FFA07A'),(49,'#87CEFA'),(50,'#B0C4DE'),(51,'#9370DB'),(52,'#FFA500'),(53,'#FF4500'),(54,'#DDA0DD'),(55,'#BC8F8F'),(56,'#8B4513'),(57,'#2E8B57'),(58,'#C0C0C0'),(59,'#FFFF00');
/*!40000 ALTER TABLE `colors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consolidations`
--

DROP TABLE IF EXISTS `consolidations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `consolidations` (
  `con_id` int(11) NOT NULL AUTO_INCREMENT,
  `con_user_id` int(11) NOT NULL,
  `con_division_id` int(11) DEFAULT NULL,
  `con_products` text CHARACTER SET utf8,
  `con_reference` varchar(45) CHARACTER SET utf8 DEFAULT NULL,
  `con_kg` double DEFAULT NULL,
  `con_estimate_cost` double DEFAULT NULL,
  `con_vessels` text CHARACTER SET utf8,
  `con_request_date` datetime DEFAULT NULL,
  `con_group_id` int(11) DEFAULT NULL,
  `con_status` varchar(55) CHARACTER SET utf8 DEFAULT NULL,
  `con_ind_id` int(11) DEFAULT NULL,
  `con_done_id` int(11) DEFAULT NULL,
  `con_pieces` int(4) DEFAULT NULL,
  `con_is_grouped` int(4) DEFAULT NULL,
  `con_type` varchar(45) DEFAULT NULL,
  `con_subid` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`con_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf16;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consolidations`
--

LOCK TABLES `consolidations` WRITE;
/*!40000 ALTER TABLE `consolidations` DISABLE KEYS */;
/*!40000 ALTER TABLE `consolidations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vessels`
--

DROP TABLE IF EXISTS `vessels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vessels` (
  `vessel_id` int(11) NOT NULL AUTO_INCREMENT,
  `vessel_description` varchar(45) NOT NULL,
  `vessel_deleted` int(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`vessel_id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vessels`
--

LOCK TABLES `vessels` WRITE;
/*!40000 ALTER TABLE `vessels` DISABLE KEYS */;
INSERT INTO `vessels` VALUES (1,'Aliki',1),(2,'Amphitrite',0),(3,'Arethusa',0),(4,'Artemis',0),(5,'Astarte',0),(6,'Atalandi',0),(7,'Baltimore',0),(8,'Boston',0),(9,'Coronis',0),(10,'Crystalia',0),(11,'Electra',0),(12,'G.P. Zafirakis',0),(13,'Houston',0),(14,'Ismene',0),(15,'Leto',0),(16,'Los Angeles',0),(17,'Maera',0),(18,'Maia',0),(19,'Medusa',0),(20,'Melia',0),(21,'Myrsini',0),(22,'Myrto',0),(23,'New Orleans',0),(24,'New York',0),(25,'New Port News',0),(26,'Oceanis',0),(27,'P.S. Palios',0),(28,'Phaidra',0),(29,'Philadelphia',0),(30,'Polymnia',0),(31,'San Fransisco',0),(32,'Santa Barbara',0),(33,'Seattle',0),(34,'Selina',0);
/*!40000 ALTER TABLE `vessels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consolidations_done`
--

DROP TABLE IF EXISTS `consolidations_done`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `consolidations_done` (
  `cond_id` int(11) NOT NULL AUTO_INCREMENT,
  `cond_user_id` int(11) DEFAULT NULL,
  `cond_division_id` int(11) DEFAULT NULL,
  `cond_products` text,
  `cond_reference` text,
  `cond_kg` double DEFAULT NULL,
  `cond_estimate_cost` double DEFAULT NULL,
  `cond_vessels` text,
  `cond_request_date` datetime DEFAULT NULL,
  `cond_notes` text,
  `cond_group_id` int(11) DEFAULT NULL,
  `cond_status` varchar(45) DEFAULT NULL,
  `cond_consolidated` tinyint(4) DEFAULT '0',
  `cond_ind_id` int(11) DEFAULT NULL,
  `cond_con_done_id` int(11) DEFAULT NULL,
  `cond_pieces` int(4) DEFAULT NULL,
  `cond_is_grouped` tinyint(4) DEFAULT NULL,
  `cond_service_type` int(11) DEFAULT NULL,
  `cond_type` varchar(45) DEFAULT NULL,
  `cond_highlight` int(4) DEFAULT '0',
  `cond_delivered_on_board` int(1) NOT NULL DEFAULT '0',
  `cond_subid` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`cond_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consolidations_done`
--

LOCK TABLES `consolidations_done` WRITE;
/*!40000 ALTER TABLE `consolidations_done` DISABLE KEYS */;
/*!40000 ALTER TABLE `consolidations_done` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `divisions`
--

DROP TABLE IF EXISTS `divisions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `divisions` (
  `division_id` int(11) NOT NULL AUTO_INCREMENT,
  `division_description` varchar(45) NOT NULL,
  PRIMARY KEY (`division_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `divisions`
--

LOCK TABLES `divisions` WRITE;
/*!40000 ALTER TABLE `divisions` DISABLE KEYS */;
INSERT INTO `divisions` VALUES (1,'Crew'),(2,'Environmental'),(3,'Forwarding'),(4,'HSQ'),(5,'IT'),(6,'Operations'),(7,'Purchasing'),(8,'Supply'),(9,'Technical');
/*!40000 ALTER TABLE `divisions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `individuals`
--

DROP TABLE IF EXISTS `individuals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `individuals` (
  `ind_id` int(11) NOT NULL AUTO_INCREMENT,
  `ind_division_id` int(11) NOT NULL,
  `ind_products` text,
  `ind_user_id` int(11) NOT NULL,
  `ind_vessels` text,
  `ind_ex` int(11) DEFAULT NULL,
  `ind_to` int(11) DEFAULT NULL,
  `ind_request_date` datetime DEFAULT NULL,
  `ind_deadline` varchar(45) DEFAULT NULL,
  `ind_status` varchar(45) DEFAULT NULL,
  `ind_forwarder` varchar(155) DEFAULT NULL,
  `ind_estimate_cost` double DEFAULT NULL,
  `ind_actual_cost` double DEFAULT NULL,
  `ind_notes` text,
  `ind_mode` varchar(45) DEFAULT NULL,
  `ind_kg` double DEFAULT NULL,
  `ind_reference` varchar(155) DEFAULT NULL,
  `ind_confirmation_date` datetime DEFAULT NULL,
  `ind_group_id` int(11) DEFAULT NULL,
  `ind_is_grouped` tinyint(4) DEFAULT NULL,
  `ind_deleted` int(11) DEFAULT NULL,
  `ind_consolidated` tinyint(4) DEFAULT '0',
  `ind_date_deleted` datetime DEFAULT NULL,
  `ind_service_type` int(11) DEFAULT NULL,
  `ind_pieces` int(4) DEFAULT NULL,
  `ind_currency` varchar(45) DEFAULT NULL,
  `ind_rate` double DEFAULT NULL,
  `ind_splitted` int(1) NOT NULL DEFAULT '0',
  `ind_parent` int(11) NOT NULL DEFAULT '0',
  `ind_dims` varchar(155) DEFAULT NULL,
  `ind_subid` varchar(45) DEFAULT NULL,
  `ind_split_color` varchar(45) DEFAULT NULL,
  `ind_dispatch_number` text,
  PRIMARY KEY (`ind_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `individuals`
--

LOCK TABLES `individuals` WRITE;
/*!40000 ALTER TABLE `individuals` DISABLE KEYS */;
/*!40000 ALTER TABLE `individuals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `individual_groups`
--

DROP TABLE IF EXISTS `individual_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `individual_groups` (
  `ind_group_id` int(11) NOT NULL AUTO_INCREMENT,
  `ind_group_color` varchar(45) DEFAULT NULL,
  `ind_group_ex` int(11) DEFAULT NULL,
  `ind_group_to` int(11) DEFAULT NULL,
  `ind_group_deadline` varchar(45) DEFAULT NULL,
  `ind_group_active` tinyint(4) DEFAULT NULL,
  `ind_group_confirmation_date` datetime DEFAULT NULL,
  `ind_group_cost` double DEFAULT NULL,
  `ind_group_forwarder` varchar(155) DEFAULT NULL,
  `ind_group_currency` varchar(45) DEFAULT NULL,
  `ind_group_rate` double DEFAULT NULL,
  PRIMARY KEY (`ind_group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `individual_groups`
--

LOCK TABLES `individual_groups` WRITE;
/*!40000 ALTER TABLE `individual_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `individual_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_roles`
--

DROP TABLE IF EXISTS `users_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users_roles` (
  `users_role_id` int(11) NOT NULL AUTO_INCREMENT,
  `users_role_description` varchar(45) NOT NULL,
  PRIMARY KEY (`users_role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_roles`
--

LOCK TABLES `users_roles` WRITE;
/*!40000 ALTER TABLE `users_roles` DISABLE KEYS */;
INSERT INTO `users_roles` VALUES (1,'USERS'),(2,'MANAGERS');
/*!40000 ALTER TABLE `users_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_types`
--

DROP TABLE IF EXISTS `service_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `service_types` (
  `service_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `service_type_description` text NOT NULL,
  `service_type_group` varchar(100) DEFAULT NULL,
  `service_type_deleted` int(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`service_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_types`
--

LOCK TABLES `service_types` WRITE;
/*!40000 ALTER TABLE `service_types` DISABLE KEYS */;
INSERT INTO `service_types` VALUES (1,'Local Orders','Individuals',0),(2,'Regular Dispatch','Individuals',0),(3,'Personnel Dispatch','Individuals',0),(4,'Cancelled','Individuals',0),(5,'Offland & Pick Up to Repair Shop','Individuals',0),(6,'Offland to Normal Warehouse','Individuals',0),(7,'Customs, Pick Up to Agent & On Board Delivery','Consolidations',0),(8,'Customs, Pick Up & On Board Delivery','Consolidations',0),(9,'Customs, Pick Up & Transport to Agent','Consolidations',0),(10,'From Agent to the Vessel','Consolidations',0),(11,'Pick Up, Customs & Dispatch','Consolidations',0),(12,'Pick Up & On Board Delivery','Consolidations',0),(13,'Pick Up & Delivery to Agent','Consolidations',0),(14,'Cancelled','Consolidations',0),(15,'Customs, Pick Up & Delivery on Board via Agent ','Consolidations',0);
/*!40000 ALTER TABLE `service_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cities`
--

DROP TABLE IF EXISTS `cities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cities` (
  `city_id` int(11) NOT NULL AUTO_INCREMENT,
  `city_name` varchar(155) DEFAULT NULL,
  `city_deleted` int(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`city_id`)
) ENGINE=InnoDB AUTO_INCREMENT=233 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cities`
--

LOCK TABLES `cities` WRITE;
/*!40000 ALTER TABLE `cities` DISABLE KEYS */;
INSERT INTO `cities` VALUES (1,'Kabul',0),(2,'Tirana (Tirane)',0),(3,'Algiers',0),(4,'Andorra la Vella',0),(5,'Luanda',0),(6,'Saint John\'s',0),(7,'Buenos Aires',0),(8,'Yerevan',0),(9,'Canberra',0),(10,'Vienna',0),(11,'Baku',0),(12,'Nassau',0),(13,'Manama',0),(14,'Dhaka',0),(15,'Bridgetown',0),(16,'Minsk',0),(17,'Brussels',0),(18,'Belmopan',0),(19,'Porto Novo',0),(20,'Thimphu',0),(21,'La Paz (administrative), Sucre (official)',0),(22,'Sarajevo',0),(23,'Gaborone',0),(24,'Brasilia',0),(25,'Bandar Seri Begawan',0),(26,'Sofia',0),(27,'Ouagadougou',0),(28,'Gitega',0),(29,'Phnom Penh',0),(30,'Yaounde',0),(31,'Ottawa',0),(32,'Praia',0),(33,'Bangui',0),(34,'N\'Djamena',0),(35,'Santiago',0),(36,'Beijing',0),(37,'Bogota',0),(38,'Moroni',0),(39,'Kinshasa',0),(40,'Brazzaville',0),(41,'San Jose',0),(42,'Yamoussoukro',0),(43,'Zagreb',0),(44,'Havana',0),(45,'Nicosia',0),(46,'Prague',0),(47,'Copenhagen',0),(48,'Djibouti',0),(49,'Roseau',0),(50,'Santo Domingo',0),(51,'Dili',0),(52,'Quito',0),(53,'Cairo',0),(54,'San Salvador',0),(55,'London',0),(56,'Malabo',0),(57,'Asmara',0),(58,'Tallinn',0),(59,'Mbabana',0),(60,'Addis Ababa',0),(61,'Palikir',0),(62,'Suva',0),(63,'Helsinki',0),(64,'Paris',0),(65,'Libreville',0),(66,'Banjul',0),(67,'Tbilisi',0),(69,'Accra',0),(71,'Saint George\'s',0),(72,'Guatemala City',0),(73,'Conakry',0),(74,'Bissau',0),(75,'Georgetown',0),(76,'Port au Prince',0),(77,'Tegucigalpa',0),(78,'Budapest',0),(79,'Reykjavik',0),(80,'New Delhi',0),(81,'Jakarta',0),(82,'Tehran',0),(83,'Baghdad',0),(84,'Dublin',0),(85,'Jerusalem',0),(86,'Rome',0),(87,'Kingston',0),(88,'Tokyo',0),(89,'Amman',0),(90,'Nur-Sultan',0),(91,'Nairobi',0),(92,'Tarawa Atoll',0),(93,'Pristina',0),(94,'Kuwait City',0),(95,'Bishkek',0),(96,'Vientiane',0),(97,'Riga',0),(98,'Beirut',0),(99,'Maseru',0),(100,'Monrovia',0),(101,'Tripoli',0),(102,'Vaduz',0),(103,'Vilnius',0),(104,'Luxembourg',0),(105,'Antananarivo',0),(106,'Lilongwe',0),(107,'Kuala Lumpur',0),(108,'Male',0),(109,'Bamako',0),(110,'Valletta',0),(111,'Majuro',0),(112,'Nouakchott',0),(113,'Port Louis',0),(114,'Mexico City',0),(115,'Chisinau',0),(116,'Monaco',0),(117,'Ulaanbaatar',0),(118,'Podgorica',0),(119,'Rabat',0),(120,'Maputo',0),(121,'Nay Pyi Taw',0),(122,'Windhoek',0),(123,'No official capital',0),(124,'Kathmandu',0),(125,'Amsterdam',0),(126,'Wellington',0),(127,'Managua',0),(128,'Niamey',0),(129,'Abuja',0),(130,'Pyongyang',0),(131,'Skopje',0),(132,'Belfast',0),(133,'Oslo',0),(134,'Muscat',0),(135,'Islamabad',0),(136,'Melekeok',0),(137,'Panama City',0),(138,'Port Moresby',0),(139,'Asuncion',0),(140,'Lima',0),(141,'Manila',0),(142,'Warsaw',0),(143,'Lisbon',0),(144,'Doha',0),(145,'Bucharest',0),(146,'Moscow',0),(147,'Kigali',0),(148,'Basseterre',0),(149,'Castries',0),(150,'Kingstown',0),(151,'Apia',0),(152,'San Marino',0),(153,'Sao Tome',0),(154,'Riyadh',0),(155,'Edinburgh',0),(156,'Dakar',0),(157,'Belgrade',0),(158,'Victoria',0),(159,'Freetown',0),(160,'Singapore',0),(161,'Bratislava',0),(162,'Ljubljana',0),(163,'Honiara',0),(164,'Mogadishu',0),(165,'Pretoria, Bloemfontein, Cape Town',0),(166,'Seoul',0),(167,'Juba',0),(168,'Madrid',0),(169,'Colombo[18]',0),(170,'Khartoum',0),(171,'Paramaribo',0),(172,'Stockholm',0),(173,'Bern',0),(174,'Damascus',0),(175,'Taipei',0),(176,'Dushanbe',0),(177,'Dodoma',0),(178,'Bangkok',0),(179,'Lome',0),(180,'Nuku\'alofa',0),(181,'Port of Spain',0),(182,'Tunis',0),(183,'Ankara',0),(184,'Ashgabat',0),(185,'Funafuti',0),(186,'Kampala',0),(187,'Kiev',0),(188,'Abu Dhabi',0),(189,'London',0),(190,'Washington D.C.',0),(191,'Montevideo',0),(192,'Tashkent',0),(193,'Port Vila',0),(194,'Vatican City',0),(195,'Caracas',0),(196,'Hanoi',0),(197,'Cardiff',0),(198,'Sanaa',0),(199,'Lusaka',0),(200,'Harare',0),(201,'Kalamata',0),(202,'Patra',0),(203,'Glyfada',0),(204,'BRUMA',0),(205,'Sandton',0),(206,'Varkiza',0),(207,'Johannesburg',0),(208,'Voula',0),(209,'Hello city',0),(210,'undefined',0),(211,'undefined',0),(212,'undefined',0),(214,'Berlin',0),(216,'Athens',0),(218,'Lamia',0);
/*!40000 ALTER TABLE `cities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'forwarding'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-05-27  9:06:52