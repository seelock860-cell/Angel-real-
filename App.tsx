import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PropertyCard } from './components/PropertyCard';
import { PropertyFilters } from './components/PropertyFilters';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { SellPropertyModal } from './components/SellPropertyModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { WhatsAppFloat } from './components/WhatsAppFloat';

import { Property, Enquiry, PropertyFilterState } from './types/property';
import { fetchProperties, fetchEnquiries } from './lib/supabase';
import { INITIAL_PROPERTIES } from './data/initialProperties';
import { Building, Sparkles, PhoneCall, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { getWhatsAppUrl, WHATSAPP_DISPLAY_NUMBER } from './lib/whatsapp';

export default function App() {
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseActive, setIsSupabaseActive] = useState(false);

  // Filter State
  const [filter, setFilter] = useState<PropertyFilterState>({
    search: '',
    listing_type: 'all',
    property_type: '',
    bedrooms: 'all',
    max_price: 'all',
    sort_by: 'featured'
  });

  // Modal states
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);

  const propertiesSectionRef = useRef<HTMLDivElement>(null);

  // Load Data
  const loadData = async () => {
    try {
      const [propRes, enqRes] = await Promise.all([
        fetchProperties(),
        fetchEnquiries()
      ]);

      if (propRes.data && propRes.data.length > 0) {
        setProperties(propRes.data);
      }
      setIsSupabaseActive(propRes.isFromSupabase);

      if (enqRes.data) {
        setEnquiries(enqRes.data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Check URL hash for hidden admin access (#/admin or #admin or #/dashboard)
    const checkHashRoute = () => {
      const hash = window.location.hash.toLowerCase().trim();
      if (
        hash === '#/admin' || 
        hash === '#admin' || 
        hash === '#/dashboard' || 
        hash === '#dashboard'
      ) {
        setIsAdminOpen(true);
      }
    };

    checkHashRoute();
    window.addEventListener('hashchange', checkHashRoute);
    return () => window.removeEventListener('hashchange', checkHashRoute);
  }, []);

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    const hash = window.location.hash.toLowerCase();
    if (hash.includes('admin') || hash.includes('dashboard')) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  const handleFilterUpdate = (updates: Partial<PropertyFilterState>) => {
    setFilter(prev => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilter({
      search: '',
      listing_type: 'all',
      property_type: '',
      bedrooms: 'all',
      max_price: 'all',
      sort_by: 'featured'
    });
  };

  const scrollToProperties = () => {
    const el = document.getElementById('properties');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigate = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filter & Sort Logic
  const filteredProperties = useMemo(() => {
    return properties.filter(prop => {
      // Listing type (buy / rent / all)
      if (filter.listing_type !== 'all' && prop.listing_type !== filter.listing_type) {
        return false;
      }

      // Keyword / Location search
      if (filter.search.trim()) {
        const query = filter.search.toLowerCase().trim();
        const matchesTitle = prop.title.toLowerCase().includes(query);
        const matchesLocation = prop.location.toLowerCase().includes(query);
        const matchesType = prop.property_type.toLowerCase().includes(query);
        const matchesCity = prop.city ? prop.city.toLowerCase().includes(query) : false;
        if (!matchesTitle && !matchesLocation && !matchesType && !matchesCity) {
          return false;
        }
      }

      // Property type
      if (filter.property_type && filter.property_type !== 'All Types') {
        if (prop.property_type.toLowerCase() !== filter.property_type.toLowerCase()) {
          return false;
        }
      }

      // Bedrooms
      if (filter.bedrooms !== 'all') {
        if (prop.bedrooms < Number(filter.bedrooms)) {
          return false;
        }
      }

      // Max price
      if (filter.max_price !== 'all') {
        if (prop.price > Number(filter.max_price)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (filter.sort_by === 'featured') {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (filter.sort_by === 'price-asc') {
        return a.price - b.price;
      }
      if (filter.sort_by === 'price-desc') {
        return b.price - a.price;
      }
      if (filter.sort_by === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return 0;
    });
  }, [properties, filter]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. Header Navigation */}
      <Navbar
        onFilterChange={(type) => handleFilterUpdate({ listing_type: type })}
        activeListingType={filter.listing_type}
        onNavigate={handleNavigate}
      />

      <main className="flex-1">
        {/* 2. Hero Section with Background & Search Console */}
        <div id="hero">
          <Hero
            filter={filter}
            onFilterChange={handleFilterUpdate}
            onSearchSubmit={scrollToProperties}
            onExploreClick={scrollToProperties}
          />
        </div>

        {/* 3. Featured / Available Properties Section */}
        <section id="properties" ref={propertiesSectionRef} className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
                <Building className="w-3.5 h-3.5" />
                <span>Prime Portfolio</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                Featured Properties
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Explore handpicked luxury villas, penthouses, duplexes, and commercial developments available for purchase and lease.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSellModalOpen(true)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 shadow-2xs transition-colors cursor-pointer"
              >
                List Your Property
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <PropertyFilters
            filter={filter}
            onFilterChange={handleFilterUpdate}
            onReset={handleResetFilters}
            totalResults={filteredProperties.length}
          />

          {/* Properties Grid */}
          {filteredProperties.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm">
              <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 mb-1">No Properties Found</h3>
              <p className="text-xs text-slate-500 mb-4">
                No active properties match your current filter criteria. Try resetting or selecting a broader search area.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onViewDetails={(prop) => setSelectedProperty(prop)}
                />
              ))}
            </div>
          )}
        </section>

        {/* 4. "Sell With Us" Conversion Section */}
        <section id="sell-section" className="py-16 bg-blue-900 text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="bg-gradient-to-r from-blue-950 via-slate-950 to-blue-900 rounded-3xl p-8 sm:p-12 border border-blue-800 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="max-w-xl space-y-4">
                <span className="text-xs uppercase tracking-widest text-blue-400 font-bold block">
                  For Property Owners & Developers
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  Looking to Sell or Lease Your Luxury Property?
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Angle Real Estate connects luxury property owners directly with qualified private buyers, institutional investors, and multinational tenants. Enjoy comprehensive marketing, drone photography, and verified escrow transactions.
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Free Professional Valuation</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Private Buyer Pool</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>0% Upfront Listing Cost</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => setIsSellModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  <span>Submit Property for Listing</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href={getWhatsAppUrl("Hello Angle Real Estate, I am a property owner looking to list a property with your agency.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>WhatsApp Acquisition Desk</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Company Credibility & About Section */}
        <AboutSection
          onExploreClick={scrollToProperties}
          onOpenSellModal={() => setIsSellModalOpen(true)}
        />

        {/* 6. Contact Section with WhatsApp line 09023971419 */}
        <ContactSection />
      </main>

      {/* 7. Corporate Footer */}
      <Footer
        onNavigate={handleNavigate}
        onFilterChange={(type) => handleFilterUpdate({ listing_type: type })}
      />

      {/* 8. Floating WhatsApp Action Button */}
      <WhatsAppFloat />

      {/* MODALS */}
      <PropertyDetailModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
      />

      <SellPropertyModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
      />

      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={handleCloseAdmin}
        properties={properties}
        enquiries={enquiries}
        onRefreshData={loadData}
      />
    </div>
  );
}
