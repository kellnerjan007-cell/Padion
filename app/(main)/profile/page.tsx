"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Clock, Trophy, LogOut, User } from "lucide-react";
import type { Profile, Prediction } from "@/types";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-background rounded-xl p-4 text-center">
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className="text-xs text-muted mt-1">{label}</p>
    </div>
  );
}

function StatusIcon({ status }: { status: Prediction["status"] }) {
  if (status === "correct") return <CheckCircle className="w-4 h-4 text-success" />;
  if (status === "wrong") return <XCircle className="w-4 h-4 text-accent" />;
  if (status === "partial") return <Trophy className="w-4 h-4 text-warning" />;
  return <Clock className="w-4 h-4 text-muted" />;
}

export default function ProfilePage() {
  const { user, profile, signOut } = useAuthStore();
  const router = useRouter();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loadedProfile, setLoadedProfile] = useState<Profile | null>(profile);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { router.push("/login"); return; }

      useAuthStore.getState().setUser(u);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", u.id)
        .single();

      if (profileData) {
        const mapped: Profile = {
          id: profileData.id as string,
          username: profileData.username as string,
          displayName: profileData.display_name as string,
          avatarUrl: profileData.avatar_url as string | null,
          country: profileData.country as string | null,
          isPremium: profileData.is_premium as boolean,
          totalPoints: profileData.total_points as number,
          createdAt: profileData.created_at as string,
        };
        setLoadedProfile(mapped);
        useAuthStore.getState().setProfile(mapped);
      }

      const { data: predsData } = await supabase
        .from("predictions")
        .select("*")
        .eq("user_id", u.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (predsData) {
        setPredictions(predsData.map((row) => ({
          id: row.id as string,
          userId: row.user_id as string,
          matchId: row.match_id as string,
          predictedWinnerTeam: row.predicted_winner_team as 1 | 2,
          predictedScore: row.predicted_score as string | null,
          pointsEarned: row.points_earned as number,
          status: row.status as Prediction["status"],
          createdAt: row.created_at as string,
        })));
      }

      setIsLoading(false);
    };

    loadProfile();
  }, [router]);

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  const correct = predictions.filter((p) => p.status === "correct").length;
  const total = predictions.filter((p) => p.status !== "pending").length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="h-24 bg-surface rounded-2xl animate-pulse" />
        <div className="h-20 bg-surface rounded-2xl animate-pulse" />
        <div className="h-40 bg-surface rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profil</h1>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-muted hover:text-accent transition text-sm"
        >
          <LogOut className="w-4 h-4" />
          Abmelden
        </button>
      </div>

      {/* Avatar + name */}
      <div className="bg-surface rounded-2xl p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
          {loadedProfile?.avatarUrl ? (
            <img src={loadedProfile.avatarUrl} className="w-16 h-16 rounded-full object-cover" alt="" />
          ) : (
            <User className="w-8 h-8 text-accent" />
          )}
        </div>
        <div>
          <p className="font-bold text-lg">{loadedProfile?.displayName ?? user?.email}</p>
          {loadedProfile?.username && (
            <p className="text-muted text-sm">@{loadedProfile.username}</p>
          )}
          {loadedProfile?.isPremium && (
            <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full mt-1 inline-block">
              Premium
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Punkte" value={loadedProfile?.totalPoints ?? 0} />
        <StatCard label="Trefferquote" value={`${accuracy}%`} />
        <StatCard label="Predictions" value={predictions.length} />
      </div>

      {/* Prediction History */}
      <div>
        <h2 className="font-semibold mb-3">Prediction-Verlauf</h2>
        {predictions.length === 0 ? (
          <div className="text-center py-10 text-muted bg-surface rounded-2xl">
            <Trophy className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Noch keine Predictions</p>
          </div>
        ) : (
          <div className="space-y-2">
            {predictions.map((pred) => (
              <div key={pred.id} className="bg-surface rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    Team {pred.predictedWinnerTeam} gewinnt
                    {pred.predictedScore && <span className="text-muted"> · {pred.predictedScore}</span>}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {new Date(pred.createdAt).toLocaleDateString("de-CH")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIcon status={pred.status} />
                  {pred.pointsEarned > 0 && (
                    <span className="text-success text-sm font-bold">+{pred.pointsEarned}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
