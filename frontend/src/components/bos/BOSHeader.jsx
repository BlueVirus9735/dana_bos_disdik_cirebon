import React from "react";
import { Search, Plus, RefreshCw } from "lucide-react";

export default function BOSHeader({
  searchTerm,
  setSearchTerm,
  onRefresh,
  onAddManual,
  userRole,
  isRefreshing,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center">
        <div className="pl-4 pr-2 text-gray-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          placeholder="Cari nama sekolah atau NPSN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent border-none focus:ring-0 text-gray-700 dark:text-gray-200 placeholder-gray-400 h-10"
        />
      </div>

      <div className="flex gap-3 justify-end items-center">
        {userRole && (
          <button
            onClick={onAddManual}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah</span>
          </button>
        )}
        <button
          onClick={onRefresh}
          className="p-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700 shadow-sm transition-colors"
          title="Refresh Data"
        >
          <RefreshCw
            className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>
    </div>
  );
}
