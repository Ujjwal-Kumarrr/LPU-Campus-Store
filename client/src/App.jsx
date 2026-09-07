import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { FiltersSidebar } from './components/FiltersSidebar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { SellModal } from './components/SellModal';
import { MyListingsModal } from './components/MyListingsModal';
import { AuthModal } from './components/AuthModal';
import { CATEGORIES } from './constants';
import { ShoppingBag, Sparkles, Filter, ShieldCheck, Heart, AlertCircle, RefreshCw } from 'lucide-react';

function MarketplaceApp() {
  const { user } = useAuth();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedHostel, setSelectedHostel] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [minDiscount, setMinDiscount] = useState(0);
  const [sortOption, setSortOption] = useState('newest');

  // Mobile Filters Drawer
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Products Data
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [activeProduct, setActiveProduct] = useState(null);
  const [isSellOpen, setIsSellOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMyListingsOpen, setIsMyListingsOpen] = useState(false);

  // Fetch products from server
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedHostel !== 'all') params.append('hostel', selectedHostel);
      if (selectedSize !== 'all') params.append('size', selectedSize);
      if (minDiscount > 0) params.append('minDiscount', minDiscount);
      if (sortOption) params.append('sort', sortOption);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to fetch campus clothes');
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search / fetch
    const timeout = setTimeout(() => {
      fetchProducts();
    }, 200);
    return () => clearTimeout(timeout);
  }, [searchQuery, selectedCategory, selectedHostel, selectedSize, minDiscount, sortOption]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedHostel('all');
    setSelectedSize('all');
    setMinDiscount(0);
    setSearchQuery('');
    setSortOption('newest');
  };

  const handleProductCreated = (newProduct) => {
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-orange-500 selection:text-white">
      
      {/* Navigation */}
      <Navbar
        onOpenSell={() => setIsSellOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenMyListings={() => setIsMyListingsOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        
        {/* Hero Section */}
        <HeroBanner
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          onFilterDiscount={(disc) => setMinDiscount(disc)}
        />

        {/* Category Horizontal Scroll Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer shrink-0 ${
                  active
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20 scale-105'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden flex items-center justify-between mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-xl text-xs font-bold text-slate-800 border border-slate-200 shadow-xs"
          >
            <Filter className="w-3.5 h-3.5 text-orange-600" />
            <span>Filter Hostels & Discounts</span>
          </button>

          <span className="text-xs text-slate-500 font-semibold">
            {products.length} {products.length === 1 ? 'item' : 'items'} available
          </span>
        </div>

        {/* Main Grid: Sidebar + Product Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 sticky top-20">
            <FiltersSidebar
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedHostel={selectedHostel}
              setSelectedHostel={setSelectedHostel}
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              minDiscount={minDiscount}
              setMinDiscount={setMinDiscount}
              sortOption={sortOption}
              setSortOption={setSortOption}
              onReset={handleResetFilters}
            />
          </aside>

          {/* Mobile Filters Modal/Drawer */}
          {showMobileFilters && (
            <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 p-4 flex flex-col justify-end">
              <div className="bg-white rounded-3xl p-5 max-h-[85vh] overflow-y-auto space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <h3 className="text-sm font-bold text-slate-900">Campus Filters</h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="text-xs font-bold text-slate-500"
                  >
                    Done
                  </button>
                </div>
                <FiltersSidebar
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  selectedHostel={selectedHostel}
                  setSelectedHostel={setSelectedHostel}
                  selectedSize={selectedSize}
                  setSelectedSize={setSelectedSize}
                  minDiscount={minDiscount}
                  setMinDiscount={setMinDiscount}
                  sortOption={sortOption}
                  setSortOption={setSortOption}
                  onReset={handleResetFilters}
                />
              </div>
            </div>
          )}

          {/* Products Feed */}
          <div className="lg:col-span-3">
            
            {/* Results Header */}
            <div className="hidden lg:flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-extrabold text-slate-900">
                  {selectedCategory === 'all' ? 'All Campus Apparel' : CATEGORIES.find(c => c.id === selectedCategory)?.label}
                </h2>
                {selectedHostel !== 'all' && (
                  <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-0.5 rounded-md">
                    📍 {selectedHostel}
                  </span>
                )}
                {minDiscount > 0 && (
                  <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded-md">
                    🔥 {minDiscount}%+ OFF
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Showing <strong>{products.length}</strong> items from LPU hostellers
              </span>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="py-20 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-500">Checking campus closet listings...</p>
              </div>
            )}

            {/* Error State */}
            {!loading && error && (
              <div className="p-6 bg-red-50 border border-red-200 rounded-3xl text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
                <p className="text-sm font-bold text-red-800">{error}</p>
                <button
                  onClick={fetchProducts}
                  className="bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Retry Loading
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && products.length === 0 && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 shadow-xs">
                <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  No clothes found matching this criteria
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Try lowering the discount threshold, selecting "All Campus Hostels", or clearing the search query.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Product Cards Grid */}
            {!loading && !error && products.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={(p) => setActiveProduct(p)}
                    onReserve={(p) => setActiveProduct(p)}
                  />
                ))}
              </div>
            )}

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-10 mt-16 text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-xs">
                  LPU
                </div>
                <span className="font-extrabold text-slate-900 text-sm">LPU Campus Closet</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Empowering Lovely Professional University students to buy & sell pre-loved clothing, winter gear, and college lab aprons safely within campus.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Popular Categories</h4>
              <ul className="text-xs space-y-2 text-slate-500">
                <li className="hover:text-orange-600 cursor-pointer" onClick={() => setSelectedCategory('hoodies')}>Winter Hoodies & Fleece</li>
                <li className="hover:text-orange-600 cursor-pointer" onClick={() => setSelectedCategory('formals')}>Placement Blazers & Suits</li>
                <li className="hover:text-orange-600 cursor-pointer" onClick={() => setSelectedCategory('labcoats')}>Pharmacy & Chemistry Lab Coats</li>
                <li className="hover:text-orange-600 cursor-pointer" onClick={() => setSelectedCategory('footwear')}>Campus Sneakers & Shoes</li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Campus Pickup Locations</h4>
              <ul className="text-xs space-y-2 text-slate-500">
                <li>UniMall Central Plaza</li>
                <li>Boys Hostels (BH-1 to BH-8) Gates</li>
                <li>Girls Hostels (GH-1 to GH-6) Reception</li>
                <li>Block 34 Tuck Shop & Block 38 Library</li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Hosteller Safety Notice</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Always meet in open campus public spots (UniMall, Food Court, or Hostel Security Gates). Inspect fitting before paying via UPI/Cash.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
            <span>© 2026 LPU Campus Closet • Lovely Professional University, Phagwara, Punjab.</span>
            <span>Made with ❤️ for LPU Hostellers & Day Scholars</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {activeProduct && (
        <ProductDetailModal
          product={activeProduct}
          onClose={() => setActiveProduct(null)}
          onReserveSuccess={() => {
            fetchProducts();
          }}
        />
      )}

      {isSellOpen && (
        <SellModal
          onClose={() => setIsSellOpen(false)}
          onProductCreated={handleProductCreated}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      )}

      {isMyListingsOpen && (
        <MyListingsModal
          onClose={() => setIsMyListingsOpen(false)}
          onUpdate={fetchProducts}
        />
      )}

      {isAuthOpen && (
        <AuthModal
          onClose={() => setIsAuthOpen(false)}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MarketplaceApp />
    </AuthProvider>
  );
}
