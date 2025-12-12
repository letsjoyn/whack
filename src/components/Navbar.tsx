import { motion } from "framer-motion";
import { Home, Building2, Plane, Sparkles, User, Shield, Menu, X, Zap, Calendar, MapIcon, Compass, LogOut, Settings, ArrowRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useChatStore } from "@/stores/chatStore";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface NavbarProps {
  onSafetyClick: () => void;
  isOffline: boolean;
  onContextClick?: () => void;
  onMapClick?: () => void;
}

const Navbar = ({ onSafetyClick, isOffline, onContextClick, onMapClick }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const { isOpen: isChatOpen, setOpen: setChatOpen } = useChatStore();

  // Close dashboard dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dashboardRef.current && !dashboardRef.current.contains(event.target as Node)) {
        setIsDashboardOpen(false);
      }
    };

    if (isDashboardOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isDashboardOpen]);

  const navItems = [
    { icon: Home, label: "Home", href: "/", isRoute: true },
    { icon: Building2, label: "Explore", href: "/stays", isRoute: true },
    { icon: Compass, label: "Utilities", href: "/utilities", isRoute: true },
    { icon: Sparkles, label: "BookOnce AI", href: "#ai", highlight: true, isRoute: false, onClick: () => setChatOpen(true), isActive: isChatOpen },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-3 md:px-8"
    >
      {/* Cute Animated Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Airplane hovering above Explore tab */}
        <motion.div
          className="absolute hidden md:block pointer-events-none z-[60]"
          style={{
            left: "calc(50% + 120px)", // Position directly above Explore button
            top: "-40px", // Higher above the navbar
          }}
          animate={{
            y: [0, -3, 2, -1, 0, 1, -2, 0], // Gentle handheld camera bobbing
            x: [0, 2, -1, 3, -2, 1, 0, -1], // Subtle side-to-side drift
            rotate: [0, 1, -0.5, 2, -1, 0.5, 0], // Very gentle rotation like handheld
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1], // Natural timing
          }}
        >
          <Plane className="w-8 h-8 text-blue-600 drop-shadow-2xl" style={{ filter: 'drop-shadow(0 0 12px rgba(37, 99, 235, 0.8))' }} />
        </motion.div>

        {/* Floating Sparkles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.8,
            }}
          >
            <Sparkles className="w-3 h-3 text-primary/30" />
          </motion.div>
        ))}

        {/* Floating Clouds */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`cloud-${i}`}
            className="absolute text-muted-foreground/20"
            style={{
              left: `${10 + i * 30}%`,
              top: `${20 + i * 20}%`,
            }}
            animate={{
              x: [0, 50, 0],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 2,
            }}
          >
            <div className="text-2xl">☁️</div>
          </motion.div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="navbar-glass rounded-2xl px-4 md:px-6 py-3 flex items-center justify-between shadow-themed-medium">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-accent flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">BO</span>
            </div>
            <span className="font-serif text-xl font-semibold text-foreground hidden sm:block">
              BookOnce
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
                const className = `flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  item.highlight
                    ? item.isActive
                      ? "bg-gradient-accent text-primary-foreground shadow-glow ring-2 ring-primary/50"
                      : "bg-gradient-accent text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`;

                const content = (
                  <>
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </>
                );

                if (item.onClick) {
                  return (
                    <motion.button
                      key={item.label}
                      onClick={item.onClick}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={className}
                    >
                      {content}
                    </motion.button>
                  );
                }

                return item.isRoute ? (
                  <motion.div
                    key={item.label}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link to={item.href} className={`${className} no-underline`}>
                      {content}
                    </Link>
                  </motion.div>
                ) : (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`${className} no-underline`}
                  >
                    {content}
                  </motion.a>
                );
              })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Map Button */}
            {onMapClick && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onMapClick}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                title="Open Map"
              >
                <MapIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Map</span>
              </motion.button>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary focus-enhanced touch-target"
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>

            {/* Context Layer Button */}
            {onContextClick && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onContextClick}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all relative"
              >
                <Zap className="w-5 h-5" />
                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
              </motion.button>
            )}

            {/* Theme Toggle */}
            <ThemeToggle variant="dropdown" size="md" className="focus-enhanced" />

            {/* Safety Shield */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onSafetyClick}
              className={`p-2 rounded-xl transition-all focus-enhanced touch-target ${
                isOffline 
                  ? "bg-destructive text-destructive-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
              aria-label={isOffline ? "Safety mode active - Click to view details" : "Safety shield - Click to view safety information"}
              title={isOffline ? "Safety Mode Active" : "Safety Information"}
            >
              <Shield className="w-5 h-5" />
              <span className="sr-only">
                {isOffline ? "Safety mode is currently active" : "View safety information"}
              </span>
            </motion.button>

            {/* Login/Dashboard Button - Far Right */}
            <div className="ml-2 pl-2 border-l border-border">
              {!user ? (
                <Link to="/auth" className="no-underline">
                  <motion.button
                    whileHover={{ scale: 1.08, boxShadow: "0 0 30px rgba(99, 102, 241, 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary via-primary to-accent text-primary-foreground hover:shadow-glow transition-all font-semibold text-sm shadow-lg border border-primary/30"
                  >
                    <User className="w-4 h-4" />
                    <span>Login</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </motion.button>
                </Link>
              ) : (
                <div className="relative" ref={dashboardRef}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsDashboardOpen(!isDashboardOpen)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary via-primary to-accent text-primary-foreground hover:shadow-glow transition-all font-semibold text-sm shadow-lg border border-primary/30"
                  >
                    <User className="w-4 h-4" />
                    <span>Dashboard</span>
                  </motion.button>

                  {/* Dashboard Dropdown */}
                  {isDashboardOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-xl shadow-lg overflow-hidden z-40"
                    >
                      <div className="p-4 border-b border-border">
                        <p className="text-sm font-medium text-foreground">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>

                      <div className="p-2 space-y-1">
                        <Link
                          to="/profile"
                          onClick={() => setIsDashboardOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-secondary transition-colors no-underline"
                        >
                          <User className="w-4 h-4" />
                          My Profile
                        </Link>

                        <Link
                          to="/profile/bookings"
                          onClick={() => setIsDashboardOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-secondary transition-colors no-underline"
                        >
                          <Calendar className="w-4 h-4" />
                          My Bookings
                        </Link>

                        <button
                          onClick={() => {
                            setIsDashboardOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-secondary transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </button>

                        <div className="border-t border-border my-2"></div>

                        <button
                          onClick={() => {
                            logout();
                            setIsDashboardOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={{ 
            height: isMenuOpen ? "auto" : 0,
            opacity: isMenuOpen ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden"
          id="mobile-navigation"
          role="navigation"
          aria-label="Mobile navigation menu"
        >
          <div className="glass-strong rounded-2xl mt-2 p-4 space-y-1 relative">
            {/* Mobile Airplane with gentle handheld movement */}
            <motion.div
              className="absolute top-12 right-6 pointer-events-none z-10"
              animate={{
                y: [0, -2, 1, -1, 0, 1, -1, 0], // Gentle handheld bobbing
                x: [0, 1, -0.5, 2, -1, 0.5, 0], // Subtle drift
                rotate: [0, 0.5, -0.3, 1, -0.5, 0.3, 0], // Very gentle rotation
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 1],
              }}
            >
              <Plane className="w-6 h-6 text-blue-600 drop-shadow-2xl" style={{ filter: 'drop-shadow(0 0 10px rgba(37, 99, 235, 0.8))' }} />
            </motion.div>
            
            {navItems.map((item) => {
                const className = `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  item.highlight
                    ? item.isActive
                      ? "bg-gradient-accent text-primary-foreground ring-2 ring-primary/50"
                      : "bg-gradient-accent text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`;

                const content = (
                  <>
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </>
                );

                if (item.onClick) {
                  return (
                    <motion.button
                      key={item.label}
                      onClick={() => {
                        item.onClick();
                        setIsMenuOpen(false);
                      }}
                      whileTap={{ scale: 0.98 }}
                      className={`${className} w-full`}
                    >
                      {content}
                    </motion.button>
                  );
                }

                return item.isRoute ? (
                  <motion.div
                    key={item.label}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link to={item.href} className={`${className} no-underline`}>
                      {content}
                    </Link>
                  </motion.div>
                ) : (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsMenuOpen(false)}
                    className={`${className} no-underline`}
                  >
                    {content}
                  </motion.a>
                );
              })}
            
            {/* Mobile Theme Toggle */}
            <div className="pt-2 mt-2 border-t border-border">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium text-foreground">Theme</span>
                <ThemeToggle variant="button" showLabel={true} size="sm" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
