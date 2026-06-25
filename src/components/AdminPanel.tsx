import React, { useState, useEffect } from "react";
import { User, SystemConfig } from "../types";
import { ShieldCheck, Users, Settings, Radio, Sparkles, RefreshCw, Layers } from "lucide-react";

interface AdminPanelProps {
  onConfigChange: (platformName: string) => void;
}

export default function AdminPanel({ onConfigChange }: AdminPanelProps) {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [platformName, setPlatformName] = useState("CAREER-MATE MACGS");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchConfig();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsersList(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/admin/config");
      const data = await res.json();
      setPlatformName(data.platformName);
      setMaintenanceMode(data.maintenanceMode);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSuccessMsg("");
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platformName, maintenanceMode }),
      });
      const data = await res.json();
      setSuccessMsg("System configuration properties committed successfully!");
      onConfigChange(data.config.platformName);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest font-mono">
            System Level Administrative Terminal
          </span>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-sans">
            Admin Panel Config
          </h1>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-50 border border-orange-100 text-orange-850 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-orange-650" /> Admin Module Active
        </span>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Settings Form */}
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-100 pb-2">
            <Settings className="w-4 h-4 text-gray-500" /> System Properties
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-gray-700 uppercase tracking-wide mb-15">
                Platform Brand Name:
              </label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs"
                required
              />
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-gray-100 rounded-lg">
              <div className="space-y-0.5">
                <span className="block text-[10px] font-semibold text-gray-700 uppercase tracking-wide">
                  Enforce Maintenance Mode
                </span>
                <span className="block text-[9.5px] text-gray-400">Suspend registrations</span>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-white font-semibold rounded-xl text-xs cursor-pointer focus:outline-none disabled:opacity-50"
            >
              {savingSettings ? "Updating..." : "Commit Changes"}
            </button>
          </form>
        </div>

        {/* Registered Users List */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
              <Users className="w-4 h-4 text-gray-500" /> Active Users List ({usersList.length})
            </h3>
            <button
              onClick={fetchUsers}
              disabled={loadingUsers}
              className="p-1 text-gray-400 hover:text-amber-500 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? "animate-spin" : ""}`} />
            </button>
          </div>

          {loadingUsers ? (
            <div className="py-12 text-center text-xs text-gray-400 font-semibold italic">
              Loading users index...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-650">
                <thead>
                  <tr className="border-b text-slate-400 uppercase tracking-wider text-[9.5px] font-bold">
                    <th className="pb-2 font-mono">User ID</th>
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Classification</th>
                    <th className="pb-2">Last Login</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {usersList.map((usr) => (
                    <tr key={usr.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 font-mono text-[9.5px] font-bold text-teal-800">{usr.id}</td>
                      <td className="py-2.5">
                        <span className="font-bold text-slate-900 block">{usr.name}</span>
                        <span className="text-[10px] text-gray-400">{usr.email}</span>
                      </td>
                      <td className="py-2.5 uppercase text-[10px] font-semibold">{usr.userType}</td>
                      <td className="py-2.5 text-[10px] text-gray-400">{new Date(usr.lastLogin).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
