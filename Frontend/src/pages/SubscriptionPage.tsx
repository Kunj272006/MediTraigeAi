import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHospitalSession, updateHospitalPlan, SUBSCRIPTION_PLANS } from '../lib/hospitalAuth';
import type { HospitalAccount, SubscriptionPlanTier } from '../types';
import { Navbar } from '../components/Navbar';
import {
  Check,
  Building2,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Volume2
} from 'lucide-react';
import { audioAlert } from '../lib/audioAlert';

export const SubscriptionPage: React.FC = () => {
  const [session, setSession] = useState<HospitalAccount | null>(getHospitalSession());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthChange = () => setSession(getHospitalSession());
    window.addEventListener('hospital_auth_changed', handleAuthChange);
    return () => window.removeEventListener('hospital_auth_changed', handleAuthChange);
  }, []);

  const handleUpgrade = (tier: SubscriptionPlanTier) => {
    const updated = updateHospitalPlan(tier);
    if (updated) {
      setSession(updated);
      setSuccessMessage(`Successfully updated to ${SUBSCRIPTION_PLANS.find(p => p.id === tier)?.name}!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-ivory-100 flex flex-col justify-between selection:bg-forest-100 selection:text-forest-900">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 sm:py-12 w-full space-y-10">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-50 border border-forest-200 text-forest-800 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>Licensing Plans</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-medium tracking-tight text-charcoal-900">
            Hospital Subscriptions
          </h1>
          <p className="text-sm text-charcoal-500">
            Select a licensing plan for your healthcare institution.
          </p>
        </div>

        {/* Current Active Plan Status Bar */}
        {session && (
          <div className="bg-white border border-forest-200/90 rounded-2xl p-6 shadow-apple flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-forest-800 text-ivory-100 flex items-center justify-center font-bold text-lg">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-charcoal-900 text-base">
                    {session.hospitalName}
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-forest-50 text-forest-800 border border-forest-200 px-2 py-0.5 rounded-full font-bold">
                    {session.hospitalId}
                  </span>
                </div>
                <div className="text-xs text-charcoal-500 flex items-center gap-4 mt-1">
                  <span>Current Tier: <strong className="text-charcoal-800">{SUBSCRIPTION_PLANS.find(p => p.id === session.activePlan)?.name}</strong></span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-forest-700" />
                    Valid until: <strong className="text-charcoal-800">{session.planValidUntil}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => audioAlert.playSeriousAlarm()}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-charcoal-300 text-xs font-medium text-charcoal-700 hover:bg-ivory-200 transition-colors"
                title="Test Serious Condition Sound Alert"
              >
                <Volume2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Test Serious Alarm</span>
              </button>
              <Link
                to="/staff/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest-800 text-ivory-100 text-xs font-semibold hover:bg-forest-900 shadow-sm transition-all"
              >
                <span>Go to Triage Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 3 Subscription Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isCurrent = session?.activePlan === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all ${
                  plan.popular
                    ? 'bg-white border-2 border-forest-800 shadow-apple ring-4 ring-forest-50'
                    : 'bg-white/80 border border-charcoal-200/90 shadow-subtle hover:shadow-apple'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-forest-800 text-ivory-100 text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Popular</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs uppercase font-bold text-charcoal-500 tracking-wider">
                      {plan.durationLabel}
                    </span>
                    {plan.savings && (
                      <span className="text-[10px] font-bold text-forest-800 bg-forest-50 border border-forest-200 px-2 py-0.5 rounded-full">
                        {plan.savings}
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="font-serif text-4xl sm:text-5xl font-medium text-charcoal-900">
                      {plan.priceFormatted}
                    </span>
                    <span className="text-xs text-charcoal-500 font-medium">
                      / {plan.durationLabel}
                    </span>
                  </div>

                  <p className="text-xs text-charcoal-500 mb-6">
                    {plan.billingFrequency}
                  </p>

                  {/* Feature Checklist */}
                  <div className="space-y-3 pt-4 border-t border-charcoal-100 text-xs text-charcoal-700">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan Action Button */}
                <div className="pt-8">
                  {isCurrent ? (
                    <div className="w-full py-3 px-4 rounded-xl bg-forest-50 border border-forest-300 text-forest-900 font-bold text-xs flex items-center justify-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-forest-700" />
                      <span>Current Active Plan</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleUpgrade(plan.id)}
                      className={`w-full py-3 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
                        plan.popular
                          ? 'bg-forest-800 text-ivory-100 hover:bg-forest-900 shadow-md'
                          : 'bg-ivory-200 hover:bg-ivory-300 text-charcoal-800 border border-charcoal-300'
                      }`}
                    >
                      <span>Select {plan.durationLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </main>

      <footer className="w-full py-6 text-center text-xs text-charcoal-400 border-t border-charcoal-200/60">
        MEDITRIAGE AI • Clinical Triage Platform • support@meditriage.ai
      </footer>
    </div>
  );
};
