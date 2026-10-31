-- =========================================================================
-- ANGLE REAL ESTATE - SUPABASE PRODUCTION DATABASE SCHEMA
-- Execute this script in your Supabase Project -> SQL Editor -> New Query
-- =========================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROPERTIES TABLE
CREATE TABLE IF NOT EXISTS public.properties (
    id TEXT PRIMARY KEY DEFAULT ('prop-' || substr(md5(random()::text), 1, 12)),
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    currency TEXT DEFAULT '₦',
    location TEXT NOT NULL,
    city TEXT,
    state TEXT,
    listing_type TEXT NOT NULL CHECK (listing_type IN ('buy', 'rent', 'sell')),
    property_type TEXT NOT NULL,
    bedrooms INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,
    area_sqm NUMERIC DEFAULT 0,
    images JSONB DEFAULT '[]'::jsonb,
    features JSONB DEFAULT '[]'::jsonb,
    featured BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. CUSTOMER ENQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.enquiries (
    id TEXT PRIMARY KEY DEFAULT ('enq-' || substr(md5(random()::text), 1, 12)),
    property_id TEXT,
    property_title TEXT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES (Safe creation without DROP keywords)
DO $$
BEGIN
    -- Allow public to view properties
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'properties' AND policyname = 'Public can view properties'
    ) THEN
        CREATE POLICY "Public can view properties" ON public.properties FOR SELECT USING (true);
    END IF;

    -- Allow admin dashboard to manage properties
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'properties' AND policyname = 'Allow admin dashboard to manage properties'
    ) THEN
        CREATE POLICY "Allow admin dashboard to manage properties" ON public.properties FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    END IF;

    -- Allow public to submit customer enquiries
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'enquiries' AND policyname = 'Public can submit enquiries'
    ) THEN
        CREATE POLICY "Public can submit enquiries" ON public.enquiries FOR INSERT WITH CHECK (true);
    END IF;

    -- Allow admin dashboard to view and manage enquiries
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'enquiries' AND policyname = 'Allow dashboard to manage enquiries'
    ) THEN
        CREATE POLICY "Allow dashboard to manage enquiries" ON public.enquiries FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    END IF;
END
$$;

-- 6. STORAGE BUCKET FOR PROPERTY IMAGES (Optional for uploaded photos)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can view property images'
    ) THEN
        CREATE POLICY "Public can view property images" ON storage.objects FOR SELECT USING (bucket_id = 'property-images');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can upload property images'
    ) THEN
        CREATE POLICY "Public can upload property images" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'property-images');
    END IF;
END
$$;

-- 8. INITIAL SAMPLE SEED DATA
INSERT INTO public.properties (
    id, title, description, price, currency, location, city, state, 
    listing_type, property_type, bedrooms, bathrooms, area_sqm, images, features, featured, status
) VALUES 
(
    'prop-lekki-villa-01',
    'The Obsidian Grand Waterfront Villa',
    'An architectural masterpiece situated right along the Lekki coastline. This contemporary smart home features 5 palatial ensuite bedrooms, a private infinity pool overlooking the lagoon, floor-to-ceiling double-glazed thermal glass, Italian marble flooring, and 2-room staff quarters.',
    750000000,
    '₦',
    'Admiralty Way, Lekki Phase 1, Lagos',
    'Lekki',
    'Lekki Phase 1',
    'buy',
    'Villa',
    5,
    6,
    780,
    '["/src/assets/images/hero_angle_property_1793350587000.jpg", "/src/assets/images/villa_lekki_facade_1793350588492.jpg"]'::jsonb,
    '["Private Infinity Pool", "Lagoon Waterfront View", "Smart Home Automation", "Italian Marble Finishing", "2-Room BQ", "24/7 CCTV", "4-Car Covered Carport"]'::jsonb,
    true,
    'available'
),
(
    'prop-banana-duplex-02',
    'The Royal Horizon Luxury Duplex Mansion',
    'Located in the most prestigious private enclave of Banana Island. Boasting timeless contemporary lines, triple-height foyer, custom chef kitchen with German appliances, temperature-controlled wine cellar, and rooftop entertainment terrace.',
    920000000,
    '₦',
    'Zone A, Banana Island, Ikoyi, Lagos',
    'Ikoyi',
    'Lagos',
    'buy',
    'Duplex',
    5,
    6,
    850,
    '["/src/assets/images/villa_lekki_facade_1793350588492.jpg"]'::jsonb,
    '["Gated Island Security", "Rooftop Lounge", "German Miele Appliances", "Wine Cellar", "Solar Power System", "Fitted Gym", "Private Elevator"]'::jsonb,
    true,
    'available'
),
(
    'prop-vi-penthouse-03',
    'Azure Sky Penthouse with Marina Panorama',
    'An executive penthouse residence perched high above Victoria Island with unhindered 270-degree views of the Atlantic marina and Lagos city skyline. Features custom designer appointments, open-concept lounge, and 24/7 concierge service.',
    45000000,
    '₦',
    'Ahmadu Bello Way, Victoria Island, Lagos',
    'Victoria Island',
    'Lagos',
    'rent',
    'Penthouse',
    4,
    5,
    480,
    '["/src/assets/images/apartment_penthouse_1793350588439.jpg"]'::jsonb,
    '["Panoramic Marina View", "Concierge & Valet", "Private Keycard Elevator", "High-Speed Fiber", "Central AC", "Communal Olympic Pool", "Tennis Courts"]'::jsonb,
    true,
    'available'
),
(
    'prop-maitama-terrace-04',
    'The Grand Cedar Contemporary Terrace',
    'A bespoke 4-bedroom luxury townhouse located in the diplomatic heart of Maitama, Abuja. Highlights include natural cedar wood louvers, double volume dining area, solar energy backup, private manicured front lawn, and dedicated security post.',
    380000000,
    '₦',
    'Mississippi Street, Maitama District, Abuja',
    'Maitama',
    'Abuja',
    'buy',
    'Terrace',
    4,
    4,
    390,
    '["/src/assets/images/suburban_residence_1793350589703.jpg"]'::jsonb,
    '["Diplomatic Security Zone", "Solar Hybrid Power", "Cedar Louvers", "Fitted Kitchen", "Private Walkway", "Water Treatment System"]'::jsonb,
    false,
    'available'
),
(
    'prop-vi-commercial-05',
    'Axis One Prime Corporate Office Floor',
    'Premier grade-A commercial office space in Victoria Island’s central business core. Features energy-efficient glass facade, flexible open layout ready for corporate partitioning, 4 high-speed destination lifts, and full power redundancy.',
    65000000,
    '₦',
    'Adeola Odeku Street, Victoria Island, Lagos',
    'Victoria Island',
    'Lagos',
    'rent',
    'Commercial',
    0,
    8,
    1200,
    '["/src/assets/images/commercial_office_tower_1793350589226.jpg"]'::jsonb,
    '["Grade-A Corporate Tower", "4 High-Speed Lifts", "Dual 1000kVA Generators", "Underground Dedicated Parking", "Fiber Backbone", "24/7 Security"]'::jsonb,
    false,
    'available'
)
ON CONFLICT (id) DO NOTHING;
