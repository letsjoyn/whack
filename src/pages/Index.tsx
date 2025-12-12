import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import JourneySearchCard, { JourneySearchParams } from '@/components/JourneySearchCard';
import MapView from '@/components/MapView';
import EchoModal from '@/components/EchoModal';
import LocalShadowWidget from '@/components/LocalShadowWidget';
import SafetyMesh from '@/components/SafetyMesh';
import VanishingDestinations from '@/components/VanishingDestinations';
import { ContextLayerPanel } from '@/components/ContextLayer';

import echoesData from '@/data/echoes.json';
import Hyperspeed from '@/components/Hyperspeed';

const Index = () => {
  const [searchParams] = useSearchParams();

  // State
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isSafetyOpen, setIsSafetyOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isNearby, setIsNearby] = useState(true);
  const [isContextOpen, setIsContextOpen] = useState(false);

  // Echo Modal State
  const [selectedEcho, setSelectedEcho] = useState<(typeof echoesData)[0] | null>(null);
  const [isEchoModalOpen, setIsEchoModalOpen] = useState(false);

  // Get destination from URL params (from Stays page)
  const initialDestination = searchParams.get('to');
  const initialDestinationName = searchParams.get('destination');

  // High contrast mode when offline
  useEffect(() => {
    if (isOffline) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [isOffline]);

  const handleEchoClick = (echo: (typeof echoesData)[0]) => {
    setSelectedEcho(echo);
    setIsEchoModalOpen(true);
  };

  const handleJourneyExplore = (params: JourneySearchParams) => {
    console.log('Journey search params:', params);
    // Navigate to journey planner with search parameters
    const searchParams = new URLSearchParams({
      from: params.source,
      to: params.destination,
      departure: params.departureDate,
      return: params.returnDate,
      guests: params.guests.toString(),
    });
    window.location.href = `/journey?${searchParams.toString()}`;
  };

  return (
    <div
      className={`min-h-screen bg-background transition-colors duration-500 ${isOffline ? 'high-contrast' : ''}`}
    >
      {/* Navigation */}
      <Navbar
        onSafetyClick={() => setIsSafetyOpen(true)}
        isOffline={isOffline}
        onMapClick={() => setIsMapOpen(true)}
      />

      {/* Hero Section with Journey Search */}
      <section className="relative min-h-screen flex items-center justify-center overflow-x-hidden">
        {/* Hyperspeed background (replaces static background image) */}
        <div className="absolute inset-0">
          <Hyperspeed />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-6"
            >
              <span className="text-sm font-medium text-white">✨ BookOnce AI-Powered Travel</span>
            </motion.div>

            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
              Travel That
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Adapts to You
              </span>
            </h1>

            <p className="text-base md:text-lg text-white/80 max-w-2xl mx-auto mb-8">
              Book your perfect journey in one place. Complete travel booking platform that adapts
              to your mood, energy, and desires.
            </p>
          </motion.div>

          {/* Journey Search Card */}
          <JourneySearchCard
            onExplore={handleJourneyExplore}
            initialDestination={initialDestination || undefined}
            initialDestinationName={initialDestinationName || undefined}
          />

          {/* Stats removed per request */}
        </div>
      </section>

      {/* Main Content */}
      <main className="relative">
        {/* Vanishing Destinations - Last Mile of Civilization */}
        <VanishingDestinations />

        {/* Footer */}
        <footer className="py-12 px-4 md:px-8 border-t border-border">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-accent flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">BO</span>
              </div>
              <span className="font-serif text-xl font-semibold text-foreground">BookOnce</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
              Book your perfect journey in one place. Complete travel booking platform for modern
              travelers.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                About
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
            <p className="text-xs text-muted-foreground mt-8">
              © 2024 BookOnce. Built for hackathon demonstration.
            </p>
          </div>
        </footer>
      </main>

      {/* Local Shadow Widget (Floating) */}
      <LocalShadowWidget />

      {/* Context Layer Panel */}
      <ContextLayerPanel isOpen={isContextOpen} onClose={() => setIsContextOpen(false)} />

      {/* Map View (Modal) */}
      <MapView
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onEchoClick={handleEchoClick}
        isNearby={isNearby}
      />

      {/* Echo Modal */}
      <EchoModal
        echo={selectedEcho}
        isOpen={isEchoModalOpen}
        onClose={() => setIsEchoModalOpen(false)}
        isNearby={isNearby}
      />

      {/* Safety Mesh Modal */}
      <SafetyMesh
        isOpen={isSafetyOpen}
        onClose={() => setIsSafetyOpen(false)}
        isOffline={isOffline}
        onToggleOffline={() => setIsOffline(!isOffline)}
      />
    </div>
  );
};

export default Index;
