import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Database,
  Upload,
  LogOut,
  GraduationCap,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  FileText,
  PieChart,
  Users,
  Sun,
  Moon,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useState } from "react";

export default function MainLayout({ children }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Initialize all menus as expanded by default for better discovery
  const [expandedMenus, setExpandedMenus] = useState({
    ijazah: true,
    bos: true,
  });

  const toggleMenu = (key) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const allMenuStructure = [
    {
      type: "link",
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      roles: ["super_admin", "admin_ijazah", "admin_bos"],
    },
    {
      type: "link",
      name: "Manajemen User",
      path: "/users",
      icon: Users,
      roles: ["super_admin"],
    },
    {
      type: "group",
      id: "ijazah",
      label: "Ijazah",
      icon: FileText,
      roles: [
        "super_admin",
        "admin_ijazah",
        "operator_sekolah",
        "operator_ijazah",
      ],
      items: [
        {
          name: "Data Ijazah",
          path: "/data-ijazah",
          icon: Database,
          roles: [
            "super_admin",
            "admin_ijazah",
            "operator_sekolah",
            "operator_ijazah",
          ],
        },
        {
          name: "Upload Baru",
          path: "/upload-ijazah",
          icon: Upload,
          roles: ["admin_ijazah", "operator_sekolah", "operator_ijazah"],
        },
      ],
    },
    {
      type: "group",
      id: "bos",
      label: "Dana BOS",
      icon: PieChart,
      roles: ["super_admin", "admin_bos", "operator_sekolah", "operator_bos"],
      items: [
        {
          name: "Data BOS",
          path: "/data-bos",
          icon: Database,
          roles: [
            "super_admin",
            "admin_bos",
            "operator_sekolah",
            "operator_bos",
          ],
        },
        {
          name: "Proses K-Means",
          path: "/proses-kmeans",
          icon: LayoutDashboard,
          roles: ["super_admin", "admin_bos", "operator_bos"],
        },
        {
          name: "Hasil Klaster",
          path: "/hasil-klaster",
          icon: GraduationCap,
          roles: ["super_admin", "admin_bos", "operator_bos"],
        },
        {
          name: "Visualisasi",
          path: "/visualisasi",
          icon: LayoutDashboard,
          roles: ["super_admin", "admin_bos", "operator_bos"],
        },
      ],
    },
  ];

  const menuStructure = allMenuStructure.filter((item) => {
    if (!user || !user.role) return false;

    // First check role based permission
    if (item.roles && !item.roles.includes(user.role)) return false;

    // Special Rule: Dana BOS only for SD operators (if they are operators)
    if (item.id === "bos" && user.role === "operator_sekolah") {
      // Check jenjang. Note: user.sekolah might be joined or we just rely on user.jenjang provided by backend
      // In AuthController/UserModel we selected 's.jenjang'. Ideally it's mapped to user.jenjang
      // Let's assume user.jenjang exists now.
      if (user.jenjang !== "SD") return false;
    }

    return true;
  });

  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden font-sans transition-colors duration-200">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`
        fixed inset-y-0 left-0 z-30 w-72 bg-white dark:bg-gray-800 shadow-xl shadow-blue-900/5 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Brand / Logo Area */}
        <div className="h-24 flex items-center px-6  relative overflow-hidden">
          {/* Abstract background accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

          <div className="flex items-center gap-4 relative z-10 w-full">
            <div className="w-12 h-12 relative flex-shrink-0">
              <div className="absolute inset-0 bg-blue-500/20 blur-lg rounded-full animate-pulse-slow"></div>
              <img
                src="/logo_dinas.png"
                alt="Logo"
                className="relative w-full h-full object-contain drop-shadow-md"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
                Dinas Pendidikan
              </h1>
              <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Kabupaten Cirebon
              </p>
            </div>
          </div>

          <button
            className="ml-auto md:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {menuStructure.map((item, idx) => {
            if (item.type === "link") {
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-200 font-medium text-sm
                            ${
                              isActive
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-blue-600 dark:hover:text-blue-400"
                            }`
                  }
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.name}</span>
                  {item.path === "/dashboard" && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400"></span>
                  )}
                </NavLink>
              );
            } else if (item.type === "group") {
              const visibleItems = item.items.filter((child) => {
                if (!child.roles) return true;
                return child.roles.includes(user.role);
              });

              if (visibleItems.length === 0) return null;

              const isExpanded = expandedMenus[item.id];
              const hasActiveChild = visibleItems.some(
                (child) => location.pathname === child.path
              );

              return (
                <div key={item.id} className="pt-2">
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 font-medium text-sm group
                                ${
                                  hasActiveChild
                                    ? "bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200"
                                }
                               `}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`p-1.5 rounded-lg transition-colors ${
                          hasActiveChild
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-500 group-hover:text-blue-500"
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="font-semibold">{item.label}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isExpanded
                        ? "max-h-96 opacity-100 mt-1"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="pl-4 pr-1 py-1 space-y-1">
                      {visibleItems.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          onClick={() => setIsSidebarOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm ml-3 relative
                                                ${
                                                  isActive
                                                    ? "text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-900/20"
                                                    : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                                                }`
                          }
                        >
                          {/* Vertical line connector visualization */}
                          <span
                            className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full transition-colors ${
                              // eslint-disable-next-line
                              location.pathname === child.path
                                ? "bg-blue-500"
                                : "bg-transparent"
                            }`}
                          ></span>

                          <span
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${
                              location.pathname === child.path
                                ? "bg-blue-500"
                                : "bg-gray-300 dark:bg-gray-600"
                            }`}
                          ></span>
                          {child.name}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="bg-white dark:bg-gray-700/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-600/50 shadow-sm mb-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {user?.username || "Guest User"}
              </p>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize truncate">
                  {user?.role?.replace("_", " ") || "Guest"}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full relative group overflow-hidden rounded-xl border border-red-100 dark:border-red-900/30 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 hover:text-white dark:hover:text-white transition-colors"
          >
            <div className="absolute inset-0 w-0 bg-red-500 transition-all duration-[250ms] ease-out group-hover:w-full"></div>
            <div className="relative flex items-center justify-center gap-2 px-4 py-2.5 font-medium text-sm">
              <LogOut className="w-4 h-4" />
              <span>Keluar Sesi</span>
            </div>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md  h-16 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl md:hidden transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3 md:hidden ml-3">
              <img src="/logo_dinas.png" alt="Logo" className="w-8 h-8" />
              <span className="font-bold text-gray-900 dark:text-white">
                Disdik Cirebon
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 mx-2"></div>
            <button
              onClick={toggleTheme}
              className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-all active:scale-95 border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
              title={
                theme === "dark"
                  ? "Ganti ke Mode Terang"
                  : "Ganti ke Mode Gelap"
              }
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-yellow-400 transition-transform rotate-90" />
              ) : (
                <Moon className="w-5 h-5 text-blue-600 transition-transform -rotate-12" />
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#F3F4F6] dark:bg-gray-900 relative scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}
