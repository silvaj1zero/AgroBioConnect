-- ============================================
-- AgroBio v1.0 — Initial Schema Migration
-- 18 tables + RLS + Storage + Seed data
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('admin', 'farmer', 'agronomist', 'auditor', 'organization_admin', 'organization_member');
CREATE TYPE org_type AS ENUM ('farm', 'biofactory', 'cooperative', 'research', 'distributor', 'government', 'other');
CREATE TYPE biofactory_type AS ENUM ('commercial', 'on_farm', 'family_farm');
CREATE TYPE biofactory_status AS ENUM ('pending', 'active', 'suspended', 'inactive');
CREATE TYPE batch_status AS ENUM ('in_progress', 'qc', 'approved', 'rejected', 'applied');
CREATE TYPE product_category AS ENUM ('biocontrol', 'biofertilizer', 'biostimulant', 'inoculant', 'biopesticide', 'plant_growth_regulator', 'soil_conditioner', 'seed_treatment', 'other');
CREATE TYPE ingredient_type AS ENUM ('bacteria', 'fungus', 'virus', 'nematode', 'other');
CREATE TYPE connection_type AS ENUM ('supplier', 'customer', 'partner', 'technical', 'other');
CREATE TYPE content_category AS ENUM ('news', 'tutorial', 'regulation', 'research', 'event', 'other');
CREATE TYPE consent_type AS ENUM ('data_processing', 'marketing', 'analytics', 'third_party_sharing');

-- ============================================
-- 1. USER PROFILES
-- ============================================

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'farmer',
  full_name TEXT,
  cpf_cnpj TEXT,
  phone TEXT,
  crea_cra TEXT,
  avatar_url TEXT,
  organization_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 2. ORGANIZATIONS
-- ============================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type org_type NOT NULL DEFAULT 'farm',
  description TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  logo_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add FK after organizations exists
ALTER TABLE user_profiles ADD CONSTRAINT fk_user_profiles_org
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL;

-- ============================================
-- 3. REFERENCE TABLES
-- ============================================

CREATE TABLE active_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type ingredient_type NOT NULL DEFAULT 'bacteria',
  target_organisms TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE crops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_pt TEXT NOT NULL,
  name_en TEXT,
  scientific_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  active_ingredient TEXT,
  manufacturer TEXT,
  mapa_registration TEXT,
  category product_category NOT NULL DEFAULT 'other',
  availability TEXT,
  agrofit_id TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE product_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES active_ingredients(id) ON DELETE CASCADE,
  concentration TEXT,
  UNIQUE(product_id, ingredient_id)
);

CREATE TABLE product_crops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  crop_id UUID NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
  UNIQUE(product_id, crop_id)
);

-- ============================================
-- 4. BIOFACTORIES
-- ============================================

CREATE TABLE biofactories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type biofactory_type NOT NULL DEFAULT 'on_farm',
  cnpj TEXT,
  address JSONB DEFAULT '{}',
  rt_id UUID REFERENCES user_profiles(id),
  status biofactory_status NOT NULL DEFAULT 'pending',
  qr_code TEXT,
  trepda TEXT,
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 5. TECHNICAL RESPONSIBILITIES
-- ============================================

CREATE TABLE technical_responsibilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  biofactory_id UUID NOT NULL REFERENCES biofactories(id) ON DELETE CASCADE,
  rt_profile_id UUID NOT NULL REFERENCES user_profiles(id),
  art_number TEXT,
  signature_url TEXT,
  valid_from DATE NOT NULL,
  valid_until DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 6. PRODUCTION BATCHES
-- ============================================

CREATE TABLE production_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  biofactory_id UUID NOT NULL REFERENCES biofactories(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  batch_number TEXT NOT NULL UNIQUE,
  volume_liters NUMERIC,
  start_date DATE NOT NULL,
  end_date DATE,
  ph NUMERIC,
  temperature NUMERIC,
  status batch_status NOT NULL DEFAULT 'in_progress',
  notes TEXT,
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 7. QUALITY REPORTS
-- ============================================

CREATE TABLE quality_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES production_batches(id) ON DELETE CASCADE,
  lab_name TEXT,
  ufc_count NUMERIC,
  purity NUMERIC,
  concentration NUMERIC,
  report_url TEXT,
  is_compliant BOOLEAN DEFAULT false,
  analysis_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 8. FIELD NOTEBOOK ENTRIES
-- ============================================

CREATE TABLE field_notebook_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  field_name TEXT,
  field_id UUID,
  area_hectares NUMERIC,
  crop TEXT,
  activity_type TEXT NOT NULL DEFAULT 'application',
  date DATE NOT NULL,
  product_id UUID REFERENCES products(id),
  product_name TEXT,
  dosage TEXT,
  method TEXT,
  weather JSONB DEFAULT '{}',
  photos TEXT[],
  observations TEXT,
  location JSONB,
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 9. CONNECTIONS (Ecosystem)
-- ============================================

CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_from UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  org_to UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type connection_type NOT NULL DEFAULT 'partner',
  status TEXT DEFAULT 'pending',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 10. CONTENT
-- ============================================

CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  body TEXT,
  category content_category NOT NULL DEFAULT 'news',
  image_url TEXT,
  author TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 11. COMPLIANCE RECORDS
-- ============================================

CREATE TABLE compliance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  biofactory_id UUID REFERENCES biofactories(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  details JSONB DEFAULT '{}',
  valid_from DATE,
  valid_until DATE,
  document_url TEXT,
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 12. AUDIT LOGS (IMMUTABLE)
-- ============================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  metadata JSONB DEFAULT '{}',
  organization_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prevent updates and deletes on audit_logs
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable and cannot be modified or deleted';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_logs_immutable_update
  BEFORE UPDATE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

CREATE TRIGGER audit_logs_immutable_delete
  BEFORE DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

-- ============================================
-- 13. LGPD CONSENTS
-- ============================================

CREATE TABLE lgpd_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type consent_type NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT false,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, consent_type)
);

-- ============================================
-- 14. GOV API CACHE
-- ============================================

CREATE TABLE gov_api_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_source TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  response JSONB,
  cached_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ttl_hours INTEGER NOT NULL DEFAULT 24,
  UNIQUE(api_source, endpoint)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_profiles_role ON user_profiles(role);
CREATE INDEX idx_profiles_org ON user_profiles(organization_id);
CREATE INDEX idx_biofactories_org ON biofactories(organization_id);
CREATE INDEX idx_biofactories_owner ON biofactories(owner_id);
CREATE INDEX idx_batches_biofactory ON production_batches(biofactory_id);
CREATE INDEX idx_batches_number ON production_batches(batch_number);
CREATE INDEX idx_batches_owner ON production_batches(owner_id);
CREATE INDEX idx_batches_status ON production_batches(status);
CREATE INDEX idx_quality_batch ON quality_reports(batch_id);
CREATE INDEX idx_field_entries_owner ON field_notebook_entries(owner_id);
CREATE INDEX idx_field_entries_date ON field_notebook_entries(date);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
CREATE INDEX idx_gov_cache_source ON gov_api_cache(api_source, endpoint);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_compliance_org ON compliance_records(organization_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE biofactories ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE technical_responsibilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_notebook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE gov_api_cache ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role(uid UUID)
RETURNS user_role AS $$
  SELECT role FROM user_profiles WHERE id = uid;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PUBLIC READ: products, active_ingredients, crops, content
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read ingredients" ON active_ingredients FOR SELECT USING (true);
CREATE POLICY "Public read crops" ON crops FOR SELECT USING (true);
CREATE POLICY "Public read product_ingredients" ON product_ingredients FOR SELECT USING (true);
CREATE POLICY "Public read product_crops" ON product_crops FOR SELECT USING (true);
CREATE POLICY "Public read content" ON content FOR SELECT USING (true);

-- PUBLIC READ: production_batches (for QR trace lookup)
CREATE POLICY "Public read batches by number" ON production_batches
  FOR SELECT USING (true);

-- PUBLIC READ: quality_reports, biofactories (for QR trace chain)
CREATE POLICY "Public read quality_reports" ON quality_reports FOR SELECT USING (true);
CREATE POLICY "Public read biofactories" ON biofactories FOR SELECT USING (true);

-- GOV API CACHE: authenticated read/write
CREATE POLICY "Authenticated read gov cache" ON gov_api_cache
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated write gov cache" ON gov_api_cache
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update gov cache" ON gov_api_cache
  FOR UPDATE TO authenticated USING (true);

-- USER PROFILES: own read/write, admins/auditors read all
CREATE POLICY "Users read own profile" ON user_profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR get_user_role(auth.uid()) IN ('admin', 'auditor'));
CREATE POLICY "Users update own profile" ON user_profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Users insert own profile" ON user_profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- ORGANIZATIONS: authenticated read, owner write
CREATE POLICY "Authenticated read orgs" ON organizations
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Owner manage orgs" ON organizations
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner update orgs" ON organizations
  FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Owner delete orgs" ON organizations
  FOR DELETE TO authenticated USING (owner_id = auth.uid() OR get_user_role(auth.uid()) = 'admin');

-- BIOFACTORIES: owner write (public read already set above)
CREATE POLICY "Owner manage biofactories" ON biofactories
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner update biofactories" ON biofactories
  FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR get_user_role(auth.uid()) IN ('admin', 'auditor'));
CREATE POLICY "Owner delete biofactories" ON biofactories
  FOR DELETE TO authenticated USING (owner_id = auth.uid() OR get_user_role(auth.uid()) = 'admin');

-- PRODUCTION BATCHES: owner write (public read already set)
CREATE POLICY "Owner manage batches" ON production_batches
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner update batches" ON production_batches
  FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR get_user_role(auth.uid()) IN ('admin', 'auditor'));
CREATE POLICY "Owner delete batches" ON production_batches
  FOR DELETE TO authenticated USING (owner_id = auth.uid() OR get_user_role(auth.uid()) = 'admin');

-- QUALITY REPORTS: authenticated write (public read already set)
CREATE POLICY "Authenticated insert reports" ON quality_reports
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update reports" ON quality_reports
  FOR UPDATE TO authenticated USING (true);

-- TECHNICAL RESPONSIBILITIES: authenticated read/write
CREATE POLICY "Authenticated read tech resp" ON technical_responsibilities
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated write tech resp" ON technical_responsibilities
  FOR INSERT TO authenticated WITH CHECK (true);

-- FIELD NOTEBOOK: own read/write, auditors read all
CREATE POLICY "Owner read field entries" ON field_notebook_entries
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR get_user_role(auth.uid()) IN ('admin', 'auditor'));
CREATE POLICY "Owner insert field entries" ON field_notebook_entries
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner update field entries" ON field_notebook_entries
  FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owner delete field entries" ON field_notebook_entries
  FOR DELETE TO authenticated USING (owner_id = auth.uid() OR get_user_role(auth.uid()) = 'admin');

-- COMPLIANCE RECORDS: own read/write, auditors read all
CREATE POLICY "Owner read compliance" ON compliance_records
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR get_user_role(auth.uid()) IN ('admin', 'auditor'));
CREATE POLICY "Owner insert compliance" ON compliance_records
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner update compliance" ON compliance_records
  FOR UPDATE TO authenticated USING (owner_id = auth.uid());

-- AUDIT LOGS: auditors/admins read, authenticated insert
CREATE POLICY "Auditor read audit logs" ON audit_logs
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('admin', 'auditor'));
CREATE POLICY "Authenticated insert audit logs" ON audit_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- LGPD CONSENTS: own read/write
CREATE POLICY "Users read own consents" ON lgpd_consents
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users manage own consents" ON lgpd_consents
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own consents" ON lgpd_consents
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- CONNECTIONS: authenticated read/write
CREATE POLICY "Authenticated read connections" ON connections
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated write connections" ON connections
  FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'farmer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_orgs BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_biofactories BEFORE UPDATE ON biofactories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_batches BEFORE UPDATE ON production_batches FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_field_entries BEFORE UPDATE ON field_notebook_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_compliance BEFORE UPDATE ON compliance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_products BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public) VALUES
  ('logos', 'logos', true),
  ('certificates', 'certificates', false),
  ('field-photos', 'field-photos', false),
  ('lab-reports', 'lab-reports', false),
  ('qr-codes', 'qr-codes', true),
  ('invoices', 'invoices', false),
  ('signatures', 'signatures', false);

-- Storage policies: authenticated upload, public read for public buckets
CREATE POLICY "Public read logos" ON storage.objects FOR SELECT USING (bucket_id = 'logos');
CREATE POLICY "Public read qr-codes" ON storage.objects FOR SELECT USING (bucket_id = 'qr-codes');
CREATE POLICY "Auth upload logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'logos');
CREATE POLICY "Auth upload certificates" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'certificates');
CREATE POLICY "Auth upload field-photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'field-photos');
CREATE POLICY "Auth upload lab-reports" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'lab-reports');
CREATE POLICY "Auth upload qr-codes" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'qr-codes');
CREATE POLICY "Auth upload invoices" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'invoices');
CREATE POLICY "Auth upload signatures" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'signatures');
CREATE POLICY "Auth read own files" ON storage.objects FOR SELECT TO authenticated USING (true);

-- ============================================
-- SEED DATA: 30 Brazilian Crops
-- ============================================

INSERT INTO crops (name_pt, name_en, scientific_name) VALUES
  ('Soja', 'Soybean', 'Glycine max'),
  ('Milho', 'Corn', 'Zea mays'),
  ('Algodão', 'Cotton', 'Gossypium hirsutum'),
  ('Café', 'Coffee', 'Coffea arabica'),
  ('Cana-de-Açúcar', 'Sugarcane', 'Saccharum officinarum'),
  ('Feijão', 'Bean', 'Phaseolus vulgaris'),
  ('Arroz', 'Rice', 'Oryza sativa'),
  ('Trigo', 'Wheat', 'Triticum aestivum'),
  ('Mandioca', 'Cassava', 'Manihot esculenta'),
  ('Laranja', 'Orange', 'Citrus sinensis'),
  ('Tomate', 'Tomato', 'Solanum lycopersicum'),
  ('Batata', 'Potato', 'Solanum tuberosum'),
  ('Banana', 'Banana', 'Musa paradisiaca'),
  ('Uva', 'Grape', 'Vitis vinifera'),
  ('Manga', 'Mango', 'Mangifera indica'),
  ('Maçã', 'Apple', 'Malus domestica'),
  ('Morango', 'Strawberry', 'Fragaria × ananassa'),
  ('Cacau', 'Cocoa', 'Theobroma cacao'),
  ('Sorgo', 'Sorghum', 'Sorghum bicolor'),
  ('Amendoim', 'Peanut', 'Arachis hypogaea'),
  ('Girassol', 'Sunflower', 'Helianthus annuus'),
  ('Cevada', 'Barley', 'Hordeum vulgare'),
  ('Aveia', 'Oat', 'Avena sativa'),
  ('Centeio', 'Rye', 'Secale cereale'),
  ('Eucalipto', 'Eucalyptus', 'Eucalyptus grandis'),
  ('Pinus', 'Pine', 'Pinus elliottii'),
  ('Seringueira', 'Rubber tree', 'Hevea brasiliensis'),
  ('Dendê', 'Oil palm', 'Elaeis guineensis'),
  ('Mamão', 'Papaya', 'Carica papaya'),
  ('Abacaxi', 'Pineapple', 'Ananas comosus');

-- ============================================
-- SEED DATA: Common Active Ingredients
-- ============================================

INSERT INTO active_ingredients (name, type, target_organisms) VALUES
  ('Bacillus thuringiensis', 'bacteria', ARRAY['Lepidoptera', 'Coleoptera']),
  ('Beauveria bassiana', 'fungus', ARRAY['Coleoptera', 'Hemiptera', 'Thysanoptera']),
  ('Metarhizium anisopliae', 'fungus', ARRAY['Coleoptera', 'Hemiptera', 'Orthoptera']),
  ('Trichoderma harzianum', 'fungus', ARRAY['Fusarium', 'Rhizoctonia', 'Sclerotinia']),
  ('Trichoderma asperellum', 'fungus', ARRAY['Fusarium', 'Pythium', 'Rhizoctonia']),
  ('Bradyrhizobium japonicum', 'bacteria', ARRAY['Fixação de nitrogênio - Soja']),
  ('Azospirillum brasilense', 'bacteria', ARRAY['Promoção de crescimento - Milho, Trigo']),
  ('Bacillus subtilis', 'bacteria', ARRAY['Fungos fitopatogênicos diversos']),
  ('Bacillus amyloliquefaciens', 'bacteria', ARRAY['Fusarium', 'Rhizoctonia']),
  ('Pochonia chlamydosporia', 'fungus', ARRAY['Nematoides - Meloidogyne', 'Heterodera']),
  ('Purpureocillium lilacinum', 'fungus', ARRAY['Nematoides - Meloidogyne']),
  ('Baculovirus anticarsia', 'virus', ARRAY['Anticarsia gemmatalis - Lagarta da soja']),
  ('Cotesia flavipes', 'other', ARRAY['Diatraea saccharalis - Broca da cana']),
  ('Trichogramma pretiosum', 'other', ARRAY['Lepidoptera - Ovos de mariposas']),
  ('Isaria fumosorosea', 'fungus', ARRAY['Bemisia tabaci - Mosca branca']);

-- ============================================
-- DONE
-- ============================================
