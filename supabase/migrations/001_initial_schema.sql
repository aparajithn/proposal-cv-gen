-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Consultants table
CREATE TABLE consultants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  skills TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID REFERENCES consultants(id) ON DELETE CASCADE,
  client_name TEXT,
  role TEXT NOT NULL,
  duration TEXT,
  tech_stack TEXT[] DEFAULT '{}',
  description_technical TEXT,
  description_executive TEXT,
  description_functional TEXT,
  outcomes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CV exports tracking table
CREATE TABLE cv_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID REFERENCES consultants(id) ON DELETE CASCADE,
  rfp_name TEXT,
  format TEXT CHECK (format IN ('pdf', 'word-table', 'word-bullets')),
  exported_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE consultants ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_exports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for consultants
CREATE POLICY "Users can view their own consultants"
  ON consultants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consultants"
  ON consultants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consultants"
  ON consultants FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own consultants"
  ON consultants FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for projects
CREATE POLICY "Users can view projects for their consultants"
  ON projects FOR SELECT
  USING (
    consultant_id IN (
      SELECT id FROM consultants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert projects for their consultants"
  ON projects FOR INSERT
  WITH CHECK (
    consultant_id IN (
      SELECT id FROM consultants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update projects for their consultants"
  ON projects FOR UPDATE
  USING (
    consultant_id IN (
      SELECT id FROM consultants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete projects for their consultants"
  ON projects FOR DELETE
  USING (
    consultant_id IN (
      SELECT id FROM consultants WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for cv_exports
CREATE POLICY "Users can view their own exports"
  ON cv_exports FOR SELECT
  USING (
    consultant_id IN (
      SELECT id FROM consultants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own exports"
  ON cv_exports FOR INSERT
  WITH CHECK (
    consultant_id IN (
      SELECT id FROM consultants WHERE user_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX idx_consultants_user_id ON consultants(user_id);
CREATE INDEX idx_projects_consultant_id ON projects(consultant_id);
CREATE INDEX idx_cv_exports_consultant_id ON cv_exports(consultant_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_consultants_updated_at
  BEFORE UPDATE ON consultants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
