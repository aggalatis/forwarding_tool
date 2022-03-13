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
INSERT INTO `vessels` VALUES (1,'Aliki',1),(2,'Amphitrite',0),(3,'Arethusa',0),(4,'Artemis',0),(5,'Astarte',0),(6,'Atalandi',0),(7,'Baltimore',0),(8,'Boston',0),(9,'Coronis',0),(10,'Crystalia',0),(11,'Electra',0),(12,'G.P. Zafirakis',0),(13,'Houston',0),(14,'Ismene',0),(15,'Leto',0),(16,'Los Angeles',0),(17,'Maera',0),(18,'Maia',0),(19,'Medusa',0),(20,'Melia',0),(21,'Myrsini',0),(22,'Myrto',0),(23,'New Orleans',0),(24,'New York',0),(25,'New Port News',0),(26,'Oceanis',0),(27,'P.S. Palios',0),(28,'Phaidra',0),(29,'Philadelphia',0),(30,'Polymnia',0),(31,'San Fransisco',0),(32,'Santa Barbara',0),(33,'Seattle',0),(34,'Selina',0),(35,'MY vessel!!!',1),(36,'Test vessel',1);
/*!40000 ALTER TABLE `vessels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personnel`
--

DROP TABLE IF EXISTS `personnel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `personnel` (
  `per_id` int(11) NOT NULL AUTO_INCREMENT,
  `per_user_id` int(11) DEFAULT NULL,
  `per_division_id` int(11) DEFAULT NULL,
  `per_products` text,
  `per_mode` varchar(45) DEFAULT NULL,
  `per_name` text,
  `per_vessels` text,
  `per_ex` int(11) DEFAULT NULL,
  `per_to` int(11) DEFAULT NULL,
  `per_request_date` datetime DEFAULT NULL,
  `per_deadline` date DEFAULT NULL,
  `per_status` varchar(45) DEFAULT NULL,
  `per_estimate_cost` double DEFAULT NULL,
  `per_actual_cost` double DEFAULT NULL,
  `per_saving` double DEFAULT NULL,
  `per_notes` text,
  `per_kg` double DEFAULT NULL,
  `per_confirmation_date` datetime DEFAULT NULL,
  `per_deleted` tinyint(4) DEFAULT NULL,
  `per_date_deleted` datetime DEFAULT NULL,
  PRIMARY KEY (`per_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personnel`
--

LOCK TABLES `personnel` WRITE;
/*!40000 ALTER TABLE `personnel` DISABLE KEYS */;
/*!40000 ALTER TABLE `personnel` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=229 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cities`
--

LOCK TABLES `cities` WRITE;
/*!40000 ALTER TABLE `cities` DISABLE KEYS */;
INSERT INTO `cities` VALUES (1,'Kabul',0),(2,'Tirana (Tirane)',0),(3,'Algiers',0),(4,'Andorra la Vella',0),(5,'Luanda',0),(6,'Saint John\'s',0),(7,'Buenos Aires',0),(8,'Yerevan',0),(9,'Canberra',0),(10,'Vienna',0),(11,'Baku',0),(12,'Nassau',0),(13,'Manama',0),(14,'Dhaka',0),(15,'Bridgetown',0),(16,'Minsk',0),(17,'Brussels',0),(18,'Belmopan',0),(19,'Porto Novo',0),(20,'Thimphu',0),(21,'La Paz (administrative), Sucre (official)',0),(22,'Sarajevo',0),(23,'Gaborone',0),(24,'Brasilia',0),(25,'Bandar Seri Begawan',0),(26,'Sofia',0),(27,'Ouagadougou',0),(28,'Gitega',0),(29,'Phnom Penh',0),(30,'Yaounde',0),(31,'Ottawa',0),(32,'Praia',0),(33,'Bangui',0),(34,'N\'Djamena',0),(35,'Santiago',0),(36,'Beijing',0),(37,'Bogota',0),(38,'Moroni',0),(39,'Kinshasa',0),(40,'Brazzaville',0),(41,'San Jose',0),(42,'Yamoussoukro',0),(43,'Zagreb',0),(44,'Havana',0),(45,'Nicosia',0),(46,'Prague',0),(47,'Copenhagen',0),(48,'Djibouti',0),(49,'Roseau',0),(50,'Santo Domingo',0),(51,'Dili',0),(52,'Quito',0),(53,'Cairo',0),(54,'San Salvador',0),(55,'London',0),(56,'Malabo',0),(57,'Asmara',0),(58,'Tallinn',0),(59,'Mbabana',0),(60,'Addis Ababa',0),(61,'Palikir',0),(62,'Suva',0),(63,'Helsinki',0),(64,'Paris',0),(65,'Libreville',0),(66,'Banjul',0),(67,'Tbilisi',0),(69,'Accra',0),(71,'Saint George\'s',0),(72,'Guatemala City',0),(73,'Conakry',0),(74,'Bissau',0),(75,'Georgetown',0),(76,'Port au Prince',0),(77,'Tegucigalpa',0),(78,'Budapest',0),(79,'Reykjavik',0),(80,'New Delhi',0),(81,'Jakarta',0),(82,'Tehran',0),(83,'Baghdad',0),(84,'Dublin',0),(85,'Jerusalem',0),(86,'Rome',0),(87,'Kingston',0),(88,'Tokyo',0),(89,'Amman',0),(90,'Nur-Sultan',0),(91,'Nairobi',0),(92,'Tarawa Atoll',0),(93,'Pristina',0),(94,'Kuwait City',0),(95,'Bishkek',0),(96,'Vientiane',0),(97,'Riga',0),(98,'Beirut',0),(99,'Maseru',0),(100,'Monrovia',0),(101,'Tripoli',0),(102,'Vaduz',0),(103,'Vilnius',0),(104,'Luxembourg',0),(105,'Antananarivo',0),(106,'Lilongwe',0),(107,'Kuala Lumpur',0),(108,'Male',0),(109,'Bamako',0),(110,'Valletta',0),(111,'Majuro',0),(112,'Nouakchott',0),(113,'Port Louis',0),(114,'Mexico City',0),(115,'Chisinau',0),(116,'Monaco',0),(117,'Ulaanbaatar',0),(118,'Podgorica',0),(119,'Rabat',0),(120,'Maputo',0),(121,'Nay Pyi Taw',0),(122,'Windhoek',0),(123,'No official capital',0),(124,'Kathmandu',0),(125,'Amsterdam',0),(126,'Wellington',0),(127,'Managua',0),(128,'Niamey',0),(129,'Abuja',0),(130,'Pyongyang',0),(131,'Skopje',0),(132,'Belfast',0),(133,'Oslo',0),(134,'Muscat',0),(135,'Islamabad',0),(136,'Melekeok',0),(137,'Panama City',0),(138,'Port Moresby',0),(139,'Asuncion',0),(140,'Lima',0),(141,'Manila',0),(142,'Warsaw',0),(143,'Lisbon',0),(144,'Doha',0),(145,'Bucharest',0),(146,'Moscow',0),(147,'Kigali',0),(148,'Basseterre',0),(149,'Castries',0),(150,'Kingstown',0),(151,'Apia',0),(152,'San Marino',0),(153,'Sao Tome',0),(154,'Riyadh',0),(155,'Edinburgh',0),(156,'Dakar',0),(157,'Belgrade',0),(158,'Victoria',0),(159,'Freetown',0),(160,'Singapore',0),(161,'Bratislava',0),(162,'Ljubljana',0),(163,'Honiara',0),(164,'Mogadishu',0),(165,'Pretoria, Bloemfontein, Cape Town',0),(166,'Seoul',0),(167,'Juba',0),(168,'Madrid',0),(169,'Colombo[18]',0),(170,'Khartoum',0),(171,'Paramaribo',0),(172,'Stockholm',0),(173,'Bern',0),(174,'Damascus',0),(175,'Taipei',0),(176,'Dushanbe',0),(177,'Dodoma',0),(178,'Bangkok',0),(179,'Lome',0),(180,'Nuku\'alofa',0),(181,'Port of Spain',0),(182,'Tunis',0),(183,'Ankara',0),(184,'Ashgabat',0),(185,'Funafuti',0),(186,'Kampala',0),(187,'Kiev',0),(188,'Abu Dhabi',0),(189,'London',0),(190,'Washington D.C.',0),(191,'Montevideo',0),(192,'Tashkent',0),(193,'Port Vila',0),(194,'Vatican City',0),(195,'Caracas',0),(196,'Hanoi',0),(197,'Cardiff',0),(198,'Sanaa',0),(199,'Lusaka',0),(200,'Harare',0),(201,'Kalamata',0),(202,'Patra',0),(203,'Glyfada',0),(204,'BRUMA',0),(205,'Sandton',0),(206,'Varkiza',0),(207,'Johannesburg',0),(208,'Voula',0),(209,'Hello city',0),(210,'undefined',0),(211,'undefined',0),(212,'undefined',0),(214,'Berlin',0),(216,'Athens',0),(218,'Lamia',0),(221,'this is a city',0),(222,'Test City1123',1),(223,'Test (assoc)',1),(227,'false (hello)',0),(228,'hello (world)',0);
/*!40000 ALTER TABLE `cities` ENABLE KEYS */;
UNLOCK TABLES;

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
  PRIMARY KEY (`con_group_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consolidation_groups`
--

LOCK TABLES `consolidation_groups` WRITE;
/*!40000 ALTER TABLE `consolidation_groups` DISABLE KEYS */;
INSERT INTO `consolidation_groups` VALUES (1,'#7FFFD4',129,53,0,'2022-03-13 14:41:39',150,150,NULL,'dhl','31/03/2022','Courier',11),(2,'#DDA0DD',3,NULL,1,NULL,NULL,100,NULL,'','','',NULL);
/*!40000 ALTER TABLE `consolidation_groups` ENABLE KEYS */;
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
  PRIMARY KEY (`ind_group_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `individual_groups`
--

LOCK TABLES `individual_groups` WRITE;
/*!40000 ALTER TABLE `individual_groups` DISABLE KEYS */;
INSERT INTO `individual_groups` VALUES (1,'#DC143C',188,129,'2022-03-31',0,'2022-03-09 22:39:04',2500,'dhl'),(2,'empty',188,129,'2022-03-16',0,'2022-03-09 22:40:43',NULL,NULL),(3,'empty',188,3,'2022-03-31',1,NULL,NULL,NULL),(4,'#D2691E',188,129,'2022-03-31',0,NULL,2000,'');
/*!40000 ALTER TABLE `individual_groups` ENABLE KEYS */;
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
  `ind_products` text NOT NULL,
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
  PRIMARY KEY (`ind_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `individuals`
--

LOCK TABLES `individuals` WRITE;
/*!40000 ALTER TABLE `individuals` DISABLE KEYS */;
INSERT INTO `individuals` VALUES (1,2,'Metalic & Plastic Environmental Seals',2,'Arethusa',188,129,'2022-03-09 22:36:50','2022-03-31','Done','dhl',1367.6847103790858,NULL,'','Courier',100,'myReference','2022-03-09 22:39:04',1,1,0,0,NULL,8,2),(2,5,'UPS System;Whole Infinity System (Racks,Servers,Cables)',2,'Atalandi;Medusa',188,129,'2022-03-09 22:37:09','2022-03-31','Done','test',300,NULL,'','Courier',NULL,'lalala','2022-03-09 22:39:04',1,1,0,1,NULL,0,NULL),(3,9,'Fuel Additives',2,'Boston',188,129,'2022-03-09 22:37:55','2022-03-31','Done','dhl',1500,NULL,'','Road',4,'test','2022-03-09 22:39:04',1,1,0,1,NULL,7,6),(4,3,'Overalls',2,'Astarte',188,129,'2022-03-09 22:39:38','2022-03-28','Done','1',50,30,'','Personnel',1,'1','2022-03-09 22:40:07',0,0,0,1,NULL,7,1),(5,8,'Deck Stores',2,'Artemis',188,129,'2022-03-09 22:40:38','2022-03-16','Done','1',45.58949034596953,NULL,'','Sea',1,'1','2022-03-09 22:40:43',2,0,0,1,NULL,9,11),(6,3,'IMO Signs',2,'Electra',188,3,'2022-03-12 18:46:31','2022-03-31','Done','1',100,20,'','Personnel',1,'1','2022-03-12 18:46:47',0,0,0,1,NULL,9,1),(7,3,'Overalls',2,'Leto',7,200,'2022-03-13 17:20:05','2022-03-23','Pending','dhl',1000,150,'','Personnel',10,'ref',NULL,0,0,0,0,NULL,8,5),(8,3,'IMO Signs',2,'Amphitrite',188,129,'2022-03-13 17:31:06','2022-03-31','Pending','for',1000,NULL,'','Courier',20,'red',NULL,4,1,0,0,NULL,8,5),(9,7,'Spare Parts',2,'Artemis',188,129,'2022-03-13 17:31:32','2022-03-31','Pending','rca',2500,NULL,'','Courier',14,'refre',NULL,4,1,0,0,NULL,13,10);
/*!40000 ALTER TABLE `individuals` ENABLE KEYS */;
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
  `con_notes` text CHARACTER SET utf8,
  `con_group_id` int(11) DEFAULT NULL,
  `con_status` varchar(55) CHARACTER SET utf8 DEFAULT NULL,
  `con_ind_id` int(11) DEFAULT NULL,
  `con_done_id` int(11) DEFAULT NULL,
  `con_pieces` int(4) DEFAULT NULL,
  `con_is_grouped` int(4) DEFAULT NULL,
  `con_service_type` int(11) DEFAULT NULL,
  PRIMARY KEY (`con_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf16;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consolidations`
--

LOCK TABLES `consolidations` WRITE;
/*!40000 ALTER TABLE `consolidations` DISABLE KEYS */;
INSERT INTO `consolidations` VALUES (5,2,3,'IMO Signs','1',1,NULL,'Electra','2022-03-12 16:47:16',NULL,2,'Pending',6,NULL,1,0,9);
/*!40000 ALTER TABLE `consolidations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_username` varchar(155) NOT NULL,
  `user_password` varchar(155) NOT NULL,
  `user_fullname` varchar(155) DEFAULT NULL,
  `user_last_login` datetime DEFAULT NULL,
  `user_role_id` tinyint(4) NOT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'aggalatis','5416d7cd6ef195a0f7622a9c56b55e84','Aggelos Galatis','2020-05-19 18:22:00',1),(2,'manager','ccbee73cd81c7f42405e1920409247ec','My manager','2020-05-19 18:22:00',2),(3,'paris','ccbee73cd81c7f42405e1920409247ec','Paris Anania',NULL,1),(4,'george','ccbee73cd81c7f42405e1920409247ec','George George',NULL,1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
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
  `cond_consolidated` tinyint(4) DEFAULT NULL,
  `cond_ind_id` int(11) DEFAULT NULL,
  `cond_con_done_id` int(11) DEFAULT NULL,
  `cond_pieces` int(4) DEFAULT NULL,
  `cond_is_grouped` tinyint(4) DEFAULT NULL,
  `cond_service_type` int(11) DEFAULT NULL,
  PRIMARY KEY (`cond_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consolidations_done`
--

LOCK TABLES `consolidations_done` WRITE;
/*!40000 ALTER TABLE `consolidations_done` DISABLE KEYS */;
INSERT INTO `consolidations_done` VALUES (1,2,5,'UPS System;Whole Infinity System (Racks,Servers,Cables)','lalala',2,100,'Atalandi;Medusa','2022-03-09 20:41:05',NULL,1,'Done',NULL,2,NULL,NULL,0,1),(2,2,9,'Fuel Additives','test',4,100,'Boston','2022-03-09 20:41:05',NULL,1,'Done',NULL,3,NULL,6,0,1),(3,2,3,'Overalls','1',1,100,'Astarte','2022-03-09 20:41:05',NULL,1,'Done',NULL,4,NULL,1,1,1),(4,2,8,'Deck Stores','1',1,120,'Artemis','2022-03-09 20:41:05',NULL,1,'Done',NULL,5,NULL,11,1,1);
/*!40000 ALTER TABLE `consolidations_done` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `instruction_files`
--

DROP TABLE IF EXISTS `instruction_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `instruction_files` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(100) NOT NULL,
  `url` text,
  `name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instruction_files`
--

LOCK TABLES `instruction_files` WRITE;
/*!40000 ALTER TABLE `instruction_files` DISABLE KEYS */;
INSERT INTO `instruction_files` VALUES (1,'instructions','https://drive.google.com/file/d/1MSMe5dp7UuiqIbJRq5qtSd_Km_SgiYd3/view?usp=sharing','general'),(2,'visualizer','https://drive.google.com/file/d/1UujYIO9hb3Paj5tYzQQnXvIqIuoIublZ/view?usp=sharing','visualizer'),(3,'scenario','https://drive.google.com/file/d/10X3B2BORkU_eu6NlGBhOLiVl8vd9T7i6/view?usp=sharing','Scenario a.'),(4,'scenario','https://drive.google.com/file/d/1OyToRkf7lUs9wiItTx3wp6m_Y1jNuZaT/view?usp=sharing','Scenario b.'),(5,'scenario','https://drive.google.com/file/d/1x2--aK6YJbmSo9lan85HOIIjsmsWG1O8/view?usp=sharing','Scenario A'),(6,'scenario','https://drive.google.com/file/d/1DMGvTSOdQDChC5Ds8LcwOfN81Ld3l4yH/view?usp=sharing','Scenario B'),(7,'scenario','https://drive.google.com/file/d/1GKwb2AGwgQUBqd1LzoHp2TgAlcKNlx9Z/view?usp=sharing','Scenario C'),(8,'scenario','https://drive.google.com/file/d/1-oUuQVhNnNKBPo-4BpSQN8Gsg_tbIu2j/view?usp=sharing','Scenario D'),(9,'scenario','https://drive.google.com/file/d/1sN9hi8r4I_SRsspbo1MVagDfJeZIPeYx/view?usp=sharing','Scenario E'),(10,'scenario','https://drive.google.com/file/d/1kvjxuY_4sS1Rw6A4oxzYKMTWfVob4TUy/view?usp=sharing','Scenario F'),(11,'scenario','https://drive.google.com/file/d/1Hz5zvffMM4KA8hcR8x6GXExlPXPn7FKx/view?usp=sharing','Scenario G'),(12,'scenario','https://drive.google.com/file/d/1dbOLUcg-0tv0tGw50ogqou9mfKYqcMx3/view?usp=sharing','Scenario H'),(13,'scenario','https://drive.google.com/file/d/1Z6U6K3q1yLHYu3eZheCbNIxOsaLygmr2/view?usp=sharing','Scenario I'),(14,'scenario','https://drive.google.com/file/d/1C6rIHW-ZDpSDFrEl_cIaJVsxZdA0XQZ2/view?usp=sharing','Scenario J'),(15,'scenario','https://drive.google.com/file/d/1c_7xcjJiNSQm27ZjdTSIwak26znPfv_Z/view?usp=sharing','Scenario K'),(16,'scenario','https://drive.google.com/file/d/1BOAawksTf3YmA3rf53Gu3-SCqMTEunU9/view?usp=sharing','Scenario L'),(17,'scenario','https://drive.google.com/file/d/11JGdhZGxyjY9AEd2xCsoG0jYSdyX981t/view?usp=sharing','Scenario M'),(18,'scenario','https://drive.google.com/file/d/1IRPk0QsFuW77lEkg7fu6WZpDooj7m63I/view?usp=sharing','Scenario N');
/*!40000 ALTER TABLE `instruction_files` ENABLE KEYS */;
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

-- Dump completed on 2022-03-13 23:24:13
