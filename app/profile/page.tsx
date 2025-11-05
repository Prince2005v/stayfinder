"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UserProfile {
  name: string;
  email: string;
  phone_number: string;
  city: string;
  state: string;
  user_type: string;
}

export default function UserProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // ✅ FIRST: read token on client only
  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      router.push("/signin");
      return;
    }

    setToken(storedToken);
  }, []);

  // ✅ SECOND: fetch profile AFTER token is set
  useEffect(() => {
    if (!token) return; // wait for token

    async function fetchProfile() {
      try {
        const res = await fetch("http://127.0.0.1:5000/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          router.push("/signin");
          return;
        }

        setUser(data.user_profile);
        setLoading(false);
      } catch (err) {
        console.error(err);
        router.push("/signin");
      }
    }

    fetchProfile();
  }, [token]); // ✅ runs only when token is ready

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-xl dark:text-white">
        Loading profile…
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 px-6">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Your Profile</h1>

        <div className="space-y-4">
          <ProfileField label="Full Name" value={user!.name} />
          <ProfileField label="Email" value={user!.email} />
          <ProfileField label="Phone Number" value={user!.phone_number} />
          <ProfileField label="City" value={user!.city} />
          <ProfileField label="State" value={user!.state} />
          <ProfileField
            label="Account Type"
            value={user!.user_type === "host" ? "Host / Hotel Owner" : "Guest"}
          />
        </div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={() => router.push("/")}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg"
          >
            Home
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/signin");
            }}
            className="px-5 py-2 bg-red-600 text-white rounded-lg"
          >
            Log Out
          </button>
        </div>
      </div>
    </main>
  );
}

// ✅ Reusable Component
function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-lg font-semibold dark:text-white">{value}</p>
      <hr className="my-2 border-gray-300 dark:border-gray-700" />
    </div>
  );
}
