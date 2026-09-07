import React from 'react';
import { Tag, MapPin, ShieldCheck, Sparkles, Flame } from 'lucide-react';
import { CATEGORIES } from '../constants';

export function HeroBanner({ selectedCategory, onSelectCategory, onFilterDiscount }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-orange-600 via-amber-600 to-amber-700 text-white shadow-xl shadow-orange-950/10 mb-8">
      {/* Background Graphic elements */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 bg-orange-400/20 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-4 text-orange-100 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Lovely Professional University • Campus Thrift Hub</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-3">
            LPU Hostellers Clothes & Uniform Marketplace
          </h1>
          
          <p className="text-sm sm:text-base text-orange-100 font-normal leading-relaxed mb-6">
            Buy & sell winter hoodies, placement blazers, chemistry lab coats, and streetwear directly with fellow students.
            Save up to <strong>75% OFF</strong> retail prices. Handover right at your hostel gate or UniMall!
          </p>

          {/* Value Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-xs px-3 py-2 rounded-xl text-xs">
              <Tag className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Huge Student Discounts</span>
            </div>
            <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-xs px-3 py-2 rounded-xl text-xs">
              <MapPin className="w-4 h-4 text-orange-300 shrink-0" />
              <span>BH, GH & UniMall Pickup</span>
            </div>
            <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-xs px-3 py-2 rounded-xl text-xs col-span-2 sm:col-span-1">
              <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>100% LPU Verified Sellers</span>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/15">
            <span className="text-xs font-semibold text-orange-200">Hot Deals:</span>
            <button
              onClick={() => onFilterDiscount(70)}
              className="inline-flex items-center space-x-1 bg-amber-400 text-orange-950 text-xs font-bold px-3 py-1 rounded-full hover:bg-amber-300 transition-colors shadow-xs"
            >
              <Flame className="w-3 h-3 text-orange-600" />
              <span>70%+ OFF Deals</span>
            </button>
            <button
              onClick={() => onSelectCategory('hoodies')}
              className="bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1 rounded-full transition-colors"
            >
              Punjab Winter Hoodies
            </button>
            <button
              onClick={() => onSelectCategory('formals')}
              className="bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1 rounded-full transition-colors"
            >
              Placement Blazers
            </button>
            <button
              onClick={() => onSelectCategory('labcoats')}
              className="bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1 rounded-full transition-colors"
            >
              Lab Coats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
