"use client";

import { useState } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import { ArrowUpRight, Briefcase, Clock, Star, Wallet } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Legend,
} from "recharts";

/* ========================= */
/* 🧠 SWR DATA FETCH         */
/* ========================= */
export default function ProviderHome() {
  const { data, isValidating } = useSWR(
    "/api/provider-dashboard",
    );

    if (!data) return null;

  const [openChart, setOpenChart] = useState(false);
// layout already handling loading

  const balance = data.balance ?? 0;
  const monthEarnings = data.monthEarnings ?? 0;
  const activeJobs = data.activeJobs ?? 0;
  const pendingRequests = data.pendingRequests ?? 0;
  const completed = data.completed ?? 0;
  const rating = data.rating ?? 0;
  const recentActivity = data.recentActivity ?? [];
  const earningsChart = data.earningsChart ?? [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-8"
    >
      {/* 🔥 Header */}
      <div className="pt-10">
        <h1 className="text-2xl md:text-3xl font-bold">Overview</h1>
        <p className="text-gray-400 text-sm">
          Here's an overview of your activities and earnings.
        </p>

        {/* ✅ subtle background refresh indicator */}
        {isValidating && (
          <p className="text-xs text-gray-500 mt-1">Updating...</p>
        )}
      </div>

      {/* 💰 Balance Card */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-linear-to-br from-emerald-500/20 to-emerald-700/10 border border-emerald-400/20 backdrop-blur-xl">
        <div className="flex items-center gap-3 text-emerald-400">
          <Wallet size={18} />
          <p className="text-sm">Available Balance</p>
        </div>

        <h2 className="text-4xl font-bold mt-2">
           ₦{balance.toLocaleString()}
        </h2>

        <div className="flex items-end justify-between mt-6">
          <div>
            <p className="text-xs text-gray-400">This Month</p>
            <p className="text-emerald-400 font-medium">
               ₦{monthEarnings.toLocaleString()}
            </p>
          </div>

          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-black font-semibold hover:opacity-90 transition">
            Withdraw
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      {/* 📊 Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Briefcase size={18} />} label="Active Jobs" value={activeJobs} />
        <StatCard icon={<Clock size={18} />} label="Pending" value={pendingRequests} />
        <StatCard icon={<Briefcase size={18} />} label="Completed" value={completed} />
        <StatCard icon={<Star size={18} />} label="Rating" value={rating ? `${rating}⭐` : "—"} />
      </div>

      {/* 📈 Chart */}
      <div
        onClick={() => setOpenChart(true)}
        className="bg-white/5 border border-white/10 rounded-3xl p-6 cursor-pointer hover:bg-white/10 transition"
      >
        <p className="text-sm text-gray-300 mb-4">Earnings Overview</p>

        {earningsChart.length === 0 ? (
          <div className="h-48 rounded-xl bg-white/5" />
        ) : (
          <div className="w-full h-55">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={earningsChart}
                  dataKey="earnings"
                  nameKey="date"
                  innerRadius={50}
                  outerRadius={80}
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 📝 Activity */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
        <p className="text-sm text-gray-300 mb-4">Recent Activity</p>

        {recentActivity.length === 0 ? (
          <p className="text-gray-500 text-sm">No recent activity yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {recentActivity.map((item: any, index: number) => (
              <ActivityItem key={index} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* 🪟 Modal */}
      {openChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="relative w-[95%] md:w-175 bg-[#0b0b0b] border border-white/10 rounded-3xl p-6">
            <button
              onClick={() => setOpenChart(false)}
              className="absolute top-4 right-4 text-gray-400"
            >
              ✕
            </button>

            <h3 className="text-lg font-semibold mb-6">
              Earnings Breakdown
            </h3>

            <div className="w-full h-100">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={earningsChart}
                    dataKey="earnings"
                    nameKey="date"
                    innerRadius={80}
                    outerRadius={140}
                  />
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ========================= */
/* Components                */
/* ========================= */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3"
    >
      <div className="text-emerald-400">{icon}</div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </motion.div>
  );
}

function ActivityItem({ item }: { item: any }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm">{item.title}</p>
        <p className="text-xs text-gray-400">{item.subtitle}</p>
      </div>
      {item.amount && (
        <p className="text-emerald-400 font-medium">{item.amount}</p>
      )}
    </div>
  );
}
