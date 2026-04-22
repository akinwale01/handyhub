"use client";

import { useEffect, useState } from "react";

type Job = {
  _id: string;
  title: string;
  description?: string;
  location?: string;
  price: number;
  status:
    | "PENDING"
    | "ACTIVE"
    | "PENDING_COMPLETION"
    | "COMPLETED";
};

export default function ProviderJobsPage() {
  const [status, setStatus] = useState<Job["status"]>("PENDING");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    const res = await fetch(`/api/jobs?status=${status}`);
    const data = await res.json();
    setJobs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, [status]);

  const updateJob = async (jobId: string) => {
    await fetch("/api/jobs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobId,
        action: "REQUEST_COMPLETION",
      }),
    });

    fetchJobs();
    setSelectedJob(null);
  };

  // 🔴🟡🔵🟢 STATUS COLORS (STRICT AS YOU REQUESTED)
  const statusStyle = (s: Job["status"]) => {
    switch (s) {
      case "PENDING":
        return "bg-red-500/15 text-red-300 border-red-500/40";
      case "ACTIVE":
        return "bg-yellow-500/15 text-yellow-300 border-yellow-500/40";
      case "PENDING_COMPLETION":
        return "bg-blue-500/15 text-blue-300 border-blue-500/40";
      case "COMPLETED":
        return "bg-green-500/15 text-green-300 border-green-500/40";
    }
  };

  // 🔘 BIGGER COMPLETED BUTTON
  const completedStyle =
    "px-6 py-2.5 text-sm font-semibold rounded-full border flex items-center gap-2 justify-center";

  // 📦 EMPTY STATE BOX (FIXED SIZE + CENTERED)
  const EmptyBox = ({ text }: { text: string }) => (
    <div className="w-full h-140 flex items-center justify-center">
      <div className="w-[320px] h-40 border border-white/10 rounded-2xl flex items-center justify-center text-gray-400 text-sm text-center bg-black/20">
        {text}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0b0f17] text-white px-6 py-10">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Job Terminal</h1>
        <p className="text-sm text-gray-400">
          Structured execution flow system
        </p>
      </div>

      {/* FILTERS */}
      <div className="flex gap-3 mb-8 flex-wrap">
        {[
          "PENDING",
          "ACTIVE",
          "PENDING_COMPLETION",
          "COMPLETED",
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatus(tab as Job["status"])}
            className={`px-4 py-2 rounded-full border text-sm transition ${
              status === tab
                ? statusStyle(tab as Job["status"])
                : "border-white/10 text-gray-400 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="w-full max-w-4xl h-140 border border-white/10 rounded-2xl overflow-hidden bg-white/5">
        {loading ? (
          <div className="p-6 text-gray-400">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <EmptyBox text={`No ${status} jobs in this sector right now`} />
        ) : (
          <div className="p-3 space-y-2 overflow-y-auto h-full">
            {jobs.map((job) => (
              <div
                key={job._id}
                onClick={() => setSelectedJob(job)}
                className="flex items-center justify-between px-4 py-4 rounded-xl bg-black/20 hover:bg-black/30 transition cursor-pointer"
              >
                {/* TITLE */}
                <div>
                  <div className="text-sm font-medium">{job.title}</div>
                  {job.location && (
                    <div className="text-xs text-gray-500">
                      {job.location}
                    </div>
                  )}
                </div>

                {/* STATUS */}
                <div
                  className={` text-xs border rounded px-3 py-3 ${statusStyle(
                    job.status
                  )}`}
                >
                  {job.status === "COMPLETED"
                    ? "✓ Work Completed"
                    : job.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL (ENHANCED STRUCTURE) */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-5">
          <div className="w-full max-w-md bg-[#111827] border border-white/10 rounded-2xl p-6 flex flex-col gap-6">
            {/* TITLE */}
            <div>
              <h2 className="text-xl font-semibold capitalize">
                {selectedJob.title}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Job ID: {selectedJob._id}
              </p>
            </div>

            {/* LOCATION */}
            <div className="text-sm">
              <span className="text-gray-400">Location:</span>{" "}
              <span className="text-white">
                {selectedJob.location || "Not specified"}
              </span>
            </div>

            {/* DESCRIPTION */}
            <div className="text-sm text-gray-400 leading-relaxed">
              {selectedJob.description ||
                "No description provided for this job."}
            </div>

            {/* PRICE */}
            <div className="text-sm">
              <span className="text-gray-400">Payment:</span>{" "}
              <span className="text-green-400 font-semibold">
                ₦{selectedJob.price.toLocaleString()}
              </span>
            </div>

            {/* STATUS */}
            <div className="text-sm">
              <span className="text-gray-400">Status:</span>{" "}
              <span className="text-white font-medium">
                {selectedJob.status}
              </span>
            </div>

            {/* ACTION */}
            {selectedJob.status === "ACTIVE" && (
              <button
                onClick={() => updateJob(selectedJob._id)}
                className="w-full py-2.5 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/30"
              >
                Request Completion
              </button>
            )}

            <button
              onClick={() => setSelectedJob(null)}
              className="w-full py-2.5 rounded-lg bg-white text-black font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}