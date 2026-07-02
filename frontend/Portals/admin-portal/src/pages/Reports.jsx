import { useEffect, useMemo, useState } from "react";
import { Users, UserPlus, Download } from "lucide-react";
import api from "../config/api";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const EMPTY_REPORTS = {
  totalMembers: 0,
  activeMembers: 0,
  inactiveMembers: 0,
  admins: 0,
  interns: 0,
  volunteers: 0,
  memberRoleCount: 0,
  roleCounts: {},
  statusCounts: {},
  growthData: [],
  recentMembers: [],
};

export default function Reports() {
  const [reports, setReports] = useState(EMPTY_REPORTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/reports?t=${Date.now()}`);
      setReports({ ...EMPTY_REPORTS, ...(res.data.reports || {}) });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const summaryRows = useMemo(() => [
    ["Total People", reports.totalMembers || 0],
    ["Active People", reports.activeMembers || 0],
    ["Inactive People", reports.inactiveMembers || 0],
    ["Admins", reports.admins || 0],
    ["Members", reports.memberRoleCount || 0],
    ["Interns", reports.interns || 0],
    ["Volunteers", reports.volunteers || 0],
  ], [reports]);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Amaanitvam Foundation", 14, 18);
    doc.setFontSize(14);
    doc.text("Live Member Reports", 14, 30);

    autoTable(doc, {
      head: [["Report", "Value"]],
      body: summaryRows,
      startY: 40,
    });

    if (reports.recentMembers?.length) {
      autoTable(doc, {
        head: [["Name", "Email", "Role", "Status", "Department"]],
        body: reports.recentMembers.map((m) => [
          m.name || "—",
          m.email || "—",
          m.role || "—",
          m.status || "active",
          m.department || "—",
        ]),
        startY: doc.lastAutoTable.finalY + 10,
      });
    }

    doc.save("Amaanitvam-Live-Member-Report.pdf");
  };

  const exportExcel = () => {
    const workbook = XLSX.utils.book_new();

    const summarySheet = XLSX.utils.json_to_sheet([
      Object.fromEntries(summaryRows),
    ]);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

    const memberSheet = XLSX.utils.json_to_sheet(
      (reports.recentMembers || []).map((m) => ({
        Name: m.name || "",
        Email: m.email || "",
        Phone: m.phone || "",
        Role: m.role || "",
        Status: m.status || "active",
        Department: m.department || "",
        Joined: m.createdAt ? new Date(m.createdAt).toLocaleDateString("en-IN") : "",
      }))
    );
    XLSX.utils.book_append_sheet(workbook, memberSheet, "Recent Members");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(file, "Amaanitvam-Live-Member-Report.xlsx");
  };

  const cards = [
    { title: "Total People", value: reports.totalMembers || 0, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Active People", value: reports.activeMembers || 0, icon: UserPlus, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Inactive People", value: reports.inactiveMembers || 0, icon: Users, color: "text-slate-600", bg: "bg-slate-50" },
    { title: "Admins", value: reports.admins || 0, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Interns", value: reports.interns || 0, icon: Users, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Volunteers", value: reports.volunteers || 0, icon: Users, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  const growthData = reports.growthData?.length
    ? reports.growthData
    : [{ month: "Current", members: reports.totalMembers || 0, active: reports.activeMembers || 0 }];

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">
            Live numbers calculated from Member Management records.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={exportPDF}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <button
            onClick={exportExcel}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.title} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-slate-500 text-sm">{card.title}</p>
                <h2 className="text-3xl font-bold mt-3">{loading ? "—" : card.value}</h2>
              </div>
              <div className={`${card.bg} p-3 rounded-xl`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 mt-8 p-6">
        <h2 className="text-xl font-bold mb-2">Member Growth</h2>
        <p className="text-sm text-slate-500 mb-6">Joined members and active members by month.</p>
        <div style={{ width: "100%", height: 350 }}>
          <ResponsiveContainer>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="members" name="Joined" stroke="#10b981" strokeWidth={3} />
              <Line type="monotone" dataKey="active" name="Active" stroke="#2563eb" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm mt-8 p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Members</h2>
        {!reports.recentMembers?.length ? (
          <p className="text-slate-500">No member records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="py-3 pr-4">Name</th>
                  <th className="py-3 pr-4">Email</th>
                  <th className="py-3 pr-4">Role</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Department</th>
                </tr>
              </thead>
              <tbody>
                {reports.recentMembers.map((member) => (
                  <tr key={member._id || member.email} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium text-slate-700">{member.name || "—"}</td>
                    <td className="py-3 pr-4 text-slate-500">{member.email || "—"}</td>
                    <td className="py-3 pr-4 capitalize">{member.role || "member"}</td>
                    <td className="py-3 pr-4 capitalize">{member.status || "active"}</td>
                    <td className="py-3 pr-4">{member.department || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
