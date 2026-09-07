import React, { useState, useEffect } from 'react';
import { X, Trash2, CheckCircle2, Clock, MapPin, MessageCircle, AlertCircle, ShoppingBag, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function MyListingsModal({ onClose, onUpdate }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('items'); // 'items' | 'requests'
  const [actionMsg, setActionMsg] = useState('');

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [resProducts, resReservations] = await Promise.all([
        fetch(`/api/products?sellerId=${user.id}`).then(r => r.json()),
        fetch(`/api/products/seller/reservations/${user.id}`).then(r => r.json())
      ]);

      setItems(resProducts.products || []);
      setReservations(Array.isArray(resReservations) ? resReservations : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleStatusChange = async (productId, newStatus) => {
    try {
      const res = await fetch(`/api/products/${productId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, sellerId: user.id })
      });
      if (res.ok) {
        setActionMsg(`Listing marked as ${newStatus.toUpperCase()}`);
        setTimeout(() => setActionMsg(''), 3000);
        loadData();
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to remove this listing?')) return;

    try {
      const res = await fetch(`/api/products/${productId}?sellerId=${user.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setActionMsg('Listing deleted successfully.');
        setTimeout(() => setActionMsg(''), 3000);
        loadData();
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-100 my-8">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Seller Dashboard & My Listings
              </h2>
              <p className="text-xs text-slate-500">
                Manage your campus apparel listings and buyer inquiries
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors font-bold cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-100 px-6 gap-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('items')}
            className={`py-3 relative cursor-pointer ${
              activeTab === 'items' ? 'text-orange-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>My Listed Items ({items.length})</span>
            {activeTab === 'items' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`py-3 relative cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'requests' ? 'text-orange-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Buyer Hold Requests ({reservations.length})</span>
            {reservations.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
            )}
            {activeTab === 'requests' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 rounded-full" />
            )}
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          
          {actionMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 font-medium">
              Loading your campus listings...
            </div>
          ) : activeTab === 'items' ? (
            items.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">You haven't listed any clothes yet!</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Have an old winter hoodie, lab apron, or shoes you no longer need? List them now to earn quick cash on campus.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map(item => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0 border"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 leading-tight">
                            {item.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <span className="font-bold text-slate-800">₹{item.sellingPrice}</span>
                          <span className="line-through text-slate-400 text-[11px]">₹{item.originalPrice}</span>
                          <span className="text-orange-600 font-semibold text-[11px]">({item.discountPercent}% OFF)</span>
                          <span>•</span>
                          <span className="text-[11px] flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {item.views || 0} views
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          📍 {item.pickupLocation}
                        </p>
                      </div>
                    </div>

                    {/* Status Toggle & Delete */}
                    <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                          onClick={() => handleStatusChange(item.id, 'available')}
                          className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${
                            item.status === 'available'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Available
                        </button>
                        <button
                          onClick={() => handleStatusChange(item.id, 'reserved')}
                          className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${
                            item.status === 'reserved'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Reserved
                        </button>
                        <button
                          onClick={() => handleStatusChange(item.id, 'sold')}
                          className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${
                            item.status === 'sold'
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Sold
                        </button>
                      </div>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                        title="Delete listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Tab: Buyer Hold Requests */
            reservations.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Clock className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No active hold requests</p>
                <p className="text-xs text-slate-400">
                  When a student reserves your items, their contact and meeting preference will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {reservations.map(res => {
                  const whatsappBuyerUrl = `https://wa.me/91${res.buyerPhone}?text=${encodeURIComponent(
                    `Hi ${res.buyerName}! I saw your hold request for "${res.productTitle}". When and where should we meet?`
                  )}`;

                  return (
                    <div
                      key={res.id}
                      className="p-4 rounded-2xl border border-orange-200/80 bg-orange-50/30 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-orange-900">
                          {res.productTitle}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(res.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="text-xs text-slate-700">
                        <strong>Buyer:</strong> {res.buyerName} ({res.buyerHostel})
                      </div>

                      <div className="text-xs text-slate-600">
                        <strong>Meeting Spot:</strong> {res.proposedMeetingSpot}
                      </div>

                      {res.note && (
                        <div className="text-xs italic text-slate-500 bg-white/80 p-2 rounded-lg border border-slate-200">
                          "{res.note}"
                        </div>
                      )}

                      <div className="pt-2 flex items-center justify-end space-x-2">
                        <a
                          href={whatsappBuyerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-3 rounded-xl transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Contact Buyer on WhatsApp ({res.buyerPhone})</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

        </div>
      </div>
    </div>
  );
}
