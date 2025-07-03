-- Create properties table
CREATE TABLE properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  area_sqm DECIMAL(8, 2),
  property_type VARCHAR(50) NOT NULL, -- 'house', 'apartment', 'commercial', etc.
	location gis.geography(POINT) not null,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
 
-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow authenticated users to read all properties
CREATE POLICY "Users can view all properties" ON properties
  FOR SELECT TO authenticated USING (true);

-- Allow users to insert properties
CREATE POLICY "Users can insert their own properties" ON properties
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own properties
CREATE POLICY "Users can update their own properties" ON properties
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Allow users to delete their own properties
CREATE POLICY "Users can delete their own properties" ON properties
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 