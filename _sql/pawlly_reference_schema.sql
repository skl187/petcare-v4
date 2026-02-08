-- phpMyAdmin SQL Dump
-- version 5.1.1deb5ubuntu1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Aug 27, 2025 at 12:04 PM
-- Server version: 8.0.43-0ubuntu0.22.04.1
-- PHP Version: 8.2.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pawlly`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_log`
--

CREATE TABLE `activity_log` (
  `id` bigint UNSIGNED NOT NULL,
  `log_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject_type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject_id` bigint UNSIGNED DEFAULT NULL,
  `event` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `causer_type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `causer_id` bigint UNSIGNED DEFAULT NULL,
  `properties` json DEFAULT NULL,
  `batch_uuid` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE `addresses` (
  `id` bigint UNSIGNED NOT NULL,
  `address_line_1` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address_line_2` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `country` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `latitude` double NOT NULL DEFAULT '1',
  `longitude` double NOT NULL DEFAULT '1',
  `is_primary` tinyint(1) NOT NULL DEFAULT '0',
  `addressable_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `addressable_id` bigint UNSIGNED NOT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `first_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `addresses`
--

INSERT INTO `addresses` (`id`, `address_line_1`, `address_line_2`, `postal_code`, `city`, `state`, `country`, `latitude`, `longitude`, `is_primary`, `addressable_type`, `addressable_id`, `created_by`, `updated_by`, `deleted_by`, `created_at`, `updated_at`, `deleted_at`, `first_name`, `last_name`) VALUES
(1, '23, Square Street', 'Near Sea View Point', '445632', '10001', '3866', '230', 1, 1, 0, 'App\\Models\\User', 2, NULL, NULL, NULL, '2025-08-27 06:27:48', '2025-08-27 06:27:48', NULL, NULL, NULL),
(2, '3, Hill Street', 'Near Mile View Building', '442387', '10002', '3866', '230', 1, 1, 0, 'App\\Models\\User', 2, NULL, NULL, NULL, '2025-08-27 06:27:48', '2025-08-27 06:27:48', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `blogs`
--

CREATE TABLE `blogs` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `tags` longtext COLLATE utf8mb4_unicode_ci,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `boarder_daycare_perdayamount`
--

CREATE TABLE `boarder_daycare_perdayamount` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` int NOT NULL,
  `amount` double DEFAULT '0',
  `type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` bigint UNSIGNED NOT NULL,
  `note` longtext COLLATE utf8mb4_unicode_ci,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `start_date_time` datetime NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `branch_id` bigint UNSIGNED NOT NULL,
  `employee_id` bigint UNSIGNED DEFAULT NULL,
  `system_service_id` bigint UNSIGNED NOT NULL,
  `pet_id` bigint UNSIGNED NOT NULL,
  `booking_extra_info` longtext COLLATE utf8mb4_unicode_ci,
  `booking_type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_amount` double NOT NULL DEFAULT '0',
  `service_amount` double NOT NULL DEFAULT '0',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `booking_boarding_mapping`
--

CREATE TABLE `booking_boarding_mapping` (
  `id` bigint UNSIGNED NOT NULL,
  `booking_id` bigint UNSIGNED NOT NULL,
  `dropoff_date_time` datetime NOT NULL,
  `dropoff_address` longtext COLLATE utf8mb4_unicode_ci,
  `pickup_date_time` datetime NOT NULL,
  `pickup_address` longtext COLLATE utf8mb4_unicode_ci,
  `price` double NOT NULL DEFAULT '0',
  `additional_facility` longtext COLLATE utf8mb4_unicode_ci,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `booking_daycare_mapping`
--

CREATE TABLE `booking_daycare_mapping` (
  `id` bigint UNSIGNED NOT NULL,
  `booking_id` bigint UNSIGNED NOT NULL,
  `date` datetime NOT NULL,
  `dropoff_time` time NOT NULL,
  `pickup_time` time NOT NULL,
  `food` longtext COLLATE utf8mb4_unicode_ci,
  `activity` longtext COLLATE utf8mb4_unicode_ci,
  `address` longtext COLLATE utf8mb4_unicode_ci,
  `price` double NOT NULL DEFAULT '0',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `booking_grooming_mapping`
--

CREATE TABLE `booking_grooming_mapping` (
  `id` bigint UNSIGNED NOT NULL,
  `date_time` datetime NOT NULL,
  `booking_id` bigint UNSIGNED NOT NULL,
  `service_id` bigint UNSIGNED NOT NULL,
  `service_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` double NOT NULL DEFAULT '0',
  `duration` int NOT NULL DEFAULT '0',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `booking_request_mapping`
--

CREATE TABLE `booking_request_mapping` (
  `id` bigint UNSIGNED NOT NULL,
  `booking_id` bigint UNSIGNED NOT NULL,
  `walker_id` bigint UNSIGNED NOT NULL,
  `status` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `booking_services`
--

CREATE TABLE `booking_services` (
  `id` bigint UNSIGNED NOT NULL,
  `sequance` int NOT NULL DEFAULT '0',
  `start_date_time` datetime NOT NULL,
  `booking_id` bigint UNSIGNED NOT NULL,
  `service_id` bigint UNSIGNED NOT NULL,
  `employee_id` bigint UNSIGNED NOT NULL,
  `service_price` double NOT NULL DEFAULT '0',
  `duration_min` int NOT NULL DEFAULT '0',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `booking_training_mapping`
--

CREATE TABLE `booking_training_mapping` (
  `id` bigint UNSIGNED NOT NULL,
  `booking_id` bigint UNSIGNED NOT NULL,
  `date_time` datetime NOT NULL,
  `training_id` bigint UNSIGNED NOT NULL,
  `price` double NOT NULL DEFAULT '0',
  `duration` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `booking_transactions`
--

CREATE TABLE `booking_transactions` (
  `id` bigint UNSIGNED NOT NULL,
  `booking_id` bigint UNSIGNED NOT NULL,
  `external_transaction_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transaction_type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `discount_percentage` double NOT NULL DEFAULT '0',
  `discount_amount` double NOT NULL DEFAULT '0',
  `tip_amount` double NOT NULL DEFAULT '0',
  `total_amount` double NOT NULL DEFAULT '0',
  `tax_percentage` longtext COLLATE utf8mb4_unicode_ci,
  `payment_status` tinyint(1) NOT NULL DEFAULT '0',
  `request_token` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `booking_veterinary_mapping`
--

CREATE TABLE `booking_veterinary_mapping` (
  `id` bigint UNSIGNED NOT NULL,
  `date_time` datetime NOT NULL,
  `booking_id` bigint UNSIGNED NOT NULL,
  `service_id` bigint UNSIGNED NOT NULL,
  `service_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` double NOT NULL DEFAULT '0',
  `duration` int NOT NULL DEFAULT '0',
  `reason` longtext COLLATE utf8mb4_unicode_ci,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `start_video_link` longtext COLLATE utf8mb4_unicode_ci,
  `join_video_link` longtext COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `booking_walking_mapping`
--

CREATE TABLE `booking_walking_mapping` (
  `id` bigint UNSIGNED NOT NULL,
  `booking_id` bigint UNSIGNED NOT NULL,
  `date_time` datetime NOT NULL,
  `address` longtext COLLATE utf8mb4_unicode_ci,
  `price` double NOT NULL DEFAULT '0',
  `duration` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `branches`
--

CREATE TABLE `branches` (
  `id` bigint UNSIGNED NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `payment_method` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `manager_id` bigint UNSIGNED DEFAULT NULL,
  `branch_for` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'both',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `contact_email` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_number` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `branch_employee`
--

CREATE TABLE `branch_employee` (
  `id` bigint UNSIGNED NOT NULL,
  `employee_id` int DEFAULT NULL,
  `branch_id` int DEFAULT NULL,
  `is_primary` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `branch_galleries`
--

CREATE TABLE `branch_galleries` (
  `id` bigint UNSIGNED NOT NULL,
  `branch_id` bigint UNSIGNED NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `full_url` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `brands`
--

CREATE TABLE `brands` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `breeds`
--

CREATE TABLE `breeds` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pettype_id` bigint UNSIGNED NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bussinesshours`
--

CREATE TABLE `bussinesshours` (
  `id` bigint UNSIGNED NOT NULL,
  `branch_id` int NOT NULL,
  `day` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_time` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `end_time` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_holiday` tinyint DEFAULT NULL,
  `breaks` longtext COLLATE utf8mb4_unicode_ci,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` int DEFAULT NULL,
  `guest_user_id` bigint DEFAULT NULL,
  `location_id` int DEFAULT NULL,
  `product_id` int NOT NULL,
  `product_variation_id` int DEFAULT NULL,
  `qty` int NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint UNSIGNED NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '1',
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_id` bigint UNSIGNED DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cities`
--

CREATE TABLE `cities` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `country_id` int DEFAULT NULL,
  `state_id` int NOT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `commissions`
--

CREATE TABLE `commissions` (
  `id` bigint UNSIGNED NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `commission_type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `commission_value` double DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `commissions`
--

INSERT INTO `commissions` (`id`, `title`, `commission_type`, `commission_value`, `status`, `created_by`, `updated_by`, `deleted_by`, `created_at`, `updated_at`, `deleted_at`, `type`) VALUES
(1, 'Booking Commission', 'percentage', 5, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL, 'service'),
(2, 'Product Commission', 'percentage', 95, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL, 'product');

-- --------------------------------------------------------

--
-- Table structure for table `commission_earnings`
--

CREATE TABLE `commission_earnings` (
  `id` bigint UNSIGNED NOT NULL,
  `employee_id` bigint UNSIGNED NOT NULL,
  `commissionable_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `commissionable_id` bigint UNSIGNED NOT NULL,
  `commission_amount` double DEFAULT NULL,
  `commission_status` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `constants`
--

CREATE TABLE `constants` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `sequence` int NOT NULL DEFAULT '0',
  `sub_type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `constants`
--

INSERT INTO `constants` (`id`, `name`, `type`, `value`, `sequence`, `sub_type`, `status`, `created_by`, `updated_by`, `deleted_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'New Booking', 'notification_type', 'new_booking', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(2, 'Accept Booking', 'notification_type', 'accept_booking', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(3, 'Reject Booking', 'notification_type', 'reject_booking', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(4, 'Complete On Booking', 'notification_type', 'complete_booking', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(5, 'Accept Booking Request', 'notification_type', 'accept_booking_request', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(6, 'Cancel On Booking', 'notification_type', 'cancel_booking', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(7, 'Chnage Password', 'notification_type', 'change_password', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(8, 'Forget Email/Password', 'notification_type', 'forget_email_password', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(9, 'Order Placed', 'notification_type', 'order_placed', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(10, 'Order Accepted', 'notification_type', 'order_accepted', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(11, 'Order Processing', 'notification_type', 'order_proccessing', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(12, 'Order Delivered', 'notification_type', 'order_delivered', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(13, 'Oreder Cancelled', 'notification_type', 'order_cancelled', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(14, 'ID', 'notification_param_button', 'id', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(15, 'Customer Name', 'notification_param_button', 'user_name', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(16, 'Description / Note', 'notification_param_button', 'description', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(17, 'Booking ID', 'notification_param_button', 'booking_id', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(18, 'Booking Date', 'notification_param_button', 'booking_date', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(19, 'Booking Time', 'notification_param_button', 'booking_time', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(20, 'Booking Services Names', 'notification_param_button', 'booking_services_names', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(21, 'Booking Duration', 'notification_param_button', 'booking_duration', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(22, 'Staff Name', 'notification_param_button', 'employee_name', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(23, 'Venue / Address', 'notification_param_button', 'venue_address', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(24, 'Your Name', 'notification_param_button', 'logged_in_user_fullname', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(25, 'Your Position', 'notification_param_button', 'logged_in_user_role', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(26, 'Company Name', 'notification_param_button', 'company_name', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(27, 'Company Info', 'notification_param_button', 'company_contact_info', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(28, 'User\' ID', 'notification_param_button', 'user_id', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(29, 'User Password', 'notification_param_button', 'user_password', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(30, 'Link', 'notification_param_button', 'link', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(31, 'Site URL', 'notification_param_button', 'site_url', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(32, 'User', 'notification_to', 'user', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(33, 'Employee', 'notification_to', 'employee', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(34, 'Demo Admin', 'notification_to', 'demo_admin', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(35, 'Admin', 'notification_to', 'admin', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(36, 'veterinary', 'SYSTEM_SERVICE', 'Veterinary', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(37, 'grooming', 'SYSTEM_SERVICE', 'Grooming', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(38, 'boarding', 'SYSTEM_SERVICE', 'Boarding', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(39, 'day_care', 'SYSTEM_SERVICE', 'Day Care', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(40, 'walking', 'SYSTEM_SERVICE', 'Walking', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(41, 'training', 'SYSTEM_SERVICE', 'Training', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(42, 'small', 'PET_SIZE', 'Small', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(43, 'large', 'PET_SIZE', 'Large', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(44, 'medium', 'PET_SIZE', 'Medium', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(45, 'cm', 'PET_HEIGHT_UNIT', 'CM', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(46, 'inch', 'PET_HEIGHT_UNIT', 'Inch', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(47, 'kg', 'PET_WEIGHT_UNIT', 'KG', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(48, 'lb', 'PET_WEIGHT_UNIT', 'Pound', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(49, 'Paid', 'PAYMENT_STATUS', '1', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(50, 'Pending', 'PAYMENT_STATUS', '0', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(51, 'cash', 'PAYMENT_METHODS', 'Cash', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(52, 'upi', 'PAYMENT_METHODS', 'UPI', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(53, 'razorpay', 'PAYMENT_METHODS', 'Razorpay', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(54, 'stripe', 'PAYMENT_METHODS', 'Stripe', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(55, 'unisex', 'BRANCH_SERVICE_GENDER', 'Unisex', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(56, 'female', 'BRANCH_SERVICE_GENDER', 'Female', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(57, 'male', 'BRANCH_SERVICE_GENDER', 'Male', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(58, '1', 'status', 'Active', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(59, '0', 'status', 'Deactive', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(60, 'pending', 'BOOKING_STATUS', 'Pending', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(61, 'confirmed', 'BOOKING_STATUS', 'Confirmed', 1, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(62, 'cancelled', 'BOOKING_STATUS', 'Cancelled', 2, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(63, 'inprogress', 'BOOKING_STATUS', 'In Progress', 3, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(64, 'completed', 'BOOKING_STATUS', 'Completed', 4, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(65, 'rejected', 'BOOKING_STATUS', 'Rejected', 5, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(66, '#e5a900', 'BOOKING_STATUS_COLOR', 'Pending Color', 0, 'pending', 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(67, '#6E6EEF', 'BOOKING_STATUS_COLOR', 'Confirm Color', 1, 'confirmed', 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(68, '#D68AF1', 'BOOKING_STATUS_COLOR', 'Check In Color', 2, 'check_in', 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(69, '#E58282', 'BOOKING_STATUS_COLOR', 'Check Out Color', 3, 'checkout', 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(70, '#D1D1D1', 'BOOKING_STATUS_COLOR', 'Cancelled Color', 4, 'cancelled', 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(71, '#3ABA61', 'BOOKING_STATUS_COLOR', 'Completed Color', 4, 'completed', 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(72, 'Text', 'field_type', 'text', 0, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(73, 'Textarea', 'field_type', 'textarea', 2, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(74, 'Select', 'field_type', 'select', 3, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(75, 'Radio', 'field_type', 'radio', 4, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(76, 'Checkbox', 'field_type', 'checkbox', 5, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(77, 'English', 'language', 'en', 1, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(78, 'বাংলা', 'language', 'br', 2, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(79, 'العربی', 'language', 'ar', 3, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(80, 'Vietnamese', 'language', 'vi', 4, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(81, 'Category', 'SLIDER_TYPES', 'category', 1, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(82, 'Service', 'SLIDER_TYPES', 'service', 2, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(83, 'Cash', 'EARNING_PAYMENT_TYPE', 'cash', 1, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(84, 'gallery', 'additional_permissions', 'Gallery', 1, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(85, 'password', 'additional_permissions', 'Password', 2, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(86, 'tableview', 'additional_permissions', 'Tableview', 3, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(87, 'review', 'additional_permissions', 'Review', 4, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL);
'
-- --------------------------------------------------------

--
-- Table structure for table `countries`
--

CREATE TABLE `countries` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dial_code` int DEFAULT NULL,
  `currency_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `symbol` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `currency_code` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `currencies`
--

CREATE TABLE `currencies` (
  `id` bigint UNSIGNED NOT NULL,
  `currency_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `currency_symbol` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `currency_code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT '0',
  `currency_position` enum('left','right','left_with_space','right_with_space') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'left',
  `no_of_decimal` int UNSIGNED NOT NULL,
  `thousand_separator` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `decimal_separator` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `currencies`
--

INSERT INTO `currencies` (`id`, `currency_name`, `currency_symbol`, `currency_code`, `is_primary`, `currency_position`, `no_of_decimal`, `thousand_separator`, `decimal_separator`, `created_by`, `updated_by`, `deleted_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Doller', '$', 'USD', 1, 'left', 2, ',', '.', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `custom_fields`
--

CREATE TABLE `custom_fields` (
  `id` bigint UNSIGNED NOT NULL,
  `custom_field_group_id` int DEFAULT NULL,
  `label` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `required` tinyint NOT NULL DEFAULT '0',
  `values` text COLLATE utf8mb4_unicode_ci,
  `is_export` int DEFAULT '0',
  `visible` enum('true','false') COLLATE utf8mb4_unicode_ci DEFAULT 'false',
  `is_view` int DEFAULT '0',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `custom_fields_data`
--

CREATE TABLE `custom_fields_data` (
  `id` bigint UNSIGNED NOT NULL,
  `custom_field_id` int DEFAULT NULL,
  `model_id` int DEFAULT NULL,
  `model` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `value` text COLLATE utf8mb4_unicode_ci,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `custom_field_groups`
--

CREATE TABLE `custom_field_groups` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `model` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `durations`
--

CREATE TABLE `durations` (
  `id` bigint UNSIGNED NOT NULL,
  `duration` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` double DEFAULT '0',
  `type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT '0',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `earnings`
--

CREATE TABLE `earnings` (
  `id` bigint UNSIGNED NOT NULL,
  `payment_method` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `amount` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint DEFAULT '1' COMMENT '1- Active , 0- InActive',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` bigint UNSIGNED NOT NULL,
  `first_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mobile` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `player_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `web_player_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  `is_banned` tinyint NOT NULL DEFAULT '0',
  `is_manager` tinyint NOT NULL DEFAULT '0',
  `show_in_calender` tinyint NOT NULL DEFAULT '0',
  `last_notification_seen` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_commissions`
--

CREATE TABLE `employee_commissions` (
  `id` bigint UNSIGNED NOT NULL,
  `employee_id` bigint UNSIGNED NOT NULL,
  `commission_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_earnings`
--

CREATE TABLE `employee_earnings` (
  `id` bigint UNSIGNED NOT NULL,
  `employee_id` bigint UNSIGNED NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `total_amount` double DEFAULT NULL,
  `commission_amount` double DEFAULT NULL,
  `tip_amount` double DEFAULT NULL,
  `payment_date` datetime NOT NULL,
  `payment_type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_rating`
--

CREATE TABLE `employee_rating` (
  `id` bigint UNSIGNED NOT NULL,
  `employee_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `review_msg` longtext COLLATE utf8mb4_unicode_ci,
  `rating` double DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `location` longtext COLLATE utf8mb4_unicode_ci,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `uuid` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `holidays`
--

CREATE TABLE `holidays` (
  `id` bigint UNSIGNED NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date` date NOT NULL,
  `branch_id` bigint UNSIGNED NOT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `installers`
--

CREATE TABLE `installers` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `queue` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `likes`
--

CREATE TABLE `likes` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` int NOT NULL,
  `is_like` tinyint NOT NULL DEFAULT '0',
  `dislike_like` tinyint NOT NULL DEFAULT '0',
  `likeable_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `likeable_id` bigint UNSIGNED NOT NULL,
  `is_view` tinyint NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `locations`
--

CREATE TABLE `locations` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `banner` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address_line_1` text COLLATE utf8mb4_unicode_ci,
  `address_line_2` text COLLATE utf8mb4_unicode_ci,
  `latitude` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `longitude` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_default` tinyint NOT NULL DEFAULT '0',
  `status` tinyint NOT NULL DEFAULT '1',
  `country` int NOT NULL DEFAULT '0',
  `state` int NOT NULL DEFAULT '0',
  `city` int NOT NULL DEFAULT '0',
  `pincode` int NOT NULL DEFAULT '0',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `logistics`
--

CREATE TABLE `logistics` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `logistic_zones`
--

CREATE TABLE `logistic_zones` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logistic_id` int NOT NULL,
  `country_id` int NOT NULL,
  `state_id` int NOT NULL,
  `standard_delivery_charge` double NOT NULL DEFAULT '0',
  `express_delivery_charge` double NOT NULL DEFAULT '0',
  `standard_delivery_time` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '1 - 3 days',
  `express_delivery_time` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '1 day',
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `logistic_zone_city`
--

CREATE TABLE `logistic_zone_city` (
  `id` bigint UNSIGNED NOT NULL,
  `logistic_id` int NOT NULL,
  `logistic_zone_id` int NOT NULL,
  `city_id` int NOT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `media`
--

CREATE TABLE `media` (
  `id` bigint UNSIGNED NOT NULL,
  `model_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` bigint UNSIGNED NOT NULL,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `collection_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime_type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `disk` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `conversions_disk` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `size` bigint UNSIGNED NOT NULL,
  `manipulations` json NOT NULL,
  `custom_properties` json NOT NULL,
  `generated_conversions` json NOT NULL,
  `responsive_images` json NOT NULL,
  `order_column` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `media`
--

INSERT INTO `media` (`id`, `model_type`, `model_id`, `uuid`, `collection_name`, `name`, `file_name`, `mime_type`, `disk`, `conversions_disk`, `size`, `manipulations`, `custom_properties`, `generated_conversions`, `responsive_images`, `order_column`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 1, 'b23a70af-f7ef-43a1-9cfe-b398a7b7bb1f', 'profile_image', 'super_admin', 'FwTTy2Y3vxlsYmMuoPME6QdL1Y1pyqftv5kF03cm.png', 'image/png', 'public', 'public', 111258, '[]', '[]', '[]', '[]', 1, '2025-08-27 06:27:48', '2025-08-27 06:27:48'),
(2, 'App\\Models\\User', 2, '1afcaca3-23e9-4e49-971a-d40de62dcaa0', 'profile_image', 'John', '2TmrQjsNFQ2iqTOlY3H2VHzW0iRyjRkze5wAGkRz.png', 'image/png', 'public', 'public', 183242, '[]', '[]', '[]', '[]', 1, '2025-08-27 06:27:48', '2025-08-27 06:27:48'),
(3, 'App\\Models\\User', 3, 'ae96b5b6-7400-4c09-95f7-482457f2549a', 'profile_image', 'Robert', 'Ybv2cfp8BUelbcCkJXY78CpHy1HAaJBnLdP2aNY7.png', 'image/png', 'public', 'public', 242879, '[]', '[]', '[]', '[]', 1, '2025-08-27 06:27:48', '2025-08-27 06:27:48'),
(4, 'App\\Models\\User', 4, 'c98406c7-6f7d-4082-9419-e293f50c7ed0', 'profile_image', 'Bentley', 'sy0rl6e1m7Uxi5v2yf3mbuzGrAf8wRNiRW6PUEl6.png', 'image/png', 'public', 'public', 357385, '[]', '[]', '[]', '[]', 1, '2025-08-27 06:27:48', '2025-08-27 06:27:48'),
(5, 'App\\Models\\User', 5, 'c48643c1-905e-43f6-8ea9-2e10dba7a216', 'profile_image', 'Brian', 'FNl77cQ0fX65UCOLrAcA3nNhhtEkDhAzmUmWFSYQ.png', 'image/png', 'public', 'public', 137208, '[]', '[]', '[]', '[]', 1, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(6, 'App\\Models\\User', 6, '68e28c32-531b-4709-ab1a-97ec74266641', 'profile_image', 'Liam', 'TgAfBxzA8BmARzlgGWPpPdUgHumFRazHXIPM6n8a.png', 'image/png', 'public', 'public', 202372, '[]', '[]', '[]', '[]', 1, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(7, 'App\\Models\\User', 7, '14775fc9-f056-4b91-9182-763014793224', 'profile_image', 'Gilbert', 'LKrE5OOlUEifHYeKOfRtn4OK0ilOM5NeovIYPozi.png', 'image/png', 'public', 'public', 230547, '[]', '[]', '[]', '[]', 1, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(8, 'App\\Models\\User', 8, 'a871a446-a575-4af4-89e8-e186b77b81b6', 'profile_image', 'Pedra', 'vh1d1to6R0ap8uDLoVhG7byvs5e7oTng9Aq4kGgL.png', 'image/png', 'public', 'public', 286718, '[]', '[]', '[]', '[]', 1, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(9, 'App\\Models\\User', 9, '63635265-2adb-43b4-aac0-e3bdd908a29a', 'profile_image', 'Diana', 'Ttw0OtfzqBzE8kyeKpwj2RDoJxxNzePrKYYiipUo.png', 'image/png', 'public', 'public', 247135, '[]', '[]', '[]', '[]', 1, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(10, 'App\\Models\\User', 10, '337f09b4-42bf-47a1-8077-0c757a7bf181', 'profile_image', 'Stella', 'TkSMVDYWmGOdA3qIU2t8xh3XecTA3lNJQaK81YtM.png', 'image/png', 'public', 'public', 205127, '[]', '[]', '[]', '[]', 1, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(11, 'App\\Models\\User', 11, '81ea63f5-83b7-4018-a556-ac293302b8c3', 'profile_image', 'Lisa', 'DO4DasSnPDW9mHeAghlT5HSr1RprTmlYBR6InaIa.png', 'image/png', 'public', 'public', 236899, '[]', '[]', '[]', '[]', 1, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(12, 'App\\Models\\User', 12, '885ec5e4-3924-4283-be25-eaab74a67cac', 'profile_image', 'Miles', 'ZsJzjyFq8jmrgki7vlSqNllmA7CHepK9kLg1lHWU.png', 'image/png', 'public', 'public', 197092, '[]', '[]', '[]', '[]', 1, '2025-08-27 06:27:55', '2025-08-27 06:27:55');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2019_12_14_000001_create_personal_access_tokens_table', 1),
(2, '2023_01_01_000000_create_permission_tables', 1),
(3, '2023_01_01_000010_create_users_table', 1),
(4, '2023_01_01_000012_create_user_providers_table', 1),
(5, '2023_01_01_000020_create_password_resets_table', 1),
(6, '2023_01_01_000040_create_settings_table', 1),
(7, '2023_01_01_000041_create_notifications_table', 1),
(8, '2023_01_01_000042_create_constants_table', 1),
(9, '2023_01_01_000100_create_services_table', 1),
(10, '2023_01_01_000200_create_media_table', 1),
(11, '2023_01_01_000400_create_activity_log_table', 1),
(12, '2023_01_01_000400_create_failed_jobs_table', 1),
(13, '2023_01_27_141241_create_branches_table', 1),
(14, '2023_01_27_154203_create_categories_table', 1),
(15, '2023_01_27_171841_create_service_branches_table', 1),
(16, '2023_01_27_172003_create_service_employees_table', 1),
(17, '2023_01_27_190720_create_addresses_table', 1),
(18, '2023_02_06_131711_create_booking_services_table', 1),
(19, '2023_04_11_120721_create_notificationtemplates_table', 1),
(20, '2023_04_11_140938_NotificationTemplateContentMapping', 1),
(21, '2023_04_25_173207_create_service_galleries_table', 1),
(22, '2023_04_27_113639_create_planlimitation_table', 1),
(23, '2023_04_27_134249_create_service_packages_table', 1),
(24, '2023_05_02_101915_create_package_service_mappings_table', 1),
(25, '2023_05_02_111101_create_plan_table', 1),
(26, '2023_05_02_111622_create_planlimitation_mapping_table', 1),
(27, '2023_05_04_115011_create_branch_galleries_table', 1),
(28, '2023_05_06_160755_create_subscriptions_table', 1),
(29, '2023_05_06_160843_create_subscriptions_transactions_table', 1),
(30, '2023_05_13_013137_create_categories_table', 1),
(31, '2023_05_14_154353_create_custom_fields_table', 1),
(32, '2023_05_15_031816_create_taxes_table', 1),
(33, '2023_05_15_101240_create_custom_fields_data_table', 1),
(34, '2023_05_15_101530_create_custom_field_groups_table', 1),
(35, '2023_05_16_111402_create_currencies_table', 1),
(36, '2023_05_17_045032_create_earnings_table', 1),
(37, '2023_05_17_110503_create_commissions_table', 1),
(38, '2023_05_17_121344_create_employees_table', 1),
(39, '2023_05_20_125942_create_holidays_table', 1),
(40, '2023_05_20_181643_create_branch_employee_table', 1),
(41, '2023_05_22_150550_create_commission_earnings_table', 1),
(42, '2023_05_22_150850_create_employee_commissions_table', 1),
(43, '2023_05_22_155610_create_booking_transactions_table', 1),
(44, '2023_05_22_162458_create_employee_earnings_table', 1),
(45, '2023_05_25_055808_create_bussinesshours_table', 1),
(46, '2023_06_08_171027_create_tip_earnings_table', 1),
(47, '2023_06_09_014626_create_sliders_table', 1),
(48, '2023_06_09_161914_create_employee_rating_table', 1),
(49, '2023_06_17_062215_create_pages_table', 1),
(50, '2023_06_17_075047_create_webhook_calls_table', 1),
(51, '2023_06_17_121725_create_jobs_table', 1),
(52, '2023_06_21_170019_create_user_profiles_table', 1),
(53, '2023_06_24_050019_create_modules_table', 1),
(54, '2023_07_05_103209_create_pets_type_table', 1),
(55, '2023_07_09_131341_create_booking_daycare_mapping_table', 1),
(56, '2023_07_09_131400_create_booking_boarding_mapping_table', 1),
(57, '2023_07_09_131409_create_booking_grooming_mapping_table', 1),
(58, '2023_07_09_131418_create_booking_walking_mapping_table', 1),
(59, '2023_07_09_131427_create_booking_training_mapping_table', 1),
(60, '2023_07_09_131512_create_booking_veterinary_mapping_table', 1),
(61, '2023_07_10_075719_create_blogs_table', 1),
(62, '2023_07_10_075726_create_events_table', 1),
(63, '2023_07_10_091201_create_system_services_table', 1),
(64, '2023_07_11_051437_create_breeds_table', 1),
(65, '2023_07_11_070855_create_durations_table', 1),
(66, '2023_07_11_121512_create_service_duration_table', 1),
(67, '2023_07_11_121523_create_service_training_table', 1),
(68, '2023_07_11_121535_create_service_facility_table', 1),
(69, '2023_07_21_085300_create_pets_table', 1),
(70, '2023_07_21_085435_create_bookings_table', 1),
(71, '2023_07_27_044323_create_pet_notes_table', 1),
(72, '2023_07_29_013849_create_products_table', 1),
(73, '2023_07_31_074834_create_logistics_table', 1),
(74, '2023_07_31_084414_create_tags_table', 1),
(75, '2023_07_31_130358_create_product_categories_table', 1),
(76, '2023_08_01_044536_create_brands_table', 1),
(77, '2023_08_02_072724_create_units_table', 1),
(78, '2023_08_03_035816_create_product_tax_table', 1),
(79, '2023_08_03_101600_create_variations_table', 1),
(80, '2023_08_09_084338_create_variation_values_table', 1),
(81, '2023_08_16_123412_create_product_variation_stocks_table', 1),
(82, '2023_08_16_123433_create_product_variations_table', 1),
(83, '2023_08_16_123521_create_product_category_mappings_table', 1),
(84, '2023_08_16_123557_create_product_tax_mappings_table', 1),
(85, '2023_08_16_123923_create_product_variation_combinations_table', 1),
(86, '2023_08_16_124106_create_product_tags_table', 1),
(87, '2023_08_16_125659_create_product_variations_values_table', 1),
(88, '2023_08_16_125812_create_logistic_zones_table', 1),
(89, '2023_08_18_103053_create_locations_table', 1),
(90, '2023_08_23_100143_create_product_galleries_table', 1),
(91, '2023_08_24_104758_create_carts_table', 1),
(92, '2023_08_26_064700_create_wishlist_table', 1),
(93, '2023_08_26_100400_alter_name_addresses', 1),
(94, '2023_08_28_073810_create_product_review_table', 1),
(95, '2023_08_29_054555_create_cities_table', 1),
(96, '2023_08_29_054601_create_states_table', 1),
(97, '2023_08_29_054608_create_countries_table', 1),
(98, '2023_08_29_063628_create_likes_table', 1),
(99, '2023_08_29_095027_create_review_galleries_table', 1),
(100, '2023_08_29_131200_alter_tax_table', 1),
(101, '2023_08_31_114732_create_order_groups_table', 1),
(102, '2023_08_31_114734_create_orders_table', 1),
(103, '2023_08_31_114740_create_order_items_table', 1),
(104, '2023_08_31_114747_create_order_updates_table', 1),
(105, '2023_09_01_115536_create_logistic_zone_city_table', 1),
(106, '2023_09_06_131856_create_stock_logs_table', 1),
(107, '2023_09_13_060334_create_product_category_brands_table', 1),
(108, '2023_10_18_052743_alter_users_table', 1),
(109, '2023_12_19_104347_create_booking_request_mapping_table', 1),
(110, '2023_12_26_063946_alter_votes_to_pet_notes', 1),
(111, '2024_01_23_041438_alter_enable_store', 1),
(112, '2024_02_13_071258_alter_type_to_commissions', 1),
(113, '2024_02_14_055950_create_order_vendor_mapping_table', 1),
(114, '2024_03_21_050115_alter_order_items', 1),
(115, '2024_03_29_084654_alter_product_reviews', 1),
(116, '2024_06_04_060537_alter_product_category_brands_table', 1),
(117, '2024_06_11_084726_alter_variations_table', 1),
(118, '2024_06_24_054554_boarder_daycare_amount', 1),
(119, '2024_06_26_065609_alter_service_facility_table', 1),
(120, '2024_06_26_065808_alter_service_duration_table', 1),
(121, '2024_06_26_104944_create_service_training_duration_mapping_table', 1),
(122, '2024_06_26_121621_alter_service_training_table', 1),
(123, '2024_08_16_120801_alter_contries_table', 1),
(124, '2024_09_05_065552_alter_setting_table_firebase_values', 1),
(125, '2024_11_06_121652_create_installers_table', 1),
(126, '2024_11_11_065032_alter_notification_contebt_mapping_table', 1),
(127, '2024_11_14_102305_create_alter_notification_template_table', 1),
(128, '2024_11_19_061813_remove_froeign_key_from_booking_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `model_has_permissions`
--

CREATE TABLE `model_has_permissions` (
  `permission_id` bigint UNSIGNED NOT NULL,
  `model_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `model_has_roles`
--

CREATE TABLE `model_has_roles` (
  `role_id` bigint UNSIGNED NOT NULL,
  `model_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `model_has_roles`
--

INSERT INTO `model_has_roles` (`role_id`, `model_type`, `model_id`) VALUES
(1, 'App\\Models\\User', 1),
(9, 'App\\Models\\User', 2),
(9, 'App\\Models\\User', 3),
(9, 'App\\Models\\User', 4),
(9, 'App\\Models\\User', 5),
(9, 'App\\Models\\User', 6),
(9, 'App\\Models\\User', 7),
(9, 'App\\Models\\User', 8),
(9, 'App\\Models\\User', 9),
(9, 'App\\Models\\User', 10),
(9, 'App\\Models\\User', 11),
(6, 'App\\Models\\User', 12);

-- --------------------------------------------------------

--
-- Table structure for table `modules`
--

CREATE TABLE `modules` (
  `id` bigint UNSIGNED NOT NULL,
  `module_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `more_permission` text COLLATE utf8mb4_unicode_ci,
  `status` tinyint NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `modules`
--

INSERT INTO `modules` (`id`, `module_name`, `description`, `more_permission`, `status`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 'Booking', '', NULL, 1, NULL, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(2, 'Boarding', '', '[\"boarding_booking\",\"boarder\",\"facility\"]', 1, NULL, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(3, 'Veterinary', '', '[\"veterinary_booking\",\"veterinarian\",\"veterinary_category\",\"veterinary_service\"]', 1, NULL, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(4, 'Grooming', '', '[\"grooming_booking\",\"groomer\",\"grooming_category\",\"grooming_service\"]', 1, NULL, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(5, 'Traning', '', '[\"training_booking\",\"trainer\",\"training_type\",\"training_duration\"]', 1, NULL, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(6, 'Walking', '', '[\"walking_booking\",\"walker\",\"walking_duration\",\"booking_request\"]', 1, NULL, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(7, 'DayCare', '', '[\"daycare_booking\",\"care_taker\"]', 1, NULL, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(8, 'PetSitter', '', NULL, 1, NULL, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(9, 'Service', '', '[\"assign_service\"]', 1, NULL, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(10, 'Category', '', NULL, 1, NULL, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(11, 'subcategory', '', NULL, 1, NULL, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(12, 'Product', '', '[\"brand\",\"product_category\",\"product_subcategory\",\"unit\",\"tag\"]', 1, NULL, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(13, 'Product Variation', '', NULL, 1, NULL, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(14, 'Order', '', '[\"order_review\"]', 1, NULL, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(15, 'Supply', '', '[\"logistics\",\"shipping_zones\"]', 1, NULL, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(16, 'Location', '', '[\"city\",\"state\",\"country\"]', 1, NULL, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(17, 'Employees', '', '[\"employee_password\",\"employee_earning\",\"employee_payout\",\"pending_employees\"]', 1, NULL, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(18, 'Owners', '', '[\"owner\'s pet\",\"user_password\"]', 1, NULL, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(19, 'Review', '', NULL, 1, NULL, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(20, 'Tax', '', NULL, 1, NULL, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(21, 'Events', '', NULL, 1, NULL, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(22, 'Blogs', '', NULL, 1, NULL, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(23, 'Syetem Service', '', NULL, 1, NULL, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(24, 'Pet', '', '[\"pet type\",\"breed\"]', 1, NULL, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(25, 'Reports', '', '[\"daily_bookings\",\"overall_bookings\",\"order_reports\"]', 1, NULL, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(26, 'Page', '', NULL, 1, NULL, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(27, 'Notification', '', NULL, 1, NULL, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(28, 'App Banner', '', NULL, 1, NULL, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(29, 'Notification Template', '', NULL, 1, NULL, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(30, 'Constant', '', NULL, 1, NULL, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(31, 'Permission', '', NULL, 1, NULL, '2025-08-27 06:27:49', '2025-08-27 06:27:49'),
(32, 'Modules', '', NULL, 1, NULL, '2025-08-27 06:27:49', '2025-08-27 06:27:49');
"
-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notifiable_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notifiable_id` bigint UNSIGNED NOT NULL,
  `data` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notification_templates`
--

CREATE TABLE `notification_templates` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `label` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `to` longtext COLLATE utf8mb4_unicode_ci,
  `bcc` longtext COLLATE utf8mb4_unicode_ci,
  `cc` longtext COLLATE utf8mb4_unicode_ci,
  `status` tinyint NOT NULL DEFAULT '0',
  `channels` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notification_templates`
--

INSERT INTO `notification_templates` (`id`, `name`, `label`, `description`, `type`, `to`, `bcc`, `cc`, `status`, `channels`, `created_by`, `updated_by`, `deleted_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'new_booking', 'Booking confirmation', NULL, 'new_booking', '[\"admin\",\"demo_admin\",\"employee\",\"user\"]', NULL, NULL, 1, '{\"IS_MAIL\":\"0\",\"PUSH_NOTIFICATION\":\"1\",\"IS_CUSTOM_WEBHOOK\":\"0\"}', NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(2, 'accept_booking', 'Accept Booking', NULL, 'accept_booking', '[\"user\",\"admin\",\"demo_admin\"]', NULL, NULL, 1, '{\"IS_MAIL\":\"0\",\"PUSH_NOTIFICATION\":\"1\",\"IS_CUSTOM_WEBHOOK\":\"0\"}', NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(3, 'reject_booking', 'Reject Booking', NULL, 'reject_booking', '[\"user\",\"admin\",\"demo_admin\"]', NULL, NULL, 1, '{\"IS_MAIL\":\"0\",\"PUSH_NOTIFICATION\":\"1\",\"IS_CUSTOM_WEBHOOK\":\"0\"}', NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(4, 'complete_booking', 'Complete On Booking', NULL, 'complete_booking', '[\"user\",\"admin\",\"demo_admin\"]', NULL, NULL, 1, '{\"IS_MAIL\":\"0\",\"PUSH_NOTIFICATION\":\"1\",\"IS_CUSTOM_WEBHOOK\":\"0\"}', NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(5, 'cancel_booking', 'Cancel On Booking', NULL, 'cancel_booking', '[\"user\",\"employee\",\"admin\",\"demo_admin\"]', NULL, NULL, 1, '{\"IS_MAIL\":\"0\",\"PUSH_NOTIFICATION\":\"1\",\"IS_CUSTOM_WEBHOOK\":\"0\"}', NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(6, 'accept_booking_request', 'Accept Booking Request', NULL, 'accept_booking_request', '[\"admin\",\"demo_admin\",\"user\"]', NULL, NULL, 1, '{\"IS_MAIL\":\"0\",\"PUSH_NOTIFICATION\":\"1\",\"IS_CUSTOM_WEBHOOK\":\"0\"}', NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(7, 'change_password', 'Change Password', NULL, 'change_password', '[\"admin\",\"demo_admin\",\"employee\",\"user\"]', NULL, NULL, 1, '{\"IS_MAIL\":\"0\",\"PUSH_NOTIFICATION\":\"1\",\"IS_CUSTOM_WEBHOOK\":\"0\"}', NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(8, 'forget_email_password', 'Forget Email/Password', NULL, 'forget_email_password', '[\"admin\",\"demo_admin\",\"employee\",\"user\"]', NULL, NULL, 1, '{\"IS_MAIL\":\"0\",\"PUSH_NOTIFICATION\":\"1\",\"IS_CUSTOM_WEBHOOK\":\"0\"}', NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(9, 'order_placed', 'Order Placed', NULL, 'order_placed', '[\"user\",\"admin\",\"demo_admin\",\"employee\"]', NULL, NULL, 1, '{\"IS_MAIL\":\"0\",\"PUSH_NOTIFICATION\":\"1\",\"IS_CUSTOM_WEBHOOK\":\"0\"}', NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(10, 'order_accepted', 'Order Accepted', NULL, 'order_accepted', '[\"user\",\"admin\",\"demo_admin\"]', NULL, NULL, 1, '{\"IS_MAIL\":\"0\",\"PUSH_NOTIFICATION\":\"1\",\"IS_CUSTOM_WEBHOOK\":\"0\"}', NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(11, 'order_proccessing', 'Order Processing', NULL, 'order_proccessing', '[\"user\",\"admin\",\"demo_admin\"]', NULL, NULL, 1, '{\"IS_MAIL\":\"0\",\"PUSH_NOTIFICATION\":\"1\",\"IS_CUSTOM_WEBHOOK\":\"0\"}', NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(12, 'order_delivered', 'Order Delivered', NULL, 'order_delivered', '[\"user\",\"admin\",\"demo_admin\"]', NULL, NULL, 1, '{\"IS_MAIL\":\"0\",\"PUSH_NOTIFICATION\":\"1\",\"IS_CUSTOM_WEBHOOK\":\"0\"}', NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(13, 'order_cancelled', 'Oreder Cancelled', NULL, 'order_cancelled', '[\"user\",\"admin\",\"demo_admin\"]', NULL, NULL, 1, '{\"IS_MAIL\":\"0\",\"PUSH_NOTIFICATION\":\"1\",\"IS_CUSTOM_WEBHOOK\":\"0\"}', NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `notification_template_content_mapping`
--

CREATE TABLE `notification_template_content_mapping` (
  `id` int UNSIGNED NOT NULL,
  `template_id` bigint UNSIGNED DEFAULT NULL,
  `language` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `template_detail` longtext COLLATE utf8mb4_unicode_ci,
  `subject` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notification_message` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notification_link` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT '0',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `user_type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mail_template_detail` longtext COLLATE utf8mb4_unicode_ci,
  `mail_subject` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notification_template_content_mapping`
--

INSERT INTO `notification_template_content_mapping` (`id`, `template_id`, `language`, `template_detail`, `subject`, `notification_message`, `notification_link`, `status`, `created_by`, `updated_by`, `deleted_by`, `created_at`, `updated_at`, `deleted_at`, `user_type`, `mail_template_detail`, `mail_subject`) VALUES
(1, 1, 'en', '<p>Dear [[ admin_name ]],<br /><br /> We are pleased to inform you that your appointment has been successfully confirmed with [[ company_name ]]! Thank you for choosing us &ndash; we are excited to serve you and ensure you and your pet have a fantastic experience. <br /><br />Here are the details of your appointment: <br /><br />📅 Appointment Details: <br />- Appointment ID: #[[ booking_id ]] - Service/Event: [[ booking_services_names ]]<br />- Date: [[ booking_date ]] <br />- Time: [[ booking_time ]] <br />- Location: [[ venue_address ]] <br /><br />We&rsquo;ve received your appointment and everything is set. Our team is preparing to deliver an amazing service, and we want to make sure all your expectations are met. If you have any questions or specific requests, feel free to reach out to us. <br /><br />Tip: Don\'t forget to mark your calendar and set a reminder for your appointment! <br /><br />We appreciate your trust in us and look forward to providing top-notch service. For any further queries, our customer support team is here to assist you.<br /><br />Best regards,<br />[[ logged_in_user_fullname ]], <br />[[ logged_in_user_role ]],<br />[[ company_name ]]</p>', 'New Booking Received.', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'admin', '<p>New booking received: ID #[[ booking_id ]] by [[ user_name ]]. Check the details on your dashboard.</p>', 'New Booking Received'),
(2, 1, 'en', '<p>Dear [[ admin_name ]],<br /><br /> We are pleased to inform you that your appointment has been successfully confirmed with [[ company_name ]]! Thank you for choosing us &ndash; we are excited to serve you and ensure you and your pet have a fantastic experience. <br /><br />Here are the details of your appointment: <br /><br />📅 Appointment Details: <br />- Appointment ID: #[[ booking_id ]] - Service/Event: [[ booking_services_names ]]<br />- Date: [[ booking_date ]] <br />- Time: [[ booking_time ]] <br />- Location: [[ venue_address ]] <br /><br />We&rsquo;ve received your appointment and everything is set. Our team is preparing to deliver an amazing service, and we want to make sure all your expectations are met. If you have any questions or specific requests, feel free to reach out to us. <br /><br />Tip: Don\'t forget to mark your calendar and set a reminder for your appointment! <br /><br />We appreciate your trust in us and look forward to providing top-notch service. For any further queries, our customer support team is here to assist you.<br /><br />Best regards,<br />[[ logged_in_user_fullname ]], <br />[[ logged_in_user_role ]],<br />[[ company_name ]]</p>', 'New Booking Received.', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'demo_admin', '<p>New booking received: ID #[[ booking_id ]] by [[ user_name ]]. Check the details on your dashboard.</p>', 'New Booking Received'),
(3, 1, 'en', '<p>Hello [[ employee_name ]],<br /><br /> You have been assigned a new booking scheduled for [[ booking_date ]] at [[ booking_time ]]. <br /><br />📋 Booking Details: <br />- Booking ID: #[[ booking_id ]] <br />- Customer Name: [[ user_name ]] <br />- Services: [[ booking_services_names ]] <br />- Duration: [[ booking_duration ]] <br />- Address: [[ venue_address ]] <br /><br /> Please prepare accordingly and confirm the booking in your dashboard. <br /><br /> Regards, <br /> [[ company_name ]]</p>', 'New Booking Assigned.', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'employee', 'New booking assigned to you: ID #[[ booking_id ]]. Check schedule for [[ booking_date ]] at [[ booking_time ]].', 'New Booking Assigned'),
(4, 1, 'en', '<p>Hello [[ user_name ]],<br /><br /> Thank you for choosing [[ company_name ]] for your pet care needs! Your booking has been confirmed. <br /><br /> 📋 Booking Details:<br /> - Booking ID: #[[ booking_id ]] <br />- Date &amp; Time: [[ booking_date ]] at [[ booking_time ]] <br />- Services: [[ booking_services_names ]] <br />- Duration: [[ booking_duration ]] <br />- Assigned Staff: [[ employee_name ]] <br />- Address: [[ venue_address ]] If you have any questions, please reach out to us. <br /><br /> Thank you, <br /> [[ company_name ]]</p>', 'Your Booking Confirmation', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'user', '<p>Your booking (ID #[[ booking_id ]]) is confirmed for [[ booking_date ]] at [[ booking_time ]]. Details sent to your email.</p>', 'Your Booking Confirmation'),
(5, 2, 'en', '<p>Dear [[ user_name ]],<br /><br /> Your booking has been successfully accepted! We\'re excited to welcome you and hope you enjoy your time with us. <br /><br /> Booking Details: <br />- Booking ID: #[[ booking_id ]]<br />- Booking Date: [[ booking_date ]] <br />- Booking Time: [[ booking_time ]] <br /><br /> We look forward to hosting you and ensuring you have a pleasant experience. If you have any questions or need assistance, don\'t hesitate to reach out to us. <br /><br /> Best regards, <br /> The [[ company_name ]] Team <br /> Contact: [[ company_contact_info ]]</p>\n            ', 'Booking Confirmed', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'user', 'Your booking is confirmed! Booking ID: #[[ booking_id ]]. Check your email for full details.', 'Booking Confirmed'),
(6, 2, 'en', '<p>Dear [[ admin_name ]], <br /><br /> A new booking has been accepted! Please review the details below. <br /><br /> Booking Details: <br /><br />- Booking ID: #[[ booking_id ]] <br />- User Name: [[ user_name ]] <br />- Booking Date: [[ booking_date ]] <br />- Booking Time: [[ booking_time ]] <br /><br /> If you need further details or assistance, please contact us. <br /><br /> Best regards, <br /> The [[ company_name ]] Team <br /> Contact: [[ company_contact_info ]]</p>\n<p><span style=\"font-family: Arial; font-size: 13px; white-space-collapse: preserve;\">&nbsp;</span></p>\n            ', 'New Booking Accepted', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'admin', '\n           <p dir=\"ltr\">New booking accepted: ID #[[ booking_id ]] from [[ user_name ]]. Review the details in your admin panel.</p>', 'New Booking Accepted'),
(7, 2, 'en', '\n               <p>Dear [[ admin_name ]], <br /><br /> A new booking has been accepted! Please review the details below. <br /><br /> Booking Details: <br /><br />- Booking ID: #[[ booking_id ]] <br />- User Name: [[ user_name ]] <br />- Booking Date: [[ booking_date ]] <br />- Booking Time: [[ booking_time ]] <br /><br /> If you need further details or assistance, please contact us. <br /><br /> Best regards, <br /> The [[ company_name ]] Team <br /> Contact: [[ company_contact_info ]]</p>\n<p><span style=\"font-family: Arial; font-size: 13px; white-space-collapse: preserve;\">&nbsp;</span></p>\n            ', 'New Booking Accepted', 'A booking has been accepted.', '', 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'demo_admin', '\n           <p dir=\"ltr\">New booking accepted: ID #[[ booking_id ]] from [[ user_name ]]. Review the details in your admin panel.</p>', 'New Booking Accepted'),
(8, 3, 'en', '\n                <p>Dear [[ user_name ]], <br /><br /> We regret to inform you that your booking has been rejected. We sincerely apologize for any inconvenience caused. <br /><br /> Booking Details:<br />- Booking ID: #[[ booking_id ]]<br /> - Service: [[ booking_services_names ]] <br />- Date: [[ booking_date ]] <br />- Time: [[ booking_time ]] <br />- Location: [[ venue_address ]] <br /><br /> If you have any questions or need assistance, please do not hesitate to contact us. <br /><br /> Best regards, <br /> The [[ company_name ]] <br />Team Contact: [[ company_contact_info ]]</p>\n\n            ', 'Booking Rejected', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'user', '<p dir=\"ltr\">We regret to inform you that your booking #[[ booking_id ]] has been rejected. Please check your email for details.</p>', 'Booking Rejected'),
(9, 3, 'en', '\n               <p>Dear [[ admin_name ]],<br /><br /> A booking has been rejected. Please review the details and take any necessary actions.</p>\n\n            ', 'Booking Rejected', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'admin', '<p>Booking #[[ booking_id ]] has been rejected. Please review the details in your admin panel.</p>', 'Booking Rejected'),
(10, 3, 'en', '\n               <p>Dear [[ admin_name ]],<br /><br /> A booking has been rejected. Please review the details and take any necessary actions.</p>\n\n            ', 'Booking Rejected', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'demo_admin', '<p>Booking #[[ booking_id ]] has been rejected. Please review the details in your admin panel.</p>', 'Booking Rejected'),
(11, 4, 'en', '<p>Dear [[ user_name ]],</p>\n<p>Congratulations! Your booking has been successfully completed. We sincerely appreciate your business and hope you had a wonderful experience with us.</p>\n<p>Booking Date: [[ booking_date ]]</p>\n<p>Service Provided: [[ booking_services_names ]]</p>\n<p>We look forward to serving you again in the future. If you have any feedback or need further assistance, please do not hesitate to contact us.</p>\n<p>Best regards,</p>\n<p>[[ company_name ]]</p>\n<p>[[ company_contact_info ]]</p>\n            ', 'Booking Complete', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'user', '<p>Your booking #[[ booking_id ]] for [[ booking_services_names ]] on [[ booking_date ]] is complete. We hope you had a great experience!</p>', 'Booking Complete'),
(12, 4, 'en', '\n            <p>Dear [[ user_name ]], <br /><br /> We regret to inform you that your booking has been rejected. We sincerely apologize for any inconvenience caused. <br /><br /> Booking Details: <br />- Booking ID: #[[ booking_id ]] <br />- Service: [[ booking_services_names ]] <br />- Date: [[ booking_date ]] <br />- Time: [[ booking_time ]] <br />- Location: [[ venue_address ]] <br /><br /> If you have any questions or need assistance, please do not hesitate to contact us. <br /><br />Best regards, <br /> The [[ company_name ]] Team <br /> Contact: [[ company_contact_info ]]</p>\n          ', 'Booking Completed Successfully', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'admin', '<p>We regret to inform you that your booking #[[ booking_id ]] has been rejected. Please check your email for details.</p>', 'Booking Completed Successfully'),
(13, 4, 'en', '\n            <p>Dear [[ user_name ]], <br /><br /> We regret to inform you that your booking has been rejected. We sincerely apologize for any inconvenience caused. <br /><br /> Booking Details: <br />- Booking ID: #[[ booking_id ]] <br />- Service: [[ booking_services_names ]] <br />- Date: [[ booking_date ]] <br />- Time: [[ booking_time ]] <br />- Location: [[ venue_address ]] <br /><br /> If you have any questions or need assistance, please do not hesitate to contact us. <br /><br />Best regards, <br /> The [[ company_name ]] Team <br /> Contact: [[ company_contact_info ]]</p>\n          ', 'Booking Completed Successfully', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'demo_admin', '<p>We regret to inform you that your booking #[[ booking_id ]] has been rejected. Please check your email for details.</p>', 'Booking Completed Successfully'),
(14, 5, 'en', '<p>Dear [[ user_name ]], <br /><br /> We regret to inform you that your booking has been cancelled. We apologize for any inconvenience this may have caused.</p>\n            <p>Booking Details: <br />- Booking ID: #[[ booking_id ]] <br />- Service: [[ booking_services_names ]] <br />- Date: [[ booking_date ]] <br />- Time: [[ booking_time ]] <br />- Location: [[ venue_address ]] <br /><br /> If you have any questions or need further assistance, please do not hesitate to contact us. We are here to help! <br /><br /> Best regards, <br /> The [[ company_name ]] Team <br /> Contact: [[ company_contact_info ]]</p>', 'Your Booking Has Been Cancelled', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'user', '<p>Your booking #[[ booking_id ]] for [[ booking_services_names ]] on [[ booking_date ]] has been cancelled. Please contact us for further assistance.</p>', 'Your Booking Has Been Cancelled'),
(15, 5, 'en', '<p>Dear [[ employee_name ]],<br /><br />A booking has been cancelled. Please review the details below.<br /><br />Booking Details:<br />- Booking ID: #[[ booking_id ]]<br />- User Name: [[ user_name ]]<br />- Service: [[ booking_services_names ]]<br />- Date: [[ booking_date ]]<br />- Time: [[ booking_time ]]<br />- Location: [[ venue_address ]]<br /><br />Please take the necessary actions as required.<br />Best regards,<br />The [[ company_name ]] Team<br />Contact: [[ company_contact_info ]]</p>\n\n            ', 'Booking Cancelled', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'employee', '<p>The booking #[[ booking_id ]] for [[ booking_services_names ]] has been cancelled.&nbsp;</p>', 'Booking Cancelled'),
(16, 5, 'en', ' <p>Dear [[ admin_name ]],<br /><br /> A booking has been cancelled. Please review the details below.<br /><br /> Booking Details: <br />- Booking ID: #[[ booking_id ]] <br />- User Name: [[ user_name ]] <br />- Service: [[ booking_services_names ]] <br />- Date: [[ booking_date ]] <br />- Time: [[ booking_time ]] <br />- Location: [[ venue_address ]] <br /><br /> Please take the necessary actions as required.<br />Best regards, <br /> The [[ company_name ]] Team <br /> Contact: [[ company_contact_info ]]</p>', 'Booking Cancelled', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'admin', '<p>The booking #[[ booking_id ]] for [[ booking_services_names ]] has been cancelled. Please review the details in your admin dashboard.</p>', 'Booking Cancelled'),
(17, 5, 'en', ' <p>Dear [[ admin_name ]],<br /><br /> A booking has been cancelled. Please review the details below.<br /><br /> Booking Details: <br />- Booking ID: #[[ booking_id ]] <br />- User Name: [[ user_name ]] <br />- Service: [[ booking_services_names ]] <br />- Date: [[ booking_date ]] <br />- Time: [[ booking_time ]] <br />- Location: [[ venue_address ]] <br /><br /> Please take the necessary actions as required.<br />Best regards, <br /> The [[ company_name ]] Team <br /> Contact: [[ company_contact_info ]]</p>', 'Booking Cancelled', 'The booking has been cancelled. Review the details as needed.', '', 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'demo_admin', '<p>The booking #[[ booking_id ]] for [[ booking_services_names ]] has been cancelled. Please review the details in your admin dashboard.</p>', 'Booking Cancelled'),
(18, 6, 'en', ' <p>Dear [[ admin_name ]], <br /><br /> A new booking request has been accepted. Please review the details below. <br /><br /> Booking Details:<br /> - Booking ID: #[[ booking_id ]] <br />- User Name: [[ user_name ]] <br />- Service(s): [[ booking_services_names ]] <br />- Date: [[ booking_date ]] <br />- Time: [[ booking_time ]] <br />- Duration: [[ booking_duration ]] <br />- Venue: [[ venue_address ]]<br /> <br /> Best regards, <br /> The [[ company_name ]] Team <br />Contact us: [[ company_contact_info ]]</p>', 'Booking Accepted', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'admin', '<p>A booking #[[ booking_id ]] for [[ booking_services_names ]] has been accepted. Check the admin dashboard for more details.</p>', 'Booking Accepted'),
(19, 6, 'en', '<p>Dear [[ admin_name ]], <br /><br /> A new booking request has been accepted. Please review the details below. <br /><br /> Booking Details:<br /> - Booking ID: #[[ booking_id ]] <br />- User Name: [[ user_name ]] <br />- Service(s): [[ booking_services_names ]] <br />- Date: [[ booking_date ]] <br />- Time: [[ booking_time ]] <br />- Duration: [[ booking_duration ]] <br />- Venue: [[ venue_address ]]<br /> <br /> Best regards, <br /> The [[ company_name ]] Team <br />Contact us: [[ company_contact_info ]]</p>', 'Booking Accepted', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'demo_admin', '<p>A booking #[[ booking_id ]] for [[ booking_services_names ]] has been accepted. Check the admin dashboard for more details.</p>', 'Booking Accepted'),
(20, 6, 'en', '<p>Dear [[ user_name ]], <br /><br /> Great news! Your booking request has been accepted. We look forward to providing you with exceptional service. <br /><br /> Booking Details: <br />- Booking ID: #[[ booking_id ]] <br />- Service(s): [[ booking_services_names ]] <br />- Date: [[ booking_date ]] <br />- Time: [[ booking_time ]] <br />- Duration: [[ booking_duration ]] <br />- Venue: [[ venue_address ]] <br /><br /> For any questions, please contact us at [[ company_contact_info ]].<br /><br /> Best regards, <br /> The [[ company_name ]] Team</p>\n<p><span style=\"font-family: Arial; font-size: 13px; white-space-collapse: preserve;\">&nbsp;</span></p>\n            ', 'Your Booking Request Has Been Accepted!', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'user', '<p>Your booking #[[ booking_id ]] for [[ booking_services_names ]] on [[ booking_date ]] at [[ booking_time ]] has been accepted. See you soon!</p>', 'Booking Accepted'),
(21, 7, 'en', '<p>Dear [[ admin_name ]],<br /><br /> A user has successfully changed their password. Please review the details below: <br /><br /> User ID: [[ user_id ]] <br /> User Name: [[ user_name ]]<br /><br /> If this change was unauthorized, please investigate further. <br /><br /> Best regards, <br /> The [[ company_name ]] Team <br /> Contact us: [[ company_contact_info ]]</p>\n<p><span style=\"font-family: Arial; font-size: 13px; white-space-collapse: preserve;\">&nbsp;</span></p>\n            ', 'User Password Updated', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'admin', '<p>User [[ user_name ]] ( ID: [[ user_id ]] ) has changed their password. Please review if necessary.</p>', 'User Password Changed'),
(22, 7, 'en', '<p>Dear [[ admin_name ]],<br /><br /> A user has successfully changed their password. Please review the details below: <br /><br /> User ID: [[ user_id ]] <br /> User Name: [[ user_name ]]<br /><br /> If this change was unauthorized, please investigate further. <br /><br /> Best regards, <br /> The [[ company_name ]] Team <br /> Contact us: [[ company_contact_info ]]</p>\n<p><span style=\"font-family: Arial; font-size: 13px; white-space-collapse: preserve;\">&nbsp;</span></p>\n            ', 'User Password Updated', 'A password change has occurred. If you did not make this change, take action to secure the account.', '', 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'demo_admin', '<p>User [[ user_name ]] ( ID: [[ user_id ]] ) has changed their password. Please review if necessary.</p>', 'User Password Changed'),
(23, 7, 'en', '<p>Dear [[ employee_name ]], <br /><br /> Your password has been successfully changed. <br /><br />If you did not request this change, please contact us immediately. <br /><br />For any concerns, reach out to us at [[ company_contact_info ]]. <br /><br /> Best regards, <br />The [[ company_name ]] Team</p>\n            ', 'Your Password Has Been Successfully Changed', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'employee', '<p>Your password has been updated. If this wasn\'t you, contact support immediately.</p>', 'Password Changed Successfully'),
(24, 7, 'en', '<p>Dear [[ user_name ]], <br /><br /> Your password has been successfully changed.<br /><br /> If you did not request this change, please contact us immediately.<br /><br /> For any concerns, reach out to us at [[ company_contact_info ]]. <br /><br /> Best regards, <br /> The [[ company_name ]] Team</p>\n\n            ', 'Your Password Has Been Successfully Changed', 'Your password has been changed successfully. If you did not initiate this change, please follow the steps to secure your account.', '', 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'user', '<p>Your password has been updated. If this wasn\'t you, contact support immediately.</p>', 'Password Changed Successfully'),
(25, 8, 'en', '<p>Thank you for choosing us for your recent order. We are delighted to confirm that your order has been successfully placed!</p>\n            ', 'Password Reset Request by User', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'user', '<p>User [[ user_name ]] ( ID: [[ user_id ]] ) requested a password reset. Review if needed.</p>', 'User Requested Password Reset'),
(26, 8, 'en', '<p>Dear [[ admin_name ]], <br /><br />A user has requested a password reset.<br /><br /> Please review the details below: <br /> User ID: [[ user_id ]]<br />User Name: [[ user_name ]] <br /><br />If this request seems suspicious, please investigate. <br /><br /> Best regards,<br /> The [[ company_name ]] Team <br /> Contact: [[ company_contact_info ]]</p>\n            ', 'User Requested Password Reset', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'admin', '<p>User [[ user_name ]] ( ID: [[ user_id ]] ) requested a password reset. Review if needed.</p>', 'Password Reset Request by User'),
(27, 8, 'en', '<p>Dear [[ admin_name ]], <br /><br />A user has requested a password reset.<br /><br /> Please review the details below: <br /> User ID: [[ user_id ]]<br />User Name: [[ user_name ]] <br /><br />If this request seems suspicious, please investigate. <br /><br /> Best regards,<br /> The [[ company_name ]] Team <br /> Contact: [[ company_contact_info ]]</p>\n            ', 'User Requested Password Reset', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'demo_admin', '<p>User [[ user_name ]] ( ID: [[ user_id ]] ) requested a password reset. Review if needed.</p>', 'Password Reset Request by User'),
(28, 8, 'en', '<p>Dear [[ employee_name ]], <br /><br />We received a request to reset your password. <br /><br />Please click the link below to set a new password:<br />Reset Link: [[ link ]]<br /><br /> If you did not request this, please ignore this email or contact us immediately. <br /><br /> Best regards, <br /> The [[ company_name ]] Team <br /> Contact us: [[ company_contact_info ]]</p>\n<p><span style=\"font-family: Arial; font-size: 13px; white-space-collapse: preserve;\">&nbsp;</span></p>\n            ', 'Reset Your Account Password', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'employee', '<p>We received your password reset request. Check your email for instructions<span style=\"font-family: Arial; font-size: 13px; white-space-collapse: preserve;\">.</span></p>', 'Reset Your Account Password'),
(29, 9, 'en', '\n            <p>Dear [[ user_name ]], <br /><br /> Thank you for your purchase! We are happy to inform you that your order for pet care products has been successfully placed. <br /><br />If you have any questions or need assistance, feel free to contact us at [[ company_contact_info ]]. <br /><br /> Thank you for trusting [[ company_name ]] for your pet care needs!<br /><br /> Best regards, <br /> The [[ company_name ]] Team <br /> Contact us: [[ company_contact_info ]]</p>\n            ', 'Your Pet Care Product Order is Confirmed!', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'user', '<p>Your order for pet care products has been successfully placed. We will update you once it is shipped!</p>', 'Your Pet Care Product Order is Confirmed!'),
(30, 9, 'en', '<p>Dear [[ admin_name ]],<br /><br /> A new order for pet care products has been placed.<br /><br />Please ensure the order is processed and shipped promptly. <br /><br /> Best regards, <br /><br /> The [[ company_name ]] Team &nbsp;</p>\n<p>Contact: [[ company_contact_info ]]</p>\n            ', 'New Pet Care Product Order', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'admin', '<p>A new order for pet care products has been placed. Please review the order details and take action.</p>', 'New Pet Care Product Order'),
(31, 9, 'en', '<p>Dear [[ admin_name ]],<br /><br /> A new order for pet care products has been placed.<br /><br />Please ensure the order is processed and shipped promptly. <br /><br /> Best regards, <br /><br /> The [[ company_name ]] Team &nbsp;</p>\n<p>Contact: [[ company_contact_info ]]</p>\n            ', 'New Pet Care Product Order', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'demo_admin', '<p>A new order for pet care products has been placed. Please review the order details and take action.</p>', 'New Pet Care Product Order'),
(32, 10, 'en', '<p>Dear [[ user_name ]],</p>\n<p>Great news! Your order for pet care products has been successfully accepted and is being processed. <br /><br /> We&rsquo;ll notify you when your order is on its way! If you have any questions, feel free to reach out to us. <br /><br /> Thank you for trusting [[ company_name ]] for your pet care needs!<br /><br /> Best regards,<br />The [[ company_name ]] Team <br />Contact us: [[ company_contact_info ]]</p>\n', 'Your Pet Care Product Order is Accepted!', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'user', '<p>Your order for pet care products has been accepted and is being processed. We&rsquo;ll notify you when it&rsquo;s shipped!</p>', 'Your Pet Care Product Order is Accepted!'),
(33, 10, 'en', '<p>Dear [[ admin_name ]], <br /><br /> The order for pet care products has been accepted and is now in progress. <br /><br />Please find the order details below: <br />Customer Name: [[ user_name ]] <br /><br /> Please make sure the fulfillment process continues smoothly.<br /><br /> Best regards, <br /> The [[ company_name ]] Team <br /> Contact: [[ company_contact_info ]]</p>\n<p><span style=\"font-family: Arial; font-size: 13px; white-space-collapse: preserve;\">&nbsp;</span></p>', 'Pet Care Product Order Accepted', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'admin', '<p>An order for pet care products has been accepted. Please review the order details and ensure processing.</p>', 'Pet Care Product Order Accepted'),
(34, 10, 'en', '<p>Dear [[ admin_name ]], <br /><br /> The order for pet care products has been accepted and is now in progress. <br /><br />Please find the order details below: <br />Customer Name: [[ user_name ]] <br /><br /> Please make sure the fulfillment process continues smoothly.<br /><br /> Best regards, <br /> The [[ company_name ]] Team <br /> Contact: [[ company_contact_info ]]</p>\n<p><span style=\"font-family: Arial; font-size: 13px; white-space-collapse: preserve;\">&nbsp;</span></p>', 'Pet Care Product Order Accepted', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'demo_admin', '<p>An order for pet care products has been accepted. Please review the order details and ensure processing.</p>', 'Pet Care Product Order Accepted'),
(35, 11, 'en', '<p>Dear [[ user_name ]], <br />|<br />We are excited to let you know that your order for pet care products is now being processed! <br /><br />Our team is getting everything ready to ship your items as quickly as possible. <br /><br /> We will notify you as soon as your order ships. If you have any questions or need assistance, don\'t hesitate to contact us.<br /><br /> Thank you for shopping with [[ company_name ]]! <br /><br /> Best regards, <br /> The [[ company_name ]] Team<br /> Contact us: [[ company_contact_info ]]</p>', 'Your Product Order is Being Processed', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'user', '<p>The pet care product order is now being processed. Please review and ensure fulfillment.</p>', 'Your Product Order is Being Processed'),
(36, 11, 'en', '<p>Dear [[ admin_name ]],<br /><br /> The order for pet care products is now being processed.<br /><br /> Below are the details for your review: Customer Name: [[ user_name ]] <br /><br /> Please ensure the processing steps continue smoothly and take the necessary actions for fulfillment. <br /><br /> Best regards, <br /> The [[ company_name ]] Team<br /> Contact: [[ company_contact_info ]]</p>\n<p><span style=\"font-family: Arial; font-size: 13px; white-space-collapse: preserve;\">&nbsp;</span></p>', 'Pet Care Product Order Now Being Processed', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'admin', '<p>Your order for pet care products is now being processed! We&rsquo;ll update you once it&rsquo;s on the way.</p>', 'Product Order - Now Being Processed'),
(37, 11, 'en', '<p>Dear [[ admin_name ]],<br /><br /> The order for pet care products is now being processed.<br /><br /> Below are the details for your review: Customer Name: [[ user_name ]] <br /><br /> Please ensure the processing steps continue smoothly and take the necessary actions for fulfillment. <br /><br /> Best regards, <br /> The [[ company_name ]] Team<br /> Contact: [[ company_contact_info ]]</p>\n<p><span style=\"font-family: Arial; font-size: 13px; white-space-collapse: preserve;\">&nbsp;</span></p>', 'Pet Care Product Order Now Being Processed', 'A new order is being processed. View the details in the demo admin panel.', '', 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'demo_admin', '<p>Your order for pet care products is now being processed! We&rsquo;ll update you once it&rsquo;s on the way.</p>', 'Product Order - Now Being Processed'),
(38, 12, 'en', '<p>Dear [[ admin_name ]],<br /> <br /> The order for pet care products has been successfully delivered to the customer.&nbsp;<br /><br />Here are the details: <br />Customer Name: [[ user_name ]] <br /><br /> Please update the records accordingly.<br /> <br />If there are any issues, please address them promptly. <br /><br /> Best regards, <br /> The [[ company_name ]] Team<br /> Contact: [[ company_contact_info ]]</p>\n', 'Order Delivered - Confirmation for Pet Care Products', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'user', '<p>The order for pet care products has been delivered to the customer. Please update the records.</p>', 'Order Delivered - Confirmation for Pet Care Products'),
(39, 12, 'en', '<p>Dear [[ admin_name ]], <br /><br /> The order for pet care products has been successfully delivered to the customer. <br /><br />Here are the details: <br />Customer Name: [[ user_name ]] <br /><br /> Please update the records accordingly. If there are any issues, please address them promptly. <br /><br /> Best regards, <br /> The [[ company_name ]] Team<br /> Contact: [[ company_contact_info ]]</p>\n<p><span style=\"font-family: Arial; font-size: 13px; white-space-collapse: preserve;\">&nbsp;</span></p>', 'Order Delivered - Confirmation for Pet Care Products', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'admin', '<p><span style=\"font-family: Arial; font-size: 13px; white-space-collapse: preserve;\">The order for pet care products has been delivered to the customer. Please update the records.</span></p>', 'Order Delivered - Confirmation for Pet Care Products'),
(40, 12, 'en', '<p>Dear [[ admin_name ]], <br /><br /> The order for pet care products has been successfully delivered to the customer. <br /><br />Here are the details: <br />Customer Name: [[ user_name ]] <br /><br /> Please update the records accordingly. If there are any issues, please address them promptly. <br /><br /> Best regards, <br /> The [[ company_name ]] Team<br /> Contact: [[ company_contact_info ]]</p>\n<p><span style=\"font-family: Arial; font-size: 13px; white-space-collapse: preserve;\">&nbsp;</span></p>', 'Order Delivered - Confirmation for Pet Care Products', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'demo_admin', '<p><span style=\"font-family: Arial; font-size: 13px; white-space-collapse: preserve;\">The order for pet care products has been delivered to the customer. Please update the records.</span></p>', 'Order Delivered - Confirmation for Pet Care Products'),
(41, 13, 'en', '<p>Dear [[ user_name ]], <br /> We regret to inform you that your order has been cancelled. <br /><br /> We apologize for any inconvenience this may have caused. <br /><br />If you have any questions or would like assistance with placing a new order, please do not hesitate to reach out to us. <br /><br /> Thank you for understanding. <br /><br /> Best regards, <br /> The [[ company_name ]] Team <br />Contact us: [[ company_contact_info ]]</p>\n<p><span style=\"font-family: Arial; font-size: 13px; white-space-collapse: preserve;\">&nbsp;</span></p>', 'Your Product Order Has Been Cancelled', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'user', '<p>We\'re sorry to inform you that your order has been cancelled. Please contact us if you need further assistance.</p>', 'Your Product Order Has Been Cancelled'),
(42, 13, 'en', '<p>Dear [[ admin_name ]], <br /><br /> An order has been cancelled. <br />Below are the details: <br />Customer Name: [[ user_name ]] <br /><br /> Please review the cancellation and update the records accordingly. <br />If further action is needed, please address it promptly. <br /><br /> Best regards, <br /> The [[ company_name ]] Team <br /> Contact: [[ company_contact_info ]]</p>\n', 'Order Cancelled', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'admin', '<p>An order has been cancelled by the [[ user_name ]]. Please update the records and take necessary actions.</p>', 'Order Cancelled'),
(43, 13, 'en', '<p>Dear [[ admin_name ]], <br /><br /> An order has been cancelled. <br />Below are the details: <br />Customer Name: [[ user_name ]] <br /><br /> Please review the cancellation and update the records accordingly. <br />If further action is needed, please address it promptly. <br /><br /> Best regards, <br /> The [[ company_name ]] Team <br /> Contact: [[ company_contact_info ]]</p>\n', 'Order Cancelled', NULL, NULL, 1, NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL, 'demo_admin', '<p>An order has been cancelled by the [[ user_name ]]. Please update the records and take necessary actions.</p>', 'Order Cancelled');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` bigint UNSIGNED NOT NULL,
  `order_group_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `guest_user_id` int DEFAULT NULL,
  `location_id` int DEFAULT NULL,
  `delivery_status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'order_placed',
  `payment_status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unpaid',
  `applied_coupon_code` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `coupon_discount_amount` double NOT NULL DEFAULT '0',
  `admin_earning_percentage` double NOT NULL DEFAULT '0' COMMENT 'how much in percentage seller will pay to admin for each sell',
  `total_admin_earnings` double NOT NULL DEFAULT '0',
  `logistic_id` int DEFAULT NULL,
  `logistic_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pickup_or_delivery` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'delivery',
  `pickup_hub_id` int DEFAULT NULL,
  `shipping_cost` double NOT NULL DEFAULT '0',
  `tips_amount` double NOT NULL DEFAULT '0',
  `reward_points` bigint NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_groups`
--

CREATE TABLE `order_groups` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` int DEFAULT NULL,
  `guest_user_id` int DEFAULT NULL,
  `order_code` bigint NOT NULL,
  `shipping_address_id` int DEFAULT NULL,
  `billing_address_id` int DEFAULT NULL,
  `location_id` int DEFAULT NULL,
  `phone_no` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alternative_phone_no` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sub_total_amount` double NOT NULL DEFAULT '0',
  `total_tax_amount` double NOT NULL DEFAULT '0',
  `total_coupon_discount_amount` double NOT NULL DEFAULT '0',
  `total_shipping_cost` double NOT NULL DEFAULT '0',
  `grand_total_amount` double NOT NULL DEFAULT '0',
  `payment_method` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cash_on_delivery',
  `payment_status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unpaid',
  `payment_details` longtext COLLATE utf8mb4_unicode_ci,
  `is_manual_payment` tinyint(1) NOT NULL DEFAULT '0',
  `manual_payment_details` longtext COLLATE utf8mb4_unicode_ci,
  `pos_order_address` text COLLATE utf8mb4_unicode_ci,
  `additional_discount_value` double NOT NULL DEFAULT '0',
  `additional_discount_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'flat',
  `total_discount_amount` double NOT NULL DEFAULT '0',
  `total_tips_amount` double NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint UNSIGNED NOT NULL,
  `order_id` int NOT NULL,
  `product_variation_id` int NOT NULL,
  `qty` int NOT NULL DEFAULT '1',
  `location_id` int DEFAULT NULL,
  `unit_price` double NOT NULL DEFAULT '0',
  `total_tax` double NOT NULL DEFAULT '0',
  `total_price` double NOT NULL DEFAULT '0',
  `reward_points` bigint NOT NULL DEFAULT '0',
  `is_refunded` tinyint NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `vendor_id` bigint UNSIGNED NOT NULL DEFAULT '1',
  `total_shipping_cost` double NOT NULL DEFAULT '0',
  `delivery_status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'order_placed',
  `payment_status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unpaid',
  `delivered_date` datetime DEFAULT NULL,
  `discount_value` double NOT NULL DEFAULT '0',
  `discount_type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expected_delivery_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_updates`
--

CREATE TABLE `order_updates` (
  `id` bigint UNSIGNED NOT NULL,
  `order_id` int NOT NULL,
  `user_id` int NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_vendor_mapping`
--

CREATE TABLE `order_vendor_mapping` (
  `id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED NOT NULL,
  `vendor_id` bigint UNSIGNED NOT NULL DEFAULT '1',
  `product_total_amount` double NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `package_service_mappings`
--

CREATE TABLE `package_service_mappings` (
  `id` bigint UNSIGNED NOT NULL,
  `service_id` bigint UNSIGNED DEFAULT NULL,
  `service_package_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pages`
--

CREATE TABLE `pages` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sequence` int DEFAULT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `status` tinyint NOT NULL DEFAULT '0',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(125) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guard_name` varchar(125) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_fixed` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `guard_name`, `is_fixed`, `created_at`, `updated_at`) VALUES
(1, 'edit_settings', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(2, 'view_logs', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(3, 'view_booking', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(4, 'add_booking', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(5, 'edit_booking', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(6, 'delete_booking', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(7, 'view_boarding', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(8, 'add_boarding', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(9, 'edit_boarding', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(10, 'delete_boarding', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(11, 'view_boarding_booking', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(12, 'add_boarding_booking', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(13, 'edit_boarding_booking', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(14, 'delete_boarding_booking', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(15, 'view_boarder', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(16, 'add_boarder', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(17, 'edit_boarder', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(18, 'delete_boarder', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(19, 'view_facility', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(20, 'add_facility', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(21, 'edit_facility', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(22, 'delete_facility', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(23, 'view_veterinary', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(24, 'add_veterinary', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(25, 'edit_veterinary', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(26, 'delete_veterinary', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(27, 'view_veterinary_booking', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(28, 'add_veterinary_booking', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(29, 'edit_veterinary_booking', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(30, 'delete_veterinary_booking', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(31, 'view_veterinarian', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(32, 'add_veterinarian', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(33, 'edit_veterinarian', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(34, 'delete_veterinarian', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(35, 'view_veterinary_category', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(36, 'add_veterinary_category', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(37, 'edit_veterinary_category', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(38, 'delete_veterinary_category', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(39, 'view_veterinary_service', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(40, 'add_veterinary_service', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(41, 'edit_veterinary_service', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(42, 'delete_veterinary_service', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(43, 'view_grooming', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(44, 'add_grooming', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(45, 'edit_grooming', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(46, 'delete_grooming', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(47, 'view_grooming_booking', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(48, 'add_grooming_booking', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(49, 'edit_grooming_booking', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(50, 'delete_grooming_booking', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(51, 'view_groomer', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(52, 'add_groomer', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(53, 'edit_groomer', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(54, 'delete_groomer', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(55, 'view_grooming_category', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(56, 'add_grooming_category', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(57, 'edit_grooming_category', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(58, 'delete_grooming_category', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(59, 'view_grooming_service', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(60, 'add_grooming_service', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(61, 'edit_grooming_service', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(62, 'delete_grooming_service', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(63, 'view_traning', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(64, 'add_traning', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(65, 'edit_traning', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(66, 'delete_traning', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(67, 'view_training_booking', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(68, 'add_training_booking', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(69, 'edit_training_booking', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(70, 'delete_training_booking', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(71, 'view_trainer', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(72, 'add_trainer', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(73, 'edit_trainer', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(74, 'delete_trainer', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(75, 'view_training_type', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(76, 'add_training_type', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(77, 'edit_training_type', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(78, 'delete_training_type', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(79, 'view_traning_duration', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(80, 'add_traning_duration', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(81, 'edit_traning_duration', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(82, 'delete_traning_duration', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(83, 'view_walking', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(84, 'add_walking', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(85, 'edit_walking', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(86, 'delete_walking', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(87, 'view_walking_booking', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(88, 'add_walking_booking', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(89, 'edit_walking_booking', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(90, 'delete_walking_booking', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(91, 'view_booking_request', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(92, 'add_booking_request', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(93, 'edit_booking_request', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(94, 'delete_booking_request', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(95, 'view_walker', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(96, 'add_walker', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(97, 'edit_walker', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(98, 'delete_walker', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(99, 'view_walking_duration', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(100, 'add_walking_duration', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(101, 'edit_walking_duration', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(102, 'delete_walking_duration', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(103, 'view_daycare', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(104, 'add_daycare', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(105, 'edit_daycare', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(106, 'delete_daycare', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(107, 'view_daycare_booking', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(108, 'add_daycare_booking', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(109, 'edit_daycare_booking', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(110, 'delete_daycare_booking', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(111, 'view_care_taker', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(112, 'add_care_taker', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(113, 'edit_care_taker', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(114, 'delete_care_taker', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(115, 'view_pet_sitter', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(116, 'add_pet_sitter', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(117, 'edit_pet_sitter', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(118, 'delete_pet_sitter', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(119, 'view_pet_store', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(120, 'add_pet_store', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(121, 'edit_pet_store', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(122, 'delete_pet_store', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(123, 'view_service', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(124, 'add_service', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(125, 'edit_service', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(126, 'delete_service', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(127, 'add_assign_service', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(128, 'view_category', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(129, 'add_category', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(130, 'edit_category', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(131, 'delete_category', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(132, 'view_subcategory', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(133, 'add_subcategory', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(134, 'edit_subcategory', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(135, 'delete_subcategory', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(136, 'view_employees', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(137, 'add_employees', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(138, 'edit_employees', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(139, 'delete_employees', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(140, 'view_pending_employees', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(141, 'edit_employee_password', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(142, 'view_employee_earning', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(143, 'add_employee_earning', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(144, 'edit_employee_earning', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(145, 'delete_employee_earning', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(146, 'view_employee_payout', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(147, 'add_employee_payout', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(148, 'edit_employee_payout', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(149, 'delete_employee_payout', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(150, 'view_owners', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(151, 'add_owners', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(152, 'edit_owners', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(153, 'delete_owners', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(154, 'view_owner\'s_pet', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(155, 'add_owner\'s_pet', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(156, 'edit_owner\'s_pet', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(157, 'delete_owner\'s_pet', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(158, 'edit_user_password', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(159, 'view_review', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(160, 'add_review', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(161, 'edit_review', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(162, 'delete_review', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(163, 'view_order_review', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(164, 'add_order_review', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(165, 'edit_order_review', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(166, 'delete_order_review', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(167, 'view_tax', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(168, 'add_tax', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(169, 'edit_tax', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(170, 'delete_tax', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(171, 'view_events', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(172, 'add_events', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(173, 'edit_events', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(174, 'delete_events', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(175, 'view_blogs', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(176, 'add_blogs', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(177, 'edit_blogs', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(178, 'delete_blogs', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(179, 'view_syetem_service', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(180, 'add_syetem_service', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(181, 'edit_syetem_service', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(182, 'delete_syetem_service', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(183, 'view_pet', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(184, 'add_pet', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(185, 'edit_pet', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(186, 'delete_pet', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(187, 'view_pet_type', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(188, 'add_pet_type', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(189, 'edit_pet_type', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(190, 'delete_pet_type', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(191, 'view_breed', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(192, 'add_breed', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(193, 'edit_breed', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(194, 'delete_breed', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(195, 'view_reports', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(196, 'add_reports', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(197, 'edit_reports', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(198, 'delete_reports', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(199, 'view_daily_bookings', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(200, 'add_daily_bookings', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(201, 'edit_daily_bookings', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(202, 'delete_daily_bookings', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(203, 'view_overall_bookings', 'web', 1, '2025-08-27 06:27:41', '2025-08-27 06:27:41'),
(204, 'add_overall_bookings', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(205, 'edit_overall_bookings', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(206, 'delete_overall_bookings', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(207, 'view_order_reports', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(208, 'add_order_reports', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(209, 'edit_order_reports', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(210, 'delete_order_reports', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(211, 'view_page', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(212, 'add_page', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(213, 'edit_page', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(214, 'delete_page', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(215, 'view_setting', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(216, 'add_setting', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(217, 'edit_setting', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(218, 'delete_setting', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(219, 'view_notification', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(220, 'add_notification', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(221, 'edit_notification', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(222, 'delete_notification', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(223, 'view_notification_template', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(224, 'add_notification_template', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(225, 'edit_notification_template', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(226, 'delete_notification_template', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(227, 'view_app_banner', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(228, 'add_app_banner', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(229, 'edit_app_banner', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(230, 'delete_app_banner', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(231, 'view_constant', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(232, 'add_constant', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(233, 'edit_constant', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(234, 'delete_constant', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(235, 'view_permission', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(236, 'add_permission', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(237, 'edit_permission', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(238, 'delete_permission', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(239, 'view_modules', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(240, 'add_modules', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(241, 'edit_modules', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(242, 'delete_modules', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(243, 'view_product', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(244, 'add_product', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(245, 'edit_product', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(246, 'delete_product', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(247, 'view_product_category', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(248, 'add_product_category', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(249, 'edit_product_category', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(250, 'delete_product_category', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(251, 'view_product_subcategory', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(252, 'add_product_subcategory', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(253, 'edit_product_subcategory', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(254, 'delete_product_subcategory', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(255, 'view_brand', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(256, 'add_brand', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(257, 'edit_brand', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(258, 'delete_brand', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(259, 'view_unit', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(260, 'add_unit', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(261, 'edit_unit', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(262, 'delete_unit', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(263, 'view_tag', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(264, 'add_tag', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(265, 'edit_tag', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(266, 'delete_tag', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(267, 'view_product_variation', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(268, 'add_product_variation', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(269, 'edit_product_variation', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(270, 'delete_product_variation', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(271, 'view_order', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(272, 'add_order', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(273, 'edit_order', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(274, 'delete_order', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(275, 'view_supply', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(276, 'add_supply', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(277, 'edit_supply', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(278, 'delete_supply', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(279, 'view_logistics', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(280, 'add_logistics', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(281, 'edit_logistics', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(282, 'delete_logistics', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(283, 'view_shipping_zones', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(284, 'add_shipping_zones', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(285, 'edit_shipping_zones', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(286, 'delete_shipping_zones', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(287, 'view_location', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(288, 'add_location', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(289, 'edit_location', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(290, 'delete_location', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(291, 'view_city', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(292, 'add_city', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(293, 'edit_city', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(294, 'delete_city', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(295, 'view_state', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(296, 'add_state', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(297, 'edit_state', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(298, 'delete_state', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(299, 'view_country', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(300, 'add_country', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(301, 'edit_country', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42'),
(302, 'delete_country', 'web', 1, '2025-08-27 06:27:42', '2025-08-27 06:27:42');

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL,
  `tokenable_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` longtext COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pets`
--

CREATE TABLE `pets` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pettype_id` bigint UNSIGNED NOT NULL,
  `breed_id` bigint UNSIGNED DEFAULT NULL,
  `size` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_of_birth` datetime DEFAULT NULL,
  `age` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `weight` double DEFAULT NULL,
  `height` double DEFAULT NULL,
  `weight_unit` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `height_unit` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `additional_info` longtext COLLATE utf8mb4_unicode_ci,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pets_type`
--

CREATE TABLE `pets_type` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pet_notes`
--

CREATE TABLE `pet_notes` (
  `id` bigint UNSIGNED NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pet_id` bigint UNSIGNED NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `is_private` bigint UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `plan`
--

CREATE TABLE `plan` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration` int NOT NULL DEFAULT '1',
  `amount` int DEFAULT NULL,
  `identifier` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `trial_period` int NOT NULL DEFAULT '0',
  `planlimitation` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `planlimitation`
--

CREATE TABLE `planlimitation` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `limit` bigint NOT NULL DEFAULT '0',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `planlimitation_mapping`
--

CREATE TABLE `planlimitation_mapping` (
  `id` bigint UNSIGNED NOT NULL,
  `plan_id` int DEFAULT NULL,
  `planlimitation_id` int DEFAULT NULL,
  `limit` int DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `short_description` text COLLATE utf8mb4_unicode_ci,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `brand_id` int DEFAULT NULL,
  `unit_id` int DEFAULT NULL,
  `product_tags` longtext COLLATE utf8mb4_unicode_ci,
  `min_price` double NOT NULL DEFAULT '0',
  `max_price` double NOT NULL DEFAULT '0',
  `discount_value` double NOT NULL DEFAULT '0',
  `discount_type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `discount_start_date` int DEFAULT NULL,
  `discount_end_date` int DEFAULT NULL,
  `sell_target` int DEFAULT NULL,
  `stock_qty` int NOT NULL DEFAULT '0',
  `status` tinyint NOT NULL DEFAULT '0',
  `is_featured` tinyint NOT NULL DEFAULT '0',
  `min_purchase_qty` int NOT NULL DEFAULT '1',
  `max_purchase_qty` int NOT NULL DEFAULT '1',
  `has_variation` tinyint NOT NULL DEFAULT '1',
  `has_warranty` tinyint NOT NULL DEFAULT '1',
  `total_sale_count` double NOT NULL DEFAULT '0',
  `standard_delivery_hours` int NOT NULL DEFAULT '24',
  `express_delivery_hours` int NOT NULL DEFAULT '24',
  `size_guide` text COLLATE utf8mb4_unicode_ci,
  `reward_points` bigint NOT NULL DEFAULT '0',
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_categories`
--

CREATE TABLE `product_categories` (
  `id` bigint UNSIGNED NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_id` bigint UNSIGNED DEFAULT NULL,
  `sorting_order_level` int NOT NULL DEFAULT '0',
  `is_featured` tinyint NOT NULL DEFAULT '0',
  `is_top` tinyint NOT NULL DEFAULT '0',
  `total_sale_count` int NOT NULL DEFAULT '0',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_category_brands`
--

CREATE TABLE `product_category_brands` (
  `id` bigint UNSIGNED NOT NULL,
  `category_id` int NOT NULL,
  `brand_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `product_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_category_mappings`
--

CREATE TABLE `product_category_mappings` (
  `id` bigint UNSIGNED NOT NULL,
  `product_id` int NOT NULL,
  `category_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_galleries`
--

CREATE TABLE `product_galleries` (
  `id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `full_url` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_review`
--

CREATE TABLE `product_review` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` int DEFAULT NULL,
  `product_id` int NOT NULL,
  `product_variation_id` int DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `review_msg` text COLLATE utf8mb4_unicode_ci,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `employee_id` bigint UNSIGNED NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_tags`
--

CREATE TABLE `product_tags` (
  `id` bigint UNSIGNED NOT NULL,
  `product_id` int NOT NULL,
  `tag_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_tax`
--

CREATE TABLE `product_tax` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_tax_mappings`
--

CREATE TABLE `product_tax_mappings` (
  `id` bigint UNSIGNED NOT NULL,
  `product_id` int NOT NULL,
  `tax_id` int NOT NULL,
  `tax_value` double NOT NULL DEFAULT '0',
  `tax_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'amount' COMMENT 'flat / percent',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_variations`
--

CREATE TABLE `product_variations` (
  `id` bigint UNSIGNED NOT NULL,
  `product_id` int NOT NULL,
  `variation_key` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sku` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` double NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_variations_values`
--

CREATE TABLE `product_variations_values` (
  `id` bigint UNSIGNED NOT NULL,
  `product_id` int NOT NULL,
  `variation_value_id` int NOT NULL,
  `image` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_variation_combinations`
--

CREATE TABLE `product_variation_combinations` (
  `id` bigint UNSIGNED NOT NULL,
  `product_id` int NOT NULL,
  `product_variation_id` int NOT NULL,
  `variation_id` int NOT NULL,
  `variation_value_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_variation_stocks`
--

CREATE TABLE `product_variation_stocks` (
  `id` bigint UNSIGNED NOT NULL,
  `product_variation_id` int NOT NULL,
  `location_id` int DEFAULT NULL COMMENT 'warehouse/location',
  `stock_qty` int NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `review_galleries`
--

CREATE TABLE `review_galleries` (
  `id` bigint UNSIGNED NOT NULL,
  `review_id` bigint UNSIGNED NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `full_url` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(125) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guard_name` varchar(125) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_fixed` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `title`, `guard_name`, `is_fixed`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'Admin', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(2, 'demo_admin', 'Demo Admin', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(3, 'vet', 'Veterinarian', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(4, 'groomer', 'Groomer', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(5, 'walker', 'Walker', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(6, 'boarder', 'Boarder', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(7, 'trainer', 'Trainer', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(8, 'day_taker', 'Day Care Taker', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(9, 'user', 'Customer', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(10, 'pet_sitter', 'Pet Sitter', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40'),
(11, 'pet_store', 'Pet Store', 'web', 1, '2025-08-27 06:27:40', '2025-08-27 06:27:40');

-- --------------------------------------------------------

--
-- Table structure for table `role_has_permissions`
--

CREATE TABLE `role_has_permissions` (
  `permission_id` bigint UNSIGNED NOT NULL,
  `role_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_has_permissions`
--

INSERT INTO `role_has_permissions` (`permission_id`, `role_id`) VALUES
(1, 1),
(2, 1),
(3, 1),
(4, 1),
(5, 1),
(6, 1),
(7, 1),
(8, 1),
(9, 1),
(10, 1),
(11, 1),
(12, 1),
(13, 1),
(14, 1),
(15, 1),
(16, 1),
(17, 1),
(18, 1),
(19, 1),
(20, 1),
(21, 1),
(22, 1),
(23, 1),
(24, 1),
(25, 1),
(26, 1),
(27, 1),
(28, 1),
(29, 1),
(30, 1),
(31, 1),
(32, 1),
(33, 1),
(34, 1),
(35, 1),
(36, 1),
(37, 1),
(38, 1),
(39, 1),
(40, 1),
(41, 1),
(42, 1),
(43, 1),
(44, 1),
(45, 1),
(46, 1),
(47, 1),
(48, 1),
(49, 1),
(50, 1),
(51, 1),
(52, 1),
(53, 1),
(54, 1),
(55, 1),
(56, 1),
(57, 1),
(58, 1),
(59, 1),
(60, 1),
(61, 1),
(62, 1),
(63, 1),
(64, 1),
(65, 1),
(66, 1),
(67, 1),
(68, 1),
(69, 1),
(70, 1),
(71, 1),
(72, 1),
(73, 1),
(74, 1),
(75, 1),
(76, 1),
(77, 1),
(78, 1),
(79, 1),
(80, 1),
(81, 1),
(82, 1),
(83, 1),
(84, 1),
(85, 1),
(86, 1),
(87, 1),
(88, 1),
(89, 1),
(90, 1),
(91, 1),
(92, 1),
(93, 1),
(94, 1),
(95, 1),
(96, 1),
(97, 1),
(98, 1),
(99, 1),
(100, 1),
(101, 1),
(102, 1),
(103, 1),
(104, 1),
(105, 1),
(106, 1),
(107, 1),
(108, 1),
(109, 1),
(110, 1),
(111, 1),
(112, 1),
(113, 1),
(114, 1),
(115, 1),
(116, 1),
(117, 1),
(118, 1),
(119, 1),
(120, 1),
(121, 1),
(122, 1),
(123, 1),
(124, 1),
(125, 1),
(126, 1),
(127, 1),
(128, 1),
(129, 1),
(130, 1),
(131, 1),
(132, 1),
(133, 1),
(134, 1),
(135, 1),
(136, 1),
(137, 1),
(138, 1),
(139, 1),
(140, 1),
(141, 1),
(142, 1),
(143, 1),
(144, 1),
(145, 1),
(146, 1),
(147, 1),
(148, 1),
(149, 1),
(150, 1),
(151, 1),
(152, 1),
(153, 1),
(154, 1),
(155, 1),
(156, 1),
(157, 1),
(158, 1),
(159, 1),
(160, 1),
(161, 1),
(162, 1),
(163, 1),
(164, 1),
(165, 1),
(166, 1),
(167, 1),
(168, 1),
(169, 1),
(170, 1),
(171, 1),
(172, 1),
(173, 1),
(174, 1),
(175, 1),
(176, 1),
(177, 1),
(178, 1),
(179, 1),
(180, 1),
(181, 1),
(182, 1),
(183, 1),
(184, 1),
(185, 1),
(186, 1),
(187, 1),
(188, 1),
(189, 1),
(190, 1),
(191, 1),
(192, 1),
(193, 1),
(194, 1),
(195, 1),
(196, 1),
(197, 1),
(198, 1),
(199, 1),
(200, 1),
(201, 1),
(202, 1),
(203, 1),
(204, 1),
(205, 1),
(206, 1),
(207, 1),
(208, 1),
(209, 1),
(210, 1),
(211, 1),
(212, 1),
(213, 1),
(214, 1),
(215, 1),
(216, 1),
(217, 1),
(218, 1),
(219, 1),
(220, 1),
(221, 1),
(222, 1),
(223, 1),
(224, 1),
(225, 1),
(226, 1),
(227, 1),
(228, 1),
(229, 1),
(230, 1),
(231, 1),
(232, 1),
(233, 1),
(234, 1),
(235, 1),
(236, 1),
(237, 1),
(238, 1),
(239, 1),
(240, 1),
(241, 1),
(242, 1),
(243, 1),
(244, 1),
(245, 1),
(246, 1),
(247, 1),
(248, 1),
(249, 1),
(250, 1),
(251, 1),
(252, 1),
(253, 1),
(254, 1),
(255, 1),
(256, 1),
(257, 1),
(258, 1),
(259, 1),
(260, 1),
(261, 1),
(262, 1),
(263, 1),
(264, 1),
(265, 1),
(266, 1),
(267, 1),
(268, 1),
(269, 1),
(270, 1),
(271, 1),
(272, 1),
(273, 1),
(274, 1),
(275, 1),
(276, 1),
(277, 1),
(278, 1),
(279, 1),
(280, 1),
(281, 1),
(282, 1),
(283, 1),
(284, 1),
(285, 1),
(286, 1),
(287, 1),
(288, 1),
(289, 1),
(290, 1),
(291, 1),
(292, 1),
(293, 1),
(294, 1),
(295, 1),
(296, 1),
(297, 1),
(298, 1),
(299, 1),
(300, 1),
(301, 1),
(302, 1),
(1, 2),
(2, 2),
(3, 2),
(4, 2),
(5, 2),
(6, 2),
(7, 2),
(8, 2),
(9, 2),
(10, 2),
(11, 2),
(12, 2),
(13, 2),
(14, 2),
(15, 2),
(16, 2),
(17, 2),
(18, 2),
(19, 2),
(20, 2),
(21, 2),
(22, 2),
(23, 2),
(24, 2),
(25, 2),
(26, 2),
(27, 2),
(28, 2),
(29, 2),
(30, 2),
(31, 2),
(32, 2),
(33, 2),
(34, 2),
(35, 2),
(36, 2),
(37, 2),
(38, 2),
(39, 2),
(40, 2),
(41, 2),
(42, 2),
(43, 2),
(44, 2),
(45, 2),
(46, 2),
(47, 2),
(48, 2),
(49, 2),
(50, 2),
(51, 2),
(52, 2),
(53, 2),
(54, 2),
(55, 2),
(56, 2),
(57, 2),
(58, 2),
(59, 2),
(60, 2),
(61, 2),
(62, 2),
(63, 2),
(64, 2),
(65, 2),
(66, 2),
(67, 2),
(68, 2),
(69, 2),
(70, 2),
(71, 2),
(72, 2),
(73, 2),
(74, 2),
(75, 2),
(76, 2),
(77, 2),
(78, 2),
(79, 2),
(80, 2),
(81, 2),
(82, 2),
(83, 2),
(84, 2),
(85, 2),
(86, 2),
(87, 2),
(88, 2),
(89, 2),
(90, 2),
(91, 2),
(92, 2),
(93, 2),
(94, 2),
(95, 2),
(96, 2),
(97, 2),
(98, 2),
(99, 2),
(100, 2),
(101, 2),
(102, 2),
(103, 2),
(104, 2),
(105, 2),
(106, 2),
(107, 2),
(108, 2),
(109, 2),
(110, 2),
(111, 2),
(112, 2),
(113, 2),
(114, 2),
(115, 2),
(116, 2),
(117, 2),
(118, 2),
(119, 2),
(120, 2),
(121, 2),
(122, 2),
(123, 2),
(124, 2),
(125, 2),
(126, 2),
(127, 2),
(128, 2),
(129, 2),
(130, 2),
(131, 2),
(132, 2),
(133, 2),
(134, 2),
(135, 2),
(136, 2),
(137, 2),
(138, 2),
(139, 2),
(140, 2),
(141, 2),
(142, 2),
(143, 2),
(144, 2),
(145, 2),
(146, 2),
(147, 2),
(148, 2),
(149, 2),
(150, 2),
(151, 2),
(152, 2),
(153, 2),
(154, 2),
(155, 2),
(156, 2),
(157, 2),
(158, 2),
(159, 2),
(160, 2),
(161, 2),
(162, 2),
(163, 2),
(164, 2),
(165, 2),
(166, 2),
(167, 2),
(168, 2),
(169, 2),
(170, 2),
(171, 2),
(172, 2),
(173, 2),
(174, 2),
(175, 2),
(176, 2),
(177, 2),
(178, 2),
(179, 2),
(180, 2),
(181, 2),
(182, 2),
(183, 2),
(184, 2),
(185, 2),
(186, 2),
(187, 2),
(188, 2),
(189, 2),
(190, 2),
(191, 2),
(192, 2),
(193, 2),
(194, 2),
(195, 2),
(196, 2),
(197, 2),
(198, 2),
(199, 2),
(200, 2),
(201, 2),
(202, 2),
(203, 2),
(204, 2),
(205, 2),
(206, 2),
(207, 2),
(208, 2),
(209, 2),
(210, 2),
(211, 2),
(212, 2),
(213, 2),
(214, 2),
(215, 2),
(216, 2),
(217, 2),
(218, 2),
(219, 2),
(220, 2),
(221, 2),
(222, 2),
(223, 2),
(224, 2),
(225, 2),
(226, 2),
(227, 2),
(228, 2),
(229, 2),
(230, 2),
(231, 2),
(232, 2),
(233, 2),
(234, 2),
(238, 2),
(239, 2),
(240, 2),
(241, 2),
(242, 2),
(243, 2),
(244, 2),
(245, 2),
(246, 2),
(247, 2),
(248, 2),
(249, 2),
(250, 2),
(252, 2),
(253, 2),
(254, 2),
(255, 2),
(256, 2),
(257, 2),
(258, 2),
(259, 2),
(260, 2),
(261, 2),
(262, 2),
(263, 2),
(264, 2),
(265, 2),
(266, 2),
(267, 2),
(268, 2),
(269, 2),
(270, 2),
(271, 2),
(272, 2),
(273, 2),
(274, 2),
(275, 2),
(276, 2),
(277, 2),
(278, 2),
(279, 2),
(280, 2),
(281, 2),
(282, 2),
(283, 2),
(284, 2),
(285, 2),
(286, 2),
(287, 2),
(288, 2),
(289, 2),
(290, 2),
(291, 2),
(292, 2),
(293, 2),
(294, 2),
(295, 2),
(296, 2),
(297, 2),
(298, 2),
(299, 2),
(300, 2),
(301, 2),
(302, 2),
(23, 3),
(27, 3),
(39, 3),
(123, 3),
(124, 3),
(125, 3),
(126, 3),
(128, 3),
(132, 3),
(150, 3),
(154, 3),
(159, 3),
(43, 4),
(47, 4),
(59, 4),
(123, 4),
(124, 4),
(125, 4),
(126, 4),
(128, 4),
(132, 4),
(150, 4),
(154, 4),
(159, 4),
(83, 5),
(87, 5),
(91, 5),
(99, 5),
(100, 5),
(101, 5),
(102, 5),
(123, 5),
(150, 5),
(154, 5),
(159, 5),
(7, 6),
(11, 6),
(19, 6),
(20, 6),
(21, 6),
(22, 6),
(123, 6),
(150, 6),
(154, 6),
(159, 6),
(63, 7),
(67, 7),
(75, 7),
(76, 7),
(77, 7),
(78, 7),
(123, 7),
(150, 7),
(154, 7),
(159, 7),
(103, 8),
(107, 8),
(150, 8),
(154, 8),
(159, 8),
(3, 9),
(115, 10),
(116, 10),
(117, 10),
(118, 10),
(150, 10),
(154, 10),
(159, 10),
(163, 11),
(243, 11),
(244, 11),
(245, 11),
(246, 11),
(248, 11),
(249, 11),
(250, 11),
(252, 11),
(253, 11),
(254, 11),
(255, 11),
(256, 11),
(257, 11),
(258, 11),
(259, 11),
(260, 11),
(261, 11),
(262, 11),
(263, 11),
(264, 11),
(265, 11),
(266, 11),
(267, 11),
(268, 11),
(269, 11),
(270, 11),
(271, 11),
(272, 11),
(273, 11),
(274, 11),
(276, 11),
(277, 11),
(278, 11),
(280, 11),
(281, 11),
(282, 11),
(284, 11),
(285, 11),
(286, 11);

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` bigint UNSIGNED NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `duration_min` double(8,2) NOT NULL DEFAULT '15.00',
  `default_price` double(8,2) NOT NULL DEFAULT '0.00',
  `type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `category_id` bigint UNSIGNED NOT NULL,
  `sub_category_id` bigint UNSIGNED DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `service_branches`
--

CREATE TABLE `service_branches` (
  `id` bigint UNSIGNED NOT NULL,
  `service_id` bigint UNSIGNED NOT NULL,
  `branch_id` bigint UNSIGNED NOT NULL,
  `service_price` double NOT NULL DEFAULT '0',
  `duration_min` double NOT NULL DEFAULT '0',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `service_categories`
--

CREATE TABLE `service_categories` (
  `id` bigint UNSIGNED NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '1',
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_id` bigint UNSIGNED DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `service_duration`
--

CREATE TABLE `service_duration` (
  `id` bigint UNSIGNED NOT NULL,
  `duration` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '15',
  `price` double(8,2) NOT NULL DEFAULT '0.00',
  `type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `service_employees`
--

CREATE TABLE `service_employees` (
  `id` bigint UNSIGNED NOT NULL,
  `service_id` bigint UNSIGNED NOT NULL,
  `employee_id` bigint UNSIGNED NOT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `service_facility`
--

CREATE TABLE `service_facility` (
  `id` bigint UNSIGNED NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `service_galleries`
--

CREATE TABLE `service_galleries` (
  `id` bigint UNSIGNED NOT NULL,
  `service_id` bigint UNSIGNED NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `full_url` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `service_packages`
--

CREATE TABLE `service_packages` (
  `id` bigint UNSIGNED NOT NULL,
  `employee_id` bigint UNSIGNED NOT NULL,
  `category_id` bigint UNSIGNED DEFAULT NULL,
  `subcategory_id` bigint UNSIGNED DEFAULT NULL,
  `name` text COLLATE utf8mb4_unicode_ci,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `price` double(8,2) DEFAULT '0.00',
  `start_at` datetime DEFAULT NULL,
  `end_at` datetime DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `is_featured` tinyint DEFAULT '0',
  `package_type` text COLLATE utf8mb4_unicode_ci,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `service_training`
--

CREATE TABLE `service_training` (
  `id` bigint UNSIGNED NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `service_training_duration_mapping`
--

CREATE TABLE `service_training_duration_mapping` (
  `id` bigint UNSIGNED NOT NULL,
  `type_id` int NOT NULL,
  `duration` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '15',
  `amount` double DEFAULT '0',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `val` text COLLATE utf8mb4_unicode_ci,
  `type` varchar(90) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'string',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `name`, `val`, `type`, `created_by`, `updated_by`, `deleted_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'slot_duration', '00:15', 'text', NULL, NULL, NULL, '2025-08-27 06:27:40', '2025-08-27 06:27:40', NULL),
(2, 'pet_daycare_amount', '100', 'booking_config', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(3, 'pet_boarding_amount', '200', 'booking_config', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(4, 'is_one_signal_notification', '1', 'integaration', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(5, 'is_application_link', '1', 'integaration', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(6, 'customer_app_play_store', 'https://play.google.com/store/apps/details?id=com.pawlly.customer', 'is_application_link', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(7, 'customer_app_app_store', 'https://apps.apple.com/in/app/pawlly/id6458044939', 'is_application_link', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(8, 'employee_app_play_store', 'https://play.google.com/store/apps/details?id=com.pawlly.employee', 'is_application_link', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(9, 'employee_app_app_store', 'https://apps.apple.com/us/app/pawlly-for-employee/id6462849036', 'is_application_link', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(10, 'is_zoom', '1', 'integaration', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(11, 'account_id', 'WJHpsUd9TKKt99vWOKqeig', 'is_zoom', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(12, 'client_id', '', 'is_zoom', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(13, 'client_secret', '', 'is_zoom', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(14, 'razor_payment_method', '1', 'razorpayPayment', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(15, 'razorpay_secretkey', '', 'razor_payment_method', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(16, 'razorpay_publickey', '', 'razor_payment_method', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(17, 'str_payment_method', '1', 'stripePayment', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(18, 'stripe_secretkey', '', 'str_payment_method', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(19, 'stripe_publickey', '', 'str_payment_method', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(20, 'paystack_payment_method', '1', 'paystackPayment', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(21, 'paystack_secretkey', '', 'paystack_payment_method', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(22, 'paystack_publickey', '', 'paystack_payment_method', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(23, 'paypal_payment_method', '1', 'paypalPayment', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(24, 'paypal_secretkey', '', 'paypal_payment_method', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(25, 'paypal_clientid', '', 'paypal_payment_method', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(26, 'flutterwave_payment_method', '1', 'flutterwavePayment', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(27, 'flutterwave_secretkey', '', 'flutterwave_payment_method', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(28, 'flutterwave_publickey', '', 'flutterwave_payment_method', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(29, 'is_event', '1', 'other_settings', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(30, 'is_blog', '1', 'other_settings', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(31, 'is_user_push_notification', '1', 'other_settings', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(32, 'is_provider_push_notification', '1', 'other_settings', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(33, 'default_time_zone', 'Asia/Kolkata', 'misc', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(34, 'firebase_notification', '1', 'other_settings', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(35, 'firebase_project_id', 'pawlly-flutter', 'firebase_notification', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(36, 'enable_multi_vendor', '0', 'other_settings', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(37, 'enable_new_petstore_login', '1', 'other_settings', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(38, 'social_login', '1', 'other_settings', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(39, 'google_login', '1', 'other_settings', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL),
(40, 'apple_login', '1', 'other_settings', NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `sliders`
--

CREATE TABLE `sliders` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `link` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT 'category',
  `link_id` int DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `states`
--

CREATE TABLE `states` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `country_id` int NOT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock_logs`
--

CREATE TABLE `stock_logs` (
  `id` bigint UNSIGNED NOT NULL,
  `type` enum('inward','outward') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'inward',
  `quantity` int NOT NULL DEFAULT '0',
  `location_id` bigint UNSIGNED NOT NULL DEFAULT '1',
  `product_id` bigint UNSIGNED NOT NULL,
  `product_variation_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` bigint UNSIGNED NOT NULL,
  `plan_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` double DEFAULT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `identifier` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration` int DEFAULT NULL,
  `plan_type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_id` int DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions_transactions`
--

CREATE TABLE `subscriptions_transactions` (
  `id` bigint UNSIGNED NOT NULL,
  `subscriptions_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `amount` double DEFAULT NULL,
  `payment_type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_status` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `other_transactions_details` text COLLATE utf8mb4_unicode_ci,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `system_services`
--

CREATE TABLE `system_services` (
  `id` bigint UNSIGNED NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `feature_image` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tags`
--

CREATE TABLE `tags` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `taxes`
--

CREATE TABLE `taxes` (
  `id` bigint UNSIGNED NOT NULL,
  `title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'percent' COMMENT 'fixed , percent',
  `value` double DEFAULT NULL,
  `status` tinyint DEFAULT '1' COMMENT '1- Active , 0- InActive',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `module_type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `taxes`
--

INSERT INTO `taxes` (`id`, `title`, `type`, `value`, `status`, `created_by`, `updated_by`, `deleted_by`, `created_at`, `updated_at`, `deleted_at`, `module_type`) VALUES
(1, 'Sales Tax', 'percentage', 1, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL, 'services'),
(2, 'Other Taxes', 'percentage', 2, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL, 'services'),
(3, 'Service Tax or Gross Receipts Tax', 'fixed', 5, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL, 'services'),
(4, 'Sales Tax', 'percentage', 5, 1, NULL, NULL, NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL, 'products');

-- --------------------------------------------------------

--
-- Table structure for table `tip_earnings`
--

CREATE TABLE `tip_earnings` (
  `id` bigint UNSIGNED NOT NULL,
  `employee_id` bigint UNSIGNED NOT NULL,
  `tippable_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tippable_id` bigint UNSIGNED NOT NULL,
  `tip_amount` double DEFAULT NULL,
  `tip_status` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `units`
--

CREATE TABLE `units` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `first_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mobile` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `login_type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `player_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `web_player_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `is_manager` tinyint NOT NULL DEFAULT '0',
  `show_in_calender` tinyint NOT NULL DEFAULT '0',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_banned` tinyint UNSIGNED NOT NULL DEFAULT '0',
  `is_subscribe` tinyint UNSIGNED NOT NULL DEFAULT '0',
  `status` tinyint UNSIGNED NOT NULL DEFAULT '1',
  `last_notification_seen` timestamp NULL DEFAULT NULL,
  `user_setting` longtext COLLATE utf8mb4_unicode_ci,
  `address` longtext COLLATE utf8mb4_unicode_ci,
  `user_type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `latitude` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `longitude` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `enable_store` tinyint NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `mobile`, `login_type`, `player_id`, `web_player_id`, `gender`, `date_of_birth`, `is_manager`, `show_in_calender`, `email_verified_at`, `password`, `avatar`, `is_banned`, `is_subscribe`, `status`, `last_notification_seen`, `user_setting`, `address`, `user_type`, `remember_token`, `created_at`, `updated_at`, `deleted_at`, `latitude`, `longitude`, `enable_store`) VALUES
(1, 'Super', 'Admin', 'admin@pawlly.com', '44-5289568745', NULL, NULL, NULL, 'male', '1976-04-03', 0, 0, '2025-08-27 06:27:47', '$2y$10$3GV9geegX9oIIhhp6lXB/O86YYcPWiQfGmMSmWLG9i./ZORNYxH.i', 'img/avatar/male.webp', 0, 0, 1, NULL, NULL, NULL, 'admin', NULL, '2025-08-27 06:27:47', '2025-08-27 06:27:47', NULL, NULL, NULL, 0),
(2, 'John', 'Doe', 'john@gmail.com', '1-4578952512', NULL, NULL, NULL, 'male', '1984-03-06', 0, 0, '2025-08-27 06:27:47', '$2y$10$BnikovdbJH6FSlvba2Icj.CZ7uieZ5Dl0kjsfFvj0sIMK6KT9BYfG', 'img/avatar/male.webp', 0, 0, 1, NULL, NULL, NULL, 'user', NULL, '2025-08-27 06:27:47', '2025-08-27 06:27:47', NULL, NULL, NULL, 0),
(3, 'Robert', 'Martin', 'robert@gmail.com', '1-7485961545', NULL, NULL, NULL, 'male', '2008-05-30', 0, 0, '2025-08-27 06:27:47', '$2y$10$Pdnd2D3DVscU9FRmCGusdukcMh5yiY9C/KMo4P3A9NCn9rQPLSA5G', 'img/avatar/male.webp', 0, 0, 1, NULL, NULL, NULL, 'user', NULL, '2025-08-27 06:27:47', '2025-08-27 06:27:47', NULL, NULL, NULL, 0),
(4, 'Bentley', 'Howard', 'bentley@gmail.com', '1-2563987448', NULL, NULL, NULL, 'male', '1970-02-19', 0, 0, '2025-08-27 06:27:47', '$2y$10$o2bcvbrudnJWpgmR7dVRT.sMFwBQyGHZdPcm.eUfqiHS/zpn0ea46', NULL, 0, 0, 1, NULL, NULL, NULL, 'user', NULL, '2025-08-27 06:27:47', '2025-08-27 06:27:47', NULL, NULL, NULL, 0),
(5, 'Brian', 'Shaw', 'brian@gmail.com', '1-3565478912', NULL, NULL, NULL, 'male', '2021-12-19', 0, 0, '2025-08-27 06:27:47', '$2y$10$xhanvT0eOEQZpOVWhghsg.oS7xM/XMiNwiDMaY89/Rl9pPXnV8SnO', NULL, 0, 0, 1, NULL, NULL, NULL, 'user', NULL, '2025-08-27 06:27:47', '2025-08-27 06:27:47', NULL, NULL, NULL, 0),
(6, 'Liam', 'Long', 'liam@gmail.com', '1-8574965162', NULL, NULL, NULL, 'male', '2007-01-24', 0, 0, '2025-08-27 06:27:47', '$2y$10$cH4p1j9/9XJ8r0zo7Hj7ru8YERM.DrYnqjF7TPQm0GaybgOT5O21K', NULL, 0, 0, 1, NULL, NULL, NULL, 'user', NULL, '2025-08-27 06:27:47', '2025-08-27 06:27:47', NULL, NULL, NULL, 0),
(7, 'Gilbert', 'Adams', 'gilbert@gmail.com', '1-5674587110', NULL, NULL, NULL, 'male', '1983-09-21', 0, 0, '2025-08-27 06:27:47', '$2y$10$nUwy8vPn0v3v6DDTqpBKeu9H7FFVso7OzBWNjJfKnc0bbpdS8RIou', NULL, 0, 0, 1, NULL, NULL, NULL, 'user', NULL, '2025-08-27 06:27:47', '2025-08-27 06:27:47', NULL, NULL, NULL, 0),
(8, 'Pedra', 'Danlel', 'pedra@gmail.com', '1-6589741258', NULL, NULL, NULL, 'female', '1995-12-02', 0, 0, '2025-08-27 06:27:48', '$2y$10$F87cTFVHmoIDD06CwktC7e/.T2QC8Ti2snsM/Tt04pguegjGw7u8e', NULL, 0, 0, 1, NULL, NULL, NULL, 'user', NULL, '2025-08-27 06:27:48', '2025-08-27 06:27:48', NULL, NULL, NULL, 0),
(9, 'Diana', 'Norris', 'diana@gmail.com', '1-5687412589', NULL, NULL, NULL, 'female', '2022-04-04', 0, 0, '2025-08-27 06:27:48', '$2y$10$YTJO7f9ZLYQHvLRKLRO42u8cNZUhl/9B1krKgQdp/HdZVi6P9jxwy', NULL, 0, 0, 1, NULL, NULL, NULL, 'user', NULL, '2025-08-27 06:27:48', '2025-08-27 06:27:48', NULL, NULL, NULL, 0),
(10, 'Stella', 'Green', 'stella@gmail.com', '1-6352897456', NULL, NULL, NULL, 'female', '1998-03-04', 0, 0, '2025-08-27 06:27:48', '$2y$10$d6Im2QyVCt.RC.5wFfdvj.MqhF.zKdiWQIQip87hp5/e5Xancv2D2', NULL, 0, 0, 1, NULL, NULL, NULL, 'user', NULL, '2025-08-27 06:27:48', '2025-08-27 06:27:48', NULL, NULL, NULL, 0),
(11, 'Lisa', 'Lucas', 'lisa@gmail.com', '1-3652417895', NULL, NULL, NULL, 'female', '1976-02-26', 0, 0, '2025-08-27 06:27:48', '$2y$10$.jad.MVnA6kn5orvry9rEOe4/3xUdtJG2iH/NoNdeOv/zrjVw5RH2', NULL, 0, 0, 1, NULL, NULL, NULL, 'user', NULL, '2025-08-27 06:27:48', '2025-08-27 06:27:48', NULL, NULL, NULL, 0),
(12, 'Miles', 'Warren', 'miles@gmail.com', '1-4752125589', NULL, NULL, NULL, 'male', NULL, 0, 1, '2025-08-27 06:27:51', '$2y$10$01xyUWbG8xpDjFuTFdRTpOKZyJYvrurOCvy3w9A5uMDgPQLd5W0Cy', NULL, 0, 0, 1, NULL, NULL, NULL, 'boarder', NULL, '2025-08-27 06:27:51', '2025-08-27 06:27:51', NULL, '54.607868', '-5.926437', 0);

-- --------------------------------------------------------

--
-- Table structure for table `user_profiles`
--

CREATE TABLE `user_profiles` (
  `id` bigint UNSIGNED NOT NULL,
  `about_self` text COLLATE utf8mb4_unicode_ci,
  `expert` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `facebook_link` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `instagram_link` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `twitter_link` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dribbble_link` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_providers`
--

CREATE TABLE `user_providers` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `provider` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `variations`
--

CREATE TABLE `variations` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  `type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT 'text',
  `is_fixed` tinyint NOT NULL DEFAULT '0',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `variation_values`
--

CREATE TABLE `variation_values` (
  `id` bigint UNSIGNED NOT NULL,
  `variation_id` int NOT NULL,
  `value` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `webhook_calls`
--

CREATE TABLE `webhook_calls` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `headers` json DEFAULT NULL,
  `payload` json DEFAULT NULL,
  `exception` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wishlist`
--

CREATE TABLE `wishlist` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` int DEFAULT NULL,
  `guest_user_id` bigint DEFAULT NULL,
  `product_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subject` (`subject_type`,`subject_id`),
  ADD KEY `causer` (`causer_type`,`causer_id`),
  ADD KEY `activity_log_log_name_index` (`log_name`);

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `addresses_addressable_type_addressable_id_index` (`addressable_type`,`addressable_id`);

--
-- Indexes for table `blogs`
--
ALTER TABLE `blogs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `boarder_daycare_perdayamount`
--
ALTER TABLE `boarder_daycare_perdayamount`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bookings_branch_id_foreign` (`branch_id`),
  ADD KEY `bookings_user_id_foreign` (`user_id`),
  ADD KEY `bookings_pet_id_foreign` (`pet_id`);

--
-- Indexes for table `booking_boarding_mapping`
--
ALTER TABLE `booking_boarding_mapping`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `booking_daycare_mapping`
--
ALTER TABLE `booking_daycare_mapping`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `booking_grooming_mapping`
--
ALTER TABLE `booking_grooming_mapping`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `booking_request_mapping`
--
ALTER TABLE `booking_request_mapping`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `booking_services`
--
ALTER TABLE `booking_services`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `booking_training_mapping`
--
ALTER TABLE `booking_training_mapping`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `booking_transactions`
--
ALTER TABLE `booking_transactions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `booking_veterinary_mapping`
--
ALTER TABLE `booking_veterinary_mapping`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `booking_walking_mapping`
--
ALTER TABLE `booking_walking_mapping`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `branches`
--
ALTER TABLE `branches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `branch_employee`
--
ALTER TABLE `branch_employee`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `branch_galleries`
--
ALTER TABLE `branch_galleries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `breeds`
--
ALTER TABLE `breeds`
  ADD PRIMARY KEY (`id`),
  ADD KEY `breeds_pettype_id_foreign` (`pettype_id`);

--
-- Indexes for table `bussinesshours`
--
ALTER TABLE `bussinesshours`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cities`
--
ALTER TABLE `cities`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `commissions`
--
ALTER TABLE `commissions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `commission_earnings`
--
ALTER TABLE `commission_earnings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `commission_earnings_commissionable_type_commissionable_id_index` (`commissionable_type`,`commissionable_id`);

--
-- Indexes for table `constants`
--
ALTER TABLE `constants`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `countries`
--
ALTER TABLE `countries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `currencies`
--
ALTER TABLE `currencies`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `custom_fields`
--
ALTER TABLE `custom_fields`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `custom_fields_data`
--
ALTER TABLE `custom_fields_data`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `custom_field_groups`
--
ALTER TABLE `custom_field_groups`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `durations`
--
ALTER TABLE `durations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `earnings`
--
ALTER TABLE `earnings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `employees_email_unique` (`email`);

--
-- Indexes for table `employee_commissions`
--
ALTER TABLE `employee_commissions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `employee_earnings`
--
ALTER TABLE `employee_earnings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `employee_rating`
--
ALTER TABLE `employee_rating`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `events_user_id_foreign` (`user_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `holidays`
--
ALTER TABLE `holidays`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `installers`
--
ALTER TABLE `installers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `likes`
--
ALTER TABLE `likes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `likes_likeable_type_likeable_id_index` (`likeable_type`,`likeable_id`);

--
-- Indexes for table `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `logistics`
--
ALTER TABLE `logistics`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `logistic_zones`
--
ALTER TABLE `logistic_zones`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `logistic_zone_city`
--
ALTER TABLE `logistic_zone_city`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `media`
--
ALTER TABLE `media`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `media_uuid_unique` (`uuid`),
  ADD KEY `media_model_type_model_id_index` (`model_type`,`model_id`),
  ADD KEY `media_order_column_index` (`order_column`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  ADD KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  ADD KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `modules`
--
ALTER TABLE `modules`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_notifiable_type_notifiable_id_index` (`notifiable_type`,`notifiable_id`);

--
-- Indexes for table `notification_templates`
--
ALTER TABLE `notification_templates`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notification_template_content_mapping`
--
ALTER TABLE `notification_template_content_mapping`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `order_groups`
--
ALTER TABLE `order_groups`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `order_updates`
--
ALTER TABLE `order_updates`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `order_vendor_mapping`
--
ALTER TABLE `order_vendor_mapping`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `package_service_mappings`
--
ALTER TABLE `package_service_mappings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `package_service_mappings_service_id_foreign` (`service_id`),
  ADD KEY `package_service_mappings_service_package_id_foreign` (`service_package_id`);

--
-- Indexes for table `pages`
--
ALTER TABLE `pages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD KEY `password_resets_email_index` (`email`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `pets`
--
ALTER TABLE `pets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pets_user_id_foreign` (`user_id`),
  ADD KEY `pets_pettype_id_foreign` (`pettype_id`),
  ADD KEY `pets_breed_id_foreign` (`breed_id`);

--
-- Indexes for table `pets_type`
--
ALTER TABLE `pets_type`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pet_notes`
--
ALTER TABLE `pet_notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pet_notes_pet_id_foreign` (`pet_id`);

--
-- Indexes for table `plan`
--
ALTER TABLE `plan`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `planlimitation`
--
ALTER TABLE `planlimitation`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `planlimitation_mapping`
--
ALTER TABLE `planlimitation_mapping`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `product_categories`
--
ALTER TABLE `product_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `product_category_brands`
--
ALTER TABLE `product_category_brands`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `product_category_mappings`
--
ALTER TABLE `product_category_mappings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `product_galleries`
--
ALTER TABLE `product_galleries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `product_review`
--
ALTER TABLE `product_review`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `product_tags`
--
ALTER TABLE `product_tags`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `product_tax`
--
ALTER TABLE `product_tax`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `product_tax_mappings`
--
ALTER TABLE `product_tax_mappings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `product_variations`
--
ALTER TABLE `product_variations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `product_variations_values`
--
ALTER TABLE `product_variations_values`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `product_variation_combinations`
--
ALTER TABLE `product_variation_combinations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `product_variation_stocks`
--
ALTER TABLE `product_variation_stocks`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `review_galleries`
--
ALTER TABLE `review_galleries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indexes for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`role_id`),
  ADD KEY `role_has_permissions_role_id_foreign` (`role_id`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `service_branches`
--
ALTER TABLE `service_branches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `service_categories`
--
ALTER TABLE `service_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `service_duration`
--
ALTER TABLE `service_duration`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `service_employees`
--
ALTER TABLE `service_employees`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `service_facility`
--
ALTER TABLE `service_facility`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `service_galleries`
--
ALTER TABLE `service_galleries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `service_packages`
--
ALTER TABLE `service_packages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `service_training`
--
ALTER TABLE `service_training`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `service_training_duration_mapping`
--
ALTER TABLE `service_training_duration_mapping`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sliders`
--
ALTER TABLE `sliders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `states`
--
ALTER TABLE `states`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `stock_logs`
--
ALTER TABLE `stock_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `subscriptions_transactions`
--
ALTER TABLE `subscriptions_transactions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `system_services`
--
ALTER TABLE `system_services`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `taxes`
--
ALTER TABLE `taxes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tip_earnings`
--
ALTER TABLE `tip_earnings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tip_earnings_tippable_type_tippable_id_index` (`tippable_type`,`tippable_id`);

--
-- Indexes for table `units`
--
ALTER TABLE `units`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indexes for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_providers`
--
ALTER TABLE `user_providers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_providers_user_id_foreign` (`user_id`);

--
-- Indexes for table `variations`
--
ALTER TABLE `variations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `variation_values`
--
ALTER TABLE `variation_values`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `webhook_calls`
--
ALTER TABLE `webhook_calls`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `wishlist`
--
ALTER TABLE `wishlist`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_log`
--
ALTER TABLE `activity_log`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `addresses`
--
ALTER TABLE `addresses`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `blogs`
--
ALTER TABLE `blogs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `boarder_daycare_perdayamount`
--
ALTER TABLE `boarder_daycare_perdayamount`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `booking_boarding_mapping`
--
ALTER TABLE `booking_boarding_mapping`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `booking_daycare_mapping`
--
ALTER TABLE `booking_daycare_mapping`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `booking_grooming_mapping`
--
ALTER TABLE `booking_grooming_mapping`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `booking_request_mapping`
--
ALTER TABLE `booking_request_mapping`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `booking_services`
--
ALTER TABLE `booking_services`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `booking_training_mapping`
--
ALTER TABLE `booking_training_mapping`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `booking_transactions`
--
ALTER TABLE `booking_transactions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `booking_veterinary_mapping`
--
ALTER TABLE `booking_veterinary_mapping`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `booking_walking_mapping`
--
ALTER TABLE `booking_walking_mapping`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `branches`
--
ALTER TABLE `branches`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `branch_employee`
--
ALTER TABLE `branch_employee`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `branch_galleries`
--
ALTER TABLE `branch_galleries`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `brands`
--
ALTER TABLE `brands`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `breeds`
--
ALTER TABLE `breeds`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bussinesshours`
--
ALTER TABLE `bussinesshours`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cities`
--
ALTER TABLE `cities`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `commissions`
--
ALTER TABLE `commissions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `commission_earnings`
--
ALTER TABLE `commission_earnings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `constants`
--
ALTER TABLE `constants`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=88;

--
-- AUTO_INCREMENT for table `countries`
--
ALTER TABLE `countries`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `currencies`
--
ALTER TABLE `currencies`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `custom_fields`
--
ALTER TABLE `custom_fields`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `custom_fields_data`
--
ALTER TABLE `custom_fields_data`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `custom_field_groups`
--
ALTER TABLE `custom_field_groups`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `durations`
--
ALTER TABLE `durations`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `earnings`
--
ALTER TABLE `earnings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_commissions`
--
ALTER TABLE `employee_commissions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_earnings`
--
ALTER TABLE `employee_earnings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_rating`
--
ALTER TABLE `employee_rating`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `holidays`
--
ALTER TABLE `holidays`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `installers`
--
ALTER TABLE `installers`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `likes`
--
ALTER TABLE `likes`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `locations`
--
ALTER TABLE `locations`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `logistics`
--
ALTER TABLE `logistics`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `logistic_zones`
--
ALTER TABLE `logistic_zones`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `logistic_zone_city`
--
ALTER TABLE `logistic_zone_city`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `media`
--
ALTER TABLE `media`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=129;

--
-- AUTO_INCREMENT for table `modules`
--
ALTER TABLE `modules`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `notification_templates`
--
ALTER TABLE `notification_templates`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `notification_template_content_mapping`
--
ALTER TABLE `notification_template_content_mapping`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_groups`
--
ALTER TABLE `order_groups`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_updates`
--
ALTER TABLE `order_updates`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_vendor_mapping`
--
ALTER TABLE `order_vendor_mapping`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `package_service_mappings`
--
ALTER TABLE `package_service_mappings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pages`
--
ALTER TABLE `pages`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=303;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pets`
--
ALTER TABLE `pets`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pets_type`
--
ALTER TABLE `pets_type`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pet_notes`
--
ALTER TABLE `pet_notes`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `plan`
--
ALTER TABLE `plan`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `planlimitation`
--
ALTER TABLE `planlimitation`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `planlimitation_mapping`
--
ALTER TABLE `planlimitation_mapping`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_categories`
--
ALTER TABLE `product_categories`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_category_brands`
--
ALTER TABLE `product_category_brands`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_category_mappings`
--
ALTER TABLE `product_category_mappings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_galleries`
--
ALTER TABLE `product_galleries`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_review`
--
ALTER TABLE `product_review`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_tags`
--
ALTER TABLE `product_tags`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_tax`
--
ALTER TABLE `product_tax`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_tax_mappings`
--
ALTER TABLE `product_tax_mappings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_variations`
--
ALTER TABLE `product_variations`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_variations_values`
--
ALTER TABLE `product_variations_values`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_variation_combinations`
--
ALTER TABLE `product_variation_combinations`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_variation_stocks`
--
ALTER TABLE `product_variation_stocks`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `review_galleries`
--
ALTER TABLE `review_galleries`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `service_branches`
--
ALTER TABLE `service_branches`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `service_categories`
--
ALTER TABLE `service_categories`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `service_duration`
--
ALTER TABLE `service_duration`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `service_employees`
--
ALTER TABLE `service_employees`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `service_facility`
--
ALTER TABLE `service_facility`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `service_galleries`
--
ALTER TABLE `service_galleries`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `service_packages`
--
ALTER TABLE `service_packages`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `service_training`
--
ALTER TABLE `service_training`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `service_training_duration_mapping`
--
ALTER TABLE `service_training_duration_mapping`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `sliders`
--
ALTER TABLE `sliders`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `states`
--
ALTER TABLE `states`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_logs`
--
ALTER TABLE `stock_logs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subscriptions_transactions`
--
ALTER TABLE `subscriptions_transactions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `system_services`
--
ALTER TABLE `system_services`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tags`
--
ALTER TABLE `tags`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `taxes`
--
ALTER TABLE `taxes`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `tip_earnings`
--
ALTER TABLE `tip_earnings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `units`
--
ALTER TABLE `units`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `user_profiles`
--
ALTER TABLE `user_profiles`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_providers`
--
ALTER TABLE `user_providers`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `variations`
--
ALTER TABLE `variations`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `variation_values`
--
ALTER TABLE `variation_values`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `webhook_calls`
--
ALTER TABLE `webhook_calls`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wishlist`
--
ALTER TABLE `wishlist`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_branch_id_foreign` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_pet_id_foreign` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `breeds`
--
ALTER TABLE `breeds`
  ADD CONSTRAINT `breeds_pettype_id_foreign` FOREIGN KEY (`pettype_id`) REFERENCES `pets_type` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `package_service_mappings`
--
ALTER TABLE `package_service_mappings`
  ADD CONSTRAINT `package_service_mappings_service_id_foreign` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `package_service_mappings_service_package_id_foreign` FOREIGN KEY (`service_package_id`) REFERENCES `service_packages` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pets`
--
ALTER TABLE `pets`
  ADD CONSTRAINT `pets_breed_id_foreign` FOREIGN KEY (`breed_id`) REFERENCES `breeds` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pets_pettype_id_foreign` FOREIGN KEY (`pettype_id`) REFERENCES `pets_type` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pets_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pet_notes`
--
ALTER TABLE `pet_notes`
  ADD CONSTRAINT `pet_notes_pet_id_foreign` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_providers`
--
ALTER TABLE `user_providers`
  ADD CONSTRAINT `user_providers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
