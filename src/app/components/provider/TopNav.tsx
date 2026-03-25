"use client";

import { useMemo, useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bell, Settings } from "lucide-react";
import toast from "react-hot-toast";

type Notification = {
  _id: string;
  message: string;
  read: boolean;
};

export default function TopNavbar() {
  const { data: session } = useSession();
  const router = useRouter();

  const firstName = session?.user?.firstName || "Guest";
  const image = session?.user?.image;
  const isOnline = session?.user?.isOnline ?? false;

  // =========================
  // STATE
  // =========================
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [shownNotificationIds, setShownNotificationIds] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // =========================
  // GREETING
  // =========================
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "It's Late";
  }, []);

  // =========================
  // AUDIO SETUP
  // =========================
  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
    audioRef.current.volume = 0.5;

    const unlockAudio = () => {
      audioRef.current?.play()
        .then(() => { audioRef.current?.pause(); setAudioUnlocked(true); })
        .catch(() => {});
      document.removeEventListener("click", unlockAudio);
      document.removeEventListener("keydown", unlockAudio);
    };

    document.addEventListener("click", unlockAudio);
    document.addEventListener("keydown", unlockAudio);
  }, []);

  // =========================
  // FETCH NOTIFICATIONS
  // =========================
  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notify");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error("Notification fetch error:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  // =========================
  // TOAST & AUDIO ON NEW
  // =========================
  useEffect(() => {
    if (!audioUnlocked) return;
    notifications.forEach((n) => {
      if (!n.read && !shownNotificationIds.has(n._id)) {
        toast.success(n.message);
        audioRef.current?.play().catch(() => {});
        setShownNotificationIds((prev) => new Set(prev).add(n._id));
      }
    });
  }, [notifications, audioUnlocked, shownNotificationIds]);

  // =========================
  // CLOSE DROPDOWN ON OUTSIDE CLICK
  // =========================
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =========================
  // HELPERS
  // =========================
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notify/${id}`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notify/mark-all", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteReadNotifications = async () => {
    try {
      await fetch("/api/notify/delete-read", { method: "DELETE" });
      setNotifications((prev) => prev.filter((n) => !n.read));
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className="fixed top-0 left-0 w-full z-40 bg-[#111827] backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center justify-between px-4 py-4 md:px-8">

        {/* USER INFO */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-full overflow-hidden border border-emerald-400/40 bg-emerald-500/20 flex items-center justify-center text-sm font-semibold">
              {image ? (
                <Image src={image} alt={firstName} width={44} height={44} className="object-cover w-full h-full" />
              ) : (
                <span className="text-white">{firstName[0]?.toUpperCase()}</span>
              )}
            </div>
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0B1220] ${isOnline ? "bg-emerald-400" : "bg-gray-500"}`} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs text-gray-400">{greeting}</span>
            <span className="font-semibold">{firstName}</span>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-5 relative" ref={dropdownRef}>

          {/* NOTIFICATIONS */}
          <button
            onClick={() => setOpen(!open)}
            className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <Bell size={20} className="text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-14 w-80 bg-[#1F2937] rounded-xl shadow-lg p-4 z-50">
              {notifications.length === 0 ? (
                <p className="text-sm text-gray-400">No notifications</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => markAsRead(n._id)}
                    className={`p-2 rounded-lg text-sm cursor-pointer ${
                      n.read ? "text-gray-400" : "text-white bg-white/5"
                    }`}
                  >
                    {n.message}
                  </div>
                ))
              )}

              <div className="flex justify-between mt-2">
                <button
                  onClick={markAllAsRead}
                  className={`text-xs cursor-pointer ${unreadCount > 0 ? "text-green-400" : "text-red-400"}`}
                >
                  Mark all as read
                </button>
                <button
                  onClick={deleteReadNotifications}
                  className="text-xs cursor-pointer text-blue-400"
                >
                  Delete read
                </button>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          <button
            onClick={() => router.push("/dashboard/provider/settings")}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <Settings size={20} className="text-white" />
          </button>

        </div>

      </div>
    </div>
  );
}