"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import {
  Scissors,
  Shirt,
  SprayCan,
  Plug,
  Car,
  Hammer,
  Camera,
  Utensils,
  Laptop,
  Plus,
} from "lucide-react";

const PROVIDER_CATEGORIES = [
  { key: "barbing", label: "Barbing", icon: Scissors },
  { key: "laundry", label: "Laundry", icon: Shirt },
  { key: "cleaning", label: "Cleaning", icon: SprayCan },
  { key: "electrical", label: "Electrical", icon: Plug },
  { key: "mechanic", label: "Mechanic", icon: Car },
  { key: "carpentry", label: "Carpentry", icon: Hammer },
  { key: "photography", label: "Photography", icon: Camera },
  { key: "catering", label: "Catering", icon: Utensils },
  { key: "tech", label: "Tech Support", icon: Laptop },
  { key: "other", label: "Other", icon: Plus },
];

export default function ProviderOnboarding() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    location: "",
    businessName: "",
    bio: "",
    categories: [] as string[],
    pricing: {} as Record<string, number>,
    profilePhoto: null as File | null,
    profilePhotoPreview: "",
  });

  useEffect(() => {
    if (session?.user) {
      setForm((f) => ({
        ...f,
        firstName: session.user.firstName || "",
        lastName: session.user.lastName || "",
      }));
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert("Profile photo must not exceed 3MB");
      return;
    }

    setForm((f) => ({
      ...f,
      profilePhoto: file,
      profilePhotoPreview: URL.createObjectURL(file),
    }));
  };

  const maxCategories = 3;

    const toggleCategory = (key: string) => {
    setForm((f) => {
      const exists = f.categories.includes(key);

      if (!exists && f.categories.length >= maxCategories) {
        return f; // No alert — just ignore
      }

      return {
        ...f,
        categories: exists
          ? f.categories.filter((c) => c !== key)
          : [...f.categories, key],
      };
    });
  };

    const formatCurrency = (value: string) => {
        const numeric = value.replace(/\D/g, "");
        return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      };

      const parseCurrency = (value: string) => {
        return Number(value.replace(/,/g, ""));
    };

    const handlePriceChange = (cat: string, value: string) => {
      const numericValue = parseCurrency(value);

      setForm((f) => ({
        ...f,
        pricing: { ...f.pricing, [cat]: numericValue },
      }));
    };

  const handleSubmit = async () => {
    if (!form.profilePhoto) return alert("Upload your real photo");
    if (!form.categories.length) return alert("Select at least one service");

    for (const cat of form.categories) {
      const price = form.pricing[cat];
      if (!price || price < 2000) return;
}

    setSubmitting(true);

    try {
      const body = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key === "profilePhoto" && value) {
          body.append(key, value as File);
        } else if (typeof value === "string") {
          body.append(key, value);
        }
      });

      body.append("categories", JSON.stringify(form.categories));
      body.append("pricing", JSON.stringify(form.pricing));

      const res = await fetch("/api/provider-onboarding", {
        method: "POST",
        body,
      });

      if (!res.ok) throw new Error("Upload failed");

      setSuccess(true);

      // 🔥 Redirect AFTER showing success screen
      setTimeout(() => {
        router.replace("/dashboard/provider");
         router.refresh();
      }, 2000);

    } catch (err) {
      alert("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
        <div className="absolute w-125 h-125 bg-indigo-600 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="relative bg-zinc-900/80 backdrop-blur-xl p-12 rounded-3xl border border-zinc-700 shadow-2xl flex flex-col items-center gap-6 animate-slideUp">
          <CheckCircle2 size={80} className="text-green-400 animate-bounce" />
          <h2 className="text-3xl font-bold text-white text-center">
            Congratulations 🎉
          </h2>
          <p className="text-zinc-400 text-center">
            Your provider profile has been successfully created.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex justify-center px-4 py-12">
      <div className="absolute w-150 h-150 bg-indigo-600 rounded-full blur-3xl opacity-20 -top-50 -left-50" />
      <div className="absolute w-125 h-125 bg-pink-600 rounded-full blur-3xl opacity-20 -bottom-50 -right-50" />

      <div className="relative w-full max-w-4xl bg-zinc-900/80 backdrop-blur-xl border border-zinc-700 rounded-3xl p-10 shadow-2xl flex flex-col gap-8 animate-slideUp">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">
            Create Your Provider Profile
          </h1>
          <p className="text-zinc-400 mt-2">
            Show customers what you offer
          </p>
        </div>

        {/* PROFILE PHOTO */}
        <div className="flex justify-center">
          <label className="cursor-pointer group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-transform group-hover:scale-105">
              {form.profilePhotoPreview ? (
                <img
                  src={form.profilePhotoPreview}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-400 bg-zinc-800">
                  Upload Photo
                </div>
              )}
            </div>
            <input hidden type="file" accept="image/*" onChange={handleImageChange} />
          </label>
        </div>

        {/* Floating Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FloatingInput name="firstName" value={form.firstName} label="First Name"
            onChange={(e:any)=>setForm({...form,firstName:e.target.value})}/>
          <FloatingInput name="lastName" value={form.lastName} label="Last Name"
            onChange={(e:any)=>setForm({...form,lastName:e.target.value})}/>
        </div>

        <FloatingInput name="businessName" value={form.businessName} label="Business Name"
          onChange={(e:any)=>setForm({...form,businessName:e.target.value})}/>

        <FloatingInput
          name="phone"
          value={form.phone}
          label="Phone Number"
          onChange={(e: any) =>
            setForm({ ...form, phone: e.target.value })
          }
        />

          <FloatingInput
            name="address"
            value={form.address}
            label="Business Address"
            onChange={(e: any) =>
              setForm({ ...form, address: e.target.value })
            }
          />

        {/* SERVICES */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-semibold text-lg">
              Services. <span className="text-sm italic text-gray-400">(You can select a maximum of 3)</span>
            </h3>

            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                form.categories.length === maxCategories
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-800 text-zinc-400"
              }`}
            >
              {form.categories.length}/{maxCategories} Selected
            </div>
          </div>


          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {PROVIDER_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const active = form.categories.includes(cat.key);

              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => toggleCategory(cat.key)}
                  className={`p-4 rounded-2xl flex flex-col items-center gap-2 border transition-all cursor-pointer ${
                    active
                      ? "bg-indigo-600/20 border-indigo-500 scale-105 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                      : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:scale-105 hover:border-indigo-400"
                  }`}
                >
                  <Icon size={24} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* PRICING */}
        {form.categories.length > 0 && (
          <div className="flex flex-col gap-6">
            <h3 className="text-white font-semibold text-lg">
              Set Pricing (Minimum ₦2,000)
            </h3>

            {form.categories.map((cat) => {
              const rawPrice = form.pricing[cat];
              const formattedPrice = rawPrice
                ? formatCurrency(String(rawPrice))
                : "";

              const isInvalid = rawPrice && rawPrice < 2000;

              return (
                <div key={cat} className="flex flex-col gap-2">

                  {/* Currency Input */}
                  <div
                    className={`flex items-center bg-zinc-800 border rounded-xl px-4 py-3 transition ${
                      isInvalid
                        ? "border-red-500"
                        : "border-zinc-700 focus-within:border-indigo-500"
                    }`}
                  >
                    <span className="text-zinc-400 mr-2">₦</span>

                    <input
                      type="text"
                      value={formattedPrice}
                      onChange={(e) =>
                        handlePriceChange(cat, e.target.value)
                      }
                      className="bg-transparent w-full outline-none text-white"
                      placeholder={`Enter price for ${cat}`}
                    />
                  </div>

                  {isInvalid && (
                    <p className="text-red-400 text-sm">
                      Minimum price for this service is ₦2,000
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-6 w-full py-4 rounded-xl font-semibold text-white bg-linear-to-r from-indigo-600 to-pink-600 hover:scale-105 transition-transform flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {submitting && <Loader2 size={18} className="animate-spin" />}
          Finish Setup
        </button>
      </div>
    </div>
  );
}

/* Floating Input */
function FloatingInput({ name, label, value, onChange }: any) {
  return (
    <div className="relative">
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="peer w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 pt-6 pb-2 text-white focus:outline-none focus:border-indigo-500 transition"
      />
      <label
        className={`absolute left-4 transition-all text-zinc-400 ${
          value
            ? "top-2 text-xs text-indigo-400"
            : "top-4 text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-indigo-400"
        }`}
      >
        {label}
      </label>
    </div>
  );
}