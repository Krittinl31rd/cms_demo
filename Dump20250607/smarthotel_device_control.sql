-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: smarthotel
-- ------------------------------------------------------
-- Server version	8.0.42

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
-- Table structure for table `device_control`
--

DROP TABLE IF EXISTS `device_control`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `device_control` (
  `room_id` int NOT NULL,
  `device_id` int NOT NULL,
  `control_id` int NOT NULL,
  `name` varchar(45) DEFAULT NULL,
  `value` double DEFAULT NULL,
  `last_update` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`room_id`,`device_id`,`control_id`),
  KEY `fk_device_id_idx` (`device_id`),
  CONSTRAINT `fk_device_id` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`),
  CONSTRAINT `fk_room_id` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `device_control`
--

LOCK TABLES `device_control` WRITE;
/*!40000 ALTER TABLE `device_control` DISABLE KEYS */;
INSERT INTO `device_control` VALUES (5,22,1,'status',0,'2025-06-02 10:45:43'),(5,22,2,'fanspeed',1,'2025-06-02 10:45:43'),(5,22,3,'temp',25,'2025-06-02 10:45:43'),(5,22,101,'status',30001,'2025-06-02 10:45:43'),(5,22,102,'fanspeed',30002,'2025-06-02 10:45:43'),(5,22,103,'temp',30003,'2025-06-02 10:45:43'),(5,32,1,'status',0,'2025-06-03 02:34:12'),(5,32,101,'status',30011,'2025-06-03 02:34:12'),(5,33,1,'status',NULL,'2025-06-03 02:34:47'),(5,33,101,'status',30012,'2025-06-03 02:34:47'),(6,34,1,'status',NULL,'2025-06-03 03:39:51'),(6,34,101,'status',30011,'2025-06-03 03:39:51'),(6,36,1,'status',NULL,'2025-06-03 08:43:31'),(6,36,101,'status',30010,'2025-06-03 08:43:31');
/*!40000 ALTER TABLE `device_control` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-07 17:50:42
