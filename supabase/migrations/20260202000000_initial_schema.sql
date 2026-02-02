-- =====================================================
-- AgroBioConnect Phase 1 - Initial Database Schema
-- Supabase Migration
-- Created: 2026-02-02
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CUSTOM TYPES (ENUMS)
-- =====================================================

-- Organization types
CREATE TYPE organization_type AS ENUM (
  'bioinput_company',
  'university_institute',
  'rural_producer',
  'diagnostic_startup',
  'association',
  'logistics',
  'science'
);

-- Biofactory types
CREATE TYPE biofactory_type AS ENUM (
  'commercial',
  'on_farm',
  'family_farm'
);

-- Product categories
CREATE TYPE product_category AS ENUM (
  'inoculant',
  'biodefensive',
  'biofertilizer',
  'biostimulant',
  'biological_nematicide',
  'biological_fungicide',
  'biological_insecticide',
  'soil_conditioner',
  'other'
);

-- Connection types
CREATE TYPE connection_type AS ENUM (
  'partnership',
  'supplier',
  'customer',
  'research',
  'consulting'
);

-- Connection status
CREATE TYPE connection_status AS ENUM (
  'active',
  'negotiating',
  'ended'
);

-- News/insights categories
CREATE TYPE content_category AS ENUM (
  'research',
  'market',
  'technology',
  'regulation',
  'sustainability',
  'innovation'
);

-- Regulatory compliance status
CREATE TYPE compliance_status AS ENUM (
  'compliant',
  'pending',
  'non_compliant',
  'under_review'
);

-- User roles
CREATE TYPE user_role AS ENUM (
  'admin',
  'farmer',
  'agronomist',
  'auditor',
  'organization_admin',
  'organization_member'
);

-- Audit action types
CREATE TYPE audit_action AS ENUM (
  'create',
  'update',
  'delete',
  'read',
  'approve',
  'reject',
  'export'
);

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  cnpj VARCHAR(18) UNIQUE, -- Encrypted for LGPD
  cpf VARCHAR(14) UNIQUE, -- For individual producers, encrypted
  organization_type organization_type NOT NULL,
  description TEXT,
  logo_url TEXT,
  website VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20), -- Encrypted for LGPD

  -- Address
  address_street VARCHAR(255),
  address_number VARCHAR(20),
  address_complement VARCHAR(100),
  address_neighborhood VARCHAR(100),
  address_city VARCHAR(100),
  address_state VARCHAR(2),
  address_postal_code VARCHAR(9),
  address_country VARCHAR(2) DEFAULT 'BR',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Verification
  verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMPTZ,

  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('portuguese', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(address_city, '')), 'C')
  ) STORED
);

-- Users (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  role user_role NOT NULL DEFAULT 'farmer',

  -- Personal info
  full_name VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE, -- Encrypted for LGPD
  phone VARCHAR(20), -- Encrypted for LGPD

  -- Professional info
  professional_registration VARCHAR(50), -- CREA, CRA, etc.
  specialization VARCHAR(255),
  bio TEXT,
  avatar_url TEXT,

  -- Preferences
  email_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  language VARCHAR(5) DEFAULT 'pt-BR',

  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permissions
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role permissions mapping
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role user_role NOT NULL,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role, permission_id)
);

-- =====================================================
-- REGULATORY MODULE
-- =====================================================

-- Biofactories
CREATE TABLE biofactories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  biofactory_type biofactory_type NOT NULL,

  -- Location
  address_street VARCHAR(255),
  address_number VARCHAR(20),
  address_complement VARCHAR(100),
  address_neighborhood VARCHAR(100),
  address_city VARCHAR(100) NOT NULL,
  address_state VARCHAR(2) NOT NULL,
  address_postal_code VARCHAR(9),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Capacity and infrastructure
  production_capacity_liters DECIMAL(12, 2),
  production_capacity_kg DECIMAL(12, 2),
  infrastructure_description TEXT,

  -- Regulatory
  mapa_registration VARCHAR(100),
  environmental_license VARCHAR(100),
  license_expiry_date DATE,
  compliance_status compliance_status DEFAULT 'pending',

  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Production batches
CREATE TABLE production_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  biofactory_id UUID NOT NULL REFERENCES biofactories(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,

  -- Batch identification
  batch_number VARCHAR(100) NOT NULL,
  production_date DATE NOT NULL,
  expiry_date DATE,
  volume_liters DECIMAL(10, 2),
  weight_kg DECIMAL(10, 2),

  -- Fermentation parameters
  initial_ph DECIMAL(4, 2),
  final_ph DECIMAL(4, 2),
  fermentation_temp_celsius DECIMAL(5, 2),
  fermentation_duration_hours INTEGER,
  fermentation_start_date TIMESTAMPTZ,
  fermentation_end_date TIMESTAMPTZ,

  -- Quality parameters
  organism_concentration VARCHAR(100), -- e.g., "1x10^9 UFC/mL"
  purity_percentage DECIMAL(5, 2),
  contamination_level VARCHAR(50),

  -- Status
  status VARCHAR(50) DEFAULT 'in_production', -- in_production, quality_control, approved, rejected, distributed
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  UNIQUE(biofactory_id, batch_number)
);

-- Quality lab reports
CREATE TABLE quality_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES production_batches(id) ON DELETE CASCADE,
  lab_organization_id UUID REFERENCES organizations(id),

  -- Report identification
  report_number VARCHAR(100) NOT NULL UNIQUE,
  report_date DATE NOT NULL,
  analysis_date DATE,

  -- Microbiological analysis
  ufc_count VARCHAR(100), -- Colony Forming Units count
  ufc_ml DECIMAL(15, 2), -- UFC per mL
  ufc_g DECIMAL(15, 2), -- UFC per gram
  viability_percentage DECIMAL(5, 2),
  purity_percentage DECIMAL(5, 2),

  -- Contamination tests
  salmonella_present BOOLEAN,
  ecoli_present BOOLEAN,
  other_contaminants TEXT,

  -- Physical-chemical properties
  ph_value DECIMAL(4, 2),
  moisture_percentage DECIMAL(5, 2),
  density DECIMAL(6, 4),

  -- Document
  report_document_url TEXT, -- Storage bucket reference

  -- Validation
  approved BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES auth.users(id),
  approval_date TIMESTAMPTZ,
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Technical responsibility records (RT/ART)
CREATE TABLE technical_responsibilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES production_batches(id) ON DELETE CASCADE,
  responsible_user_id UUID NOT NULL REFERENCES auth.users(id),

  -- RT/ART information
  document_type VARCHAR(20) NOT NULL, -- 'RT' or 'ART'
  document_number VARCHAR(100) NOT NULL,
  professional_council VARCHAR(20), -- CREA, CRA, etc.
  council_registration VARCHAR(50) NOT NULL,

  -- Digital signature
  signature_hash TEXT, -- Cryptographic hash of digital signature
  signature_date TIMESTAMPTZ NOT NULL,
  signature_document_url TEXT,

  -- Validity
  valid_until DATE,
  is_valid BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Regulatory compliance records
CREATE TABLE compliance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  biofactory_id UUID NOT NULL REFERENCES biofactories(id) ON DELETE CASCADE,

  -- Compliance details
  compliance_type VARCHAR(100) NOT NULL, -- 'MAPA', 'Environmental', 'Sanitary', etc.
  compliance_status compliance_status NOT NULL,

  -- Inspection details
  inspection_date DATE,
  inspector_name VARCHAR(255),
  inspector_organization VARCHAR(255),

  -- Findings
  findings TEXT,
  non_conformities TEXT,
  corrective_actions TEXT,
  deadline_date DATE,

  -- Resolution
  resolved BOOLEAN DEFAULT FALSE,
  resolution_date DATE,
  resolution_notes TEXT,

  -- Documents
  document_url TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- PRODUCTS MODULE
-- =====================================================

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,

  -- Product identification
  name VARCHAR(255) NOT NULL,
  commercial_name VARCHAR(255),
  category product_category NOT NULL,

  -- MAPA registration (synced from Agrofit API)
  mapa_registration_number VARCHAR(100) UNIQUE,
  mapa_registration_status VARCHAR(50),
  mapa_last_sync TIMESTAMPTZ,
  agrofit_data JSONB, -- Cache of Agrofit API response

  -- Product details
  description TEXT,
  application_instructions TEXT,
  dosage_recommendations TEXT,
  safety_precautions TEXT,

  -- Composition
  formulation VARCHAR(100),
  concentration VARCHAR(100),

  -- Packaging
  package_size_liters DECIMAL(10, 2),
  package_size_kg DECIMAL(10, 2),
  shelf_life_months INTEGER,

  -- Certifications
  organic_certified BOOLEAN DEFAULT FALSE,
  certification_body VARCHAR(255),
  certification_number VARCHAR(100),
  certification_expiry DATE,

  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('portuguese', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(commercial_name, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(description, '')), 'B')
  ) STORED
);

-- Active ingredients/organisms
CREATE TABLE active_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  scientific_name VARCHAR(255),
  ingredient_type VARCHAR(50), -- 'bacteria', 'fungi', 'virus', 'chemical', etc.

  -- Classification
  genus VARCHAR(100),
  species VARCHAR(100),
  strain VARCHAR(100),

  -- Properties
  description TEXT,
  mode_of_action TEXT,

  -- Safety
  toxicity_class VARCHAR(50),
  safety_notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product ingredients mapping
CREATE TABLE product_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES active_ingredients(id) ON DELETE CASCADE,
  concentration VARCHAR(100),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, ingredient_id)
);

-- Target crops
CREATE TABLE crops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  scientific_name VARCHAR(255),
  crop_family VARCHAR(100),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product target crops mapping
CREATE TABLE product_crops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  crop_id UUID NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
  application_stage VARCHAR(100), -- 'pre-planting', 'planting', 'growth', 'flowering', etc.
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, crop_id)
);

-- =====================================================
-- CONNECTIONS MODULE
-- =====================================================

-- Organization connections
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_from_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  organization_to_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Connection details
  connection_type connection_type NOT NULL,
  connection_status connection_status NOT NULL DEFAULT 'negotiating',

  -- Contract/agreement details
  contract_number VARCHAR(100),
  start_date DATE,
  end_date DATE,

  -- Notes
  description TEXT,
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  -- Prevent self-connections and duplicates
  CHECK (organization_from_id != organization_to_id),
  UNIQUE(organization_from_id, organization_to_id, connection_type)
);

-- =====================================================
-- CONTENT MODULE
-- =====================================================

-- News/Insights
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Content details
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category content_category NOT NULL,
  summary TEXT,
  body TEXT,

  -- Media
  featured_image_url TEXT,
  images JSONB, -- Array of image URLs

  -- Author
  author_user_id UUID REFERENCES auth.users(id),
  author_organization_id UUID REFERENCES organizations(id),
  author_name VARCHAR(255),

  -- SEO
  meta_description TEXT,
  meta_keywords TEXT[],

  -- Publishing
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  featured BOOLEAN DEFAULT FALSE,

  -- Engagement
  views_count INTEGER DEFAULT 0,

  -- Tags
  tags TEXT[],

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('portuguese', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(summary, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(body, '')), 'C')
  ) STORED
);

-- =====================================================
-- AUDIT AND COMPLIANCE MODULE
-- =====================================================

-- Audit logs (immutable)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Actor
  user_id UUID REFERENCES auth.users(id),
  user_email VARCHAR(255),
  user_ip_address INET,

  -- Action
  action audit_action NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,

  -- Details
  description TEXT,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB,

  -- Context
  organization_id UUID REFERENCES organizations(id),

  -- Timestamp (immutable)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Digital field notebook entries
CREATE TABLE field_notebook_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Association
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  biofactory_id UUID REFERENCES biofactories(id),
  batch_id UUID REFERENCES production_batches(id),

  -- Entry details
  entry_date DATE NOT NULL,
  activity_type VARCHAR(100), -- 'production', 'application', 'monitoring', 'harvest', etc.

  -- Location
  field_name VARCHAR(255),
  area_hectares DECIMAL(10, 2),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Weather conditions
  weather_conditions VARCHAR(100),
  temperature_celsius DECIMAL(5, 2),
  humidity_percentage DECIMAL(5, 2),

  -- Activity details
  description TEXT NOT NULL,
  products_used JSONB, -- Array of {product_id, quantity, unit}
  equipment_used TEXT[],

  -- Results/observations
  observations TEXT,
  photos JSONB, -- Array of photo URLs

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Document uploads
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Association
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES production_batches(id),
  biofactory_id UUID REFERENCES biofactories(id),

  -- Document details
  document_type VARCHAR(100) NOT NULL, -- 'invoice', 'lab_report', 'certificate', 'license', etc.
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- File
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size_bytes BIGINT,
  file_mime_type VARCHAR(100),

  -- Validation
  verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES auth.users(id),
  verification_date TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Organizations
CREATE INDEX idx_organizations_type ON organizations(organization_type);
CREATE INDEX idx_organizations_city_state ON organizations(address_city, address_state);
CREATE INDEX idx_organizations_verified ON organizations(verified);
CREATE INDEX idx_organizations_active ON organizations(is_active);
CREATE INDEX idx_organizations_search ON organizations USING GIN(search_vector);
CREATE INDEX idx_organizations_location ON organizations USING GIST(
  ll_to_earth(latitude, longitude)
) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- User profiles
CREATE INDEX idx_user_profiles_organization ON user_profiles(organization_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_active ON user_profiles(is_active);

-- Biofactories
CREATE INDEX idx_biofactories_organization ON biofactories(organization_id);
CREATE INDEX idx_biofactories_type ON biofactories(biofactory_type);
CREATE INDEX idx_biofactories_city_state ON biofactories(address_city, address_state);
CREATE INDEX idx_biofactories_compliance ON biofactories(compliance_status);
CREATE INDEX idx_biofactories_active ON biofactories(is_active);

-- Production batches
CREATE INDEX idx_batches_biofactory ON production_batches(biofactory_id);
CREATE INDEX idx_batches_product ON production_batches(product_id);
CREATE INDEX idx_batches_date ON production_batches(production_date DESC);
CREATE INDEX idx_batches_status ON production_batches(status);

-- Quality reports
CREATE INDEX idx_quality_reports_batch ON quality_reports(batch_id);
CREATE INDEX idx_quality_reports_lab ON quality_reports(lab_organization_id);
CREATE INDEX idx_quality_reports_date ON quality_reports(report_date DESC);
CREATE INDEX idx_quality_reports_approved ON quality_reports(approved);

-- Technical responsibilities
CREATE INDEX idx_tech_resp_batch ON technical_responsibilities(batch_id);
CREATE INDEX idx_tech_resp_user ON technical_responsibilities(responsible_user_id);
CREATE INDEX idx_tech_resp_valid ON technical_responsibilities(is_valid);

-- Compliance records
CREATE INDEX idx_compliance_biofactory ON compliance_records(biofactory_id);
CREATE INDEX idx_compliance_status ON compliance_records(compliance_status);
CREATE INDEX idx_compliance_date ON compliance_records(inspection_date DESC);
CREATE INDEX idx_compliance_resolved ON compliance_records(resolved);

-- Products
CREATE INDEX idx_products_organization ON products(organization_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_mapa ON products(mapa_registration_number);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_search ON products USING GIN(search_vector);

-- Product ingredients
CREATE INDEX idx_product_ingredients_product ON product_ingredients(product_id);
CREATE INDEX idx_product_ingredients_ingredient ON product_ingredients(ingredient_id);

-- Product crops
CREATE INDEX idx_product_crops_product ON product_crops(product_id);
CREATE INDEX idx_product_crops_crop ON product_crops(crop_id);

-- Connections
CREATE INDEX idx_connections_from ON connections(organization_from_id);
CREATE INDEX idx_connections_to ON connections(organization_to_id);
CREATE INDEX idx_connections_type ON connections(connection_type);
CREATE INDEX idx_connections_status ON connections(connection_status);

-- Content
CREATE INDEX idx_content_category ON content(category);
CREATE INDEX idx_content_published ON content(published, published_at DESC);
CREATE INDEX idx_content_featured ON content(featured);
CREATE INDEX idx_content_author_user ON content(author_user_id);
CREATE INDEX idx_content_author_org ON content(author_organization_id);
CREATE INDEX idx_content_search ON content USING GIN(search_vector);
CREATE INDEX idx_content_tags ON content USING GIN(tags);

-- Audit logs
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_organization ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- Field notebook
CREATE INDEX idx_field_notebook_organization ON field_notebook_entries(organization_id);
CREATE INDEX idx_field_notebook_biofactory ON field_notebook_entries(biofactory_id);
CREATE INDEX idx_field_notebook_batch ON field_notebook_entries(batch_id);
CREATE INDEX idx_field_notebook_date ON field_notebook_entries(entry_date DESC);
CREATE INDEX idx_field_notebook_created_by ON field_notebook_entries(created_by);

-- Documents
CREATE INDEX idx_documents_organization ON documents(organization_id);
CREATE INDEX idx_documents_batch ON documents(batch_id);
CREATE INDEX idx_documents_biofactory ON documents(biofactory_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_verified ON documents(verified);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE biofactories ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE technical_responsibilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_notebook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role = 'admin'
    AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user's organization
CREATE OR REPLACE FUNCTION get_user_organization()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT organization_id FROM user_profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RLS POLICIES: ORGANIZATIONS (Public directory, write own data)
-- =====================================================

-- Public read for verified organizations
CREATE POLICY "Public read verified organizations"
  ON organizations FOR SELECT
  USING (verified = TRUE AND is_active = TRUE);

-- Authenticated users can read all organizations
CREATE POLICY "Authenticated read all organizations"
  ON organizations FOR SELECT
  TO authenticated
  USING (TRUE);

-- Users can insert organizations (e.g., for registration)
CREATE POLICY "Users can create organizations"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- Users can update their own organization
CREATE POLICY "Users update own organization"
  ON organizations FOR UPDATE
  TO authenticated
  USING (
    id = get_user_organization() OR is_admin()
  );

-- Admins can delete organizations
CREATE POLICY "Admins delete organizations"
  ON organizations FOR DELETE
  TO authenticated
  USING (is_admin());

-- =====================================================
-- RLS POLICIES: USER PROFILES
-- =====================================================

-- Users can read all authenticated user profiles (for collaboration)
CREATE POLICY "Authenticated read user profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (TRUE);

-- Users can update their own profile
CREATE POLICY "Users update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR is_admin());

-- Users can insert their own profile
CREATE POLICY "Users insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- =====================================================
-- RLS POLICIES: BIOFACTORIES
-- =====================================================

-- Public read for verified organizations' biofactories
CREATE POLICY "Public read verified biofactories"
  ON biofactories FOR SELECT
  USING (
    is_active = TRUE AND EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = biofactories.organization_id
      AND organizations.verified = TRUE
    )
  );

-- Authenticated users read all biofactories
CREATE POLICY "Authenticated read biofactories"
  ON biofactories FOR SELECT
  TO authenticated
  USING (TRUE);

-- Users can manage own organization's biofactories
CREATE POLICY "Users manage own biofactories"
  ON biofactories FOR ALL
  TO authenticated
  USING (
    organization_id = get_user_organization() OR is_admin()
  );

-- =====================================================
-- RLS POLICIES: PRODUCTION BATCHES
-- =====================================================

-- Users can read batches from their organization's biofactories
CREATE POLICY "Users read own batches"
  ON production_batches FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM biofactories
      WHERE biofactories.id = production_batches.biofactory_id
      AND (biofactories.organization_id = get_user_organization() OR is_admin())
    )
  );

-- Users can manage batches from their organization's biofactories
CREATE POLICY "Users manage own batches"
  ON production_batches FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM biofactories
      WHERE biofactories.id = production_batches.biofactory_id
      AND (biofactories.organization_id = get_user_organization() OR is_admin())
    )
  );

-- =====================================================
-- RLS POLICIES: QUALITY REPORTS
-- =====================================================

-- Users read reports for their batches
CREATE POLICY "Users read own quality reports"
  ON quality_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM production_batches pb
      JOIN biofactories bf ON bf.id = pb.biofactory_id
      WHERE pb.id = quality_reports.batch_id
      AND (bf.organization_id = get_user_organization() OR is_admin())
    )
  );

-- Users manage reports for their batches
CREATE POLICY "Users manage own quality reports"
  ON quality_reports FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM production_batches pb
      JOIN biofactories bf ON bf.id = pb.biofactory_id
      WHERE pb.id = quality_reports.batch_id
      AND (bf.organization_id = get_user_organization() OR is_admin())
    )
  );

-- =====================================================
-- RLS POLICIES: PRODUCTS (Public directory)
-- =====================================================

-- Public read for active products
CREATE POLICY "Public read active products"
  ON products FOR SELECT
  USING (is_active = TRUE);

-- Authenticated read all products
CREATE POLICY "Authenticated read products"
  ON products FOR SELECT
  TO authenticated
  USING (TRUE);

-- Users manage own organization's products
CREATE POLICY "Users manage own products"
  ON products FOR ALL
  TO authenticated
  USING (
    organization_id = get_user_organization() OR is_admin()
  );

-- =====================================================
-- RLS POLICIES: ACTIVE INGREDIENTS & CROPS (Public read)
-- =====================================================

CREATE POLICY "Public read active ingredients"
  ON active_ingredients FOR SELECT
  USING (TRUE);

CREATE POLICY "Admin manage active ingredients"
  ON active_ingredients FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Public read crops"
  ON crops FOR SELECT
  USING (TRUE);

CREATE POLICY "Admin manage crops"
  ON crops FOR ALL
  TO authenticated
  USING (is_admin());

-- =====================================================
-- RLS POLICIES: CONNECTIONS
-- =====================================================

-- Users read connections involving their organization
CREATE POLICY "Users read own connections"
  ON connections FOR SELECT
  TO authenticated
  USING (
    organization_from_id = get_user_organization() OR
    organization_to_id = get_user_organization() OR
    is_admin()
  );

-- Users manage connections from their organization
CREATE POLICY "Users manage own connections"
  ON connections FOR ALL
  TO authenticated
  USING (
    organization_from_id = get_user_organization() OR is_admin()
  );

-- =====================================================
-- RLS POLICIES: CONTENT (Public read published)
-- =====================================================

-- Public read published content
CREATE POLICY "Public read published content"
  ON content FOR SELECT
  USING (published = TRUE);

-- Authenticated read all content
CREATE POLICY "Authenticated read content"
  ON content FOR SELECT
  TO authenticated
  USING (TRUE);

-- Authors and admins manage content
CREATE POLICY "Authors manage own content"
  ON content FOR ALL
  TO authenticated
  USING (
    author_user_id = auth.uid() OR is_admin()
  );

-- =====================================================
-- RLS POLICIES: AUDIT LOGS (Read-only, admin only)
-- =====================================================

CREATE POLICY "Admins read audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (is_admin());

-- Audit logs are insert-only via triggers
CREATE POLICY "System insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- =====================================================
-- RLS POLICIES: FIELD NOTEBOOK
-- =====================================================

CREATE POLICY "Users read own field notebook"
  ON field_notebook_entries FOR SELECT
  TO authenticated
  USING (
    organization_id = get_user_organization() OR is_admin()
  );

CREATE POLICY "Users manage own field notebook"
  ON field_notebook_entries FOR ALL
  TO authenticated
  USING (
    organization_id = get_user_organization() OR is_admin()
  );

-- =====================================================
-- RLS POLICIES: DOCUMENTS
-- =====================================================

CREATE POLICY "Users read own documents"
  ON documents FOR SELECT
  TO authenticated
  USING (
    organization_id = get_user_organization() OR is_admin()
  );

CREATE POLICY "Users manage own documents"
  ON documents FOR ALL
  TO authenticated
  USING (
    organization_id = get_user_organization() OR is_admin()
  );

-- =====================================================
-- TRIGGERS FOR AUDIT LOGGING
-- =====================================================

-- Function to log changes
CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER AS $$
DECLARE
  action_type audit_action;
BEGIN
  -- Determine action type
  IF (TG_OP = 'INSERT') THEN
    action_type := 'create';
  ELSIF (TG_OP = 'UPDATE') THEN
    action_type := 'update';
  ELSIF (TG_OP = 'DELETE') THEN
    action_type := 'delete';
  END IF;

  -- Insert audit log
  INSERT INTO audit_logs (
    user_id,
    user_email,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values
  ) VALUES (
    auth.uid(),
    auth.jwt() ->> 'email',
    action_type,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_organizations
  AFTER INSERT OR UPDATE OR DELETE ON organizations
  FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_biofactories
  AFTER INSERT OR UPDATE OR DELETE ON biofactories
  FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_production_batches
  AFTER INSERT OR UPDATE OR DELETE ON production_batches
  FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_quality_reports
  AFTER INSERT OR UPDATE OR DELETE ON quality_reports
  FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_products
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION log_audit();

-- =====================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_biofactories_updated_at
  BEFORE UPDATE ON biofactories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_production_batches_updated_at
  BEFORE UPDATE ON production_batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_quality_reports_updated_at
  BEFORE UPDATE ON quality_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_connections_updated_at
  BEFORE UPDATE ON connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_content_updated_at
  BEFORE UPDATE ON content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_field_notebook_updated_at
  BEFORE UPDATE ON field_notebook_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- STORAGE BUCKETS CONFIGURATION
-- =====================================================

-- Note: These need to be created via Supabase Dashboard or API
-- Listed here for documentation

/*
STORAGE BUCKETS TO CREATE:

1. organization-logos
   - Public read
   - Authenticated write (own organization only)
   - Max file size: 2MB
   - Allowed types: image/jpeg, image/png, image/webp

2. lab-reports
   - Private (RLS controlled)
   - Max file size: 10MB
   - Allowed types: application/pdf, image/jpeg, image/png

3. invoices
   - Private (RLS controlled)
   - Max file size: 10MB
   - Allowed types: application/pdf

4. field-photos
   - Private (RLS controlled)
   - Max file size: 5MB
   - Allowed types: image/jpeg, image/png, image/webp

5. technical-documents
   - Private (RLS controlled)
   - Max file size: 10MB
   - Allowed types: application/pdf

6. content-images
   - Public read
   - Authenticated write (content authors)
   - Max file size: 5MB
   - Allowed types: image/jpeg, image/png, image/webp

7. user-avatars
   - Public read
   - Authenticated write (own avatar only)
   - Max file size: 1MB
   - Allowed types: image/jpeg, image/png, image/webp
*/

-- =====================================================
-- LGPD COMPLIANCE NOTES
-- =====================================================

/*
SENSITIVE DATA REQUIRING ENCRYPTION (LGPD Article 7):

1. CPF/CNPJ - Use pgcrypto for encryption at rest
2. Phone numbers - Encrypt in application layer before storage
3. Email addresses - Hash for lookups, encrypt for storage
4. IP addresses in audit logs - Anonymize after 90 days

RECOMMENDED IMPLEMENTATION:

-- Encrypt CPF/CNPJ before insert
CREATE OR REPLACE FUNCTION encrypt_pii()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.cpf IS NOT NULL THEN
    NEW.cpf := pgp_sym_encrypt(NEW.cpf, current_setting('app.encryption_key'));
  END IF;
  IF NEW.cnpj IS NOT NULL THEN
    NEW.cnpj := pgp_sym_encrypt(NEW.cnpj, current_setting('app.encryption_key'));
  END IF;
  IF NEW.phone IS NOT NULL THEN
    NEW.phone := pgp_sym_encrypt(NEW.phone, current_setting('app.encryption_key'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrypt for authorized access
CREATE OR REPLACE FUNCTION decrypt_cpf(encrypted_cpf TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN pgp_sym_decrypt(encrypted_cpf::bytea, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DATA RETENTION POLICIES:

1. Audit logs: 5 years (regulatory requirement)
2. Production batches: Indefinite (traceability)
3. Quality reports: Indefinite (regulatory)
4. User activity logs: 90 days
5. Deleted user data: 30 days (anonymized after)

RIGHT TO BE FORGOTTEN:

Implement anonymization function:
- Replace PII with 'ANONYMIZED_USER_[ID]'
- Keep transactional data for regulatory compliance
- Mark user profile as anonymized
*/

-- =====================================================
-- SEED DATA STRUCTURE
-- =====================================================

-- Default permissions
INSERT INTO permissions (name, description, resource, action) VALUES
  ('read_organizations', 'Read organization data', 'organizations', 'read'),
  ('write_organizations', 'Create/update organizations', 'organizations', 'write'),
  ('read_products', 'Read product catalog', 'products', 'read'),
  ('write_products', 'Manage products', 'products', 'write'),
  ('read_batches', 'Read production batches', 'batches', 'read'),
  ('write_batches', 'Manage production batches', 'batches', 'write'),
  ('approve_quality', 'Approve quality reports', 'quality', 'approve'),
  ('read_audit', 'Read audit logs', 'audit', 'read'),
  ('manage_users', 'Manage user accounts', 'users', 'manage');

-- Default role permissions
INSERT INTO role_permissions (role, permission_id)
SELECT 'admin', id FROM permissions; -- Admins get all permissions

INSERT INTO role_permissions (role, permission_id)
SELECT 'organization_admin', id FROM permissions
WHERE name IN ('read_organizations', 'write_organizations', 'read_products', 'write_products', 'read_batches', 'write_batches');

INSERT INTO role_permissions (role, permission_id)
SELECT 'farmer', id FROM permissions
WHERE name IN ('read_organizations', 'read_products', 'read_batches', 'write_batches');

INSERT INTO role_permissions (role, permission_id)
SELECT 'auditor', id FROM permissions
WHERE name IN ('read_organizations', 'read_products', 'read_batches', 'approve_quality', 'read_audit');

-- Common crops in Brazil
INSERT INTO crops (name, scientific_name, crop_family) VALUES
  ('Soja', 'Glycine max', 'Fabaceae'),
  ('Milho', 'Zea mays', 'Poaceae'),
  ('Café', 'Coffea arabica', 'Rubiaceae'),
  ('Cana-de-açúcar', 'Saccharum officinarum', 'Poaceae'),
  ('Algodão', 'Gossypium hirsutum', 'Malvaceae'),
  ('Feijão', 'Phaseolus vulgaris', 'Fabaceae'),
  ('Trigo', 'Triticum aestivum', 'Poaceae'),
  ('Arroz', 'Oryza sativa', 'Poaceae'),
  ('Tomate', 'Solanum lycopersicum', 'Solanaceae'),
  ('Batata', 'Solanum tuberosum', 'Solanaceae');

-- Common active ingredients
INSERT INTO active_ingredients (name, scientific_name, ingredient_type, genus, species) VALUES
  ('Azospirillum brasilense', 'Azospirillum brasilense', 'bacteria', 'Azospirillum', 'brasilense'),
  ('Bacillus subtilis', 'Bacillus subtilis', 'bacteria', 'Bacillus', 'subtilis'),
  ('Trichoderma harzianum', 'Trichoderma harzianum', 'fungi', 'Trichoderma', 'harzianum'),
  ('Bradyrhizobium japonicum', 'Bradyrhizobium japonicum', 'bacteria', 'Bradyrhizobium', 'japonicum'),
  ('Metarhizium anisopliae', 'Metarhizium anisopliae', 'fungi', 'Metarhizium', 'anisopliae'),
  ('Beauveria bassiana', 'Beauveria bassiana', 'fungi', 'Beauveria', 'bassiana'),
  ('Bacillus thuringiensis', 'Bacillus thuringiensis', 'bacteria', 'Bacillus', 'thuringiensis');

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Active biofactories with organization details
CREATE VIEW v_active_biofactories AS
SELECT
  bf.*,
  o.name as organization_name,
  o.organization_type,
  o.verified as organization_verified
FROM biofactories bf
JOIN organizations o ON o.id = bf.organization_id
WHERE bf.is_active = TRUE;

-- Production batches with full context
CREATE VIEW v_production_batches_detail AS
SELECT
  pb.*,
  bf.name as biofactory_name,
  bf.address_city as biofactory_city,
  bf.address_state as biofactory_state,
  o.name as organization_name,
  p.name as product_name,
  p.category as product_category,
  COUNT(qr.id) as quality_reports_count,
  COUNT(CASE WHEN qr.approved = TRUE THEN 1 END) as approved_reports_count
FROM production_batches pb
JOIN biofactories bf ON bf.id = pb.biofactory_id
JOIN organizations o ON o.id = bf.organization_id
LEFT JOIN products p ON p.id = pb.product_id
LEFT JOIN quality_reports qr ON qr.batch_id = pb.id
GROUP BY pb.id, bf.name, bf.address_city, bf.address_state, o.name, p.name, p.category;

-- Products with ingredients
CREATE VIEW v_products_with_ingredients AS
SELECT
  p.*,
  o.name as organization_name,
  ARRAY_AGG(DISTINCT ai.name) as active_ingredients,
  ARRAY_AGG(DISTINCT c.name) as target_crops
FROM products p
LEFT JOIN organizations o ON o.id = p.organization_id
LEFT JOIN product_ingredients pi ON pi.product_id = p.id
LEFT JOIN active_ingredients ai ON ai.id = pi.ingredient_id
LEFT JOIN product_crops pc ON pc.product_id = p.id
LEFT JOIN crops c ON c.id = pc.crop_id
GROUP BY p.id, o.name;

-- =====================================================
-- COMMENTS ON TABLES
-- =====================================================

COMMENT ON TABLE organizations IS 'Organizations in the AgroBioConnect platform (companies, producers, institutions)';
COMMENT ON TABLE user_profiles IS 'Extended user profile data linked to Supabase auth.users';
COMMENT ON TABLE biofactories IS 'Production facilities for bioinputs';
COMMENT ON TABLE production_batches IS 'Individual production lots with fermentation parameters';
COMMENT ON TABLE quality_reports IS 'Laboratory quality control reports for production batches';
COMMENT ON TABLE technical_responsibilities IS 'Technical responsibility documents (RT/ART) for production batches';
COMMENT ON TABLE compliance_records IS 'Regulatory compliance inspection records';
COMMENT ON TABLE products IS 'Bioinput products with MAPA registration data';
COMMENT ON TABLE active_ingredients IS 'Active biological organisms used in bioinputs';
COMMENT ON TABLE crops IS 'Agricultural crops that bioinputs target';
COMMENT ON TABLE connections IS 'Relationships between organizations';
COMMENT ON TABLE content IS 'News, insights, and educational content';
COMMENT ON TABLE audit_logs IS 'Immutable audit trail for all data changes';
COMMENT ON TABLE field_notebook_entries IS 'Digital field notebook records';
COMMENT ON TABLE documents IS 'Document uploads (invoices, reports, certificates)';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
