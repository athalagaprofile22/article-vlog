// app/contact/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  MessageSquare, 
  ShieldCheck,
  Sparkles,
  Clock,
  ArrowUpRight,
  HeartHandshake,
  Globe,
  MessageCircle
} from 'lucide-react';

const QUICK_SUBJECTS = [
  'General Inquiry',
  'Story / Vlog Feature',
  'Service Support',
  'Partnership',
  'Feedback'
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMessage('Please fill in all required fields.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            subject: formData.subject || 'New Contact Inquiry',
            message: formData.message,
            is_read: false
          }
        ]);

      if (error) {
        throw error;
      }

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      console.error('Failed to save message:', err);
      setStatus('error');
      setErrorMessage('Failed to send message. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f6f9f8] text-slate-800 relative selection:bg-emerald-600 selection:text-white overflow-x-hidden antialiased">
      
      {/* 120FPS GPU-Accelerated Curved SVG Background Architecture */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transform-gpu">
        {/* Top Organic Curved Wave - Balanced height for mobile & desktop */}
        <svg
          className="absolute top-0 left-0 w-full h-[260px] sm:h-[520px] text-emerald-950/[0.035] transform-gpu"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,192L60,181.3C120,171,240,149,360,154.7C480,160,600,192,720,186.7C840,181,960,139,1080,128C1200,117,1320,139,1380,149.3L1440,160L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
          />
        </svg>

        {/* Soft Radial Mesh */}
        <div 
          className="absolute -top-24 -left-24 sm:-top-40 sm:-left-40 w-[340px] h-[340px] sm:w-[600px] sm:h-[600px] rounded-full opacity-60 transform-gpu"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0) 70%)'
          }}
        />
        <div 
          className="absolute top-1/3 -right-24 sm:-right-40 w-[360px] h-[360px] sm:w-[650px] sm:h-[650px] rounded-full opacity-60 transform-gpu"
          style={{
            background: 'radial-gradient(circle, rgba(20, 184, 166, 0.12) 0%, rgba(20, 184, 166, 0) 70%)'
          }}
        />

        {/* Decorative Curved Geometric Rings (Desktop Only) */}
        <div className="absolute top-24 right-[8%] w-64 h-64 rounded-full border border-emerald-500/10 hidden lg:block transform-gpu" />
        <div className="absolute top-32 right-[10%] w-48 h-48 rounded-full border border-teal-500/10 hidden lg:block transform-gpu" />
        <div className="absolute bottom-16 left-[5%] w-72 h-72 rounded-[4rem] rotate-12 border border-emerald-500/10 hidden lg:block transform-gpu" />
      </div>

      {/* Ultra-Smooth Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-emerald-950/5 transform-gpu">
        <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 sm:gap-2.5 font-bold text-xs sm:text-sm text-slate-700 hover:text-emerald-700 transition-colors duration-200 py-1.5 px-2.5 sm:py-2 sm:px-3.5 rounded-full hover:bg-emerald-50/80 active:scale-95 transform-gpu"
          >
            <span className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-all duration-200 transform-gpu group-hover:-translate-x-0.5">
              <ArrowLeft className="w-3.5 h-3.5" />
            </span>
            <span>Back to Home</span>
          </Link>

          <div className="inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-emerald-900 bg-gradient-to-r from-emerald-100/90 to-teal-100/90 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-emerald-200/60 shadow-2xs">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 hidden xs:inline" />
            <span>24/7 Support</span>
          </div>
        </div>
      </header>

      {/* Main Content Area - Balanced Mobile Spacing */}
      <main className="relative z-10 max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-5 sm:pt-14 pb-16 sm:pb-28">
        
        {/* Hero Banner - Compact & Balanced on Mobile, Unchanged on Desktop */}
        <div className="relative text-center max-w-2xl mx-auto mb-6 sm:mb-16">
          <div className="inline-flex items-center justify-center p-1 sm:p-1.5 rounded-full sm:rounded-[2rem] bg-white shadow-sm sm:shadow-md shadow-emerald-950/5 border border-emerald-100 mb-3.5 sm:mb-6 transform-gpu">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full sm:rounded-[1.5rem] bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-inner shrink-0">
              <MessageSquare className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="px-3 sm:px-4 text-left">
              <p className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">We&apos;d love to hear from you</p>
              <p className="text-[11px] sm:text-xs font-bold text-slate-700">Fast response guaranteed</p>
            </div>
          </div>

          <h1 className="text-[1.75rem] sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.18] sm:leading-[1.15] px-2">
            Let&apos;s Start a{' '}
            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500">
              Conversation
              <svg className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-2 sm:h-3 text-emerald-400/70" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none">
                <path d="M2 9.5C50 2.5 150 2.5 198 9.5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          
          <p className="text-xs sm:text-base text-slate-600 mt-3 sm:mt-5 leading-relaxed font-medium max-w-md sm:max-w-xl mx-auto px-2">
            Have questions about our stories, vlogs, or community services? Drop us a message below and our team will get back to you right away.
          </p>
        </div>

        {/* MOBILE-ONLY: Curved Quick Action Dock */}
        <div className="grid grid-cols-3 gap-2.5 mb-6 lg:hidden transform-gpu">
          <a
            href="tel:+94712955068"
            className="flex flex-col items-center justify-center p-3 rounded-[1.5rem] bg-white border border-emerald-950/5 shadow-sm shadow-slate-200/50 active:scale-95 transition-transform transform-gpu"
          >
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5">
              <Phone className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-extrabold text-slate-800">Call Now</span>
            <span className="text-[9px] font-semibold text-slate-400">Direct Line</span>
          </a>

          <a
            href="https://wa.me/+94712955068"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3 rounded-[1.5rem] bg-gradient-to-b from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 active:scale-95 transition-transform transform-gpu"
          >
            <div className="w-9 h-9 rounded-2xl bg-white/20 text-white flex items-center justify-center mb-1.5">
              <MessageCircle className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-extrabold">WhatsApp</span>
            <span className="text-[9px] font-semibold text-emerald-100">Fastest Chat</span>
          </a>

          <a
            href="mailto:Athalaga.dev@gmail.com"
            className="flex flex-col items-center justify-center p-3 rounded-[1.5rem] bg-white border border-emerald-950/5 shadow-sm shadow-slate-200/50 active:scale-95 transition-transform transform-gpu"
          >
            <div className="w-9 h-9 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-1.5">
              <Mail className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-extrabold text-slate-800">Email Us</span>
            <span className="text-[9px] font-semibold text-slate-400">Official Desk</span>
          </a>
        </div>

        {/* Main Asymmetric Curved Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-stretch">
          
          {/* Left Column: Curved Visual Brand Card (HIDDEN ON MOBILE, VISIBLE ON DESKTOP) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between">
            <div className="relative h-full bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-[2.75rem] p-9 shadow-xl shadow-emerald-950/15 overflow-hidden flex flex-col justify-between transform-gpu">
              
              {/* Internal Curved SVG Shapes inside the Dark Card */}
              <svg
                className="absolute -top-16 -right-16 w-72 h-72 text-white/[0.06] pointer-events-none transform-gpu"
                viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="currentColor"
                  d="M45.7,-76.3C58.9,-69.3,69.1,-55.3,76.6,-40.3C84.1,-25.3,88.9,-9.3,87.3,6.1C85.7,21.5,77.7,36.3,67.1,48.5C56.5,60.7,43.3,70.3,28.2,76.3C13.1,82.3,-3.9,84.7,-20.1,81.8C-36.3,78.9,-51.7,70.7,-63.3,58.5C-74.9,46.3,-82.7,30.1,-85.4,13C-88.1,-4.1,-85.7,-22.1,-77.8,-37.2C-69.9,-52.3,-56.5,-64.5,-41.8,-70.9C-27.1,-77.3,-11.1,-77.9,2.6,-82.1C16.3,-86.3,32.5,-83.3,45.7,-76.3Z"
                  transform="translate(100 100)"
                />
              </svg>

              <svg
                className="absolute bottom-0 left-0 w-full h-36 text-emerald-950/30 pointer-events-none transform-gpu"
                viewBox="0 0 1440 320"
                preserveAspectRatio="none"
              >
                <path
                  fill="currentColor"
                  d="M0,128L48,144C96,160,192,192,288,186.7C384,181,480,139,576,138.7C672,139,768,181,864,197.3C960,213,1056,203,1152,176C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                />
              </svg>

              {/* Top Card Content */}
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-emerald-200 text-xs font-bold mb-6">
                  <HeartHandshake className="w-4 h-4 text-emerald-300" />
                  <span>Direct Contact Channels</span>
                </div>

                <h2 className="text-3xl font-black tracking-tight leading-snug mb-2">
                  Connect With Our Team Directly
                </h2>
                <p className="text-emerald-100/80 text-sm leading-relaxed mb-8">
                  Choose any channel below to reach us immediately, or use the form to save your inquiry.
                </p>

                {/* Interactive Contact Pill Cards */}
                <div className="space-y-3.5">
                  
                  {/* Email Card */}
                  <a
                    href="mailto:athalaga.dev@gmail.com"
                    className="group flex items-center justify-between p-4 rounded-[1.75rem] bg-white/10 hover:bg-white/15 border border-white/10 transition-all duration-200 transform-gpu hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-400/20 text-emerald-200 flex items-center justify-center shrink-0 group-hover:bg-emerald-400 group-hover:text-emerald-950 transition-colors duration-200">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300/80">Official Email</p>
                        <p className="text-sm font-bold text-white truncate">Athalaga.dev@gmail.com</p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-emerald-300 opacity-70 group-hover:opacity-100 shrink-0 ml-2" />
                  </a>

                  {/* Phone Card */}
                  <a
                    href="tel:+94712955068"
                    className="group flex items-center justify-between p-4 rounded-[1.75rem] bg-white/10 hover:bg-white/15 border border-white/10 transition-all duration-200 transform-gpu hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-400/20 text-emerald-200 flex items-center justify-center shrink-0 group-hover:bg-emerald-400 group-hover:text-emerald-950 transition-colors duration-200">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300/80">Call or WhatsApp</p>
                        <p className="text-sm font-bold text-white truncate">+94712955068</p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-emerald-300 opacity-70 group-hover:opacity-100 shrink-0 ml-2" />
                  </a>

                  {/* Location Card */}
                  <div className="flex items-center justify-between p-4 rounded-[1.75rem] bg-white/10 border border-white/10">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-400/20 text-emerald-200 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300/80">Service Hub</p>
                        <p className="text-sm font-bold text-white truncate">Puttalam, Sri Lanka</p>
                      </div>
                    </div>
                    <Globe className="w-4 h-4 text-emerald-300/50 shrink-0 ml-2" />
                  </div>

                </div>
              </div>

              {/* Bottom Trust Badge */}
              <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-emerald-100/90">
                <div className="flex items-center gap-2 font-semibold">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>100% Secure & Private</span>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-950/50 px-3 py-1 rounded-full text-[11px] font-bold text-emerald-300">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Fast Reply</span>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Curved Interactive Form Card */}
          <div className="lg:col-span-7">
            <div className="relative h-full bg-white rounded-[2rem] sm:rounded-[2.75rem] p-5 sm:p-10 border border-emerald-950/5 shadow-xl shadow-slate-200/60 overflow-hidden transform-gpu">
              
              {/* Subtle Curved Top-Right Corner Accent */}
              <div className="absolute -top-12 -right-12 w-28 h-28 sm:w-36 sm:h-36 bg-gradient-to-bl from-emerald-100/70 to-teal-50/20 rounded-full pointer-events-none" />

              {status === 'success' ? (
                <div className="py-10 sm:py-16 px-2 sm:px-4 text-center space-y-4 sm:space-y-5 flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.75rem] sm:rounded-[2rem] bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/25 transform-gpu">
                    <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2 max-w-md">
                    <span className="inline-block text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                      Received Successfully
                    </span>
                    <h3 className="text-xl sm:text-3xl font-black text-slate-900">
                      Thank You for Reaching Out!
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                      Your message has been safely stored. Our team will review your inquiry and respond to your email shortly.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="mt-2 sm:mt-4 w-full sm:w-auto px-8 py-3.5 rounded-full bg-slate-900 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition-all duration-200 shadow-md active:scale-95 transform-gpu cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="relative z-10 space-y-4 sm:space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 sm:pb-4">
                    <div>
                      <h3 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                        Send Us a Message
                      </h3>
                      <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
                        Fill out the form below and hit send
                      </p>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50/80 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-emerald-100">
                      * Required
                    </span>
                  </div>

                  {/* Name & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1.5 sm:mb-2 ml-1">
                        Your Name <span className="text-rose-500">*</span>
                      </label>
                      <div className={`relative rounded-[1.2rem] sm:rounded-[1.35rem] transition-all duration-200 transform-gpu ${
                        focusedField === 'name' ? 'ring-4 ring-emerald-500/15' : ''
                      }`}>
                        <input
                          type="text"
                          required
                          placeholder="Your Full Name"
                          value={formData.name}
                          onFocus={() => setFocusedField('name')}
                          onBlur={() => setFocusedField(null)}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 sm:py-3.5 rounded-[1.2rem] sm:rounded-[1.35rem] bg-slate-50/90 hover:bg-slate-100/70 border border-slate-200/90 text-[15px] sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-emerald-500 transition-colors duration-200 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1.5 sm:mb-2 ml-1">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className={`relative rounded-[1.2rem] sm:rounded-[1.35rem] transition-all duration-200 transform-gpu ${
                        focusedField === 'email' ? 'ring-4 ring-emerald-500/15' : ''
                      }`}>
                        <input
                          type="email"
                          required
                          placeholder="name@example.com"
                          value={formData.email}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField(null)}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 sm:py-3.5 rounded-[1.2rem] sm:rounded-[1.35rem] bg-slate-50/90 hover:bg-slate-100/70 border border-slate-200/90 text-[15px] sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-emerald-500 transition-colors duration-200 font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Interactive Curved Topic Pills (Horizontal Swipe on Mobile, Wrap on Desktop) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2 ml-1">
                      <label className="block text-xs font-extrabold text-slate-700">
                        What is this regarding?
                      </label>
                      <span className="text-[10px] font-semibold text-slate-400 sm:hidden">
                        Swipe →
                      </span>
                    </div>
                    
                    {/* Quick Topic Pills - Gray Scrollbar Hidden Completely */}
                    <div className="flex sm:flex-wrap gap-2 overflow-x-auto pb-1 sm:pb-0 mb-2.5 sm:mb-3 -mx-1 px-1 snap-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                      {QUICK_SUBJECTS.map((topic) => {
                        const isSelected = formData.subject === topic;
                        return (
                          <button
                            key={topic}
                            type="button"
                            onClick={() => setFormData({ ...formData, subject: topic })}
                            className={`snap-start shrink-0 text-[11px] sm:text-xs font-bold px-3.5 py-2 sm:py-1.5 rounded-full transition-all duration-150 transform-gpu active:scale-95 cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/30'
                                : 'bg-slate-100/90 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            {topic}
                          </button>
                        );
                      })}
                    </div>

                    <div className={`relative rounded-[1.2rem] sm:rounded-[1.35rem] transition-all duration-200 transform-gpu ${
                      focusedField === 'subject' ? 'ring-4 ring-emerald-500/15' : ''
                    }`}>
                      <input
                        type="text"
                        placeholder="Or type a custom subject here..."
                        value={formData.subject}
                        onFocus={() => setFocusedField('subject')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 sm:py-3.5 rounded-[1.2rem] sm:rounded-[1.35rem] bg-slate-50/90 hover:bg-slate-100/70 border border-slate-200/90 text-[15px] sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-emerald-500 transition-colors duration-200 font-medium"
                      />
                    </div>
                  </div>

                  {/* Message Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2 ml-1">
                      <label className="block text-xs font-extrabold text-slate-700">
                        Your Message <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {formData.message.length} chars
                      </span>
                    </div>
                    <div className={`relative rounded-[1.35rem] sm:rounded-[1.5rem] transition-all duration-200 transform-gpu ${
                      focusedField === 'message' ? 'ring-4 ring-emerald-500/15' : ''
                    }`}>
                      <textarea
                        required
                        rows={4}
                        placeholder="Tell us how we can help you today..."
                        value={formData.message}
                        onFocus={() => setFocusedField('message')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-3 sm:py-3.5 rounded-[1.35rem] sm:rounded-[1.5rem] bg-slate-50/90 hover:bg-slate-100/70 border border-slate-200/90 text-[15px] sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-emerald-500 transition-colors duration-200 resize-none font-medium leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Error Banner */}
                  {status === 'error' && (
                    <div className="flex items-center gap-2.5 sm:gap-3 text-xs text-rose-700 bg-rose-50 border border-rose-200/80 px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-2xl">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span className="font-bold">{errorMessage}</span>
                    </div>
                  )}

                  {/* Curved Pill Submit Button */}
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="group w-full py-3.5 sm:py-4 px-6 bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-extrabold rounded-full transition-all duration-200 shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/30 flex items-center justify-center gap-2.5 disabled:opacity-60 cursor-pointer transform-gpu hover:-translate-y-0.5 active:scale-[0.99]"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message Now</span>
                        <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform duration-200">
                          <Send className="w-3.5 h-3.5" />
                        </span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}