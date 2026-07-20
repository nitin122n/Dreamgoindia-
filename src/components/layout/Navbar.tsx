import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MoreVertical, X, User } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/destinations", label: "Destinations" },
  { href: "/trips", label: "Trips" },
  { href: "/services", label: "Services" },
  { href: "/blog", label: "Blog" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isAdmin } = useAuth();

  const isHome = location.pathname === "/";
  const isTransparent = isHome && !scrolled;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/trips?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
    }
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-300",
          isTransparent ? "glass-nav-transparent" : "glass-nav premium-shadow"
        )}
      >
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:h-16 lg:h-20 lg:px-8">
          <Logo variant="default" />

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 xl:flex">
            <Link
              to="/"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isTransparent ? "text-white/90" : "text-gray-700 dark:text-gray-200",
                location.pathname === "/" && "text-primary"
              )}
            >
              Home
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isTransparent ? "text-white/90" : "text-gray-700 dark:text-gray-200",
                  location.pathname.startsWith(link.href) && "text-primary"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions — matches reference: search, menu, login */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
              className={cn(
                "rounded-full p-2 transition-colors hover:bg-black/5",
                isTransparent ? "text-white" : "text-gray-700 dark:text-gray-200"
              )}
            >
              <Search className="h-5 w-5" />
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
              className={cn(
                "rounded-full p-2 xl:hidden",
                isTransparent ? "text-white" : "text-gray-700 dark:text-gray-200"
              )}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <MoreVertical className="h-5 w-5" />}
            </button>

            {user ? (
              <Button
                variant={isTransparent ? "secondary" : "default"}
                size="sm"
                onClick={() => navigate(isAdmin ? "/admin" : "/dashboard")}
                className="rounded-full px-4"
              >
                <User className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">{profile?.full_name?.split(" ")[0] || "Account"}</span>
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => navigate("/auth/login")}
                className="rounded-full bg-primary px-5 hover:bg-primary-dark"
              >
                Login
              </Button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900"
            >
              <form onSubmit={handleSearch} className="container mx-auto flex gap-2">
                <Input
                  placeholder="Search trips, destinations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                  autoFocus
                />
                <Button type="submit">Search</Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile / tablet menu drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            className="fixed inset-0 z-40 bg-white pt-16 dark:bg-gray-900 xl:hidden"
          >
            <nav className="flex flex-col gap-1 p-4">
              <Link to="/" className="rounded-xl px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800">
                Home
              </Link>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="rounded-xl px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-3 dark:border-gray-700" />
              {!user && (
                <Button onClick={() => navigate("/auth/signup")} variant="outline" className="w-full">
                  Sign Up
                </Button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
