-- Land Scout Database Schema
-- PostgreSQL / Supabase compatible

-- ============================================
-- CORE TABLES
-- ============================================

-- Counties table (reference data)
CREATE TABLE counties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    fips_code VARCHAR(5) UNIQUE,
    timezone VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Auction platforms registry
CREATE TABLE auction_platforms (
    id SERIAL PRIMARY KEY,
    county_id INTEGER REFERENCES counties(id),
    name VARCHAR(200) NOT NULL,
    url VARCHAR(500) NOT NULL,
    platform_type VARCHAR(50) NOT NULL, -- 'realtaxdeed', 'realforeclose', 'govease', 'sheriff', 'surplus', 'custom'
    auction_type VARCHAR(50) NOT NULL, -- 'tax_deed', 'foreclosure', 'sheriff_sale', 'surplus'
    schedule_description VARCHAR(200),
    schedule_day VARCHAR(20), -- 'thursday', 'first_tuesday', etc.
    schedule_time TIME,
    registration_url VARCHAR(500),
    requires_deposit BOOLEAN DEFAULT FALSE,
    deposit_amount DECIMAL(10,2),
    notes TEXT,
    last_scraped_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Properties master table
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    external_id VARCHAR(100), -- ID from source platform
    platform_id INTEGER REFERENCES auction_platforms(id),
    
    -- Location
    address VARCHAR(500),
    city VARCHAR(100),
    county_id INTEGER REFERENCES counties(id),
    state VARCHAR(2) NOT NULL,
    zip VARCHAR(10),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    parcel_id VARCHAR(100),
    
    -- Auction details
    auction_type VARCHAR(50) NOT NULL, -- 'tax_deed', 'foreclosure', 'sheriff_sale', 'surplus', 'listing'
    auction_date DATE,
    auction_time TIME,
    auction_status VARCHAR(50) DEFAULT 'upcoming', -- 'upcoming', 'active', 'sold', 'cancelled', 'postponed', 'redeemed'
    
    -- Pricing
    opening_bid DECIMAL(12,2),
    list_price DECIMAL(12,2),
    estimated_value DECIMAL(12,2),
    taxes_due DECIMAL(12,2),
    total_liens DECIMAL(12,2),
    
    -- Property details
    acres DECIMAL(10,4),
    square_feet INTEGER,
    property_type VARCHAR(50), -- 'residential_lot', 'raw_land', 'single_family', 'commercial', 'agricultural'
    zoning VARCHAR(50),
    
    -- Zoning permissions (critical for RV/mobile home buyers)
    mobile_home_allowed BOOLEAN,
    rv_allowed BOOLEAN,
    manufactured_home_allowed BOOLEAN,
    tiny_home_allowed BOOLEAN,
    has_hoa BOOLEAN DEFAULT FALSE,
    hoa_restrictions TEXT,
    
    -- Utilities
    has_water BOOLEAN,
    has_electric BOOLEAN,
    has_sewer BOOLEAN,
    has_gas BOOLEAN,
    has_well BOOLEAN,
    has_septic BOOLEAN,
    
    -- Environmental
    flood_zone VARCHAR(10),
    wetlands_percentage DECIMAL(5,2),
    in_conservation_area BOOLEAN DEFAULT FALSE,
    
    -- Additional details
    legal_description TEXT,
    case_number VARCHAR(100),
    plaintiff VARCHAR(500),
    defendant VARCHAR(500),
    
    -- AI Analysis
    ai_score INTEGER,
    ai_verdict VARCHAR(100),
    ai_analysis JSONB,
    ai_analyzed_at TIMESTAMP,
    
    -- Metadata
    source_url VARCHAR(500),
    raw_data JSONB, -- Store original scraped data
    first_seen_at TIMESTAMP DEFAULT NOW(),
    last_updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    
    UNIQUE(platform_id, external_id)
);

-- Property images
CREATE TABLE property_images (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    image_type VARCHAR(50), -- 'satellite', 'street_view', 'listing', 'document'
    source VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Property documents (liens, judgments, etc.)
CREATE TABLE property_documents (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    document_type VARCHAR(100), -- 'tax_certificate', 'lien', 'judgment', 'notice_of_sale', 'title_report'
    title VARCHAR(500),
    url VARCHAR(500),
    recording_date DATE,
    amount DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ENRICHMENT DATA TABLES
-- ============================================

-- Nearby amenities (populated via API)
CREATE TABLE nearby_amenities (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    amenity_type VARCHAR(50), -- 'grocery', 'hospital', 'school', 'gas_station', 'restaurant', 'rv_park'
    name VARCHAR(200),
    distance_miles DECIMAL(6,2),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    rating DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Comparable sales
CREATE TABLE comparable_sales (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    comp_address VARCHAR(500),
    comp_city VARCHAR(100),
    sale_date DATE,
    sale_price DECIMAL(12,2),
    acres DECIMAL(10,4),
    price_per_acre DECIMAL(12,2),
    distance_miles DECIMAL(6,2),
    source VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Area statistics
CREATE TABLE area_statistics (
    id SERIAL PRIMARY KEY,
    county_id INTEGER REFERENCES counties(id),
    zip VARCHAR(10),
    
    -- Demographics
    population INTEGER,
    median_income DECIMAL(12,2),
    median_age DECIMAL(5,2),
    
    -- Real estate
    median_home_value DECIMAL(12,2),
    median_land_price_per_acre DECIMAL(12,2),
    
    -- Safety
    crime_index INTEGER, -- 1-100 scale
    violent_crime_rate DECIMAL(8,2),
    property_crime_rate DECIMAL(8,2),
    
    -- Schools
    avg_school_rating DECIMAL(3,2),
    
    -- Data freshness
    data_year INTEGER,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- USER TABLES
-- ============================================

-- Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(200),
    phone VARCHAR(20),
    
    -- Preferences
    preferred_states TEXT[], -- ['FL', 'GA']
    preferred_counties INTEGER[],
    max_budget DECIMAL(12,2),
    min_acres DECIMAL(10,4),
    require_rv_allowed BOOLEAN DEFAULT FALSE,
    require_mobile_allowed BOOLEAN DEFAULT FALSE,
    require_no_flood_zone BOOLEAN DEFAULT FALSE,
    
    -- Financial profile (for NACA calculator)
    annual_income DECIMAL(12,2),
    monthly_debts DECIMAL(12,2),
    credit_score INTEGER,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Saved properties
CREATE TABLE saved_properties (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

-- Search alerts
CREATE TABLE search_alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200),
    
    -- Filter criteria (stored as JSON for flexibility)
    filters JSONB NOT NULL,
    
    -- Notification settings
    notify_email BOOLEAN DEFAULT TRUE,
    notify_sms BOOLEAN DEFAULT FALSE,
    notify_push BOOLEAN DEFAULT FALSE,
    frequency VARCHAR(20) DEFAULT 'instant', -- 'instant', 'daily', 'weekly'
    
    is_active BOOLEAN DEFAULT TRUE,
    last_notified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User activity log
CREATE TABLE user_activity (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
    action VARCHAR(50), -- 'view', 'save', 'share', 'click_platform'
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- SCRAPING & SYNC TABLES
-- ============================================

-- Scrape jobs
CREATE TABLE scrape_jobs (
    id SERIAL PRIMARY KEY,
    platform_id INTEGER REFERENCES auction_platforms(id),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    properties_found INTEGER DEFAULT 0,
    properties_new INTEGER DEFAULT 0,
    properties_updated INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_properties_state ON properties(state);
CREATE INDEX idx_properties_county ON properties(county_id);
CREATE INDEX idx_properties_auction_date ON properties(auction_date);
CREATE INDEX idx_properties_auction_type ON properties(auction_type);
CREATE INDEX idx_properties_price ON properties(opening_bid, list_price);
CREATE INDEX idx_properties_acres ON properties(acres);
CREATE INDEX idx_properties_ai_score ON properties(ai_score);
CREATE INDEX idx_properties_mobile_rv ON properties(mobile_home_allowed, rv_allowed);
CREATE INDEX idx_properties_location ON properties(latitude, longitude);
CREATE INDEX idx_properties_active ON properties(is_active, auction_status);

CREATE INDEX idx_nearby_amenities_property ON nearby_amenities(property_id);
CREATE INDEX idx_comparable_sales_property ON comparable_sales(property_id);

CREATE INDEX idx_saved_properties_user ON saved_properties(user_id);
CREATE INDEX idx_search_alerts_user ON search_alerts(user_id);
CREATE INDEX idx_user_activity_user ON user_activity(user_id);
CREATE INDEX idx_user_activity_created ON user_activity(created_at);

-- ============================================
-- VIEWS
-- ============================================

-- Enriched properties view for API
CREATE VIEW properties_enriched AS
SELECT 
    p.*,
    c.name as county_name,
    ap.name as platform_name,
    ap.url as platform_url,
    ap.schedule_description,
    CASE 
        WHEN p.opening_bid IS NOT NULL THEN p.opening_bid 
        ELSE p.list_price 
    END as price,
    CASE 
        WHEN p.estimated_value > 0 THEN 
            ROUND((1 - COALESCE(p.opening_bid, p.list_price) / p.estimated_value) * 100, 1)
        ELSE NULL 
    END as discount_percentage,
    CASE 
        WHEN p.auction_date IS NOT NULL THEN p.auction_date - CURRENT_DATE 
        ELSE NULL 
    END as days_until_auction
FROM properties p
LEFT JOIN counties c ON p.county_id = c.id
LEFT JOIN auction_platforms ap ON p.platform_id = ap.id
WHERE p.is_active = TRUE;

-- ============================================
-- SEED DATA: Florida & Georgia Counties
-- ============================================

INSERT INTO counties (name, state, fips_code) VALUES
-- Florida (Tampa area)
('Hillsborough', 'FL', '12057'),
('Pasco', 'FL', '12101'),
('Hernando', 'FL', '12053'),
('Polk', 'FL', '12105'),
('Pinellas', 'FL', '12103'),
('Manatee', 'FL', '12081'),
('Sarasota', 'FL', '12115'),

-- Georgia (Atlanta area)
('Fulton', 'GA', '13121'),
('DeKalb', 'GA', '13089'),
('Cobb', 'GA', '13067'),
('Gwinnett', 'GA', '13135'),
('Clayton', 'GA', '13063'),
('Cherokee', 'GA', '13057'),
('Forsyth', 'GA', '13117'),
('Gordon', 'GA', '13129'),
('Gilmer', 'GA', '13123'),
('Pickens', 'GA', '13227');

-- ============================================
-- SEED DATA: Auction Platforms
-- ============================================

INSERT INTO auction_platforms (county_id, name, url, platform_type, auction_type, schedule_description, schedule_day, schedule_time) VALUES
-- Florida
((SELECT id FROM counties WHERE name = 'Hillsborough' AND state = 'FL'), 'Hillsborough RealTaxDeed', 'https://hillsborough.realtaxdeed.com', 'realtaxdeed', 'tax_deed', 'Thursdays at 10am', 'thursday', '10:00'),
((SELECT id FROM counties WHERE name = 'Pasco' AND state = 'FL'), 'Pasco RealTaxDeed', 'https://pasco.realtaxdeed.com', 'realtaxdeed', 'tax_deed', 'Thursdays monthly', 'thursday', '10:00'),
((SELECT id FROM counties WHERE name = 'Pasco' AND state = 'FL'), 'Pasco RealForeclose', 'https://pasco.realforeclose.com', 'realforeclose', 'foreclosure', 'Varies', NULL, NULL),
((SELECT id FROM counties WHERE name = 'Pasco' AND state = 'FL'), 'Pasco Sheriff Levy Sales', 'https://pascosheriff.com/sheriff-levy-sales/', 'sheriff', 'sheriff_sale', 'As scheduled', NULL, NULL),
((SELECT id FROM counties WHERE name = 'Hillsborough' AND state = 'FL'), 'Hillsborough Surplus Lands', 'https://hcfl.gov/government/real-estate/surplus-county-lands', 'surplus', 'surplus', 'Sealed bid', NULL, NULL),
((SELECT id FROM counties WHERE name = 'Hernando' AND state = 'FL'), 'Hernando RealTaxDeed', 'https://hernando.realtaxdeed.com', 'realtaxdeed', 'tax_deed', 'Monthly', NULL, '10:00'),
((SELECT id FROM counties WHERE name = 'Polk' AND state = 'FL'), 'Polk RealTaxDeed', 'https://polk.realtaxdeed.com', 'realtaxdeed', 'tax_deed', 'Monthly', NULL, '10:00'),

-- Georgia
((SELECT id FROM counties WHERE name = 'Fulton' AND state = 'GA'), 'Fulton County Sheriff Tax Sales', 'https://fultoncountyga.gov/inside-fulton-county/fulton-county-departments/sheriff/tax-sales', 'sheriff', 'tax_deed', 'First Tuesday monthly 10am-4pm', 'first_tuesday', '10:00'),
((SELECT id FROM counties WHERE name = 'DeKalb' AND state = 'GA'), 'DeKalb Tax Commissioner', 'https://dekalbtax.org/tax-sale-listing', 'custom', 'tax_deed', 'Monthly', NULL, '10:00'),
((SELECT id FROM counties WHERE name = 'Cobb' AND state = 'GA'), 'Cobb County Tax Commissioner', 'https://www.cobbtax.gov/property/tax_sale/', 'custom', 'tax_deed', 'Varies', NULL, '10:00'),
((SELECT id FROM counties WHERE name = 'DeKalb' AND state = 'GA'), 'DeKalb County Surplus Property', 'https://www.dekalbcountyga.gov/gis/how-purchase-county-owned-property', 'surplus', 'surplus', 'As available', NULL, NULL);
