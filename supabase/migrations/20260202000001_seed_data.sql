-- =====================================================
-- AgroBioConnect Seed Data
-- Initial reference data for Phase 1
-- =====================================================

-- =====================================================
-- PERMISSIONS AND ROLES
-- =====================================================

-- Insert default permissions
INSERT INTO permissions (name, description, resource, action) VALUES
  -- Organizations
  ('read_organizations', 'View organization directory and profiles', 'organizations', 'read'),
  ('write_organizations', 'Create and update organization information', 'organizations', 'write'),
  ('verify_organizations', 'Verify organization authenticity', 'organizations', 'verify'),

  -- Products
  ('read_products', 'View product catalog and details', 'products', 'read'),
  ('write_products', 'Create and update product information', 'products', 'write'),
  ('sync_mapa', 'Sync product data with MAPA Agrofit API', 'products', 'sync'),

  -- Biofactories
  ('read_biofactories', 'View biofactory information', 'biofactories', 'read'),
  ('write_biofactories', 'Create and update biofactory records', 'biofactories', 'write'),

  -- Production Batches
  ('read_batches', 'View production batch records', 'batches', 'read'),
  ('write_batches', 'Create and update production batches', 'batches', 'write'),
  ('approve_batches', 'Approve production batches for distribution', 'batches', 'approve'),

  -- Quality Reports
  ('read_quality', 'View quality control reports', 'quality', 'read'),
  ('write_quality', 'Create and update quality reports', 'quality', 'write'),
  ('approve_quality', 'Approve quality reports', 'quality', 'approve'),

  -- Technical Responsibility
  ('create_rt', 'Create technical responsibility documents', 'technical', 'create'),
  ('sign_rt', 'Digitally sign RT/ART documents', 'technical', 'sign'),

  -- Compliance
  ('read_compliance', 'View compliance records', 'compliance', 'read'),
  ('write_compliance', 'Create and update compliance records', 'compliance', 'write'),

  -- Connections
  ('read_connections', 'View organization connections', 'connections', 'read'),
  ('write_connections', 'Create and manage organization connections', 'connections', 'write'),

  -- Content
  ('read_content', 'View published content', 'content', 'read'),
  ('write_content', 'Create and update content', 'content', 'write'),
  ('publish_content', 'Publish content to public', 'content', 'publish'),

  -- Audit
  ('read_audit', 'View audit logs', 'audit', 'read'),
  ('export_audit', 'Export audit logs for compliance', 'audit', 'export'),

  -- Users
  ('read_users', 'View user profiles', 'users', 'read'),
  ('manage_users', 'Manage user accounts and roles', 'users', 'manage');

-- Assign permissions to roles

-- ADMIN: Full access to everything
INSERT INTO role_permissions (role, permission_id)
SELECT 'admin', id FROM permissions;

-- ORGANIZATION_ADMIN: Manage own organization
INSERT INTO role_permissions (role, permission_id)
SELECT 'organization_admin', id FROM permissions
WHERE name IN (
  'read_organizations',
  'write_organizations',
  'read_products',
  'write_products',
  'read_biofactories',
  'write_biofactories',
  'read_batches',
  'write_batches',
  'read_quality',
  'write_quality',
  'read_compliance',
  'read_connections',
  'write_connections',
  'read_content',
  'read_users'
);

-- FARMER: Limited access
INSERT INTO role_permissions (role, permission_id)
SELECT 'farmer', id FROM permissions
WHERE name IN (
  'read_organizations',
  'read_products',
  'read_biofactories',
  'read_batches',
  'write_batches',
  'read_quality',
  'read_connections',
  'write_connections',
  'read_content'
);

-- AGRONOMIST: Technical responsibilities and approvals
INSERT INTO role_permissions (role, permission_id)
SELECT 'agronomist', id FROM permissions
WHERE name IN (
  'read_organizations',
  'read_products',
  'read_biofactories',
  'read_batches',
  'write_batches',
  'read_quality',
  'write_quality',
  'approve_quality',
  'create_rt',
  'sign_rt',
  'read_compliance',
  'read_connections',
  'read_content'
);

-- AUDITOR: Read and compliance focus
INSERT INTO role_permissions (role, permission_id)
SELECT 'auditor', id FROM permissions
WHERE name IN (
  'read_organizations',
  'read_products',
  'read_biofactories',
  'read_batches',
  'read_quality',
  'approve_quality',
  'read_compliance',
  'write_compliance',
  'read_audit',
  'export_audit',
  'read_content'
);

-- ORGANIZATION_MEMBER: Basic read access
INSERT INTO role_permissions (role, permission_id)
SELECT 'organization_member', id FROM permissions
WHERE name IN (
  'read_organizations',
  'read_products',
  'read_biofactories',
  'read_batches',
  'read_quality',
  'read_connections',
  'read_content'
);

-- =====================================================
-- CROPS (Brazilian Agriculture)
-- =====================================================

INSERT INTO crops (name, scientific_name, crop_family, description) VALUES
  -- Major commodity crops
  ('Soja', 'Glycine max', 'Fabaceae', 'Principal cultura para fixação biológica de nitrogênio'),
  ('Milho', 'Zea mays', 'Poaceae', 'Cultura de grande importância para inoculação com Azospirillum'),
  ('Trigo', 'Triticum aestivum', 'Poaceae', 'Cultura de inverno com potencial para bioinsumos'),
  ('Arroz', 'Oryza sativa', 'Poaceae', 'Cultura irrigada com aplicações específicas'),
  ('Feijão', 'Phaseolus vulgaris', 'Fabaceae', 'Leguminosa para inoculação com rizóbio'),

  -- Industrial crops
  ('Cana-de-açúcar', 'Saccharum officinarum', 'Poaceae', 'Cultura com alta demanda de nitrogênio'),
  ('Algodão', 'Gossypium hirsutum', 'Malvaceae', 'Cultura com potencial para biodefensivos'),
  ('Café', 'Coffea arabica', 'Rubiaceae', 'Cultura perene com uso de biofertilizantes'),
  ('Amendoim', 'Arachis hypogaea', 'Fabaceae', 'Leguminosa para inoculação'),

  -- Vegetables
  ('Tomate', 'Solanum lycopersicum', 'Solanaceae', 'Hortaliça com uso intensivo de biodefensivos'),
  ('Batata', 'Solanum tuberosum', 'Solanaceae', 'Cultura para bioestimulantes e biodefensivos'),
  ('Alface', 'Lactuca sativa', 'Asteraceae', 'Folhosa para produção orgânica'),
  ('Cenoura', 'Daucus carota', 'Apiaceae', 'Raiz para aplicação de bioestimulantes'),
  ('Pimentão', 'Capsicum annuum', 'Solanaceae', 'Hortaliça com demanda por controle biológico'),
  ('Pepino', 'Cucumis sativus', 'Cucurbitaceae', 'Cucurbitácea para biodefensivos'),

  -- Fruits
  ('Laranja', 'Citrus sinensis', 'Rutaceae', 'Citrus para controle biológico de pragas'),
  ('Banana', 'Musa spp.', 'Musaceae', 'Cultura perene para biofertilização'),
  ('Uva', 'Vitis vinifera', 'Vitaceae', 'Cultura para produção orgânica'),
  ('Manga', 'Mangifera indica', 'Anacardiaceae', 'Fruteira tropical'),
  ('Morango', 'Fragaria × ananassa', 'Rosaceae', 'Pequena fruta para produção orgânica'),

  -- Pasture and forage
  ('Brachiaria', 'Brachiaria spp.', 'Poaceae', 'Forrageira para inoculação com Azospirillum'),
  ('Panicum', 'Panicum maximum', 'Poaceae', 'Capim para pastagem'),
  ('Sorgo', 'Sorghum bicolor', 'Poaceae', 'Forrageiro e granífero'),
  ('Alfafa', 'Medicago sativa', 'Fabaceae', 'Leguminosa forrageira'),

  -- Other important crops
  ('Eucalipto', 'Eucalyptus spp.', 'Myrtaceae', 'Florestal para produção de celulose'),
  ('Abacaxi', 'Ananas comosus', 'Bromeliaceae', 'Fruteira tropical'),
  ('Mamão', 'Carica papaya', 'Caricaceae', 'Fruteira tropical'),
  ('Mandioca', 'Manihot esculenta', 'Euphorbiaceae', 'Raiz amilácea'),
  ('Cebola', 'Allium cepa', 'Amaryllidaceae', 'Hortaliça bulbosa'),
  ('Abóbora', 'Cucurbita spp.', 'Cucurbitaceae', 'Cucurbitácea para horta');

-- =====================================================
-- ACTIVE INGREDIENTS (Common Bioinput Organisms)
-- =====================================================

INSERT INTO active_ingredients (
  name,
  scientific_name,
  ingredient_type,
  genus,
  species,
  strain,
  description,
  mode_of_action,
  toxicity_class
) VALUES
  -- Nitrogen-fixing bacteria
  (
    'Azospirillum brasilense',
    'Azospirillum brasilense',
    'bacteria',
    'Azospirillum',
    'brasilense',
    'Ab-V5 e Ab-V6',
    'Bactéria fixadora de nitrogênio associativa, coloniza raízes de gramíneas',
    'Fixação biológica de nitrogênio (FBN) e produção de fitohormônios',
    'Classe IV - Produto pouco tóxico'
  ),
  (
    'Bradyrhizobium japonicum',
    'Bradyrhizobium japonicum',
    'bacteria',
    'Bradyrhizobium',
    'japonicum',
    'SEMIA 5079 e 5080',
    'Bactéria fixadora de nitrogênio simbiótica, forma nódulos em soja',
    'Fixação biológica de nitrogênio em leguminosas',
    'Classe IV - Produto pouco tóxico'
  ),
  (
    'Bradyrhizobium elkanii',
    'Bradyrhizobium elkanii',
    'bacteria',
    'Bradyrhizobium',
    'elkanii',
    'SEMIA 587 e 5019',
    'Bactéria fixadora de nitrogênio para soja',
    'Fixação biológica de nitrogênio em leguminosas',
    'Classe IV - Produto pouco tóxico'
  ),
  (
    'Rhizobium tropici',
    'Rhizobium tropici',
    'bacteria',
    'Rhizobium',
    'tropici',
    'SEMIA 4077',
    'Bactéria fixadora de nitrogênio para feijão',
    'Fixação biológica de nitrogênio em feijão',
    'Classe IV - Produto pouco tóxico'
  ),

  -- Biocontrol bacteria
  (
    'Bacillus subtilis',
    'Bacillus subtilis',
    'bacteria',
    'Bacillus',
    'subtilis',
    NULL,
    'Bactéria antagonista de fitopatógenos, estimula defesa das plantas',
    'Antibiose, competição e indução de resistência sistêmica',
    'Classe IV - Produto pouco tóxico'
  ),
  (
    'Bacillus thuringiensis',
    'Bacillus thuringiensis',
    'bacteria',
    'Bacillus',
    'thuringiensis',
    'kurstaki, aizawai',
    'Bactéria entomopatogênica, produz toxinas Cry',
    'Toxinas cristalinas ativas contra larvas de lepidópteros',
    'Classe IV - Produto pouco tóxico'
  ),
  (
    'Bacillus amyloliquefaciens',
    'Bacillus amyloliquefaciens',
    'bacteria',
    'Bacillus',
    'amyloliquefaciens',
    NULL,
    'Bactéria antagonista e promotora de crescimento',
    'Produção de lipopeptídeos antifúngicos',
    'Classe IV - Produto pouco tóxico'
  ),
  (
    'Pseudomonas fluorescens',
    'Pseudomonas fluorescens',
    'bacteria',
    'Pseudomonas',
    'fluorescens',
    NULL,
    'Bactéria rizosférica antagonista de patógenos',
    'Produção de sideróforos e antibióticos',
    'Classe IV - Produto pouco tóxico'
  ),

  -- Biocontrol fungi
  (
    'Trichoderma harzianum',
    'Trichoderma harzianum',
    'fungi',
    'Trichoderma',
    'harzianum',
    NULL,
    'Fungo antagonista de patógenos de solo, coloniza rizosfera',
    'Micoparasitismo, antibiose e competição',
    'Classe IV - Produto pouco tóxico'
  ),
  (
    'Trichoderma asperellum',
    'Trichoderma asperellum',
    'fungi',
    'Trichoderma',
    'asperellum',
    NULL,
    'Fungo antagonista e promotor de crescimento',
    'Controle biológico e indução de resistência',
    'Classe IV - Produto pouco tóxico'
  ),
  (
    'Trichoderma viride',
    'Trichoderma viride',
    'fungi',
    'Trichoderma',
    'viride',
    NULL,
    'Fungo antagonista de fitopatógenos',
    'Competição e antibiose',
    'Classe IV - Produto pouco tóxico'
  ),
  (
    'Metarhizium anisopliae',
    'Metarhizium anisopliae',
    'fungi',
    'Metarhizium',
    'anisopliae',
    NULL,
    'Fungo entomopatogênico para controle de cigarrinhas e outros insetos',
    'Infecção por contato, penetração do tegumento',
    'Classe IV - Produto pouco tóxico'
  ),
  (
    'Beauveria bassiana',
    'Beauveria bassiana',
    'fungi',
    'Beauveria',
    'bassiana',
    NULL,
    'Fungo entomopatogênico de amplo espectro',
    'Infecção por contato, ação sistêmica',
    'Classe IV - Produto pouco tóxico'
  ),
  (
    'Pochonia chlamydosporia',
    'Pochonia chlamydosporia',
    'fungi',
    'Pochonia',
    'chlamydosporia',
    NULL,
    'Fungo nematófago, parasita ovos de nematoides',
    'Parasitismo de ovos e fêmeas de nematoides',
    'Classe IV - Produto pouco tóxico'
  ),

  -- Mycorrhizal fungi
  (
    'Glomus clarum',
    'Rhizophagus clarus',
    'fungi',
    'Rhizophagus',
    'clarus',
    NULL,
    'Fungo micorrízico arbuscular, simbiose com raízes',
    'Aumento da absorção de fósforo e água',
    'Classe IV - Produto pouco tóxico'
  ),
  (
    'Rhizophagus irregularis',
    'Rhizophagus irregularis',
    'fungi',
    'Rhizophagus',
    'irregularis',
    NULL,
    'Fungo micorrízico arbuscular',
    'Simbiose radicular para absorção de nutrientes',
    'Classe IV - Produto pouco tóxico'
  ),

  -- Solubilizing bacteria
  (
    'Bacillus megaterium',
    'Bacillus megaterium',
    'bacteria',
    'Bacillus',
    'megaterium',
    NULL,
    'Bactéria solubilizadora de fosfato',
    'Solubilização de fósforo inorgânico',
    'Classe IV - Produto pouco tóxico'
  ),
  (
    'Paenibacillus polymyxa',
    'Paenibacillus polymyxa',
    'bacteria',
    'Paenibacillus',
    'polymyxa',
    NULL,
    'Bactéria fixadora de nitrogênio e solubilizadora de fosfato',
    'Múltiplos mecanismos de promoção de crescimento',
    'Classe IV - Produto pouco tóxico'
  ),

  -- Baculovirus
  (
    'Baculovirus anticarsia',
    'Anticarsia gemmatalis nucleopolyhedrovirus',
    'virus',
    'Alphabaculovirus',
    'AgMNPV',
    NULL,
    'Vírus específico para lagarta-da-soja',
    'Infecção viral específica de Anticarsia gemmatalis',
    'Classe IV - Produto pouco tóxico'
  ),
  (
    'Baculovirus spodoptera',
    'Spodoptera frugiperda nucleopolyhedrovirus',
    'virus',
    'Alphabaculovirus',
    'SfMNPV',
    NULL,
    'Vírus específico para lagarta-do-cartucho',
    'Infecção viral de Spodoptera frugiperda',
    'Classe IV - Produto pouco tóxico'
  );

-- =====================================================
-- SAMPLE CONTENT (Educational/News)
-- =====================================================

INSERT INTO content (
  title,
  slug,
  category,
  summary,
  body,
  author_name,
  published,
  published_at,
  featured,
  tags
) VALUES
  (
    'Inoculação de soja: boas práticas para a safra 2026/27',
    'inoculacao-soja-boas-praticas-2026',
    'technology',
    'Guia completo sobre inoculação de soja com rizóbio para maximizar a fixação biológica de nitrogênio.',
    'A inoculação de soja com Bradyrhizobium é uma prática consolidada na agricultura brasileira, responsável por fornecer até 300 kg/ha de nitrogênio através da fixação biológica.

## Principais recomendações:

1. **Qualidade do inoculante**: Verificar concentração mínima de 1x10^9 UFC/mL e validade
2. **Armazenamento**: Manter refrigerado até o momento da aplicação
3. **Compatibilidade**: Evitar mistura com fungicidas e micronutrientes
4. **Aplicação**: Realizar no sulco de plantio ou tratamento de sementes
5. **Momento**: Aplicar próximo ao plantio (máximo 24h antes)

## Controle de qualidade

Exigir laudos laboratoriais confirmando:
- Concentração de células viáveis
- Pureza microbiológica
- Ausência de contaminantes

A rastreabilidade dos lotes é fundamental para garantir a eficiência da inoculação.',
    'Embrapa Soja',
    TRUE,
    NOW(),
    TRUE,
    ARRAY['soja', 'inoculação', 'fixação biológica', 'bradyrhizobium']
  ),
  (
    'MAPA atualiza normativa IN 13 para bioinsumos',
    'mapa-atualiza-normativa-in13-bioinsumos',
    'regulation',
    'Ministério da Agricultura atualiza regras para registro e produção de bioinsumos no Brasil.',
    'O Ministério da Agricultura, Pecuária e Abastecimento (MAPA) publicou atualização da Instrução Normativa 13, que regulamenta a produção e comercialização de bioinsumos no Brasil.

## Principais mudanças:

1. **Rastreabilidade**: Obrigatoriedade de registro digital de todos os lotes produzidos
2. **Biofábricas On-farm**: Novos critérios para biofábricas em propriedades rurais
3. **Controle de qualidade**: Exigência de laudos laboratoriais acreditados
4. **Responsabilidade técnica**: RT/ART obrigatória para todos os lotes

## Prazos de adequação

Produtores têm até dezembro de 2026 para adequação aos novos requisitos.

A digitalização do setor de bioinsumos é um passo importante para fortalecer a rastreabilidade e garantir a qualidade dos produtos utilizados na agricultura brasileira.',
    'MAPA - Coordenação de Bioinsumos',
    TRUE,
    NOW() - INTERVAL '3 days',
    TRUE,
    ARRAY['regulação', 'MAPA', 'IN13', 'rastreabilidade']
  ),
  (
    'Mercado de bioinsumos deve crescer 15% em 2026',
    'mercado-bioinsumos-crescimento-2026',
    'market',
    'Setor de bioinsumos continua em expansão impulsionado pela demanda por agricultura sustentável.',
    'O mercado brasileiro de bioinsumos deve movimentar R$ 2,5 bilhões em 2026, crescimento de 15% em relação ao ano anterior, segundo levantamento da CropLife Brasil.

## Drivers de crescimento:

1. **Agricultura regenerativa**: Aumento da adoção de práticas sustentáveis
2. **Custo de fertilizantes**: Preços elevados de fertilizantes químicos
3. **Mercado externo**: Demanda europeia por produtos orgânicos
4. **Tecnologia**: Novos produtos e formulações mais eficientes

## Segmentos em destaque:

- Inoculantes: 40% do mercado
- Biodefensivos: 35% do mercado
- Biofertilizantes: 25% do mercado

O Brasil é líder mundial em uso de inoculantes, com taxa de adoção de 80% na cultura da soja.',
    'CropLife Brasil',
    TRUE,
    NOW() - INTERVAL '1 week',
    FALSE,
    ARRAY['mercado', 'crescimento', 'agricultura sustentável']
  ),
  (
    'Controle biológico de nematoides com fungos nematófagos',
    'controle-biologico-nematoides',
    'research',
    'Pesquisas demonstram eficácia de Pochonia chlamydosporia no controle de nematoides em soja.',
    'Estudo conduzido pela Universidade Federal de Viçosa demonstrou redução de até 70% na população de nematoides de galha (Meloidogyne javanica) com uso de Pochonia chlamydosporia.

## Metodologia:

- 4 ensaios em campo durante 2 safras
- Aplicação de 2x10^6 esporos/grama de solo
- Avaliação de população de nematoides e produtividade

## Resultados:

- Redução de 70% na população de nematoides
- Aumento de 15% na produtividade de soja
- Efeito residual de até 180 dias

## Recomendações:

O fungo deve ser aplicado no sulco de plantio ou via drench, com atenção à qualidade do inoculante e condições de solo (umidade e temperatura).

A pesquisa reforça o potencial do controle biológico como alternativa sustentável aos nematicidas químicos.',
    'UFV - Departamento de Fitopatologia',
    TRUE,
    NOW() - INTERVAL '2 weeks',
    FALSE,
    ARRAY['pesquisa', 'nematoides', 'controle biológico', 'Pochonia']
  ),
  (
    'Biofábricas On-farm: oportunidade para produtores',
    'biofabricas-on-farm-oportunidade',
    'technology',
    'Produção própria de bioinsumos permite redução de custos e maior sustentabilidade.',
    'Biofábricas on-farm permitem que produtores rurais produzam seus próprios bioinsumos, reduzindo dependência de insumos externos e custos de produção.

## Vantagens:

1. **Redução de custos**: Economia de até 60% em insumos biológicos
2. **Autonomia**: Produção na propriedade
3. **Sustentabilidade**: Menor pegada de carbono
4. **Qualidade**: Controle total sobre o processo

## Requisitos regulatórios:

- Responsável técnico (CREA/CRA)
- Controle de qualidade laboratorial
- Rastreabilidade de lotes
- Boas práticas de fabricação

## Investimento:

Biofábricas pequenas (até 1.000 L/mês) exigem investimento inicial de R$ 30.000 a R$ 80.000, com payback de 2-3 anos.

Cooperativas e associações podem compartilhar infraestrutura, reduzindo custos individuais.',
    'Embrapa Meio Ambiente',
    TRUE,
    NOW() - INTERVAL '10 days',
    FALSE,
    ARRAY['biofábrica', 'on-farm', 'sustentabilidade', 'custos']
  );

-- =====================================================
-- DEMO ORGANIZATIONS (for testing)
-- =====================================================

-- Note: In production, these should be created by users
-- Included here for testing and demo purposes only

INSERT INTO organizations (
  name,
  legal_name,
  organization_type,
  description,
  email,
  website,
  address_city,
  address_state,
  verified,
  verification_date
) VALUES
  (
    'Embrapa Soja',
    'Empresa Brasileira de Pesquisa Agropecuária',
    'university_institute',
    'Centro de pesquisa em soja e inoculantes para fixação biológica de nitrogênio',
    'contato@embrapa.br',
    'https://www.embrapa.br/soja',
    'Londrina',
    'PR',
    TRUE,
    NOW()
  ),
  (
    'BioBrasil Inoculantes',
    'BioBrasil Tecnologia em Bioinsumos Ltda',
    'bioinput_company',
    'Empresa produtora de inoculantes biológicos para agricultura sustentável',
    'contato@biobrasil.com.br',
    'https://www.biobrasil.com.br',
    'Ponta Grossa',
    'PR',
    TRUE,
    NOW()
  ),
  (
    'Fazenda Santa Rita',
    'João da Silva - Produtor Rural',
    'rural_producer',
    'Produção de soja, milho e feijão com foco em agricultura regenerativa',
    'fazenda.santarita@email.com',
    NULL,
    'Rio Verde',
    'GO',
    TRUE,
    NOW()
  );

-- =====================================================
-- NOTES
-- =====================================================

-- This seed data provides:
-- 1. Complete RBAC setup with permissions per role
-- 2. 30 common Brazilian crops
-- 3. 20 active biological ingredients (bacteria, fungi, virus)
-- 4. 5 sample content articles
-- 5. 3 demo organizations for testing

-- Next steps after running this migration:
-- 1. Create admin user via Supabase Auth
-- 2. Link admin user to user_profiles table
-- 3. Test RLS policies with different roles
-- 4. Create storage buckets
-- 5. Test complete workflow (create org → biofactory → batch → quality report)
