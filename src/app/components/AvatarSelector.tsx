"use client";

import { useState } from "react";

interface Props {
  onSelect: (url: string) => void;
}

export default function AvatarSelector({ onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [selected, setSelected] = useState<string | null>(null);

  const generateAvatars = () => {
    return Array.from({ length: 12 }).map((_, i) => {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${gender}-${i}`;
    });
  };

  const avatars = generateAvatars();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-black text-white rounded-xl"
      >
        Choose Avatar
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-lg rounded-2xl p-6 flex flex-col gap-4">

            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Select Avatar</h2>
              <button onClick={() => setOpen(false)}>✕</button>
            </div>

            {/* Gender Toggle */}
            <div className="flex gap-4">
              <button
                onClick={() => setGender("male")}
                className={`px-3 py-2 rounded-lg ${
                  gender === "male"
                    ? "bg-black text-white"
                    : "bg-gray-200"
                }`}
              >
                Male
              </button>
              <button
                onClick={() => setGender("female")}
                className={`px-3 py-2 rounded-lg ${
                  gender === "female"
                    ? "bg-black text-white"
                    : "bg-gray-200"
                }`}
              >
                Female
              </button>
            </div>

            {/* Avatar Grid */}
            <div className="grid grid-cols-3 gap-4 max-h-75 overflow-y-auto">
              {avatars.map((url) => (
                <img
                  key={url}
                  src={url}
                  alt="avatar"
                  onClick={() => setSelected(url)}
                  className={`cursor-pointer rounded-xl border-4 ${
                    selected === url
                      ? "border-black"
                      : "border-transparent"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              disabled={!selected}
              onClick={() => {
                if (selected) {
                  onSelect(selected);
                  setOpen(false);
                }
              }}
              className="w-full py-2 bg-black text-white rounded-xl disabled:opacity-50"
            >
              Confirm Selection
            </button>
          </div>
        </div>
      )}
    </>
  );
}