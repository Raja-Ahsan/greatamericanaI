-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: Jan 29, 2026 at 11:44 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `greatamericanai`
--

-- --------------------------------------------------------

--
-- Table structure for table `agents`
--

CREATE TABLE `agents` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `long_description` text NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `category` varchar(255) NOT NULL,
  `rating` decimal(3,2) NOT NULL DEFAULT 0.00,
  `reviews` int(11) NOT NULL DEFAULT 0,
  `image` varchar(255) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `video_url` varchar(255) DEFAULT NULL,
  `thumbnail_image` varchar(255) DEFAULT NULL,
  `gallery_images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`gallery_images`)),
  `seller_id` bigint(20) UNSIGNED NOT NULL,
  `capabilities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`capabilities`)),
  `api_access` tinyint(1) NOT NULL DEFAULT 1,
  `model` varchar(255) DEFAULT NULL,
  `response_time` varchar(255) DEFAULT NULL,
  `languages` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`languages`)),
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `date_added` date NOT NULL,
  `sales` int(11) NOT NULL DEFAULT 0,
  `status` enum('active','pending','inactive') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `agents`
--

INSERT INTO `agents` (`id`, `name`, `description`, `long_description`, `price`, `category`, `rating`, `reviews`, `image`, `file_path`, `video_url`, `thumbnail_image`, `gallery_images`, `seller_id`, `capabilities`, `api_access`, `model`, `response_time`, `languages`, `tags`, `date_added`, `sales`, `status`, `created_at`, `updated_at`) VALUES
(1, 'AI Code Master', 'AI Code Master', 'AI Code Master', 50.00, 'Automation', 0.00, 0, 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop', 'agent-files/4hOhpVsXSRBajd2N4IPIIEZDd7wTzqtVH3xIMCLB.zip', NULL, '/storage/agent-thumbnails/ZcSfzNZL3NBiYqfzBP0MTCTfiYTvAJWWAScqOdAa.png', '[\"\\/storage\\/agent-gallery\\/S0zwgEXQDIwXlRlk6NaxVShrPic0pbE4YqoU3VNb.png\",\"\\/storage\\/agent-gallery\\/WqE2PJHfCcGp85D9sXCYXvgGlmosYmP0UXsRmWX4.png\",\"\\/storage\\/agent-gallery\\/uY38c3GtvBJP0sBHsaTrz4wda6GNd65HNzY0nufJ.png\",\"\\/storage\\/agent-gallery\\/95jjR4Mwn0Hwmvb7Sgb1BNIweZqsz3P5jvs1t8FK.png\",\"\\/storage\\/agent-gallery\\/ByslbNOe0MH4Df4GuGLfU3cvjJgX48VqjSf1YLT0.png\",\"\\/storage\\/agent-gallery\\/RXJumjyrv0usEAXrHB8c2mdT4F3apLMnbrurX8uY.png\",\"\\/storage\\/agent-gallery\\/n7YVQJIC0UwTpEbCwrmGQ8s5DoTqPxMjZpUUkNYY.png\",\"\\/storage\\/agent-gallery\\/L3RtuZOfEfthYhpu1QrM3EV3UjLfPATCqwur0hWt.png\"]', 2, '[\"Create Content Creaction\",\"Create Website\",\"Genrate Image\"]', 1, 'React, Chatgpt', '2 sec', '[\"English\"]', '[\"chatbot\",\"automation\",\"aicodemaster\"]', '2026-01-23', 2, 'active', '2026-01-23 18:39:07', '2026-01-29 16:57:38'),
(2, 'CustomerCare Pro AI', 'Advanced AI customer service agent that handles inquiries 24/7 with natural language processing', 'CustomerCare Pro AI is a sophisticated customer service solution powered by GPT-4. It provides instant responses to customer inquiries, handles multiple languages, and integrates seamlessly with your existing CRM systems. Features include sentiment analysis, ticket routing, and comprehensive analytics dashboard.', 299.99, 'Customer Service', 4.80, 127, 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop', NULL, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop', '[\"https:\\/\\/images.unsplash.com\\/photo-1551434678-e076c223a692?w=800&h=600&fit=crop\",\"https:\\/\\/images.unsplash.com\\/photo-1552664730-d307ca884978?w=800&h=600&fit=crop\",\"https:\\/\\/images.unsplash.com\\/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop\"]', 2, '[\"24\\/7 Customer Support\",\"Multi-language Support\",\"Sentiment Analysis\",\"Ticket Routing\",\"CRM Integration\",\"Analytics Dashboard\"]', 1, 'GPT-4 Turbo', '< 1 second', '[\"English\",\"Spanish\",\"French\",\"German\",\"Italian\"]', '[\"customer-service\",\"chatbot\",\"automation\",\"support\"]', '2025-12-27', 45, 'active', '2026-01-26 10:17:17', '2026-01-26 10:17:17'),
(3, 'ContentGenius AI', 'AI-powered content creation tool that generates high-quality articles, blogs, and marketing copy', 'ContentGenius AI revolutionizes content creation with advanced natural language generation. Create engaging blog posts, social media content, product descriptions, and marketing materials in minutes. Features include SEO optimization, tone adjustment, plagiarism checking, and multi-format export capabilities.', 199.99, 'Content Creation', 4.60, 89, 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop', NULL, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop', '[\"https:\\/\\/images.unsplash.com\\/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop\",\"https:\\/\\/images.unsplash.com\\/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop\"]', 2, '[\"Blog Post Generation\",\"SEO Optimization\",\"Tone Adjustment\",\"Plagiarism Check\",\"Multi-format Export\",\"Content Templates\"]', 1, 'GPT-4 + Claude', '< 3 seconds', '[\"English\",\"Spanish\",\"French\",\"Portuguese\"]', '[\"content-creation\",\"writing\",\"seo\",\"marketing\"]', '2026-01-01', 33, 'active', '2026-01-26 10:17:18', '2026-01-29 16:57:38'),
(4, 'DataAnalyzer Pro', 'Intelligent data analysis tool that processes large datasets and generates actionable insights', 'DataAnalyzer Pro uses advanced machine learning algorithms to analyze complex datasets and provide meaningful insights. Features include automated report generation, predictive analytics, data visualization, and integration with popular data sources like Excel, CSV, and databases.', 449.99, 'Data Analysis', 4.90, 156, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop', NULL, NULL, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop', '[\"https:\\/\\/images.unsplash.com\\/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop\",\"https:\\/\\/images.unsplash.com\\/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop\"]', 2, '[\"Automated Analysis\",\"Predictive Analytics\",\"Data Visualization\",\"Report Generation\",\"Multi-source Integration\",\"Real-time Processing\"]', 1, 'GPT-4 + Custom ML', '< 5 seconds', '[\"English\"]', '[\"data-analysis\",\"analytics\",\"business-intelligence\",\"ml\"]', '2026-01-06', 78, 'active', '2026-01-26 10:17:18', '2026-01-26 10:17:18'),
(5, 'AutoWorkflow AI', 'Automation platform that streamlines business processes and eliminates manual tasks', 'AutoWorkflow AI automates repetitive business processes, saving time and reducing errors. Connect your favorite apps and create custom workflows with drag-and-drop interface. Supports integrations with 500+ apps including Slack, Gmail, Salesforce, and more.', 349.99, 'Automation', 0.00, 0, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop', NULL, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, '[]', 2, '[\"Workflow Automation\",\"500+ App Integrations\",\"Drag-and-drop Builder\",\"Scheduled Tasks\",\"Error Handling\",\"Analytics & Monitoring\"]', 1, 'GPT-4 + RPA', '< 2 seconds', '[\"English\",\"Spanish\",\"French\"]', '[\"automation\",\"workflow\",\"productivity\",\"integration\"]', '2026-01-21', 0, 'pending', '2026-01-26 10:17:18', '2026-01-26 10:17:18'),
(6, 'ResearchAssistant AI', 'AI-powered research tool that gathers, analyzes, and synthesizes information from multiple sources', 'ResearchAssistant AI helps researchers and professionals gather comprehensive information quickly. It searches across academic databases, news sources, and web content, then synthesizes findings into coherent reports. Features include citation management, source verification, and multi-format export.', 249.99, 'Research', 4.70, 94, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop', NULL, NULL, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop', '[\"https:\\/\\/images.unsplash.com\\/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop\"]', 2, '[\"Multi-source Research\",\"Citation Management\",\"Source Verification\",\"Report Synthesis\",\"Academic Database Access\",\"Export Formats\"]', 1, 'GPT-4 + Search API', '< 10 seconds', '[\"English\",\"Spanish\",\"French\",\"German\"]', '[\"research\",\"academic\",\"information\",\"analysis\"]', '2026-01-11', 41, 'active', '2026-01-26 10:17:18', '2026-01-26 10:17:18'),
(7, 'SalesBoost AI', 'Intelligent sales assistant that helps close deals faster with personalized recommendations', 'SalesBoost AI analyzes customer interactions and provides real-time sales recommendations. It helps identify upsell opportunities, suggests personalized offers, and automates follow-up communications. Integrates with major CRM platforms and provides detailed sales analytics.', 399.99, 'Sales', 4.50, 112, 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop', NULL, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop', '[\"https:\\/\\/images.unsplash.com\\/photo-1552664730-d307ca884978?w=800&h=600&fit=crop\",\"https:\\/\\/images.unsplash.com\\/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop\"]', 2, '[\"Sales Recommendations\",\"Upsell Identification\",\"CRM Integration\",\"Automated Follow-ups\",\"Sales Analytics\",\"Lead Scoring\"]', 1, 'GPT-4 + Sales Analytics', '< 2 seconds', '[\"English\",\"Spanish\"]', '[\"sales\",\"crm\",\"revenue\",\"automation\"]', '2026-01-14', 67, 'active', '2026-01-26 10:17:18', '2026-01-26 10:17:18'),
(8, 'MarketingMaster AI', 'Complete marketing automation platform with AI-powered campaign optimization', 'MarketingMaster AI creates, manages, and optimizes marketing campaigns across multiple channels. Features include audience segmentation, A/B testing, performance analytics, and automated content personalization. Supports email, social media, and paid advertising campaigns.', 499.99, 'Marketing', 4.60, 203, 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop', NULL, NULL, 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop', '[\"https:\\/\\/images.unsplash.com\\/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop\",\"https:\\/\\/images.unsplash.com\\/photo-1551434678-e076c223a692?w=800&h=600&fit=crop\"]', 2, '[\"Campaign Management\",\"Audience Segmentation\",\"A\\/B Testing\",\"Multi-channel Support\",\"Performance Analytics\",\"Content Personalization\"]', 1, 'GPT-4 + Marketing Analytics', '< 3 seconds', '[\"English\",\"Spanish\",\"French\",\"German\",\"Italian\"]', '[\"marketing\",\"campaigns\",\"automation\",\"analytics\"]', '2026-01-18', 124, 'active', '2026-01-26 10:17:18', '2026-01-26 10:17:18'),
(9, 'CodeHelper AI', 'AI coding assistant that helps developers write better code faster', 'CodeHelper AI is an intelligent coding assistant that provides real-time code suggestions, bug detection, and refactoring recommendations. Supports 50+ programming languages, integrates with popular IDEs, and includes features like code review, documentation generation, and test case creation.', 179.99, 'Development', 4.80, 278, 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop', NULL, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop', '[\"https:\\/\\/images.unsplash.com\\/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop\",\"https:\\/\\/images.unsplash.com\\/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop\"]', 2, '[\"Code Suggestions\",\"Bug Detection\",\"Refactoring\",\"50+ Languages\",\"IDE Integration\",\"Documentation Generation\"]', 1, 'GPT-4 + Codex', '< 1 second', '[\"English\"]', '[\"development\",\"coding\",\"programming\",\"productivity\"]', '2026-01-23', 190, 'active', '2026-01-26 10:17:18', '2026-01-29 13:20:57');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('laravel-cache-356a192b7913b04c54574d18c28d46e6395428ab', 'i:4;', 1769726506),
('laravel-cache-356a192b7913b04c54574d18c28d46e6395428ab:timer', 'i:1769726506;', 1769726506),
('laravel-cache-5c785c036466adea360111aa28563bfd556b5fba', 'i:1;', 1769726534),
('laravel-cache-5c785c036466adea360111aa28563bfd556b5fba:timer', 'i:1769726534;', 1769726534),
('laravel-cache-77de68daecd823babbb58edb1c8e14d7106e83bb', 'i:13;', 1769723171),
('laravel-cache-77de68daecd823babbb58edb1c8e14d7106e83bb:timer', 'i:1769723170;', 1769723171),
('laravel-cache-902ba3cda1883801594b6e1b452790cc53948fda', 'i:3;', 1769726072),
('laravel-cache-902ba3cda1883801594b6e1b452790cc53948fda:timer', 'i:1769726072;', 1769726072),
('laravel-cache-da4b9237bacccdf19c0760cab7aec4a8359010b0', 'i:5;', 1769726536),
('laravel-cache-da4b9237bacccdf19c0760cab7aec4a8359010b0:timer', 'i:1769726536;', 1769726536),
('laravel-cache-payment_8JgU5CIVSBXS4DTgvywdXURUhaFdC9wAdRdR6bhPOsihBWrbPfCFztl2gp6h0mvo', 'a:7:{s:7:\"user_id\";i:3;s:13:\"cart_snapshot\";a:1:{i:0;a:6:{s:12:\"cart_item_id\";i:2;s:8:\"agent_id\";i:1;s:10:\"agent_name\";s:14:\"AI Code Master\";s:5:\"price\";d:50;s:8:\"quantity\";i:1;s:12:\"total_amount\";d:50;}}s:8:\"subtotal\";d:50;s:8:\"tax_rate\";i:15;s:10:\"tax_amount\";d:7.5;s:5:\"total\";d:57.5;s:7:\"gateway\";s:6:\"stripe\";}', 1769713812),
('laravel-cache-payment_FFNNQktWpdLJeqBP0LE7lpmEpzaV7r2zig0qxF2ja2YmxKVoZD7hbitewWFOaWdY', 'a:7:{s:7:\"user_id\";i:3;s:13:\"cart_snapshot\";a:1:{i:0;a:6:{s:12:\"cart_item_id\";i:2;s:8:\"agent_id\";i:1;s:10:\"agent_name\";s:14:\"AI Code Master\";s:5:\"price\";d:50;s:8:\"quantity\";i:1;s:12:\"total_amount\";d:50;}}s:8:\"subtotal\";d:50;s:8:\"tax_rate\";i:15;s:10:\"tax_amount\";d:7.5;s:5:\"total\";d:57.5;s:7:\"gateway\";s:6:\"stripe\";}', 1769713786),
('laravel-cache-payment_kW3GhgiMYLd47SppwvtxOaQHcdHNI1gJQF5gTJiVLWXO9Dwq7dBprJUl7v7jyXZU', 'a:7:{s:7:\"user_id\";i:3;s:13:\"cart_snapshot\";a:1:{i:0;a:6:{s:12:\"cart_item_id\";i:2;s:8:\"agent_id\";i:1;s:10:\"agent_name\";s:14:\"AI Code Master\";s:5:\"price\";d:50;s:8:\"quantity\";i:1;s:12:\"total_amount\";d:50;}}s:8:\"subtotal\";d:50;s:8:\"tax_rate\";i:15;s:10:\"tax_amount\";d:7.5;s:5:\"total\";d:57.5;s:7:\"gateway\";s:6:\"stripe\";}', 1769714590),
('laravel-cache-payment_mgCKwwMEWQcto7JlXe6Yjh0nDo3DGW8HoVgOzm2ZredgiJw4OB1j8mRlJ6UW2A5F', 'a:7:{s:7:\"user_id\";i:3;s:13:\"cart_snapshot\";a:1:{i:0;a:6:{s:12:\"cart_item_id\";i:2;s:8:\"agent_id\";i:1;s:10:\"agent_name\";s:14:\"AI Code Master\";s:5:\"price\";d:50;s:8:\"quantity\";i:1;s:12:\"total_amount\";d:50;}}s:8:\"subtotal\";d:50;s:8:\"tax_rate\";i:15;s:10:\"tax_amount\";d:7.5;s:5:\"total\";d:57.5;s:7:\"gateway\";s:6:\"stripe\";}', 1769713980);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `agent_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_01_23_183145_add_role_to_users_table', 1),
(5, '2026_01_23_183150_create_agents_table', 1),
(6, '2026_01_23_183154_create_cart_items_table', 1),
(7, '2026_01_23_183158_create_purchases_table', 1),
(8, '2026_01_23_183432_create_personal_access_tokens_table', 1),
(9, '2026_01_23_204754_add_avatar_to_users_table', 2),
(10, '2026_01_23_231021_add_file_path_to_agents_table', 3),
(11, '2026_01_23_232226_add_media_fields_to_agents_table', 4),
(12, '2026_01_29_000001_create_wallets_table', 5),
(13, '2026_01_29_000002_create_wallet_transactions_table', 5),
(14, '2026_01_29_000003_create_withdrawal_requests_table', 5),
(15, '2026_01_29_100000_create_vendor_settings_table', 6),
(16, '2026_01_29_120000_create_platform_settings_table', 7);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 1, 'auth_token', '35e68f842884eb56d59700564095738e2b0fce4bb6905488944a5c134bc8f234', '[\"*\"]', '2026-01-23 14:23:59', NULL, '2026-01-23 14:16:57', '2026-01-23 14:23:59'),
(2, 'App\\Models\\User', 1, 'auth_token', '407835a881b20ffa29fa1e2d333cf349b6a04c09bfb1f7015180c264af7af961', '[\"*\"]', '2026-01-23 14:43:12', NULL, '2026-01-23 14:41:57', '2026-01-23 14:43:12'),
(3, 'App\\Models\\User', 1, 'auth_token', 'ebfcaa657fd0fc35efd325e34c99831f7313f6671d12c64da3d4726bd63c699e', '[\"*\"]', '2026-01-23 14:47:38', NULL, '2026-01-23 14:43:30', '2026-01-23 14:47:38'),
(4, 'App\\Models\\User', 1, 'auth_token', '2e3b4bc1f78e142e649df7f6a66f9819f679575c320ab00f10336d57fc3e6bf4', '[\"*\"]', '2026-01-23 15:39:46', NULL, '2026-01-23 14:47:47', '2026-01-23 15:39:46'),
(5, 'App\\Models\\User', 1, 'auth_token', '00c41563bfb27d41638746d61da27bb4c6863cb10e58d03e7afbe03effb1a70a', '[\"*\"]', '2026-01-23 15:54:48', NULL, '2026-01-23 15:41:08', '2026-01-23 15:54:48'),
(6, 'App\\Models\\User', 1, 'auth_token', 'ba69b9904254e7f895f541702ab18944a1a7f6c130551943eec778e522ef22a7', '[\"*\"]', '2026-01-23 16:01:20', NULL, '2026-01-23 15:55:34', '2026-01-23 16:01:20'),
(12, 'App\\Models\\User', 2, 'auth_token', 'b81f83b1cbcdfe0885124a4983eb7b37bfb9cd30b19de267356369799e6a0b3a', '[\"*\"]', '2026-01-26 16:55:59', NULL, '2026-01-26 13:50:43', '2026-01-26 16:55:59'),
(13, 'App\\Models\\User', 3, 'auth_token', 'f1c82bc37ef4752df1f34ef2aa420e735b104046959ce85cca1f624c2dc3dc5b', '[\"*\"]', '2026-01-27 11:02:32', NULL, '2026-01-27 11:02:23', '2026-01-27 11:02:32'),
(15, 'App\\Models\\User', 1, 'auth_token', 'c26c79461586635f77231e25d7a5ff1851330b06495aafeef15edfad7d7bf566', '[\"*\"]', '2026-01-28 19:01:48', NULL, '2026-01-28 18:49:09', '2026-01-28 19:01:48'),
(20, 'App\\Models\\User', 3, 'auth_token', '2a3ed1fdb8c8a77433a549d689e11d72e5fa53981826b7fa5f0e8bc82c3fa682', '[\"*\"]', '2026-01-29 16:46:10', NULL, '2026-01-29 13:13:54', '2026-01-29 16:46:10'),
(21, 'App\\Models\\User', 1, 'auth_token', '06bbeef25394d1f6402f8e4952a41a36bd8625cc935f706bd01a77f893359ce4', '[\"*\"]', '2026-01-29 13:51:49', NULL, '2026-01-29 13:40:58', '2026-01-29 13:51:49'),
(25, 'App\\Models\\User', 2, 'auth_token', '575a8156709adbe1717d8429445beff4a98936890d26a8e4591d3890968214a3', '[\"*\"]', '2026-01-29 17:41:23', NULL, '2026-01-29 17:41:15', '2026-01-29 17:41:23');

-- --------------------------------------------------------

--
-- Table structure for table `platform_settings`
--

CREATE TABLE `platform_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `key` varchar(255) NOT NULL,
  `value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`value`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `platform_settings`
--

INSERT INTO `platform_settings` (`id`, `key`, `value`, `created_at`, `updated_at`) VALUES
(1, 'platform', '{\"platformName\":\"GreatAmerican.Ai\",\"platformFee\":20,\"sellerCommission\":80,\"taxRate\":15,\"maintenanceMode\":false}', '2026-01-29 12:08:01', '2026-01-29 12:18:20'),
(2, 'payment_gateways', '{\"default_gateway\":\"stripe\",\"enabled_gateways\":[\"stripe\",\"paypal\"]}', '2026-01-29 12:08:01', '2026-01-29 12:08:01'),
(3, 'payment_settings', '{\"default_gateway\":\"stripe\",\"enabled_gateways\":[\"stripe\"],\"gateways\":{\"stripe\":{\"mode\":\"sandbox\",\"logo_url\":\"http:\\/\\/localhost:8000\\/storage\\/gateway-logos\\/stripe-1769707024.png\",\"credentials\":{\"test_secret\":\"YOUR_STRIPE_TEST_SECRET_KEY\",\"test_publishable\":\"YOUR_STRIPE_TEST_PUBLISHABLE_KEY\"}},\"paypal\":{\"mode\":\"sandbox\",\"logo_url\":\"http:\\/\\/localhost:8000\\/storage\\/gateway-logos\\/paypal-1769707032.jpg\",\"credentials\":[]},\"paymob\":{\"mode\":\"test\",\"logo_url\":\"http:\\/\\/localhost:8000\\/storage\\/gateway-logos\\/paymob-1769706583.png\",\"credentials\":{\"test_api_key\":\"\"}},\"fawry\":{\"mode\":\"test\",\"logo_url\":\"\",\"credentials\":[]},\"tabby\":{\"mode\":\"test\",\"logo_url\":\"\",\"credentials\":[]},\"moyasar\":{\"mode\":\"test\",\"logo_url\":\"\",\"credentials\":[]},\"myfatoorah\":{\"mode\":\"test\",\"logo_url\":\"\",\"credentials\":[]},\"urway\":{\"mode\":\"test\",\"logo_url\":\"\",\"credentials\":[]},\"geidea\":{\"mode\":\"test\",\"logo_url\":\"\",\"credentials\":[]},\"telr\":{\"mode\":\"test\",\"logo_url\":\"\",\"credentials\":[]},\"tamara\":{\"mode\":\"test\",\"logo_url\":\"\",\"credentials\":[]},\"alrajhibank\":{\"mode\":\"test\",\"logo_url\":\"\",\"credentials\":[]},\"clickpay\":{\"mode\":\"test\",\"logo_url\":\"\",\"credentials\":[]},\"hyperpay\":{\"mode\":\"test\",\"logo_url\":\"\",\"credentials\":[]},\"tap\":{\"mode\":\"test\",\"logo_url\":\"\",\"credentials\":[]}}}', '2026-01-29 13:51:50', '2026-01-29 13:51:50');

-- --------------------------------------------------------

--
-- Table structure for table `purchases`
--

CREATE TABLE `purchases` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `agent_id` bigint(20) UNSIGNED NOT NULL,
  `agent_name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `total_amount` decimal(10,2) NOT NULL,
  `purchase_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchases`
--

INSERT INTO `purchases` (`id`, `user_id`, `agent_id`, `agent_name`, `price`, `quantity`, `total_amount`, `purchase_date`, `created_at`, `updated_at`) VALUES
(1, 3, 1, 'AI Code Master', 50.00, 2, 100.00, '2025-11-29 18:11:26', '2026-01-28 18:11:26', '2026-01-28 18:11:26'),
(2, 3, 1, 'AI Code Master', 50.00, 2, 100.00, '2025-12-03 18:11:26', '2026-01-28 18:11:26', '2026-01-28 18:11:26'),
(3, 3, 1, 'AI Code Master', 50.00, 2, 100.00, '2025-12-31 18:11:26', '2026-01-28 18:11:26', '2026-01-28 18:11:26'),
(4, 3, 1, 'AI Code Master', 50.00, 2, 100.00, '2026-01-14 18:11:26', '2026-01-28 18:11:26', '2026-01-28 18:11:26'),
(5, 3, 1, 'AI Code Master', 50.00, 2, 100.00, '2026-01-27 18:11:26', '2026-01-28 18:11:26', '2026-01-28 18:11:26'),
(6, 3, 1, 'AI Code Master', 50.00, 1, 50.00, '2025-12-21 18:11:26', '2026-01-28 18:11:26', '2026-01-28 18:11:26'),
(7, 3, 1, 'AI Code Master', 50.00, 2, 100.00, '2025-12-05 18:11:26', '2026-01-28 18:11:26', '2026-01-28 18:11:26'),
(8, 3, 2, 'CustomerCare Pro AI', 299.99, 3, 899.97, '2025-12-15 18:11:26', '2026-01-28 18:11:26', '2026-01-28 18:11:26'),
(9, 3, 2, 'CustomerCare Pro AI', 299.99, 2, 599.98, '2025-12-02 18:11:26', '2026-01-28 18:11:26', '2026-01-28 18:11:26'),
(10, 3, 2, 'CustomerCare Pro AI', 299.99, 1, 299.99, '2025-12-07 18:11:26', '2026-01-28 18:11:26', '2026-01-28 18:11:26'),
(11, 3, 2, 'CustomerCare Pro AI', 299.99, 1, 299.99, '2025-12-16 18:11:27', '2026-01-28 18:11:27', '2026-01-28 18:11:27'),
(12, 3, 2, 'CustomerCare Pro AI', 299.99, 3, 899.97, '2026-01-10 18:11:27', '2026-01-28 18:11:27', '2026-01-28 18:11:27'),
(13, 3, 3, 'ContentGenius AI', 199.99, 3, 599.97, '2026-01-07 18:11:27', '2026-01-28 18:11:27', '2026-01-28 18:11:27'),
(14, 3, 3, 'ContentGenius AI', 199.99, 2, 399.98, '2026-01-07 18:11:27', '2026-01-28 18:11:27', '2026-01-28 18:11:27'),
(15, 3, 3, 'ContentGenius AI', 199.99, 2, 399.98, '2026-01-17 18:11:27', '2026-01-28 18:11:27', '2026-01-28 18:11:27'),
(16, 3, 3, 'ContentGenius AI', 199.99, 2, 399.98, '2025-12-08 18:11:27', '2026-01-28 18:11:27', '2026-01-28 18:11:27'),
(17, 3, 4, 'DataAnalyzer Pro', 449.99, 2, 899.98, '2025-12-20 18:11:27', '2026-01-28 18:11:27', '2026-01-28 18:11:27'),
(18, 3, 4, 'DataAnalyzer Pro', 449.99, 3, 1349.97, '2025-12-10 18:11:27', '2026-01-28 18:11:27', '2026-01-28 18:11:27'),
(19, 3, 4, 'DataAnalyzer Pro', 449.99, 2, 899.98, '2025-12-16 18:11:27', '2026-01-28 18:11:27', '2026-01-28 18:11:27'),
(20, 3, 4, 'DataAnalyzer Pro', 449.99, 3, 1349.97, '2026-01-01 18:11:27', '2026-01-28 18:11:27', '2026-01-28 18:11:27'),
(21, 3, 4, 'DataAnalyzer Pro', 449.99, 1, 449.99, '2025-12-10 18:11:27', '2026-01-28 18:11:27', '2026-01-28 18:11:27'),
(22, 3, 4, 'DataAnalyzer Pro', 449.99, 2, 899.98, '2025-11-30 18:11:27', '2026-01-28 18:11:27', '2026-01-28 18:11:27'),
(23, 3, 4, 'DataAnalyzer Pro', 449.99, 2, 899.98, '2025-12-27 18:11:27', '2026-01-28 18:11:27', '2026-01-28 18:11:27'),
(24, 3, 4, 'DataAnalyzer Pro', 449.99, 2, 899.98, '2026-01-01 18:11:27', '2026-01-28 18:11:27', '2026-01-28 18:11:27'),
(25, 3, 5, 'AutoWorkflow AI', 349.99, 3, 1049.97, '2026-01-27 18:11:28', '2026-01-28 18:11:28', '2026-01-28 18:11:28'),
(26, 3, 5, 'AutoWorkflow AI', 349.99, 1, 349.99, '2025-12-08 18:11:28', '2026-01-28 18:11:28', '2026-01-28 18:11:28'),
(27, 3, 5, 'AutoWorkflow AI', 349.99, 1, 349.99, '2025-12-09 18:11:28', '2026-01-28 18:11:28', '2026-01-28 18:11:28'),
(28, 3, 5, 'AutoWorkflow AI', 349.99, 1, 349.99, '2025-12-20 18:11:28', '2026-01-28 18:11:28', '2026-01-28 18:11:28'),
(29, 3, 5, 'AutoWorkflow AI', 349.99, 1, 349.99, '2026-01-20 18:11:28', '2026-01-28 18:11:28', '2026-01-28 18:11:28'),
(30, 3, 6, 'ResearchAssistant AI', 249.99, 1, 249.99, '2026-01-05 18:11:28', '2026-01-28 18:11:28', '2026-01-28 18:11:28'),
(31, 3, 6, 'ResearchAssistant AI', 249.99, 3, 749.97, '2026-01-05 18:11:28', '2026-01-28 18:11:28', '2026-01-28 18:11:28'),
(32, 3, 6, 'ResearchAssistant AI', 249.99, 3, 749.97, '2026-01-10 18:11:28', '2026-01-28 18:11:28', '2026-01-28 18:11:28'),
(33, 3, 6, 'ResearchAssistant AI', 249.99, 2, 499.98, '2026-01-20 18:11:28', '2026-01-28 18:11:28', '2026-01-28 18:11:28'),
(34, 3, 6, 'ResearchAssistant AI', 249.99, 1, 249.99, '2026-01-11 18:11:28', '2026-01-28 18:11:28', '2026-01-28 18:11:28'),
(35, 3, 6, 'ResearchAssistant AI', 249.99, 1, 249.99, '2025-12-13 18:11:28', '2026-01-28 18:11:28', '2026-01-28 18:11:28'),
(36, 3, 6, 'ResearchAssistant AI', 249.99, 3, 749.97, '2026-01-07 18:11:28', '2026-01-28 18:11:28', '2026-01-28 18:11:28'),
(37, 3, 7, 'SalesBoost AI', 399.99, 2, 799.98, '2026-01-26 18:11:28', '2026-01-28 18:11:28', '2026-01-28 18:11:28'),
(38, 3, 7, 'SalesBoost AI', 399.99, 1, 399.99, '2026-01-22 18:11:28', '2026-01-28 18:11:28', '2026-01-28 18:11:28'),
(39, 3, 7, 'SalesBoost AI', 399.99, 1, 399.99, '2025-12-05 18:11:28', '2026-01-28 18:11:28', '2026-01-28 18:11:28'),
(40, 3, 7, 'SalesBoost AI', 399.99, 2, 799.98, '2026-01-01 18:11:28', '2026-01-28 18:11:28', '2026-01-28 18:11:28'),
(41, 3, 7, 'SalesBoost AI', 399.99, 1, 399.99, '2025-12-27 18:11:28', '2026-01-28 18:11:28', '2026-01-28 18:11:28'),
(42, 3, 8, 'MarketingMaster AI', 499.99, 2, 999.98, '2025-12-25 18:11:28', '2026-01-28 18:11:28', '2026-01-28 18:11:28'),
(43, 3, 8, 'MarketingMaster AI', 499.99, 1, 499.99, '2025-12-24 18:11:28', '2026-01-28 18:11:28', '2026-01-28 18:11:28'),
(44, 3, 8, 'MarketingMaster AI', 499.99, 3, 1499.97, '2025-12-16 18:11:29', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(45, 3, 8, 'MarketingMaster AI', 499.99, 2, 999.98, '2025-12-29 18:11:29', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(46, 3, 8, 'MarketingMaster AI', 499.99, 1, 499.99, '2026-01-22 18:11:29', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(47, 3, 9, 'CodeHelper AI', 179.99, 3, 539.97, '2026-01-01 18:11:29', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(48, 3, 9, 'CodeHelper AI', 179.99, 2, 359.98, '2025-11-30 18:11:29', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(49, 3, 9, 'CodeHelper AI', 179.99, 2, 359.98, '2025-12-30 18:11:29', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(50, 3, 9, 'CodeHelper AI', 179.99, 1, 179.99, '2026-01-29 13:20:56', '2026-01-29 13:20:56', '2026-01-29 13:20:56'),
(51, 3, 1, 'AI Code Master', 50.00, 1, 50.00, '2026-01-29 16:41:11', '2026-01-29 16:41:11', '2026-01-29 16:41:11'),
(52, 7, 1, 'AI Code Master', 50.00, 1, 50.00, '2026-01-29 16:57:38', '2026-01-29 16:57:38', '2026-01-29 16:57:38'),
(53, 7, 3, 'ContentGenius AI', 199.99, 1, 199.99, '2026-01-29 16:57:38', '2026-01-29 16:57:38', '2026-01-29 16:57:38');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('opz7q23oNGMUFdqeaeyLmdDCKs5VqBJ4dcXQiWbR', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoidXM2ckNIM2gxdGdpMWJheVlJNFA3WFRVY3RzQ0FpN0xlU0pjNWMwZCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1769640502),
('VGzCph0iSr2Z8Wr9EYSULKE4BVEGnX3beGnACRpX', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoicWNBbVdGMnBFc0ZJbTl4QndqMVpzVWJ3YVFSZ2VucGRHa3ZmckxpMiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1769194098),
('xNf5W13V9ZWOySVmoCuhVGDboRZLW2nAg0iFOmGt', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVm9PUE5Kdld0RVdnZ2FwNGcwekhkeEh3ZVVIU0JoamJMMnoxQnBCSyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mzc6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hZG1pbi9kYXNoYm9hcmQiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1769713132),
('yTIUdNo8JgTD2e8nZ1nePPwKx1d6QaodCuZBsrxD', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoibE04RTBHZXpkVlJMWjRiOVBUMWRxd3U1b1BMZHFDSGxVNzNhZW90UiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1769195727);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `role` enum('admin','vendor','customer') NOT NULL DEFAULT 'customer',
  `verified` tinyint(1) NOT NULL DEFAULT 0,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `avatar`, `role`, `verified`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Super Admin', 'admin@greatamerican.ai', 'avatars/C2SKtOclcVRw5Q9HOaHQhm0H2I0Rv4HfhD1pCTrM.jpg', 'admin', 1, NULL, '$2y$12$tQBD1qIvCfGITETjRPDbEOwrgOf4o6gkZzIstC62gciLbvHEv71iC', NULL, '2026-01-23 13:43:57', '2026-01-23 17:20:47'),
(2, 'Pro Vendor', 'vendor@greatamerican.ai', 'avatars/mHqkdhZeJFnlLqprX6ju9yEU0bwximsfr7AV4F3s.jpg', 'vendor', 1, NULL, '$2y$12$lw4L8W7X/rTvXpnTI0Tn5ub0Egl6UZRLh2f5eC3CTwtdRgxsorlke', NULL, '2026-01-23 13:43:58', '2026-01-23 17:52:11'),
(3, 'Demo Customer', 'demo@greatamerican.ai', NULL, 'customer', 1, NULL, '$2y$12$../FyYou3l2NlcLg6JCB8O5V.KUkJQro/Uks5pMl/663FFwvCjR9a', NULL, '2026-01-23 13:43:58', '2026-01-23 13:45:42'),
(6, 'John', 'john@gmail.com', NULL, 'vendor', 1, NULL, '$2y$12$wEJ9F8k9U0aHIKVFM9o7jO8AJT5Wsxy2Pz5XEcLb7DlDRfASjkgRu', NULL, '2026-01-23 15:01:24', '2026-01-23 15:01:24'),
(7, 'jacks', 'jack@gmail.com', NULL, 'customer', 0, NULL, '$2y$12$3NZfVxWRF6yB1910Oz4bhuABNMB27lXThuP1uD8pHq.3/MuZowmb.', NULL, '2026-01-29 16:55:14', '2026-01-29 17:24:11');

-- --------------------------------------------------------

--
-- Table structure for table `vendor_settings`
--

CREATE TABLE `vendor_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`settings`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vendor_settings`
--

INSERT INTO `vendor_settings` (`id`, `user_id`, `settings`, `created_at`, `updated_at`) VALUES
(1, 2, '{\"notifications\":{\"newSale\":true,\"withdrawalProcessed\":true,\"newMessage\":true,\"weeklySummary\":false},\"payoutMethod\":\"paypal\",\"payoutEmail\":\"test@gmail.com\",\"bankAccountHolder\":null,\"bankName\":null,\"bankAccountNumber\":null,\"bankRoutingOrSwift\":null,\"payoutNotes\":null,\"payoutFrequency\":\"monthly\",\"timezone\":\"Asia\\/Karachi\"}', '2026-01-28 18:27:29', '2026-01-28 18:27:29');

-- --------------------------------------------------------

--
-- Table structure for table `wallets`
--

CREATE TABLE `wallets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `currency` varchar(3) NOT NULL DEFAULT 'USD',
  `status` enum('active','locked') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wallets`
--

INSERT INTO `wallets` (`id`, `user_id`, `balance`, `currency`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, 23408.82, 'USD', 'active', '2026-01-28 18:04:23', '2026-01-29 16:57:38');

-- --------------------------------------------------------

--
-- Table structure for table `wallet_transactions`
--

CREATE TABLE `wallet_transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `wallet_id` bigint(20) UNSIGNED NOT NULL,
  `type` enum('credit','debit') NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `balance_after` decimal(15,2) NOT NULL,
  `reference_type` varchar(50) NOT NULL,
  `reference_id` bigint(20) UNSIGNED DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `meta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`meta`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wallet_transactions`
--

INSERT INTO `wallet_transactions` (`id`, `wallet_id`, `type`, `amount`, `balance_after`, `reference_type`, `reference_id`, `description`, `meta`, `created_at`, `updated_at`) VALUES
(1, 1, 'credit', 85.00, 85.00, 'sale', 1, 'Sale: AI Code Master (Qty: 2)', '{\"purchase_id\":1,\"agent_id\":1}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(2, 1, 'credit', 85.00, 170.00, 'sale', 2, 'Sale: AI Code Master (Qty: 2)', '{\"purchase_id\":2,\"agent_id\":1}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(3, 1, 'credit', 85.00, 255.00, 'sale', 3, 'Sale: AI Code Master (Qty: 2)', '{\"purchase_id\":3,\"agent_id\":1}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(4, 1, 'credit', 85.00, 340.00, 'sale', 4, 'Sale: AI Code Master (Qty: 2)', '{\"purchase_id\":4,\"agent_id\":1}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(5, 1, 'credit', 85.00, 425.00, 'sale', 5, 'Sale: AI Code Master (Qty: 2)', '{\"purchase_id\":5,\"agent_id\":1}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(6, 1, 'credit', 42.50, 467.50, 'sale', 6, 'Sale: AI Code Master (Qty: 1)', '{\"purchase_id\":6,\"agent_id\":1}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(7, 1, 'credit', 85.00, 552.50, 'sale', 7, 'Sale: AI Code Master (Qty: 2)', '{\"purchase_id\":7,\"agent_id\":1}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(8, 1, 'credit', 764.97, 1317.47, 'sale', 8, 'Sale: CustomerCare Pro AI (Qty: 3)', '{\"purchase_id\":8,\"agent_id\":2}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(9, 1, 'credit', 509.98, 1827.46, 'sale', 9, 'Sale: CustomerCare Pro AI (Qty: 2)', '{\"purchase_id\":9,\"agent_id\":2}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(10, 1, 'credit', 254.99, 2082.45, 'sale', 10, 'Sale: CustomerCare Pro AI (Qty: 1)', '{\"purchase_id\":10,\"agent_id\":2}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(11, 1, 'credit', 254.99, 2337.44, 'sale', 11, 'Sale: CustomerCare Pro AI (Qty: 1)', '{\"purchase_id\":11,\"agent_id\":2}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(12, 1, 'credit', 764.97, 3102.42, 'sale', 12, 'Sale: CustomerCare Pro AI (Qty: 3)', '{\"purchase_id\":12,\"agent_id\":2}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(13, 1, 'credit', 509.97, 3612.39, 'sale', 13, 'Sale: ContentGenius AI (Qty: 3)', '{\"purchase_id\":13,\"agent_id\":3}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(14, 1, 'credit', 339.98, 3952.37, 'sale', 14, 'Sale: ContentGenius AI (Qty: 2)', '{\"purchase_id\":14,\"agent_id\":3}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(15, 1, 'credit', 339.98, 4292.36, 'sale', 15, 'Sale: ContentGenius AI (Qty: 2)', '{\"purchase_id\":15,\"agent_id\":3}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(16, 1, 'credit', 339.98, 4632.34, 'sale', 16, 'Sale: ContentGenius AI (Qty: 2)', '{\"purchase_id\":16,\"agent_id\":3}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(17, 1, 'credit', 764.98, 5397.32, 'sale', 17, 'Sale: DataAnalyzer Pro (Qty: 2)', '{\"purchase_id\":17,\"agent_id\":4}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(18, 1, 'credit', 1147.47, 6544.80, 'sale', 18, 'Sale: DataAnalyzer Pro (Qty: 3)', '{\"purchase_id\":18,\"agent_id\":4}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(19, 1, 'credit', 764.98, 7309.78, 'sale', 19, 'Sale: DataAnalyzer Pro (Qty: 2)', '{\"purchase_id\":19,\"agent_id\":4}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(20, 1, 'credit', 1147.47, 8457.25, 'sale', 20, 'Sale: DataAnalyzer Pro (Qty: 3)', '{\"purchase_id\":20,\"agent_id\":4}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(21, 1, 'credit', 382.49, 8839.75, 'sale', 21, 'Sale: DataAnalyzer Pro (Qty: 1)', '{\"purchase_id\":21,\"agent_id\":4}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(22, 1, 'credit', 764.98, 9604.73, 'sale', 22, 'Sale: DataAnalyzer Pro (Qty: 2)', '{\"purchase_id\":22,\"agent_id\":4}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(23, 1, 'credit', 764.98, 10369.71, 'sale', 23, 'Sale: DataAnalyzer Pro (Qty: 2)', '{\"purchase_id\":23,\"agent_id\":4}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(24, 1, 'credit', 764.98, 11134.69, 'sale', 24, 'Sale: DataAnalyzer Pro (Qty: 2)', '{\"purchase_id\":24,\"agent_id\":4}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(25, 1, 'credit', 892.47, 12027.17, 'sale', 25, 'Sale: AutoWorkflow AI (Qty: 3)', '{\"purchase_id\":25,\"agent_id\":5}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(26, 1, 'credit', 297.49, 12324.66, 'sale', 26, 'Sale: AutoWorkflow AI (Qty: 1)', '{\"purchase_id\":26,\"agent_id\":5}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(27, 1, 'credit', 297.49, 12622.15, 'sale', 27, 'Sale: AutoWorkflow AI (Qty: 1)', '{\"purchase_id\":27,\"agent_id\":5}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(28, 1, 'credit', 297.49, 12919.64, 'sale', 28, 'Sale: AutoWorkflow AI (Qty: 1)', '{\"purchase_id\":28,\"agent_id\":5}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(29, 1, 'credit', 297.49, 13217.13, 'sale', 29, 'Sale: AutoWorkflow AI (Qty: 1)', '{\"purchase_id\":29,\"agent_id\":5}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(30, 1, 'credit', 212.49, 13429.63, 'sale', 30, 'Sale: ResearchAssistant AI (Qty: 1)', '{\"purchase_id\":30,\"agent_id\":6}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(31, 1, 'credit', 637.47, 14067.10, 'sale', 31, 'Sale: ResearchAssistant AI (Qty: 3)', '{\"purchase_id\":31,\"agent_id\":6}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(32, 1, 'credit', 637.47, 14704.58, 'sale', 32, 'Sale: ResearchAssistant AI (Qty: 3)', '{\"purchase_id\":32,\"agent_id\":6}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(33, 1, 'credit', 424.98, 15129.56, 'sale', 33, 'Sale: ResearchAssistant AI (Qty: 2)', '{\"purchase_id\":33,\"agent_id\":6}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(34, 1, 'credit', 212.49, 15342.05, 'sale', 34, 'Sale: ResearchAssistant AI (Qty: 1)', '{\"purchase_id\":34,\"agent_id\":6}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(35, 1, 'credit', 212.49, 15554.54, 'sale', 35, 'Sale: ResearchAssistant AI (Qty: 1)', '{\"purchase_id\":35,\"agent_id\":6}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(36, 1, 'credit', 637.47, 16192.02, 'sale', 36, 'Sale: ResearchAssistant AI (Qty: 3)', '{\"purchase_id\":36,\"agent_id\":6}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(37, 1, 'credit', 679.98, 16872.00, 'sale', 37, 'Sale: SalesBoost AI (Qty: 2)', '{\"purchase_id\":37,\"agent_id\":7}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(38, 1, 'credit', 339.99, 17211.99, 'sale', 38, 'Sale: SalesBoost AI (Qty: 1)', '{\"purchase_id\":38,\"agent_id\":7}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(39, 1, 'credit', 339.99, 17551.98, 'sale', 39, 'Sale: SalesBoost AI (Qty: 1)', '{\"purchase_id\":39,\"agent_id\":7}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(40, 1, 'credit', 679.98, 18231.96, 'sale', 40, 'Sale: SalesBoost AI (Qty: 2)', '{\"purchase_id\":40,\"agent_id\":7}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(41, 1, 'credit', 339.99, 18571.96, 'sale', 41, 'Sale: SalesBoost AI (Qty: 1)', '{\"purchase_id\":41,\"agent_id\":7}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(42, 1, 'credit', 849.98, 19421.94, 'sale', 42, 'Sale: MarketingMaster AI (Qty: 2)', '{\"purchase_id\":42,\"agent_id\":8}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(43, 1, 'credit', 424.99, 19846.93, 'sale', 43, 'Sale: MarketingMaster AI (Qty: 1)', '{\"purchase_id\":43,\"agent_id\":8}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(44, 1, 'credit', 1274.97, 21121.91, 'sale', 44, 'Sale: MarketingMaster AI (Qty: 3)', '{\"purchase_id\":44,\"agent_id\":8}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(45, 1, 'credit', 849.98, 21971.89, 'sale', 45, 'Sale: MarketingMaster AI (Qty: 2)', '{\"purchase_id\":45,\"agent_id\":8}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(46, 1, 'credit', 424.99, 22396.88, 'sale', 46, 'Sale: MarketingMaster AI (Qty: 1)', '{\"purchase_id\":46,\"agent_id\":8}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(47, 1, 'credit', 458.97, 22855.85, 'sale', 47, 'Sale: CodeHelper AI (Qty: 3)', '{\"purchase_id\":47,\"agent_id\":9}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(48, 1, 'credit', 305.98, 23161.84, 'sale', 48, 'Sale: CodeHelper AI (Qty: 2)', '{\"purchase_id\":48,\"agent_id\":9}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(49, 1, 'credit', 305.98, 23467.82, 'sale', 49, 'Sale: CodeHelper AI (Qty: 2)', '{\"purchase_id\":49,\"agent_id\":9}', '2026-01-28 18:11:29', '2026-01-28 18:11:29'),
(50, 1, 'debit', 466.98, 23000.84, 'withdrawal', 1, 'Withdrawal payout', '{\"withdrawal_request_id\":1,\"payment_reference\":\"123123123123\"}', '2026-01-28 18:50:22', '2026-01-28 18:50:22'),
(51, 1, 'credit', 152.99, 23153.83, 'sale', 50, 'Sale: CodeHelper AI (Qty: 1)', '{\"purchase_id\":50,\"agent_id\":9}', '2026-01-29 13:20:57', '2026-01-29 13:20:57'),
(52, 1, 'credit', 42.50, 23196.33, 'sale', 51, 'Sale: AI Code Master (Qty: 1)', '{\"purchase_id\":51,\"agent_id\":1}', '2026-01-29 16:41:11', '2026-01-29 16:41:11'),
(53, 1, 'credit', 42.50, 23238.83, 'sale', 52, 'Sale: AI Code Master (Qty: 1)', '{\"purchase_id\":52,\"agent_id\":1}', '2026-01-29 16:57:38', '2026-01-29 16:57:38'),
(54, 1, 'credit', 169.99, 23408.82, 'sale', 53, 'Sale: ContentGenius AI (Qty: 1)', '{\"purchase_id\":53,\"agent_id\":3}', '2026-01-29 16:57:38', '2026-01-29 16:57:38');

-- --------------------------------------------------------

--
-- Table structure for table `withdrawal_requests`
--

CREATE TABLE `withdrawal_requests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `wallet_id` bigint(20) UNSIGNED NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `status` enum('pending','approved','rejected','paid') NOT NULL DEFAULT 'pending',
  `payment_reference` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `requested_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `processed_at` timestamp NULL DEFAULT NULL,
  `processed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `withdrawal_requests`
--

INSERT INTO `withdrawal_requests` (`id`, `wallet_id`, `amount`, `status`, `payment_reference`, `notes`, `requested_at`, `processed_at`, `processed_by`, `created_at`, `updated_at`) VALUES
(1, 1, 466.98, 'paid', '123123123123', 'Send me in my account', '2026-01-28 23:50:22', '2026-01-28 18:50:22', 1, '2026-01-28 18:12:54', '2026-01-28 18:50:22');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `agents`
--
ALTER TABLE `agents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `agents_seller_id_foreign` (`seller_id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cart_items_user_id_agent_id_unique` (`user_id`,`agent_id`),
  ADD KEY `cart_items_agent_id_foreign` (`agent_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `platform_settings`
--
ALTER TABLE `platform_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `platform_settings_key_unique` (`key`);

--
-- Indexes for table `purchases`
--
ALTER TABLE `purchases`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchases_user_id_foreign` (`user_id`),
  ADD KEY `purchases_agent_id_foreign` (`agent_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indexes for table `vendor_settings`
--
ALTER TABLE `vendor_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `vendor_settings_user_id_unique` (`user_id`);

--
-- Indexes for table `wallets`
--
ALTER TABLE `wallets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `wallets_user_id_unique` (`user_id`);

--
-- Indexes for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wallet_transactions_wallet_id_created_at_index` (`wallet_id`,`created_at`),
  ADD KEY `wallet_transactions_reference_type_index` (`reference_type`);

--
-- Indexes for table `withdrawal_requests`
--
ALTER TABLE `withdrawal_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `withdrawal_requests_wallet_id_foreign` (`wallet_id`),
  ADD KEY `withdrawal_requests_processed_by_foreign` (`processed_by`),
  ADD KEY `withdrawal_requests_status_created_at_index` (`status`,`created_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `agents`
--
ALTER TABLE `agents`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `platform_settings`
--
ALTER TABLE `platform_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `purchases`
--
ALTER TABLE `purchases`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `vendor_settings`
--
ALTER TABLE `vendor_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `wallets`
--
ALTER TABLE `wallets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT for table `withdrawal_requests`
--
ALTER TABLE `withdrawal_requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `agents`
--
ALTER TABLE `agents`
  ADD CONSTRAINT `agents_seller_id_foreign` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_agent_id_foreign` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_items_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `purchases`
--
ALTER TABLE `purchases`
  ADD CONSTRAINT `purchases_agent_id_foreign` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `purchases_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `vendor_settings`
--
ALTER TABLE `vendor_settings`
  ADD CONSTRAINT `vendor_settings_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wallets`
--
ALTER TABLE `wallets`
  ADD CONSTRAINT `wallets_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  ADD CONSTRAINT `wallet_transactions_wallet_id_foreign` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `withdrawal_requests`
--
ALTER TABLE `withdrawal_requests`
  ADD CONSTRAINT `withdrawal_requests_processed_by_foreign` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `withdrawal_requests_wallet_id_foreign` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
