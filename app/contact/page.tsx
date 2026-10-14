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
  HelpCircle,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

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
    <div className="min-h-full w-full bg-[#f4f7f6] text-slate-800 relative selection:bg-emerald-600 selection:text-white">
      {/* Absolute background decoration layers fixed cleanly to prevent scroll clipping */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-300/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-300/20 rounded-full blur-[120px]" />
      </div>

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-700 hover:text-emerald-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-3.5 py-1 rounded-full shadow-2xs">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            Support & Help Desk
          </span>
        </div>
      </header>

      {/* Main Content Area with proper padding bottom for effortless scrolling */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-28">
        {/* Title Section */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-600/20">
            <MessageSquare className="w-7 h-7" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Get in Touch With Us
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed font-medium">
            Have questions about our stories, vlogs, or professional services? Send us a message and our team will respond promptly.
          </p>
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Info Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] p-7 sm:p-8 border border-white shadow-xl shadow-slate-200/50 space-y-6">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>Contact Information</span>
              </h3>

              <div className="space-y-5 text-xs sm:text-sm">
                <div className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Email Address</p>
                    <a href="mailto:support@athalaga.lk" className="text-slate-600 hover:text-emerald-700 transition font-medium">
                      support@athalaga.lk
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Phone Numbers</p>
                    <p className="text-slate-600 font-medium">+94 74 089 8163 / +94 72 460 2008</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Office Location</p>
                    <p className="text-slate-600 font-medium">Puttalam & Surrounding Areas, Sri Lanka</p>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-slate-100 flex items-center gap-2.5 text-xs text-slate-500 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Dedicated support available 24/7 for community members.</span>
              </div>
            </div>
          </div>

          {/* Right Contact Form Card */}
          <div className="lg:col-span-7">
            <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] p-7 sm:p-9 border border-white shadow-xl shadow-slate-200/50">
              {status === 'success' ? (
                <div className="py-14 text-center space-y-4 animate-in fade-in duration-300">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Message Saved Successfully!</h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto font-medium leading-relaxed">
                    Your message has been securely saved in our database. Our team will review it shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="mt-6 px-7 py-3 rounded-2xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition shadow-md shadow-emerald-700/20 cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">
                    Send Us a Message
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Your Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Chamoth Sandeepa"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-2xl bg-slate-50/90 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-emerald-600 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-2xl bg-slate-50/90 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-emerald-600 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      placeholder="What is this inquiry about?"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-2xl bg-slate-50/90 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-emerald-600 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Your Message <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Type your message, feedback, or service request here..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-2xl bg-slate-50/90 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-emerald-600 transition resize-none"
                    />
                  </div>

                  {status === 'error' && (
                    <div className="flex items-center gap-2.5 text-xs text-rose-600 bg-rose-50 border border-rose-200 p-3.5 rounded-2xl">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span className="font-medium">{errorMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full mt-2 py-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-2xl transition shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message Now</span>
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