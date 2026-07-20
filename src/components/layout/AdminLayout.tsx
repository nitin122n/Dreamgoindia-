import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Map,
  Tags,
  FileText,
  Images,
  Star,
  MessageSquareQuote,
  HelpCircle,
  ImageIcon,
  MapPin,
  Ticket,
  Mail,
  Inbox,
  Settings,
  FolderOpen,
  Circle,
  CircleDot,
  Menu,
  X,
  LogOut,
  ExternalLink,
  Database,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { InstagramIcon } from "@/components/common/SocialIcons";
import { Logo } from "@/components/common/Logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/supabase";
import { AdminDbStatus } from "@/components/admin/AdminDbStatus";

const navItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Bookings", path: "/admin/bookings", icon: CalendarCheck },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Trips", path: "/admin/trips", icon: Map },
  { label: "Ongoing Trips", path: "/admin/ongoing-trips", icon: CircleDot },
  { label: "Categories", path: "/admin/categories", icon: Tags },
  { label: "Blogs", path: "/admin/blogs", icon: FileText },
  { label: "Gallery", path: "/admin/gallery", icon: Images },
  { label: "Reviews", path: "/admin/reviews", icon: Star },
  { label: "Testimonials", path: "/admin/testimonials", icon: MessageSquareQuote },
  { label: "FAQs", path: "/admin/faqs", icon: HelpCircle },
  { label: "Hero Slider", path: "/admin/hero", icon: ImageIcon },
  { label: "Story Highlights", path: "/admin/highlights", icon: Circle },
  { label: "Instagram", path: "/admin/instagram", icon: InstagramIcon },
  { label: "Destinations", path: "/admin/destinations", icon: MapPin },
  { label: "Coupons", path: "/admin/coupons", icon: Ticket },
  { label: "Newsletter", path: "/admin/newsletter", icon: Mail },
  { label: "Contact Forms", path: "/admin/contact", icon: Inbox },
  { label: "Settings", path: "/admin/settings", icon: Settings },
  { label: "Media Library", path: "/admin/media", icon: FolderOpen },
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "AD";

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login");
  };

  return (
    <div className="dark admin-panel flex min-h-screen bg-[#0f111a] text-gray-100">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-[#12121e] transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <Logo to="/admin" variant="white" className="min-w-0 origin-left scale-90" />
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-gray-400 hover:bg-white/5 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="border-b border-white/10 p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-primary/40">
              <AvatarFallback className="bg-primary text-xs font-semibold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {profile?.full_name ?? "Admin User"}
              </p>
              <p className="truncate text-xs text-gray-400">
                {profile?.email ?? "admin@dreamgoindia.com"}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2.5 py-3">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                item.path === "/admin"
                  ? location.pathname === "/admin"
                  : location.pathname.startsWith(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-white shadow-lg shadow-primary/25"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="space-y-1 border-t border-white/10 p-3">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white"
          >
            <ExternalLink className="h-4 w-4 text-primary" />
            View Website
          </Link>
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium",
              isSupabaseConfigured
                ? "bg-primary/15 text-primary"
                : "bg-white/5 text-gray-400"
            )}
          >
            <Database className="h-3.5 w-3.5 shrink-0" />
            {isSupabaseConfigured ? "Supabase connected" : "Demo mode"}
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 rounded-xl px-3 text-gray-400 hover:bg-white/5 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#12121e]/95 px-4 backdrop-blur lg:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-300 hover:bg-white/5 hover:text-white lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold text-white">
              {navItems.find((n) =>
                n.path === "/admin"
                  ? location.pathname === "/admin"
                  : location.pathname.startsWith(n.path)
              )?.label ?? "Admin"}
            </h1>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-3 rounded-full p-1 transition hover:bg-white/5"
              >
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold text-white">
                    {profile?.full_name ?? "Admin"}
                  </p>
                  <p className="text-xs text-gray-400">{profile?.email}</p>
                </div>
                <Avatar className="h-9 w-9 ring-2 ring-primary/40">
                  <AvatarFallback className="bg-primary text-xs font-semibold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 border-white/10 bg-[#1a1d2e] text-gray-100"
            >
              <DropdownMenuItem
                onClick={() => navigate("/admin/settings")}
                className="focus:bg-primary/15 focus:text-primary"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-primary focus:bg-primary/15 focus:text-primary"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <AdminDbStatus />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
