-- Create collections table
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create endpoints table
CREATE TABLE IF NOT EXISTS public.endpoints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL DEFAULT 'GET',
  path VARCHAR(500) NOT NULL,
  response_body TEXT DEFAULT '{}',
  status_code INTEGER DEFAULT 200,
  headers JSONB DEFAULT '{}',
  validation_rules JSONB DEFAULT '[]',
  error_scenarios JSONB DEFAULT '[]',
  delay_config JSONB DEFAULT '{"enabled": false, "min": 100, "max": 1000}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_endpoints_collection_id ON public.endpoints(collection_id);
CREATE INDEX IF NOT EXISTS idx_collections_name ON public.collections(name);
CREATE INDEX IF NOT EXISTS idx_endpoints_path ON public.endpoints(path);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_collections_updated_at ON public.collections;
CREATE TRIGGER update_collections_updated_at
    BEFORE UPDATE ON public.collections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_endpoints_updated_at ON public.endpoints;
CREATE TRIGGER update_endpoints_updated_at
    BEFORE UPDATE ON public.endpoints
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
