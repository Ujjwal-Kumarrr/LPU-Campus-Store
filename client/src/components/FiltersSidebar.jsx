import React from 'react';
import { CATEGORIES, LPU_HOSTELS, SIZES } from '../constants';
import { Filter, RotateCcw, Flame, Check } from 'lucide-react';

export function FiltersSidebar({
  selectedCategory,
  setSelectedCategory,
  selectedHostel,
  setSelectedHostel,
  selectedSize,
  setSelectedSize,
  minDiscount,
  setMinDiscount,
  sortOption,
  setSortOption,
  onReset
}) {
  const isFiltered = selectedCategory !== 'all' || selectedHostel !== 'all' || selectedSize !== 'all' || minDiscount > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
          <Filter className="w-4 h-4 text-orange-600" />
          <span>Filters</span>
        </div>
        {isFiltered && (
          <button
            onClick={onReset}
            className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Sorting */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Sort By
        </label>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
        >
          <option value="newest">Fresh Listings (Newest First)</option>
          <option value="discount-high">Maximum Discount (Highest %)</option>
          <option value="price-low">Price: Low to High (Budget Friendly)</option>
          <option value="price-high">Price: High to Low</option>
          <option value="popular">Most Viewed on Campus</option>
        </select>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Category
        </label>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                  active
                    ? 'bg-orange-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{cat.label}</span>
                {active && <Check className="w-3 h-3 text-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Campus Hostel / Area Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          LPU Hostel / Location
        </label>
        <select
          value={selectedHostel}
          onChange={(e) => setSelectedHostel(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
        >
          {LPU_HOSTELS.map((h) => (
            <option key={h.id} value={h.id}>
              {h.label}
            </option>
          ))}
        </select>
      </div>

      {/* Minimum Discount Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-600" />
            <span>Min Discount</span>
          </label>
          <span className="text-xs font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
            {minDiscount > 0 ? `${minDiscount}%+ OFF` : 'Any Price'}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="80"
          step="10"
          value={minDiscount}
          onChange={(e) => setMinDiscount(Number(e.target.value))}
          className="w-full accent-orange-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-1 mt-1">
          <span>All</span>
          <span>50%</span>
          <span>60%</span>
          <span>70%+</span>
        </div>
      </div>

      {/* Size Picker */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Filter by Size
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedSize('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedSize === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {SIZES.map((sz) => (
            <button
              key={sz}
              onClick={() => setSelectedSize(sz)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedSize === sz
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
