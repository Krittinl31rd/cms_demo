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
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `password_hash` text,
  `full_name` varchar(100) DEFAULT NULL,
  `role_id` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `valid_date` datetime DEFAULT NULL COMMENT 'วันที่ active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`email`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','admin@archi.com','$2a$12$Qi/9QFXs4AlxddFh8wRameTE6HUZ/0flSPYULYwsxenQiCg/O2K4O','Kurosawa Jin',1,1,'2025-05-27 09:46:24','2025-05-27 09:46:24'),(2,'hisoka','hisoka@archi.com','$2a$12$YjDlNJCzyu4AcmNZOvPZx.Cv18InKOwtlJbsKYzFptlCBjmc7J1zm','Hisoka Morrow',3,0,'2025-05-27 11:15:24','2025-06-05 10:37:14'),(13,'santi@archi.com','santi@archi.com','$2b$10$Xb58I16xGZ261cHh8wCKLOc8LV6t5L6/4sqb6rPSKvavTGz2lkNXy','Santi Thunder',4,1,'2025-06-05 07:55:13','2025-06-07 02:19:03'),(14,'john.doe@archi.com','john.doe@archi.com','$2b$10$.pzaeP/4hAUJaIr.x2jv.OOV0I9y2ndCJCfhr5BAbp9vNuoi5pkmK','John Doe',4,0,'2025-06-05 07:58:18',NULL),(16,'liam@archi.com','liam@archi.com','$2b$10$0dpzEOZWsYkk5aelPTo4EOgVt0As0lpTDdMbu0HdLO2JIsrwNI6W6','Liam Galagher',3,1,'2025-06-05 08:01:34','2025-06-07 02:19:01'),(17,'noel@archi.com','noel@archi.com','$2b$10$pHVy8f23wgOXQjtqcUcm9OZmGILU7gFKgi75XkvbjloRQLa9njuhK','Noel Galagher',2,0,'2025-06-05 08:01:57',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-07 17:50:40
