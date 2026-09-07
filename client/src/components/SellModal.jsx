import React, { useState, useMemo } from 'react';
import { X, Upload, Tag, MapPin, Sparkles, AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, LPU_HOSTELS, SIZES, CONDITIONS, CAMPUS_PICKUP_SPOTS } from '../constants';

export function SellModal({ onClose, onProductCreated, onOpenAuth }) {
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('hoodies');
  const [gender, setGender] = useState('unisex');
  const [size, setSize] = useState('L');
  const [condition, setCondition] = useState('Like New (Worn Once/Twice)');
  const [originalPrice, setOriginalPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [hostelBlock, setHostelBlock] = useState(user?.hostel || 'BH-1');
  const [pickupLocation, setPickupLocation] = useState('UniMall Entrance / Food Court');
  const [customPickup, setCustomPickup] = useState('');
  const [imageUrls, setImageUrls] = useState([
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80'
  ]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Live Auto Discount Calculator
  const discountCalculation = useMemo(() => {
    const orig = parseFloat(originalPrice);
    const sell = parseFloat(sellingPrice);

    if (isNaN(orig) || isNaN(sell) || orig <= 0 || sell <= 0) {
      return { valid: false, text: 'Enter prices to calculate student discount' };
    }

    if (sell > orig) {
      return { valid: false, error: true, text: 'Selling price cannot be higher than original MRP!' };
    }

    const discountPercent = Math.round(((orig - sell) / orig) * 100);
    const savings = orig - sell;

    return {
      valid: true,
      error: false,
      percent: discountPercent,
      savings: savings,
      text: `${discountPercent}% OFF (Buyer saves ₹${savings.toLocaleString('en-IN')})`
    };
  }, [originalPrice, sellingPrice]);

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setErrorMsg('');

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      const res = await fetch('/api/products/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setImageUrls(prev => [...prev.filter(url => !url.includes('unsplash')), ...data.urls]);
    } catch (err) {
      setErrorMsg('Image upload failed. You can paste an image URL directly.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddCustomUrl = () => {
    if (customImageUrl.trim()) {
      setImageUrls(prev => [customImageUrl.trim(), ...prev]);
      setCustomImageUrl('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user) {
      setErrorMsg('Please log in with your LPU account to post a listing.');
      return;
    }

    if (!title.trim() || !originalPrice || !sellingPrice) {
      setErrorMsg('Please complete all mandatory fields.');
      return;
    }

    if (!discountCalculation.valid || discountCalculation.error) {
      setErrorMsg('Please check your prices. Selling price must be less than or equal to MRP.');
      return;
    }

    const finalPickup = customPickup.trim() || pickupLocation;

    setSubmitting(true);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          gender,
          size,
          condition,
          originalPrice: Number(originalPrice),
          sellingPrice: Number(sellingPrice),
          pickupLocation: finalPickup,
          hostelBlock,
          images: imageUrls,
          sellerId: user.id
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to list product');

      setSuccessMsg('Product listed successfully on LPU Campus Closet!');
      setTimeout(() => {
        if (onProductCreated) onProductCreated(data.product);
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-slate-900">LPU Student Login Required</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            To maintain a safe and spam-free campus thrift environment, only verified Lovely Professional University students can list clothes for sale.
          </p>
          <div className="pt-2 flex gap-3 justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs"
            >
              Sign In with LPU ID
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 my-8">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-linear-to-r from-orange-50/50 to-white">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-orange-600 uppercase bg-orange-100/80 px-2 py-0.5 rounded">
              LPU Student Marketplace
            </span>
            <h2 className="text-lg font-black text-slate-900 mt-1">
              List Clothes For Sale
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors font-bold cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Item Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., LPU UniMall Winter Hoodie, Placement Blazer, Chemistry Apron..."
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          {/* Category & Gender & Size */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
              >
                {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Gender *
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
              >
                <option value="unisex">Unisex</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Size *
              </label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
              >
                {SIZES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Wear Condition *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CONDITIONS.map(cond => (
                <button
                  type="button"
                  key={cond}
                  onClick={() => setCondition(cond)}
                  className={`p-2 rounded-xl text-xs font-semibold text-center border transition-all ${
                    condition === cond
                      ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cond.split(' ')[0]} {cond.split(' ')[1] || ''}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing & LIVE SMART DISCOUNT CALCULATOR */}
          <div className="bg-linear-to-r from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-orange-950 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-orange-600" />
                <span>Price & Smart Discount Calculator</span>
              </span>
              <span className="text-[11px] font-semibold text-orange-700 bg-white/80 px-2 py-0.5 rounded-md">
                Auto-calculated
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Original MRP / Retail Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="e.g. 1999"
                  className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Selling Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  placeholder="e.g. 599"
                  className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Live Discount Preview Badge */}
            <div className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
              discountCalculation.valid && !discountCalculation.error
                ? 'bg-emerald-600 text-white shadow-sm'
                : discountCalculation.error
                ? 'bg-red-600 text-white'
                : 'bg-white text-slate-500 border border-slate-200'
            }`}>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>{discountCalculation.text}</span>
              </div>
              {discountCalculation.valid && !discountCalculation.error && (
                <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] font-black">
                  GREAT DEAL FOR STUDENTS
                </span>
              )}
            </div>
          </div>

          {/* LPU Hostel & Handover Spot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Your Hostel Block *
              </label>
              <select
                value={hostelBlock}
                onChange={(e) => setHostelBlock(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
              >
                {LPU_HOSTELS.filter(h => h.id !== 'all').map(h => (
                  <option key={h.id} value={h.id}>{h.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Preferred Handover Spot *
              </label>
              <select
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
              >
                {CAMPUS_PICKUP_SPOTS.map(spot => (
                  <option key={spot} value={spot}>{spot}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Photos Upload & Preview */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Item Photos (Upload or Paste URL)
            </label>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* File upload input */}
              <label className="flex-1 border-2 border-dashed border-slate-200 hover:border-orange-400 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50 hover:bg-orange-50/20">
                <Upload className="w-5 h-5 text-orange-600 mb-1" />
                <span className="text-xs font-bold text-slate-800">Choose images from device</span>
                <span className="text-[10px] text-slate-400">JPG, PNG, WebP up to 10MB</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>

              {/* Or paste image URL */}
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Or add Image Link:</span>
                </span>
                <div className="flex gap-1.5 mt-2">
                  <input
                    type="url"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="flex-1 text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomUrl}
                    className="bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-slate-800 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Previews */}
            {imageUrls.length > 0 && (
              <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrls(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 w-4 h-4 bg-black/70 text-white rounded-full text-[10px] flex items-center justify-center font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description / Notes for Buyer
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mention details like fitting, fabric, when it was worn (e.g., during placement or youth festival), reason for selling..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-slate-600 hover:text-slate-800 px-4 py-2 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-orange-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Publishing...' : 'List Item on LPU Market'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
