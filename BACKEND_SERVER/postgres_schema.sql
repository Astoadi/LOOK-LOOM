-- Create database (run manually in psql)
-- CREATE DATABASE look_loom;

-- Connect to the database
-- \c look_loom;

-- Drop in correct dependency order
DROP TABLE IF EXISTS outfit_category_planner;
DROP TABLE IF EXISTS outfit_planner;
DROP TABLE IF EXISTS outfits_history;
DROP TABLE IF EXISTS outfit_category_history;
DROP TABLE IF EXISTS outfit_category_combo;
DROP TABLE IF EXISTS outfits;
DROP TABLE IF EXISTS outfit_categories;
DROP TABLE IF EXISTS connections;
DROP TABLE IF EXISTS users;

-- Users Table
CREATE TABLE users (
  "user_id" BIGSERIAL PRIMARY KEY,
  first_name VARCHAR(20) NOT NULL,
  last_name VARCHAR(20) NOT NULL,
  "user_name" VARCHAR(30) NOT NULL UNIQUE,
  gender VARCHAR(1) CHECK(gender IN ('M', 'F', 'O')),
  is_active BOOLEAN DEFAULT TRUE,
  "password" VARCHAR(100) NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at DATE NOT NULL DEFAULT CURRENT_DATE,
  updated_at DATE
);

-- Outfit CATEGORIES  Table
CREATE TABLE outfit_categories (
  outfit_category_id BIGSERIAL PRIMARY KEY,
  category_name VARCHAR(50) NOT NULL,
  "user_id" BIGINT NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at DATE NOT NULL DEFAULT CURRENT_DATE,
  updated_at DATE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Outfits Table
CREATE TABLE outfits (
  outfit_id BIGSERIAL PRIMARY KEY,
  image_url VARCHAR(1000) NOT NULL,
  image_public_key VARCHAR(100) NOT NULL,
  image_file_type VARCHAR(10),
  "user_id" BIGINT NOT NULL,
  body VARCHAR(300) NOT NULL CHECK (LENGTH(body) > 0),
  is_active BOOLEAN DEFAULT TRUE,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at DATE NOT NULL DEFAULT CURRENT_DATE,
  updated_at DATE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

--This table stores relation of m*n of outfits and categories
CREATE TABLE outfit_category_combo(
  outfit_category_id BIGINT NOT NULL,
  outfit_id BIGINT NOT NULL,
  PRIMARY KEY(outfit_category_id,outfit_id),
  FOREIGN KEY (outfit_category_id) REFERENCES outfit_categories(outfit_category_id) ON DELETE CASCADE,
  FOREIGN KEY (outfit_id) REFERENCES outfits(outfit_id) ON DELETE CASCADE
);

-- Connections Table not used for now
CREATE TABLE connections (
  "user_id" BIGINT NOT NULL,--me
  connection_id BIGINT NOT NULL,--other person
  "status" VARCHAR(1) CHECK("status" IN ('A', 'P', 'R')) DEFAULT 'P',
  PRIMARY KEY (user_id, connection_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (connection_id) REFERENCES users(user_id) ON DELETE NO ACTION
);

-- Outfit History Table not used for now
CREATE TABLE outfits_history (
  "user_id" BIGINT NOT NULL,
  outfit_id BIGINT NOT NULL,
  last_used_at DATE NOT NULL,
  PRIMARY KEY (user_id, outfit_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (outfit_id) REFERENCES outfits(outfit_id) ON DELETE CASCADE
);

-- Outfit Combo History Table
CREATE TABLE outfit_category_history (
  user_id BIGINT NOT NULL,
  outfit_category_id BIGINT NOT NULL,
  last_used_at DATE NOT NULL,
  PRIMARY KEY (user_id, outfit_category_id, last_used_at),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE NO ACTION,
  FOREIGN KEY (outfit_category_id) REFERENCES outfit_categories(outfit_category_id) ON DELETE CASCADE
);

-- Planner Table FOR OUTFITS not used for now
CREATE TABLE outfit_planner (
  outfit_planner_id BIGSERIAL PRIMARY KEY,
  "user_id" BIGINT NOT NULL,
  outfit_id BIGINT NOT NULL,
  plan_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (outfit_id) REFERENCES outfits(outfit_id) ON DELETE CASCADE
);

--PLANNER TALE FOR OUTFIT CATEGORY
CREATE TABLE outfit_category_planner (
  outfit_category_planner_id BIGSERIAL PRIMARY KEY,
  "user_id" BIGINT NOT NULL,
  outfit_category_id BIGINT NOT NULL,
  plan_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (outfit_category_id) REFERENCES outfit_categories(outfit_category_id) ON DELETE CASCADE
);

