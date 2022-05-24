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

-- Dump completed on 2022-05-25  0:58:50
