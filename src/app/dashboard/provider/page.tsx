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

type SliceProps = {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  fill?: string;
};

const COLORS = [
  "#10B981",
  "#3B82F6",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
  "#84CC16",
];

const renderSlice = (props: SliceProps) => {
  const RADIAN = Math.PI / 180;
  const {
    cx = 0,
    cy = 0,
    midAngle = 0,
    innerRadius = 0,
    outerRadius = 0,
    startAngle = 0,
    endAngle = 0,
    fill,
  } = props;

  const x1 = cx + outerRadius * Math.cos(-midAngle * RADIAN);
  const y1 = cy + outerRadius * Math.sin(-midAngle * RADIAN);

  return (
    <g>
      <path
        d={`
          M ${cx} ${cy}
          L ${x1} ${y1}
          A ${outerRadius} ${outerRadius} 0 0 1
          ${cx + outerRadius * Math.cos(-endAngle * RADIAN)}
          ${cy + outerRadius * Math.sin(-endAngle * RADIAN)}
          Z
        `}
        fill={fill}
      />
    </g>
  );
};


/* ========================= */
/* 🔌 SWR Fetcher (FIXED)    */
/* ========================= */
const fetcher = (url: string) =>
  fetch(url, {
    credentials: "include",
  }).then((res) => {
    if (!res.ok) throw new Error("Unauthorized");
    return res.json();
  });

export default function ProviderHome() {
  const { data, isLoading } = useSWR("/api/provider-dashboard", fetcher);
  const [openChart, setOpenChart] = useState(false);

  if (isLoading) return <DashboardSkeleton />;

  const balance = data?.balance ?? 0;
  const monthEarnings = data?.monthEarnings ?? 0;
  const activeJobs = data?.activeJobs ?? 0;
  const pendingRequests = data?.pendingRequests ?? 0;
  const completed = data?.completed ?? 0;
  const rating = data?.rating ?? 0;
  const recentActivity = data?.recentActivity ?? [];
  const earningsChart = data?.earningsChart ?? [];

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
      </div>

      {/* 💰 Balance Card */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-linear-to-br from-emerald-500/20 to-emerald-700/10 border border-emerald-400/20 backdrop-blur-xl shadow-[0_0_50px_rgba(16,185,129,0.15)]">
        <div className="flex items-center gap-3 text-emerald-400">
          <Wallet size={18} />
          <p className="text-sm">Available Balance</p>
        </div>

        <AnimatedNumber value={balance} prefix="$" />

        <div className="flex items-end justify-between mt-6">
          <div>
            <p className="text-xs text-gray-400">This Month</p>
            <p className="text-emerald-400 font-medium">
              ${monthEarnings.toLocaleString()}
            </p>
          </div>

          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-black font-semibold hover:opacity-90 transition">
            Withdraw
            <ArrowUpRight size={16} />
          </button>
        </div>

        {balance === 0 && (
          <p className="mt-6 text-sm text-gray-400">
            🚀 Start accepting jobs to see your earnings grow.
          </p>
        )}
      </div>

      {/* 📊 Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Briefcase size={18} />} label="Active Jobs" value={activeJobs} />
        <StatCard icon={<Clock size={18} />} label="Pending" value={pendingRequests} />
        <StatCard icon={<Briefcase size={18} />} label="Completed" value={completed} />
        <StatCard icon={<Star size={18} />} label="Rating" value={rating ? `${rating}⭐` : "—"} />
      </div>

      {/* 📈 Earnings Chart (Clickable) */}
      <div
        onClick={() => setOpenChart(true)}
        className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl cursor-pointer hover:bg-white/10 transition"
      >
        <p className="text-sm text-gray-300 mb-4">Earnings Overview</p>

        {earningsChart.length === 0 ? (
          <div className="h-48 rounded-xl bg-white/5 animate-pulse" />
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
                  shape={(props) => renderSlice({
                    ...props,
                    fill: COLORS[props.index % COLORS.length],
                  })}
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 📝 Recent Activity */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
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

      {/* 🪟 Pie Chart Modal */}
      {openChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative w-[95%] md:w-175 bg-[#0b0b0b] border border-white/10 rounded-3xl p-6">
            <button
              onClick={() => setOpenChart(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-lg font-semibold mb-6">Earnings Breakdown</h3>

            <div className="w-full h-100">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                 <Pie
                  data={earningsChart}
                  dataKey="earnings"
                  nameKey="date"
                  innerRadius={80}
                  outerRadius={140}
                  shape={(props) => renderSlice({
                    ...props,
                    fill: COLORS[props.index % COLORS.length],
                  })}
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
/* 🔢 Animated Balance       */
/* ========================= */
function AnimatedNumber({ value, prefix = "" }: { value: number; prefix?: string }) {
  return (
    <h2 className="text-4xl font-bold mt-2">
      {prefix}
      {value.toLocaleString()}
    </h2>
  );
}

/* ========================= */
/* 📊 Stat Card              */
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
      className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl flex flex-col gap-3"
    >
      <div className="text-emerald-400">{icon}</div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </motion.div>
  );
}

/* ========================= */
/* 📝 Activity Item          */
/* ========================= */
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

/* ========================= */
/* 🦴 Skeleton               */
/* ========================= */
function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      <div className="h-10 w-48 bg-white/5 rounded-xl" />
      <div className="h-48 bg-white/5 rounded-3xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="h-24 bg-white/5 rounded-2xl" />
        <div className="h-24 bg-white/5 rounded-2xl" />
        <div className="h-24 bg-white/5 rounded-2xl" />
        <div className="h-24 bg-white/5 rounded-2xl" />
      </div>
      <div className="h-56 bg-white/5 rounded-3xl" />
      <div className="h-48 bg-white/5 rounded-3xl" />
    </div>
  );
}