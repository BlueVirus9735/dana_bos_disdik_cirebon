import {
  LayoutGrid,
  CheckSquare,
  Construction,
  FileText,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-lg h-screen p-5">
      <h1 className="text-xl font-bold mb-8">Monitoring App</h1>

      <nav className="space-y-4">
        <Link className="flex gap-3 items-center hover:text-blue-600" to="/">
          <LayoutGrid size={20} /> Dashboard
        </Link>
        <Link
          className="flex gap-3 items-center hover:text-blue-600"
          to="/absensi"
        >
          <CheckSquare size={20} /> Absensi
        </Link>
        <Link
          className="flex gap-3 items-center hover:text-blue-600"
          to="/alat"
        >
          <Construction size={20} /> Alat Berat
        </Link>
        <Link
          className="flex gap-3 items-center hover:text-blue-600"
          to="/laporan"
        >
          <FileText size={20} /> Laporan
        </Link>
        <Link
          className="flex gap-3 items-center hover:text-blue-600"
          to="/users"
        >
          <Users size={20} /> User
        </Link>
      </nav>
    </aside>
  );
}
