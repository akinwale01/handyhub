"use client";

import { useState } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Briefcase,
  Clock,
  Star,
  Wallet,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Legend,
} from "recharts";

/* ========================= */
/* 🧠 FETCH DATA             */
/* ========================= */
export default function CustomerHome() {
  const { data, isValidating } = useSWR("/api/customer-dashboard");

  const [openChart, setOpenChart] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  if (!data) return null;

  // 💵 Currency formatter
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    });
  };

  const totalSpent = data.totalSpent ?? 0;
  const monthSpent = data.monthSpent ?? 0;
  const activeJobs = data.activeJobs ?? 0;
  const pendingJobs = data.pendingJobs ?? 0;
  const completedJobs = data.completedJobs ?? 0;
  const reviewsGiven = data.reviewsGiven ?? 0;
  const recentActivity = data.recentActivity ?? [];
  const spendingChart = data.spendingChart ?? [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto flex flex-col gap-8"
    >
      {/* 🔷 Header */}
      <div className="pt-10 flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold">
          Overview
        </h1>
        <p className="text-gray-400 text-sm">
          Track your spending, jobs, and activity.
        </p>

        {isValidating && (
          <p className="text-xs text-gray-500">Updating...</p>
        )}
      </div>

      {/* 💸 Spending Card */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-linear-to-br from-blue-500/20 to-cyan-700/10 border border-blue-400/20 backdrop-blur-xl flex flex-col gap-6">

        {/* Top */}
        <div className="flex items-center gap-10 text-blue-400">
          <div className="flex items-center gap-3">
            <Wallet size={18} />
            <p className="text-sm">Available Balance</p>
          </div>

          {/* 👁️ Toggle */}
          <button onClick={() => setShowBalance(!showBalance)}>
            {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>

        {/* Balance */}
        <h2 className="text-4xl font-bold">
          {showBalance ? formatCurrency(totalSpent) : "*****"}
        </h2>

        {/* Bottom */}
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-400">This Month</p>
            <p className="text-blue-400 font-medium">
              {showBalance ? formatCurrency(monthSpent) : "••••••"}
            </p>
          </div>

          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 text-black font-semibold hover:opacity-90 transition cursor-pointer">
            Deposit
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      {/* 📊 Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 cursor-pointer">
        <StatCard
          icon={<Wallet size={18} />}
          label="Total Orders"
          value={activeJobs + pendingJobs + completedJobs}
        />

        <StatCard
          icon={<Clock size={18} />}
          label="Pending Requests"
          value={pendingJobs}
        />

        <StatCard
          icon={<Briefcase size={18} />}
          label="Completed Services"
          value={completedJobs}
        />

        <StatCard
          icon={<Star size={18} />}
          label="Reviews Given"
          value={reviewsGiven}
        />
      </div>

      {/* 📈 Spending Chart */}
      <div
        onClick={() => setOpenChart(true)}
        className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-4 cursor-pointer hover:bg-white/10 transition"
      >
        <p className="text-sm text-gray-300">
          Spending Overview
        </p>

        {spendingChart.length === 0 ? (
          <div className="h-48 rounded-xl bg-white/5" />
        ) : (
          <div className="w-full h-55">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={spendingChart}
                  dataKey="spent"
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
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-4">
        <p className="text-sm text-gray-300">
          Recent Activity
        </p>

        {recentActivity.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No recent activity yet.
          </p>
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
          <div className="relative w-[95%] md:w-175 bg-[#0b0b0b] border border-white/10 rounded-3xl p-6 flex flex-col gap-6">
            <button
              onClick={() => setOpenChart(false)}
              className="absolute top-4 right-4 text-gray-400"
            >
              ✕
            </button>

            <h3 className="text-lg font-semibold">
              Spending Breakdown
            </h3>

            <div className="w-full h-100">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spendingChart}
                    dataKey="spent"
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
/* COMPONENTS                */
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
      className="bg-linear-to-br from-blue-500/10 to-cyan-500/5 border border-blue-400/20 rounded-2xl p-5 flex flex-col gap-3 backdrop-blur-xl"
    >
      <div className="text-blue-400">{icon}</div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </motion.div>
  );
}

function ActivityItem({ item }: { item: any }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <p className="text-sm">{item.title}</p>
        <p className="text-xs text-gray-400">{item.subtitle}</p>
      </div>

      {item.amount && (
        <p className="text-blue-400 font-medium">
          {item.amount}
        </p>
      )}
    </div>
  );
}