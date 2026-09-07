import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, PlusCircle, Search, User, LogOut, ChevronDown, Sparkles, Building, Phone } from 'lucide-react';

export function Navbar({ onOpenSell, onOpenAuth, onOpenMyListings, searchQuery, setSearchQuery }) {
  const { user, demoUsers, switchUser, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top University Announcement Strip */}
      <div className="bg-linear-to-r from-orange-600 via-amber-600 to-orange-700 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="bg-white/20 font-semibold px-2 py-0.5 rounded text-[11px]">LPU ONLY</span>
            <span>Exclusive Student-to-Student Marketplace • Lovely Professional University, Punjab</span>
          </div>
          <div className="hidden md:flex items-center space-x-4 text-[11px] text-orange-100">
            <span>🎓 Verified LPU Hostels (BH-1 to BH-8, GH-1 to GH-6, Law Gate)</span>
            <span>⚡ Zero Commission Campus Thrift</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-900 tracking-tight">LPU Campus</span>
                <span className="bg-orange-100 text-orange-700 font-extrabold text-xs px-1.5 py-0.5 rounded">CLOSET</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-none">Student Apparel Marketplace</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg hidden sm:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search hoodies, placement blazers, lab coats, jackets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-sm text-slate-800 placeholder-slate-400 rounded-full border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons & User Menu */}
          <div className="flex items-center space-x-3">
            {/* Sell Button */}
            <button
              onClick={onOpenSell}
              className="inline-flex items-center space-x-1.5 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-sm shadow-orange-500/30 hover:shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Sell Clothes</span>
            </button>

            {/* My Listings Button (if logged in) */}
            {user && (
              <button
                onClick={onOpenMyListings}
                className="hidden lg:inline-flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-full transition-colors cursor-pointer"
              >
                <span>My Listings</span>
              </button>
            )}

            {/* User Dropdown / Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left hidden md:block pr-1">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">{user.name.split(' ')[0]}</p>
                    <p className="text-[10px] text-orange-600 font-medium leading-none">{user.hostel}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setShowUserMenu(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100 bg-orange-50/50">
                      <p className="text-sm font-bold text-slate-800">{user.name}</p>
                      <p className="text-xs text-slate-500 font-mono">Reg: {user.regNo}</p>
                      <div className="flex items-center space-x-1 mt-1 text-xs text-orange-700 font-medium">
                        <Building className="w-3.5 h-3.5" />
                        <span>{user.hostel} {user.room ? `(${user.room})` : ''}</span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenMyListings();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                      >
                        <ShoppingBag className="w-4 h-4 text-slate-400" />
                        <span>My Listed Clothes & Deals</span>
                      </button>

                      {/* Demo Switcher Quick Bar */}
                      <div className="px-4 py-2 border-t border-slate-100">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                          Quick Switch LPU Account:
                        </p>
                        <div className="space-y-1">
                          {demoUsers.map(du => (
                            <button
                              key={du.id}
                              onClick={() => {
                                switchUser(du);
                                setShowUserMenu(false);
                              }}
                              className={`w-full text-left text-xs px-2 py-1 rounded flex items-center justify-between ${
                                du.id === user.id ? 'bg-orange-100 font-bold text-orange-800' : 'hover:bg-slate-100 text-slate-600'
                              }`}
                            >
                              <span>{du.name}</span>
                              <span className="text-[10px] text-slate-400">{du.hostel}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center space-x-2 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Student Login</span>
              </button>
            )}

          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 sm:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="Search clothes, hoodies, lab coats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 text-xs text-slate-800 placeholder-slate-400 rounded-full border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>
    </header>
  );
}
