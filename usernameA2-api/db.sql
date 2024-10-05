CREATE DATABASE crowdfunding_db;
USE crowdfunding_db;

CREATE TABLE CATEGORY (
  CATEGORY_ID INT PRIMARY KEY AUTO_INCREMENT,
  NAME VARCHAR(50) NOT NULL
);

CREATE TABLE FUNDRAISER (
  FUNDRAISER_ID INT PRIMARY KEY AUTO_INCREMENT,
  ORGANIZER VARCHAR(100) NOT NULL,
  CAPTION VARCHAR(255) NOT NULL,
  TARGET_FUNDING DECIMAL(10, 2) NOT NULL,
  CURRENT_FUNDING DECIMAL(10, 2) NOT NULL DEFAULT 0,
  CITY VARCHAR(100) NOT NULL,
  ACTIVE BOOLEAN NOT NULL DEFAULT TRUE,
  CATEGORY_ID INT,
  FOREIGN KEY (CATEGORY_ID) REFERENCES CATEGORY(CATEGORY_ID)
);

CREATE TABLE DONATION (
    DONATION_ID INT PRIMARY KEY AUTO_INCREMENT,
    DATE DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    AMOUNT DECIMAL(10, 2) NOT NULL,
    GIVER VARCHAR(100) NOT NULL,
    FUNDRAISER_ID INT,
    FOREIGN KEY (FUNDRAISER_ID) REFERENCES FUNDRAISER(FUNDRAISER_ID)
);


INSERT INTO CATEGORY (NAME) VALUES 
('Health'),
('Education'),
('Environment'),
('Disaster Relief'),
('Animal Welfare');


INSERT INTO FUNDRAISER (ORGANIZER, CAPTION, TARGET_FUNDING, CURRENT_FUNDING, CITY, ACTIVE, CATEGORY_ID) VALUES
('Jackson Family', 'Help The Jackson\'s Rebuild After Flood', 10000.00, 7730.00, 'Byron Bay', TRUE, 4),
('Sarah Smith', 'Support Sarah\'s Cancer Treatment', 50000.00, 35000.00, 'Melbourne', TRUE, 1),
('Green Earth Initiative', 'Plant 10,000 Trees in Urban Areas', 25000.00, 15000.00, 'Sydney', TRUE, 5),
('Tech for Kids', 'Provide Laptops for Underprivileged Students', 20000.00, 12000.00, 'Brisbane', TRUE, 2),
('Homeless Shelter Project', 'Expand Local Homeless Shelter', 100000.00, 75000.00, 'Perth', TRUE, 3),
('Homeless Shelter Project', 'Expand Local Homeless Shelter', 100000.00, 75000.00, 'Perth', TRUE, 3),
('Feed the Hungry', 'Feed 100 Families in Need', 15000.00, 5000.00, 'Adelaide', TRUE, 1),
('Community Clean-Up', 'Organize City-Wide Clean Up Event', 3000.00, 1000.00, 'Gold Coast', TRUE, 5),
('Youth Sports League', 'Support Local Youth Sports', 20000.00, 15000.00, 'Canberra', TRUE, 2),
('Animal Shelter Renovation', 'Renovate Local Animal Shelter', 25000.00, 10000.00, 'Hobart', TRUE, 3);

INSERT INTO DONATION (AMOUNT, GIVER, FUNDRAISER_ID) VALUES
(100.00, 'Alice', 1),
(200.00, 'Bob', 1),
(50.00, 'Charlie', 2),
(150.00, 'David', 2),
(300.00, 'Eve', 3),
(75.00, 'Frank', 4),
(125.00, 'Grace', 4),
(80.00, 'Hank', 5),
(200.00, 'Ivy', 5),
(500.00, 'Jack', 1);


