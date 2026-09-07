import React from 'react';
import { MapPin, Tag, MessageCircle, Eye, ShieldCheck, Clock } from 'lucide-react';

export function ProductCard({ product, onSelect, onReserve }) {
  const isAvailable = product.status === 'available';
  const isReserved = product.status === 'reserved';
  const isSold = product.status === 'sold';

  const savings = product.originalPrice - product.sellingPrice;

  // WhatsApp link generator
  const whatsappUrl = `https://wa.me/91${product.sellerPhone}?text=${encodeURIComponent(
    `Hi ${product.sellerName}! I saw your listing "${product.title}" for ₹${product.sellingPrice} on LPU Campus Closet. Is it still available to meet up at ${product.pickupLocation}?`
  )}`;

  return (
    <div className={`group bg-white rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 ${
      isSold ? 'border-slate-200 opacity-75' : 'border-slate-200/80 hover:border-orange-300'
    }`}>
      
      {/* Image Thumbnail Container */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden cursor-pointer" onClick={() => onSelect(product)}>
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80';
          }}
        />

        {/* Status Badge */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {isSold ? (
            <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
              SOLD OUT
            </span>
          ) : isReserved ? (
            <span className="bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <Clock className="w-3 h-3" /> RESERVED
            </span>
          ) : (
            <span className="bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
              AVAILABLE
            </span>
          )}

          {/* Condition Tag */}
          <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow-xs w-fit">
            {product.condition}
          </span>
        </div>

        {/* Discount Badge */}
        {product.discountPercent > 0 && (
          <div className="absolute top-2.5 right-2.5 bg-linear-to-r from-red-600 to-orange-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-lg flex items-center space-x-1">
            <span>{product.discountPercent}% OFF</span>
          </div>
        )}

        {/* Hostel Tag overlay */}
        <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-md text-[11px] font-semibold text-slate-800 flex items-center gap-1 shadow-sm border border-slate-100">
          <MapPin className="w-3 h-3 text-orange-600" />
          <span>{product.hostelBlock}</span>
        </div>

        {/* View count */}
        <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] text-white flex items-center gap-1">
          <Eye className="w-3 h-3" />
          <span>{product.views || 1}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Size */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold uppercase tracking-wider text-orange-600 text-[10px]">
              {product.category}
            </span>
            <span className="bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-700 text-[11px]">
              Size: {product.size}
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelect(product)}
            className="text-sm font-bold text-slate-900 line-clamp-2 hover:text-orange-600 cursor-pointer transition-colors leading-snug mb-2"
          >
            {product.title}
          </h3>

          {/* Pricing Row */}
          <div className="bg-orange-50/60 rounded-xl p-2.5 mb-3 border border-orange-100/80">
            <div className="flex items-baseline space-x-2">
              <span className="text-xl font-extrabold text-slate-900">
                ₹{product.sellingPrice}
              </span>
              {product.originalPrice > product.sellingPrice && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
            {savings > 0 && (
              <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                🎉 Save ₹{savings} ({product.discountPercent}% cheaper than MRP)
              </p>
            )}
          </div>

          {/* Handover Spot */}
          <p className="text-xs text-slate-600 flex items-center gap-1.5 mb-3">
            <span className="text-slate-400 text-[11px]">Meetup:</span>
            <span className="font-medium text-slate-800 truncate">{product.pickupLocation}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
          <button
            onClick={() => onSelect(product)}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-3 rounded-xl transition-colors cursor-pointer text-center"
          >
            Details & Reserve
          </button>
          
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Chat with LPU Seller on WhatsApp"
            className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl transition-colors shrink-0 flex items-center justify-center shadow-xs"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
        </div>

      </div>
    </div>
  );
}
