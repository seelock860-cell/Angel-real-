# ANGLE REAL ESTATE

> **"Find a Place to Call Home."**  
> Premium real estate website for buying, selling, and renting luxury residential and commercial properties in Nigeria.

---

## 🏢 Company Profile

- **Company Name**: ANGLE REAL ESTATE
- **Core Operations**: Buying, selling, and renting luxury residential villas, duplexes, penthouses, and commercial developments.
- **WhatsApp Concierge**: `09023971419` (International: `+234 902 397 1419` / `2349023971419`)
- **Brand Palette**: Corporate Blue & Crisp White
- **Target Regions**: Lekki Phase 1, Banana Island, Ikoyi, Victoria Island, Maitama Abuja, and prime commercial corridors.

---

## 🚀 Key Features

### 1. Modern Architectural Homepage
- High-impact hero section with panoramic luxury villa photography.
- Prominent headline: **"Find a Place to Call Home."**
- Fast-filter search console by Listing Intent (Buy / Rent / All), Location, Property Type, and Bedrooms.
- Responsive top navigation following the strict 3-zone contract with Angle Real Estate wordmark and quick WhatsApp access.

### 2. Comprehensive Property Management & Catalog
- **Property Details**: High-resolution imagery, pricing with thousand-separator formatting, locations, bedrooms, bathrooms, and square footage.
- **Dynamic Filters**: Instant client-side filtering by Buy / Rent / Sell, property category (Villa, Duplex, Penthouse, Terrace, Commercial, Land), price thresholds, and bedroom counts.
- **Rich Modal Inspector**: Image carousel, amenities checklist (Infinity pool, 24/7 CCTV, Smart home automation, etc.), mortgage & rental structure calculator, and instant inspection scheduling.

### 3. Direct WhatsApp Integration
- Automatic WhatsApp click-to-chat links throughout the website.
- **Pre-filled Enquiries**: Clicking **"Enquire"** on any property generates an automated WhatsApp message specifying the property's name, location, price, and reference ID directed straight to `09023971419`.
- **Floating WhatsApp Widget**: Persistent floating chat button with instant customer callout.
- **Admin Direct Reply**: Admins can reply to web leads directly via WhatsApp in one click from the dashboard.

### 4. Secure Admin Dashboard
- **Admin Username**: `angle`
- **Dashboard Capabilities**:
  - Upload new properties with custom photos or high-fidelity architectural presets.
  - Edit property details, descriptions, and amenities.
  - Update listing prices in real-time.
  - Manage availability status (`Available`, `Reserved`, `Sold`).
  - Delete listings with confirmation safety.
  - View, organize, and reply to client enquiries.
  - Metric counters for Total Properties, Properties For Sale, Properties For Rent, and Portfolio Valuation.

### 5. Supabase Integration
- Built-in Supabase configuration panel inside the Admin Dashboard.
- Allows entering **Supabase Project URL** and **Publishable (Anon) API Key**.
- Live **Test Connection** button.
- **Push Local Catalog to Supabase** synchronizer.
- Complete **Row Level Security (RLS)** protecting all tables.
- Provided `supabase_schema.sql` ready to run in the Supabase SQL Editor.
- Built-in local persistence fallback so the website functions 100% out of the box even before database keys are entered!

---

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Database & Auth**: `@supabase/supabase-js`
- **Deployment**: Vercel ready (`vercel.json`)

---

## 🗄️ Supabase Setup Instructions

1. Log in to [Supabase](https://supabase.com) and create a new project.
2. Navigate to **SQL Editor** > **New Query**.
3. Open `supabase_schema.sql` from this repository (or copy it directly from the Admin Dashboard > Supabase Integration tab).
4. Run the SQL script. This will create:
   - `public.properties` table with RLS enabled.
   - `public.enquiries` table with RLS enabled.
   - Storage bucket `property-images` with public read policies.
   - Seed data with 5 luxury properties.
5. In your Supabase Dashboard, go to **Project Settings** > **API**.
6. Copy your **Project URL** and **anon public Key**.
7. Access the secret Admin Dashboard by adding `#/admin` to your website URL, paste the credentials under **Supabase Integration** and click **Save Configuration** & **Test Connection**.

## 🛠️ Secret Admin Dashboard Access

The admin button is completely hidden from the public website for security and privacy.

- **Access URL**: Add `#/admin` (or `#/dashboard`) to your browser URL:
  ```
  https://your-domain.com/#/admin
  ```
- Opening this URL directly brings up the full administrative console to manage listings, upload property pictures, edit prices, review customer enquiries, and sync database records.

---

## 📦 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Build for production
npm run build
```

---

## ☁️ Vercel Deployment

1. Push this repository to GitHub or GitLab.
2. Import the project into [Vercel](https://vercel.com).
3. Vercel will automatically detect the Vite framework and use settings from `vercel.json`:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In Vercel Project Settings > **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = your Supabase URL (optional, can also be set via Admin UI)
   - `VITE_SUPABASE_ANON_KEY` = your Supabase Anon Key (optional, can also be set via Admin UI)
   - `VITE_WHATSAPP_NUMBER` = `2349023971419`
5. Click **Deploy**.
