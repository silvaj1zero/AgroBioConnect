// Types matching the actual Supabase schema (20260202000000_initial_schema.sql)

export type UserRole = 'admin' | 'farmer' | 'agronomist' | 'auditor' | 'organization_admin' | 'organization_member'

export type OrganizationType =
  | 'bioinput_company'
  | 'university_institute'
  | 'rural_producer'
  | 'diagnostic_startup'
  | 'association'
  | 'logistics'
  | 'science'

export type BiofactoryType = 'commercial' | 'on_farm' | 'family_farm'

export type ProductCategory =
  | 'inoculant'
  | 'biodefensive'
  | 'biofertilizer'
  | 'biostimulant'
  | 'biological_nematicide'
  | 'biological_fungicide'
  | 'biological_insecticide'
  | 'soil_conditioner'
  | 'other'

export type ComplianceStatus = 'compliant' | 'pending' | 'non_compliant' | 'under_review'

export type ConnectionType = 'partnership' | 'supplier' | 'customer' | 'research' | 'consulting'
export type ConnectionStatus = 'active' | 'negotiating' | 'ended'

export type ContentCategory = 'research' | 'market' | 'technology' | 'regulation' | 'sustainability' | 'innovation'

export type AuditAction = 'create' | 'update' | 'delete' | 'read' | 'approve' | 'reject' | 'export'

// ---- Row types ----

export interface Organization {
  id: string
  name: string
  legal_name: string | null
  cnpj: string | null
  cpf: string | null
  organization_type: OrganizationType
  description: string | null
  logo_url: string | null
  website: string | null
  email: string | null
  phone: string | null
  address_street: string | null
  address_number: string | null
  address_complement: string | null
  address_neighborhood: string | null
  address_city: string | null
  address_state: string | null
  address_postal_code: string | null
  address_country: string
  latitude: number | null
  longitude: number | null
  verified: boolean
  verification_date: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface Profile {
  id: string
  organization_id: string | null
  role: UserRole
  full_name: string
  cpf: string | null
  phone: string | null
  professional_registration: string | null
  specialization: string | null
  bio: string | null
  avatar_url: string | null
  email_notifications: boolean
  sms_notifications: boolean
  language: string
  is_active: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export interface Biofactory {
  id: string
  organization_id: string
  name: string
  biofactory_type: BiofactoryType
  address_street: string | null
  address_number: string | null
  address_complement: string | null
  address_neighborhood: string | null
  address_city: string
  address_state: string
  address_postal_code: string | null
  latitude: number | null
  longitude: number | null
  production_capacity_liters: number | null
  production_capacity_kg: number | null
  infrastructure_description: string | null
  mapa_registration: string | null
  environmental_license: string | null
  license_expiry_date: string | null
  compliance_status: ComplianceStatus
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface Product {
  id: string
  organization_id: string | null
  name: string
  commercial_name: string | null
  category: ProductCategory
  mapa_registration_number: string | null
  mapa_registration_status: string | null
  mapa_last_sync: string | null
  agrofit_data: Record<string, unknown> | null
  description: string | null
  application_instructions: string | null
  dosage_recommendations: string | null
  safety_precautions: string | null
  formulation: string | null
  concentration: string | null
  package_size_liters: number | null
  package_size_kg: number | null
  shelf_life_months: number | null
  organic_certified: boolean
  certification_body: string | null
  certification_number: string | null
  certification_expiry: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface ActiveIngredient {
  id: string
  name: string
  scientific_name: string | null
  ingredient_type: string | null
  genus: string | null
  species: string | null
  strain: string | null
  description: string | null
  mode_of_action: string | null
  toxicity_class: string | null
  safety_notes: string | null
  created_at: string
  updated_at: string
}

export interface Crop {
  id: string
  name: string
  scientific_name: string | null
  crop_family: string | null
  description: string | null
  created_at: string
}

export interface ProductionBatch {
  id: string
  biofactory_id: string
  product_id: string | null
  batch_number: string
  production_date: string
  expiry_date: string | null
  volume_liters: number | null
  weight_kg: number | null
  initial_ph: number | null
  final_ph: number | null
  fermentation_temp_celsius: number | null
  fermentation_duration_hours: number | null
  fermentation_start_date: string | null
  fermentation_end_date: string | null
  organism_concentration: string | null
  purity_percentage: number | null
  contamination_level: string | null
  status: string
  notes: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface QualityReport {
  id: string
  batch_id: string
  lab_organization_id: string | null
  report_number: string
  report_date: string
  analysis_date: string | null
  ufc_count: string | null
  ufc_ml: number | null
  ufc_g: number | null
  viability_percentage: number | null
  purity_percentage: number | null
  salmonella_present: boolean | null
  ecoli_present: boolean | null
  other_contaminants: string | null
  ph_value: number | null
  moisture_percentage: number | null
  density: number | null
  report_document_url: string | null
  approved: boolean
  approved_by: string | null
  approval_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface FieldNotebookEntry {
  id: string
  organization_id: string
  biofactory_id: string | null
  batch_id: string | null
  entry_date: string
  activity_type: string | null
  field_name: string | null
  area_hectares: number | null
  latitude: number | null
  longitude: number | null
  weather_conditions: string | null
  temperature_celsius: number | null
  humidity_percentage: number | null
  description: string
  products_used: Array<{ product_id: string; quantity: number; unit: string }> | null
  equipment_used: string[] | null
  observations: string | null
  photos: Array<{ url: string; caption?: string }> | null
  created_at: string
  updated_at: string
  created_by: string
}

export interface AuditLog {
  id: string
  user_id: string | null
  user_email: string | null
  user_ip_address: string | null
  action: AuditAction
  resource_type: string
  resource_id: string | null
  description: string | null
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  metadata: Record<string, unknown> | null
  organization_id: string | null
  created_at: string
}

export interface ComplianceRecord {
  id: string
  biofactory_id: string
  compliance_type: string
  compliance_status: ComplianceStatus
  inspection_date: string | null
  inspector_name: string | null
  inspector_organization: string | null
  findings: string | null
  non_conformities: string | null
  corrective_actions: string | null
  deadline_date: string | null
  resolved: boolean
  resolution_date: string | null
  resolution_notes: string | null
  document_url: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface TechnicalResponsibility {
  id: string
  batch_id: string
  responsible_user_id: string
  document_type: string
  document_number: string
  professional_council: string | null
  council_registration: string
  signature_hash: string | null
  signature_date: string
  signature_document_url: string | null
  valid_until: string | null
  is_valid: boolean
  created_at: string
  updated_at: string
}

export interface DocumentUpload {
  id: string
  organization_id: string
  batch_id: string | null
  biofactory_id: string | null
  document_type: string
  title: string
  description: string | null
  file_url: string
  file_name: string
  file_size_bytes: number | null
  file_mime_type: string | null
  verified: boolean
  verified_by: string | null
  verification_date: string | null
  created_at: string
  updated_at: string
  created_by: string
}

// Supabase Database type (simplified — using `any` for table generics to avoid complex mapping)
export interface Database {
  public: {
    Tables: Record<string, { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }>
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, string>
  }
}

// Category label maps for UI
export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  inoculant: 'Inoculante',
  biodefensive: 'Biodefensivo',
  biofertilizer: 'Biofertilizante',
  biostimulant: 'Bioestimulante',
  biological_nematicide: 'Nematicida Biológico',
  biological_fungicide: 'Fungicida Biológico',
  biological_insecticide: 'Inseticida Biológico',
  soil_conditioner: 'Condicionador de Solo',
  other: 'Outro',
}

export const BIOFACTORY_TYPE_LABELS: Record<BiofactoryType, string> = {
  commercial: 'Comercial',
  on_farm: 'On-Farm',
  family_farm: 'Agricultura Familiar',
}

export const COMPLIANCE_STATUS_LABELS: Record<ComplianceStatus, string> = {
  compliant: 'Conforme',
  pending: 'Pendente',
  non_compliant: 'Não Conforme',
  under_review: 'Em Análise',
}

export const ORGANIZATION_TYPE_LABELS: Record<OrganizationType, string> = {
  bioinput_company: 'Empresa de Bioinsumos',
  university_institute: 'Universidade / Instituto',
  rural_producer: 'Produtor Rural',
  diagnostic_startup: 'Startup de Diagnóstico',
  association: 'Associação / Cooperativa',
  logistics: 'Logística',
  science: 'Ciência',
}
