-- MySQL dump 10.13  Distrib 8.0.23, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: forwarding
-- ------------------------------------------------------
-- Server version	5.7.33-log
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cities`
--

DROP TABLE IF EXISTS `cities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cities` (
  `city_id` int(11) NOT NULL AUTO_INCREMENT,
  `city_name` varchar(155) DEFAULT NULL,
  PRIMARY KEY (`city_id`)
) ENGINE=InnoDB AUTO_INCREMENT=210 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cities`
--

LOCK TABLES `cities` WRITE;
/*!40000 ALTER TABLE `cities` DISABLE KEYS */;
INSERT INTO `cities` VALUES (1,'Kabul'),(2,'Tirana (Tirane)'),(3,'Algiers'),(4,'Andorra la Vella'),(5,'Luanda'),(6,'Saint John\'s'),(7,'Buenos Aires'),(8,'Yerevan'),(9,'Canberra'),(10,'Vienna'),(11,'Baku'),(12,'Nassau'),(13,'Manama'),(14,'Dhaka'),(15,'Bridgetown'),(16,'Minsk'),(17,'Brussels'),(18,'Belmopan'),(19,'Porto Novo'),(20,'Thimphu'),(21,'La Paz (administrative), Sucre (official)'),(22,'Sarajevo'),(23,'Gaborone'),(24,'Brasilia'),(25,'Bandar Seri Begawan'),(26,'Sofia'),(27,'Ouagadougou'),(28,'Gitega'),(29,'Phnom Penh'),(30,'Yaounde'),(31,'Ottawa'),(32,'Praia'),(33,'Bangui'),(34,'N\'Djamena'),(35,'Santiago'),(36,'Beijing'),(37,'Bogota'),(38,'Moroni'),(39,'Kinshasa'),(40,'Brazzaville'),(41,'San Jose'),(42,'Yamoussoukro'),(43,'Zagreb'),(44,'Havana'),(45,'Nicosia'),(46,'Prague'),(47,'Copenhagen'),(48,'Djibouti'),(49,'Roseau'),(50,'Santo Domingo'),(51,'Dili'),(52,'Quito'),(53,'Cairo'),(54,'San Salvador'),(55,'London'),(56,'Malabo'),(57,'Asmara'),(58,'Tallinn'),(59,'Mbabana'),(60,'Addis Ababa'),(61,'Palikir'),(62,'Suva'),(63,'Helsinki'),(64,'Paris'),(65,'Libreville'),(66,'Banjul'),(67,'Tbilisi'),(68,'Berlin'),(69,'Accra'),(70,'Athens'),(71,'Saint George\'s'),(72,'Guatemala City'),(73,'Conakry'),(74,'Bissau'),(75,'Georgetown'),(76,'Port au Prince'),(77,'Tegucigalpa'),(78,'Budapest'),(79,'Reykjavik'),(80,'New Delhi'),(81,'Jakarta'),(82,'Tehran'),(83,'Baghdad'),(84,'Dublin'),(85,'Jerusalem'),(86,'Rome'),(87,'Kingston'),(88,'Tokyo'),(89,'Amman'),(90,'Nur-Sultan'),(91,'Nairobi'),(92,'Tarawa Atoll'),(93,'Pristina'),(94,'Kuwait City'),(95,'Bishkek'),(96,'Vientiane'),(97,'Riga'),(98,'Beirut'),(99,'Maseru'),(100,'Monrovia'),(101,'Tripoli'),(102,'Vaduz'),(103,'Vilnius'),(104,'Luxembourg'),(105,'Antananarivo'),(106,'Lilongwe'),(107,'Kuala Lumpur'),(108,'Male'),(109,'Bamako'),(110,'Valletta'),(111,'Majuro'),(112,'Nouakchott'),(113,'Port Louis'),(114,'Mexico City'),(115,'Chisinau'),(116,'Monaco'),(117,'Ulaanbaatar'),(118,'Podgorica'),(119,'Rabat'),(120,'Maputo'),(121,'Nay Pyi Taw'),(122,'Windhoek'),(123,'No official capital'),(124,'Kathmandu'),(125,'Amsterdam'),(126,'Wellington'),(127,'Managua'),(128,'Niamey'),(129,'Abuja'),(130,'Pyongyang'),(131,'Skopje'),(132,'Belfast'),(133,'Oslo'),(134,'Muscat'),(135,'Islamabad'),(136,'Melekeok'),(137,'Panama City'),(138,'Port Moresby'),(139,'Asuncion'),(140,'Lima'),(141,'Manila'),(142,'Warsaw'),(143,'Lisbon'),(144,'Doha'),(145,'Bucharest'),(146,'Moscow'),(147,'Kigali'),(148,'Basseterre'),(149,'Castries'),(150,'Kingstown'),(151,'Apia'),(152,'San Marino'),(153,'Sao Tome'),(154,'Riyadh'),(155,'Edinburgh'),(156,'Dakar'),(157,'Belgrade'),(158,'Victoria'),(159,'Freetown'),(160,'Singapore'),(161,'Bratislava'),(162,'Ljubljana'),(163,'Honiara'),(164,'Mogadishu'),(165,'Pretoria, Bloemfontein, Cape Town'),(166,'Seoul'),(167,'Juba'),(168,'Madrid'),(169,'Colombo[18]'),(170,'Khartoum'),(171,'Paramaribo'),(172,'Stockholm'),(173,'Bern'),(174,'Damascus'),(175,'Taipei'),(176,'Dushanbe'),(177,'Dodoma'),(178,'Bangkok'),(179,'Lome'),(180,'Nuku\'alofa'),(181,'Port of Spain'),(182,'Tunis'),(183,'Ankara'),(184,'Ashgabat'),(185,'Funafuti'),(186,'Kampala'),(187,'Kiev'),(188,'Abu Dhabi'),(189,'London'),(190,'Washington D.C.'),(191,'Montevideo'),(192,'Tashkent'),(193,'Port Vila'),(194,'Vatican City'),(195,'Caracas'),(196,'Hanoi'),(197,'Cardiff'),(198,'Sanaa'),(199,'Lusaka'),(200,'Harare'),(201,'Kalamata'),(202,'Patra'),(203,'Glyfada'),(204,'BRUMA'),(205,'Sandton'),(206,'Varkiza'),(207,'Johannesburg'),(208,'Voula'),(209,'Hello city');
/*!40000 ALTER TABLE `cities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `colors`
--

DROP TABLE IF EXISTS `colors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `colors` (
  `color_id` int(11) NOT NULL AUTO_INCREMENT,
  `color_code` varchar(45) NOT NULL,
  PRIMARY KEY (`color_id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `colors`
--

LOCK TABLES `colors` WRITE;
/*!40000 ALTER TABLE `colors` DISABLE KEYS */;
INSERT INTO `colors` VALUES (1,'#A52A2A'),(2,'#FFE4C4'),(3,'#FF8A33'),(4,'#CDC94B'),(5,'#FF5D5D'),(6,'#FF905D'),(7,'#FFE25D'),(8,'#EBFF5D'),(9,'#C9FF5D'),(10,'#7FFF5D'),(11,'#5DFF69'),(12,'#5DFFBD'),(13,'#5DFFEE'),(14,'#5DF3FF'),(15,'#5DC4FF'),(16,'#67ACFF'),(17,'#E97CFF'),(18,'#FF7CF5'),(19,'#FF7CCE'),(20,'#FF7CB8'),(21,'#FF7C92'),(22,'#F296FC'),(23,'#A496FC'),(24,'#96F2FC'),(25,'#A0FC96'),(26,'#E1FC96'),(27,'#FCD796'),(28,'#FCC696'),(29,'#FF8B4D'),(30,'#976245'),(31,'#43C877');
/*!40000 ALTER TABLE `colors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consolidation_groups`
--

DROP TABLE IF EXISTS `consolidation_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consolidation_groups` (
  `con_group_id` int(11) NOT NULL AUTO_INCREMENT,
  `con_group_color` varchar(45) DEFAULT NULL,
  `con_group_ex` varchar(155) DEFAULT NULL,
  `con_group_to` varchar(155) DEFAULT NULL,
  `con_group_active` tinyint(4) DEFAULT NULL,
  `con_group_confirmation_date` datetime DEFAULT NULL,
  `con_group_cost` double DEFAULT NULL,
  `con_group_forwarder` varchar(155) DEFAULT NULL,
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
-- Table structure for table `consolidations`
--

DROP TABLE IF EXISTS `consolidations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consolidations` (
  `con_id` int(11) NOT NULL AUTO_INCREMENT,
  `con_user_id` int(11) NOT NULL,
  `con_division_id` int(11) DEFAULT NULL,
  `con_product_id` int(11) DEFAULT NULL,
  `con_mode` varchar(45) DEFAULT NULL,
  `con_reference` varchar(45) DEFAULT NULL,
  `con_actual_weight` double DEFAULT NULL,
  `con_length` double DEFAULT NULL,
  `con_width` double DEFAULT NULL,
  `con_height` double DEFAULT NULL,
  `con_pieces` double DEFAULT NULL,
  `con_volume_weight` double DEFAULT NULL,
  `con_chargable_weight` double DEFAULT NULL,
  `con_vessel_id` int(11) DEFAULT NULL,
  `con_ex` varchar(155) DEFAULT NULL,
  `con_to` varchar(155) DEFAULT NULL,
  `con_request_date` datetime DEFAULT NULL,
  `con_deadline` date DEFAULT NULL,
  `con_cut_off_date` date DEFAULT NULL,
  `con_confirmation_date` datetime DEFAULT NULL,
  `con_status` varchar(45) DEFAULT NULL,
  `con_forwarder` varchar(45) DEFAULT NULL,
  `con_notes` text,
  `con_carrier` varchar(45) DEFAULT NULL,
  `con_group_id` int(11) DEFAULT NULL,
  `con_is_grouped` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`con_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consolidations`
--

LOCK TABLES `consolidations` WRITE;
/*!40000 ALTER TABLE `consolidations` DISABLE KEYS */;
/*!40000 ALTER TABLE `consolidations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `divisions`
--

DROP TABLE IF EXISTS `divisions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
-- Table structure for table `group_colors`
--

DROP TABLE IF EXISTS `group_colors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_colors` (
  `group_color_id` int(11) NOT NULL AUTO_INCREMENT,
  `group_color_description` varchar(45) COLLATE utf8_bin DEFAULT NULL,
  `group_color_code` varchar(45) COLLATE utf8_bin DEFAULT NULL,
  PRIMARY KEY (`group_color_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_colors`
--

LOCK TABLES `group_colors` WRITE;
/*!40000 ALTER TABLE `group_colors` DISABLE KEYS */;
/*!40000 ALTER TABLE `group_colors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `individual_groups`
--

DROP TABLE IF EXISTS `individual_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `individual_groups` (
  `ind_group_id` int(11) NOT NULL AUTO_INCREMENT,
  `ind_group_color` varchar(45) DEFAULT NULL,
  `ind_group_ex` int(11) DEFAULT NULL,
  `ind_group_to` int(11) DEFAULT NULL,
  `ind_group_deadline` date DEFAULT NULL,
  `ind_group_active` tinyint(4) DEFAULT NULL,
  `ind_group_confirmation_date` datetime DEFAULT NULL,
  `ind_group_cost` double DEFAULT NULL,
  `ind_group_cut_off_date` datetime DEFAULT NULL,
  `ind_group_forwarder` varchar(155) DEFAULT NULL,
  PRIMARY KEY (`ind_group_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `individual_groups`
--

LOCK TABLES `individual_groups` WRITE;
/*!40000 ALTER TABLE `individual_groups` DISABLE KEYS */;
INSERT INTO `individual_groups` VALUES (1,'empty',188,129,'2021-04-30',0,'2021-04-13 00:10:28',NULL,NULL,NULL),(2,'#96F2FC',69,60,'2021-04-30',0,'2021-04-13 00:20:01',1,'2021-04-30 00:00:00','ups');
/*!40000 ALTER TABLE `individual_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `individuals`
--

DROP TABLE IF EXISTS `individuals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `individuals` (
  `ind_id` int(11) NOT NULL AUTO_INCREMENT,
  `ind_division_id` int(11) NOT NULL,
  `ind_products` text NOT NULL,
  `ind_user_id` int(11) NOT NULL,
  `ind_vessels` text,
  `ind_ex` int(11) DEFAULT NULL,
  `ind_to` int(11) DEFAULT NULL,
  `ind_request_date` datetime DEFAULT NULL,
  `ind_deadline` date DEFAULT NULL,
  `ind_status` varchar(45) DEFAULT NULL,
  `ind_forwarder` varchar(155) DEFAULT NULL,
  `ind_estimate_cost` double DEFAULT NULL,
  `ind_notes` text,
  `ind_mode` varchar(45) DEFAULT NULL,
  `ind_kg` double DEFAULT NULL,
  `ind_reference` varchar(155) DEFAULT NULL,
  `ind_confirmation_date` datetime DEFAULT NULL,
  `ind_group_id` int(11) DEFAULT NULL,
  `ind_is_grouped` tinyint(4) DEFAULT NULL,
  `ind_deleted` int(11) DEFAULT NULL,
  `ind_date_deleted` datetime DEFAULT NULL,
  PRIMARY KEY (`ind_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `individuals`
--

LOCK TABLES `individuals` WRITE;
/*!40000 ALTER TABLE `individuals` DISABLE KEYS */;
INSERT INTO `individuals` VALUES (1,1,'Crew Mail',1,'Amphitrite',188,129,'2021-04-12 23:48:25','2021-04-30','Done','f',1,'myNotes...','Air',1,'r','2021-04-13 00:10:28',1,0,0,'2021-04-12 23:59:29'),(2,1,'Certificate',1,'Amphitrite',188,129,'2021-04-12 23:48:40','2021-04-30','Done','1',1,'','Air',1,'1','2021-04-13 00:10:28',1,0,1,'2021-04-12 23:59:56'),(3,2,'Metalic & Plastic Environmental Seals',1,'Atalandi',69,60,'2021-04-13 00:00:45','2021-04-30','Pending','1',1,'','Air',1,'1',NULL,2,1,1,'2021-04-13 00:00:51'),(4,3,'IMO Signs',1,'Arethusa',69,60,'2021-04-13 00:01:03','2021-04-30','Done','1',1,'hahah','Courier',1,'1','2021-04-13 00:20:01',2,1,0,NULL),(5,2,'Metalic & Plastic Environmental Seals',1,'Arethusa',69,60,'2021-04-13 00:17:30','2021-04-30','Done','1',1,'','Courier',1,'1','2021-04-13 00:20:01',2,1,0,NULL);
/*!40000 ALTER TABLE `individuals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!50503 SET character_set_client = utf8mb4 */;
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
-- Table structure for table `vessels`
--

DROP TABLE IF EXISTS `vessels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vessels` (
  `vessel_id` int(11) NOT NULL AUTO_INCREMENT,
  `vessel_description` varchar(45) NOT NULL,
  PRIMARY KEY (`vessel_id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vessels`
--

LOCK TABLES `vessels` WRITE;
/*!40000 ALTER TABLE `vessels` DISABLE KEYS */;
INSERT INTO `vessels` VALUES (1,'Aliki'),(2,'Amphitrite'),(3,'Arethusa'),(4,'Artemis'),(5,'Astarte'),(6,'Atalandi'),(7,'Baltimore'),(8,'Boston'),(9,'Coronis'),(10,'Crystalia'),(11,'Electra'),(12,'G.P. Zafirakis'),(13,'Houston'),(14,'Ismene'),(15,'Leto'),(16,'Los Angeles'),(17,'Maera'),(18,'Maia'),(19,'Medusa'),(20,'Melia'),(21,'Myrsini'),(22,'Myrto'),(23,'New Orleans'),(24,'New York'),(25,'New Port News'),(26,'Oceanis'),(27,'P.S. Palios'),(28,'Phaidra'),(29,'Philadelphia'),(30,'Polymnia'),(31,'San Fransisco'),(32,'Santa Barbara'),(33,'Seattle'),(34,'Selina'),(35,'Star Ship'),(36,'Star Wars');
/*!40000 ALTER TABLE `vessels` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-04-14 13:06:02
