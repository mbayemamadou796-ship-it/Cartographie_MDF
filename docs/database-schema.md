# Schéma de Base de Données (Supabase / PostgreSQL) — Cartographie MDF

## 1. Table `members` (Adhérents & Cartographie)
```sql
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telephone VARCHAR(30),
  address TEXT,
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  department VARCHAR(100),
  region VARCHAR(100),
  custom_zone_id UUID REFERENCES custom_zones(id) ON DELETE SET NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  profession VARCHAR(150),
  domain_of_study VARCHAR(150),
  professional_status VARCHAR(100),
  company VARCHAR(150),
  bio TEXT,
  linkedin_url VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_members_coords ON members(latitude, longitude);
CREATE INDEX idx_members_zone ON members(custom_zone_id);
CREATE INDEX idx_members_email ON members(email);
```

## 2. Table `custom_zones` (Zones Géographiques Personnalisées)
```sql
CREATE TABLE custom_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(20) DEFAULT '#10b981',
  region_code VARCHAR(50),
  referrer_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 3. Table `app_users` (Comptes & Droits)
```sql
CREATE TABLE app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'referent', 'user')),
  zone_ids UUID[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertion de l'administrateur unique initial (Seed de départ)
-- Cet administrateur (Bilal) sera l'unique utilisateur initial habilité à créer ensuite les autres comptes.
INSERT INTO app_users (id, email, full_name, role, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Bilal', -- Identifiant / Username
  'Bilal Admin',
  'admin',
  true
) ON CONFLICT (email) DO NOTHING;
```


## 4. Table `audit_logs` (Journaux de Traçabilité)
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_name VARCHAR(150) NOT NULL,
  action VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  details TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip_address VARCHAR(45)
);
```

## 5. Table `import_logs` (Rapports d'Importation Excel)
```sql
CREATE TABLE import_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename VARCHAR(255) NOT NULL,
  imported_by VARCHAR(150) NOT NULL,
  total_rows INT NOT NULL,
  success_count INT NOT NULL,
  error_count INT NOT NULL,
  error_details JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
