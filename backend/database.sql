/* -- L’amour & Lumière --
-- MySQL Database Setup Script (All-in-One)
-- This script:
-- 1. Creates the database (if it doesn't exist)
-- 2. Selects the database
-- 3. Creates all tables
-- 4. Inserts all sample data
*/

-- 1. Create and select the database
CREATE DATABASE IF NOT EXISTS `cuteshop_db`;
USE `cuteshop_db`;

-- 2. Set up schema
SET FOREIGN_KEY_CHECKS=0;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS `Payment`;
DROP TABLE IF EXISTS `Review`;
DROP TABLE IF EXISTS `OrderItem`;
DROP TABLE IF EXISTS `CartItem`;
DROP TABLE IF EXISTS `Order`;
DROP TABLE IF EXISTS `Cart`;
DROP TABLE IF EXISTS `Product`;
DROP TABLE IF EXISTS `Category`;
DROP TABLE IF EXISTS `User`;

-- Table structure for table `User`
CREATE TABLE `User` (
  `UserID` INT AUTO_INCREMENT PRIMARY KEY,
  `Name` VARCHAR(255) NOT NULL,
  `Email` VARCHAR(255) NOT NULL UNIQUE,
  `Password` VARCHAR(255) NOT NULL,
  `Role` VARCHAR(50) DEFAULT 'customer'
) ENGINE=InnoDB;

-- Table structure for table `Category`
CREATE TABLE `Category` (
  `CategoryID` INT AUTO_INCREMENT PRIMARY KEY,
  `Name` VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Table structure for table `Product`
CREATE TABLE `Product` (
  `ProductID` INT AUTO_INCREMENT PRIMARY KEY,
  `Name` VARCHAR(255) NOT NULL,
  `Description` TEXT,
  `Price` DECIMAL(10, 2) NOT NULL,
  `Stock` INT NOT NULL DEFAULT 0,
  `CategoryID` INT,
  `img_url` VARCHAR(255),
  FOREIGN KEY (`CategoryID`) REFERENCES `Category`(`CategoryID`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Table structure for table `Cart`
CREATE TABLE `Cart` (
  `CartID` INT AUTO_INCREMENT PRIMARY KEY,
  `UserID` INT NOT NULL,
  FOREIGN KEY (`UserID`) REFERENCES `User`(`UserID`) ON DELETE CASCADE,
  UNIQUE KEY `uk_user_cart` (`UserID`)
) ENGINE=InnoDB;

-- Table structure for table `CartItem`
CREATE TABLE `CartItem` (
  `CartItemID` INT AUTO_INCREMENT PRIMARY KEY,
  `CartID` INT NOT NULL,
  `ProductID` INT NOT NULL,
  `Quantity` INT NOT NULL DEFAULT 1,
  FOREIGN KEY (`CartID`) REFERENCES `Cart`(`CartID`) ON DELETE CASCADE,
  FOREIGN KEY (`ProductID`) REFERENCES `Product`(`ProductID`) ON DELETE CASCADE,
  UNIQUE KEY `uk_cart_product` (`CartID`, `ProductID`)
) ENGINE=InnoDB;

-- Table structure for table `Order`
CREATE TABLE `Order` (
  `OrderID` INT AUTO_INCREMENT PRIMARY KEY,
  `UserID` INT,
  `OrderDate` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `TotalAmount` DECIMAL(10, 2) NOT NULL,
  `Status` VARCHAR(50) NOT NULL DEFAULT 'Pending',
  FOREIGN KEY (`UserID`) REFERENCES `User`(`UserID`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Table structure for table `OrderItem`
CREATE TABLE `OrderItem` (
  `OrderItemID` INT AUTO_INCREMENT PRIMARY KEY,
  `OrderID` INT NOT NULL,
  `ProductID` INT,
  `Quantity` INT NOT NULL,
  `Price` DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (`OrderID`) REFERENCES `Order`(`OrderID`) ON DELETE CASCADE,
  FOREIGN KEY (`ProductID`) REFERENCES `Product`(`ProductID`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Table structure for table `Payment`
CREATE TABLE `Payment` (
  `PaymentID` INT AUTO_INCREMENT PRIMARY KEY,
  `OrderID` INT NOT NULL,
  `PaymentDate` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `Amount` DECIMAL(10, 2) NOT NULL,
  `PaymentMethod` VARCHAR(100),
  `PaymentStatus` VARCHAR(50) NOT NULL DEFAULT 'Completed',
  FOREIGN KEY (`OrderID`) REFERENCES `Order`(`OrderID`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table structure for table `Review`
CREATE TABLE `Review` (
  `ReviewID` INT AUTO_INCREMENT PRIMARY KEY,
  `ProductID` INT NOT NULL,
  `UserID` INT NOT NULL,
  `Rating` INT NOT NULL,
  `Comment` TEXT,
  `Date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`ProductID`) REFERENCES `Product`(`ProductID`) ON DELETE CASCADE,
  FOREIGN KEY (`UserID`) REFERENCES `User`(`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB;

--
-- 3. DML (Sample Data Population)
--

-- Populate Categories
INSERT INTO `Category` (`Name`) VALUES
('Stationery'),
('Plush Toys'),
('Beauty'),
('Home Decor');

-- Populate Products
INSERT INTO `Product` (`Name`, `CategoryID`, `Price`, `Stock`, `img_url`, `Description`) VALUES
('Kawaii Cat Pen', 1, 79, 100, 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', 'Cute and comfy cat-shaped pen for your class notes or journal. Writes smoothly in blue ink.'),
('Pastel Bunny Plush', 2, 349, 100, 'https://images.pexels.com/photos/1462636/pexels-photo-1462636.jpeg?auto=compress&w=400', 'Soft, huggable bunny plush with pastel colors. Perfect for gifts and cozy naps.'),
('Lavender Hand Cream', 3, 139, 100, 'https://images.pexels.com/photos/2270834/pexels-photo-2270834.jpeg?auto=compress&w=400', 'Light lavender-scented hand cream. Moisturizes and softens for silky smooth hands.'),
('Cloud Pillow', 4, 260, 100, 'https://images.unsplash.com/photo-1526178613658-3e1f28221885?auto=format&fit=crop&w=400&q=80', 'Dreamy pillow in cloud shape with smiley face. Ultra-soft for beds and sofas.'),
('Sakura Sticky Notes', 1, 59, 100, 'https://images.pexels.com/photos/3754067/pexels-photo-3754067.jpeg?auto=compress&w=400', 'Floral sticky notes inspired by Sakura blossoms. Make lists, bookmarks, or reminders cuter!'),
('Chubby Bear Plush', 2, 399, 100, 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&w=400', 'Super cuddly chubby bear plush—your best friend for hugs. Great for kids and grown-ups.'),
('Cute Cosmetics Bag', 3, 210, 100, 'https://images.unsplash.com/photo-1585386959984-a4155224c3b5?auto=format&fit=crop&w=400&q=80', 'Organize your beauty must-haves with this pastel zip bag. Waterproof lining.'),
('Rainbow Mug', 4, 179, 100, 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&w=400', 'Ceramic cup with rainbow print and glossy finish. Sip tea and coffee with joy each day.'),
('Pink Gel Highlighter', 1, 49, 100, 'https://images.pexels.com/photos/461429/pexels-photo-461429.jpeg?auto=compress&w=400', 'Smooth pink highlighter for pretty notes, planners, and creative art.'),
('Stars Plush', 2, 359, 100, 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80', 'Twinkling stars plush for dreaming big at night. Perfect for decorations or snuggles.'),
('Blush Heart Pillow', 4, 249, 100, 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80', 'Soft pink heart-shaped pillow, perfect for your couch or bedroom retreat.'),
('Candy Compact Mirror', 3, 99, 100, 'https://images.unsplash.com/photo-1600259444028-0af6cfa4e4ae?auto=format&fit=crop&w=400&q=80', 'Pocket compact mirror with candy color shell. See your reflection anywhere, anytime.');

-- 4. Finish
SET FOREIGN_KEY_CHECKS=1;