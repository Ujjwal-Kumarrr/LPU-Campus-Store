import React, { useState } from 'react';
import { X, MapPin, Tag, MessageCircle, Calendar, Eye, ShieldCheck, Share2, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function ProductDetailModal({ product, onClose, onReserveSuccess }) {
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [reserving, setReserving] = useState(false);
  const [reserveStep, setReserveStep] = useState('detail'); // 'detail' | 'form' | 'success'
  const [meetupSpot, setMeetupSpot] = useState(product.pickupLocation);
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  if (!product) return null;

  const isSold = product.status === 'sold';
  const isReserved = product.status === 'reserved';
  const savings = product.originalPrice - product.sellingPrice;

  // WhatsApp click-to-chat
  const whatsappUrl = `https://wa.me/91${product.sellerPhone}?text=${encodeURIComponent(
    `Hello ${product.sellerName}! I found your "${product.title}" on LPU Campus Closet for ₹${product.sellingPrice}. I am interested in buying it. Can we meet at ${product.pickupLocation}?`
  )}`;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReserveSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setErrorMsg('Please log in with your LPU account to reserve an item.');
      return;
    }

    setReserving(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/products/${product.id}/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: user.id,
          buyerName: user.name,
          buyerPhone: user.phone,
          buyerHostel: user.hostel,
          proposedMeetingSpot: meetupSpot,
          note
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit reservation');

      setReserveStep('success');
      if (onReserveSuccess) onReserveSuccess(data.reservation);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setReserving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-100 my-8">
        
        {/* Close & Share button */}
        <div className="absolute top-4 right-4 z-20 flex items-center space-x-2">
          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md flex items-center justify-center transition-all cursor-pointer"
            title="Copy link"
          >
            {copied ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md flex items-center justify-center transition-all cursor-pointer font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {reserveStep === 'detail' && (
          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* Left: Image Gallery */}
            <div className="bg-slate-900 flex flex-col justify-between p-4 sm:p-6 text-white">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-800 flex items-center justify-center">
                <img
                  src={product.images[selectedImage] || product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover object-center"
                />
                
                {product.discountPercent > 0 && (
                  <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">
                    {product.discountPercent}% OFF
                  </div>
                )}
              </div>

              {/* Multiple photo thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        selectedImage === idx ? 'border-orange-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Campus Meetup Notice */}
              <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Peer-to-peer campus exchange. Pay via UPI or Cash on delivery at LPU!</span>
              </div>
            </div>

            {/* Right: Product & Seller Details */}
            <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6 max-h-[85vh] overflow-y-auto">
              
              <div className="space-y-4">
                {/* Category & Status */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md">
                    {product.category}
                  </span>
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{product.views || 1} campus views</span>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                  {product.title}
                </h2>

                {/* Price Box with Instant Discount Calculation */}
                <div className="bg-linear-to-r from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100">
                  <div className="flex items-baseline space-x-3">
                    <span className="text-3xl font-black text-slate-900">
                      ₹{product.sellingPrice}
                    </span>
                    {product.originalPrice > product.sellingPrice && (
                      <span className="text-base text-slate-400 line-through">
                        MRP ₹{product.originalPrice}
                      </span>
                    )}
                    <span className="bg-red-600 text-white font-extrabold text-xs px-2.5 py-0.5 rounded-full">
                      SAVE {product.discountPercent}%
                    </span>
                  </div>
                  {savings > 0 && (
                    <p className="text-xs font-bold text-emerald-700 mt-1.5 flex items-center gap-1">
                      <span>💰 You save ₹{savings} compared to original retail price!</span>
                    </p>
                  )}
                </div>

                {/* Specs Pill Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Size</span>
                    <span className="font-bold text-slate-800">{product.size}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Condition</span>
                    <span className="font-bold text-slate-800">{product.condition}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Ideal For</span>
                    <span className="font-bold text-slate-800 capitalize">{product.gender}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Hostel Block</span>
                    <span className="font-bold text-slate-800">{product.hostelBlock}</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Seller Description
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    {product.description}
                  </p>
                </div>

                {/* Handover Spot */}
                <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-200/60 flex items-start space-x-2.5">
                  <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Preferred Meeting & Handover Spot</span>
                    <span className="text-xs text-slate-600">{product.pickupLocation}</span>
                  </div>
                </div>

                {/* Seller Card */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-extrabold flex items-center justify-center text-sm">
                      {product.sellerName ? product.sellerName.charAt(0) : 'S'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-900">{product.sellerName}</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          LPU Student
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono">Reg: {product.sellerRegNo || '12108452'}</p>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-slate-400 block">Location</span>
                    <span className="font-semibold text-slate-800">{product.hostelBlock}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                {isSold ? (
                  <div className="w-full py-3 bg-slate-100 text-slate-500 text-center font-bold text-sm rounded-2xl">
                    This item has been sold to another student
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    
                    {/* WhatsApp Direct Chat */}
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 rounded-2xl shadow-sm transition-all text-center"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Chat on WhatsApp</span>
                    </a>

                    {/* Reserve on Campus */}
                    <button
                      onClick={() => setReserveStep('form')}
                      className="inline-flex items-center justify-center space-x-2 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs py-3 px-4 rounded-2xl shadow-sm shadow-orange-500/20 transition-all cursor-pointer"
                    >
                      <Tag className="w-4 h-4" />
                      <span>Reserve Item (Hold)</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Step: Reservation Form */}
        {reserveStep === 'form' && (
          <form onSubmit={handleReserveSubmit} className="p-6 sm:p-8 space-y-5">
            <div>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Campus Hold Request</span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                Reserve "{product.title}"
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Let the seller know you'd like to meet up and buy this item for ₹{product.sellingPrice}.
              </p>
            </div>

            {errorMsg && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs font-semibold border border-red-100">
                {errorMsg}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Proposed Handover Spot at LPU
                </label>
                <input
                  type="text"
                  value={meetupSpot}
                  onChange={(e) => setMeetupSpot(e.target.value)}
                  placeholder="e.g. Outside UniMall or BH-4 Gate at 5 PM"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Message for Seller (Optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows="3"
                  placeholder="e.g., Can I inspect the fitting before paying? Will be available after my classes at 4:30 PM."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReserveStep('detail')}
                className="text-xs font-semibold text-slate-600 hover:text-slate-800 px-4 py-2"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={reserving}
                className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {reserving ? 'Submitting...' : 'Confirm Hold Request'}
              </button>
            </div>
          </form>
        )}

        {/* Step: Success Confirmation */}
        {reserveStep === 'success' && (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Hold Request Sent to Seller!
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Your request for <strong>{product.title}</strong> has been logged. For quickest response, we recommend sending a WhatsApp message right away to finalize the meetup time.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Open WhatsApp Chat Now</span>
              </a>
              <button
                onClick={onClose}
                className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-6 rounded-xl transition-colors cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
