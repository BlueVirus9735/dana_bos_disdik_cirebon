import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Activity,
  Shield,
  Database,
  School,
  BarChart,
  Users,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    sekolah: 0,
    arsip: 0,
    siswa: 0,
  });

  useEffect(() => {
    fetch("http://localhost:8000/api/dashboard.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setStats({
            sekolah: data.data.counts.total_sekolah,
            arsip: data.data.counts.total_ijazah,
            siswa: data.data.counts.total_siswa,
          });
        }
      })
      .catch((err) => console.error("Failed to fetch stats:", err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      <nav className="relative z-50 max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
            <img
              src="/logo_dinas.png"
              alt="Logo"
              className="w-9 h-9 object-contain drop-shadow-md"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white mb-0.5">
              Dinas Pendidikan
            </h1>
            <p className="text-xs text-indigo-200 font-medium tracking-widest uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Kabupaten Cirebon
            </p>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <main className="relative z-40 max-w-7xl mx-auto px-6 pt-12 lg:pt-24 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-in slide-in-from-left-10 duration-1000 fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              Sistem Informasi Terpadu
            </div>

            <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight">
              Transformasi <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400">
                Pendidikan Digital
              </span>
            </h1>

            <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
              Platform manajemen data pendidikan Kabupaten Cirebon yang
              terintegrasi. Mengelola Arsip Ijazah, Dana Bantuan Operasi Sekolah
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                to={isAuthenticated ? "/dashboard" : "/login"}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-1 transition-all flex items-center gap-3"
              >
                <Activity className="w-5 h-5" />
                {isAuthenticated ? "Buka Dashboard" : "Masuk Aplikasi"}
              </Link>
            </div>

            <div className="pt-12 grid grid-cols-3 gap-8 border-t border-white/10">
              <div>
                <h3 className="text-3xl font-bold text-white">
                  {stats.sekolah || 0}
                </h3>
                <p className="text-sm text-slate-500 mt-1">Sekolah Terdata</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white">
                  {stats.arsip || 0}
                </h3>
                <p className="text-sm text-slate-500 mt-1">Arsip Digital</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white">
                  {stats.siswa || 0}
                </h3>
                <p className="text-sm text-slate-500 mt-1">Siswa Terdata</p>
              </div>
            </div>
          </div>

          <div className="relative lg:h-[600px] flex items-center justify-center animate-in slide-in-from-right-10 duration-1000 fade-in delay-200">
            <div className="relative w-full max-w-lg aspect-square">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse-slow"></div>

              {/* Main Card */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-96 bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col p-6 rotate-[-6deg] hover:rotate-0 transition-all duration-700 z-20 group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
                    <BarChart className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="h-2 w-24 bg-white/20 rounded-full mb-2"></div>
                    <div className="h-2 w-16 bg-white/10 rounded-full"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-24 w-full bg-gradient-to-br from-white/5 to-transparent rounded-xl border border-white/5"></div>
                  <div className="h-2 w-full bg-white/10 rounded-full"></div>
                  <div className="h-2 w-2/3 bg-white/10 rounded-full"></div>
                </div>
              </div>

              {/* Secondary Card */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/3 -translate-y-2/3 w-72 h-80 bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl flex flex-col p-6 rotate-[12deg] hover:rotate-[6deg] transition-all duration-700 z-10 animate-float">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <School className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex-1 bg-white/5 rounded-xl border border-white/5"></div>
              </div>

              {/* Floating Icons */}
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-slate-800/90 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center shadow-xl animate-bounce delay-700 z-30">
                <Database className="w-8 h-8 text-blue-400" />
              </div>
              <div className="absolute -bottom-10 -left-4 w-16 h-16 bg-slate-800/90 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center shadow-xl animate-bounce delay-100 z-30">
                <Shield className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-50 border-t border-white/10 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-lg font-bold">
                  Dinas Pendidikan Kabupaten Cirebon
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed max-w-sm">
                Mewujudkan layanan pendidikan yang prima, merata, dan
                berkualitas melalui transformasi digital yang terintegrasi untuk
                Kabupaten Cirebon.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6">Tautan Cepat</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Beranda
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Tentang Kami
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Layanan
                  </a>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Portal Login
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6">Hubungi Kami</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center mt-0.5">
                    <School className="w-3 h-3" />
                  </div>
                  <span>
                    Jl. Sunan Drajat No. 1, Sumber,
                    <br />
                    Kabupaten Cirebon, Jawa Barat
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center">
                    <Activity className="w-3 h-3" />
                  </div>
                  <span>disdik@cirebonkab.go.id</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>
              &copy; {new Date().getFullYear()} Dinas Pendidikan Kabupaten
              Cirebon. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
