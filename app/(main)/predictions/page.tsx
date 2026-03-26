"use client";

import { useEffect, useState } from "react";
import { usePredictionStore } from "@/stores/prediction-store";
import { useAuthStore } from "@/stores/auth-store";
import { createClient } from "@/lib/supabase/client";
import type { Match, Prediction } from "@/types";
import { CheckCircle, XCircle, Clock, Trophy, WifiOff } from "lucide-react";

const MAX_FREE_DAILY = 3;

const FLAG: Record<string, string> = {
  ES: "🇪🇸", AR: "🇦🇷", BR: "🇧🇷", IT: "🇮🇹", FR: "🇫🇷",
  DE: "🇩🇪", PT: "🇵🇹", BE: "🇧🇪", CH: "🇨🇭", SE: "🇸🇪",
  US: "🇺🇸", GB: "🇬🇧", NL: "🇳🇱",
};
const flag = (code: string) => FLAG[code?.toUpperCase()] ?? "🏳️";

function formatCountdown(scheduledAt: string): string {
  const diff = new Date(scheduledAt).getTime() - Date.now();
  if (diff <= 0) return "Gestartet";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 24) return `${Math.floor(h / 24)}T`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function StatusIcon({ status }: { status: Prediction["status"] }) {
  if (status === "correct") return <CheckCircle className="w-4 h-4 text-success" />;
  if (status === "wrong") return <XCircle className="w-4 h-4 text-accent" />;
  if (status === "partial") return <Trophy className="w-4 h-4 text-warning" />;
  return <Clock className="w-4 h-4 text-muted" />;
}

function PredictionModal({
  match,
  onClose,
  onSubmit,
}: {
  match: Match;
  onClose: () => void;
  onSubmit: (team: 1 | 2, score?: string) => Promise<void>;
}) {
  const [selectedTeam, setSelectedTeam] = useState<1 | 2 | null>(null);
  const [selectedScore, setSelectedScore] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const scores = ["2:0", "2:1", "1:2", "0:2"];

  const team1 = `${match.team1Player1.name.split(" ").pop()} / ${match.team1Player2.name.split(" ").pop()}`;
  const team2 = `${match.team2Player1.name.split(" ").pop()} / ${match.team2Player2.name.split(" ").pop()}`;

  async function handleSubmit() {
    if (!selectedTeam) return;
    setLoading(true);
    await onSubmit(selectedTeam, selectedScore || undefined);
    setLoading(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl w-full max-w-md p-6 space-y-5">
        <div>
          <p className="text-xs text-muted mb-1">{match.tournamentName} · {match.round}</p>
          <h3 className="font-semibold text-lg">Wer gewinnt?</h3>
        </div>

        {/* Team selection */}
        <div className="space-y-3">
          {([1, 2] as const).map((team) => {
            const name = team === 1 ? team1 : team2;
            const p1 = team === 1 ? match.team1Player1 : match.team2Player1;
            return (
              <button
                key={team}
                onClick={() => setSelectedTeam(team)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition ${
                  selectedTeam === team
                    ? "border-accent bg-accent/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <span className="text-xl">{flag(p1.country)}</span>
                <span className="font-medium">{name}</span>
                {selectedTeam === team && <CheckCircle className="w-5 h-5 text-accent ml-auto" />}
              </button>
            );
          })}
        </div>

        {/* Optional score */}
        <div>
          <p className="text-sm text-muted mb-2">Satz-Ergebnis (optional, +5 Bonuspunkte)</p>
          <div className="flex gap-2">
            {scores.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedScore(selectedScore === s ? "" : s)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                  selectedScore === s
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-white/10 text-muted hover:border-white/20"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted text-center">
          Bis zu {selectedScore ? "+20" : "+10"} Punkte möglich
        </p>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-muted hover:text-primary transition">
            Abbrechen
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedTeam || loading}
            className="flex-1 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent/90 transition disabled:opacity-50"
          >
            {loading ? "Wird gespeichert…" : "Prediction abgeben"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PredictionsPage() {
  const { upcomingMatches, myPredictions, dailyCount, isLoading, error, fetch, submitPrediction } = usePredictionStore();
  const { user } = useAuthStore();
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [tab, setTab] = useState<"upcoming" | "mine">("upcoming");

  // Load user from Supabase on mount if not in store
  useEffect(() => {
    const loadUser = async () => {
      if (!user) {
        const supabase = createClient();
        const { data: { user: u } } = await supabase.auth.getUser();
        if (u) {
          useAuthStore.getState().setUser(u);
          fetch(u.id);
        }
      } else {
        fetch(user.id);
      }
    };
    loadUser();
  }, [fetch, user]);

  const canPredict = dailyCount < MAX_FREE_DAILY;
  const predictedMatchIds = new Set(myPredictions.map((p) => p.matchId));

  async function handleSubmit(team: 1 | 2, score?: string) {
    if (!user || !selectedMatch) return;
    await submitPrediction(user.id, selectedMatch.id, team, score);
  }

  const flag = (code: string) => ({ ES: "🇪🇸", AR: "🇦🇷", BR: "🇧🇷", IT: "🇮🇹", FR: "🇫🇷" } as Record<string, string>)[code?.toUpperCase()] ?? "🏳️";

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Predictions</h1>
        <span className="text-sm text-muted bg-surface px-3 py-1 rounded-full">
          {dailyCount}/{MAX_FREE_DAILY} heute
        </span>
      </div>

      {/* Tabs */}
      <div className="flex bg-surface rounded-xl p-1 mb-6">
        {(["upcoming", "mine"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              tab === t ? "bg-accent text-white" : "text-muted hover:text-primary"
            }`}
          >
            {t === "upcoming" ? "Kommende Matches" : "Meine Predictions"}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-accent/10 border border-accent/30 text-accent rounded-xl p-4 mb-4 text-sm">{error}</div>
      )}

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="bg-surface rounded-2xl h-24 animate-pulse" />)}
        </div>
      )}

      {!isLoading && tab === "upcoming" && (
        <div className="space-y-3">
          {upcomingMatches.length === 0 ? (
            <div className="text-center py-16 text-muted">
              <WifiOff className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>Keine bevorstehenden Matches</p>
            </div>
          ) : upcomingMatches.map((match) => {
            const alreadyPredicted = predictedMatchIds.has(match.id);
            const locked = match.scheduledAt
              ? new Date(match.scheduledAt).getTime() - Date.now() < 5 * 60 * 1000
              : false;

            return (
              <div key={match.id} className="bg-surface rounded-2xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted">{match.tournamentName}</span>
                  {match.scheduledAt && (
                    <span className="text-xs text-warning font-medium">
                      {formatCountdown(match.scheduledAt)}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium mb-3">
                  {match.team1Player1.name.split(" ").pop()} / {match.team1Player2.name.split(" ").pop()}
                  {" vs "}
                  {match.team2Player1.name.split(" ").pop()} / {match.team2Player2.name.split(" ").pop()}
                </p>
                {alreadyPredicted ? (
                  <span className="flex items-center gap-1 text-success text-sm">
                    <CheckCircle className="w-4 h-4" /> Prediction abgegeben
                  </span>
                ) : (
                  <button
                    onClick={() => setSelectedMatch(match)}
                    disabled={!canPredict || locked}
                    className="w-full py-2 rounded-xl bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {locked ? "Gesperrt" : !canPredict ? "Tageslimit erreicht" : "Prediction abgeben"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && tab === "mine" && (
        <div className="space-y-3">
          {myPredictions.length === 0 ? (
            <div className="text-center py-16 text-muted">
              <Trophy className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>Noch keine Predictions</p>
            </div>
          ) : myPredictions.map((pred) => (
            <div key={pred.id} className="bg-surface rounded-2xl p-4 border border-white/5 flex items-center justify-between">
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

      {selectedMatch && (
        <PredictionModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
