"use client";

import { useEffect, useState } from "react";
import { useMatchStore } from "@/stores/match-store";
import type { Match, Tournament } from "@/types";
import { Wifi, WifiOff, RefreshCw, MapPin, Calendar } from "lucide-react";

type Tab = "live" | "results" | "season";

const FLAG: Record<string, string> = {
  ES: "🇪🇸", AR: "🇦🇷", BR: "🇧🇷", IT: "🇮🇹", FR: "🇫🇷",
  DE: "🇩🇪", PT: "🇵🇹", BE: "🇧🇪", CH: "🇨🇭", SE: "🇸🇪",
  US: "🇺🇸", GB: "🇬🇧", NL: "🇳🇱", AE: "🇦🇪", QA: "🇶🇦",
};
const flag = (code: string) => FLAG[code?.toUpperCase()] ?? "🏳️";

function CategoryBadge({ category }: { category: Tournament["category"] }) {
  const styles: Record<string, string> = {
    major: "bg-yellow-500/20 text-yellow-400",
    p1: "bg-blue-500/20 text-blue-400",
    p2: "bg-purple-500/20 text-purple-400",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[category]}`}>
      {category.toUpperCase()}
    </span>
  );
}

function StatusBadge({ status }: { status: Tournament["status"] }) {
  if (status === "live") return (
    <span className="flex items-center gap-1 text-xs text-success">
      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
      Live
    </span>
  );
  if (status === "completed") return <span className="text-xs text-muted">Abgeschlossen</span>;
  return <span className="text-xs text-warning">Bevorstehend</span>;
}

function LiveDot() {
  return (
    <span className="flex items-center gap-1 text-xs font-medium text-accent">
      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
      Live
    </span>
  );
}

function MatchCard({ match }: { match: Match }) {
  const isLive = match.status === "live";
  const sets = match.score?.sets ?? [];

  return (
    <div className={`bg-surface rounded-2xl p-4 border ${isLive ? "border-accent/30" : "border-white/5"}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted">{match.tournamentName} · {match.round ?? ""}</span>
        {isLive ? <LiveDot /> : (
          <span className="text-xs text-muted">
            {match.scheduledAt
              ? new Date(match.scheduledAt).toLocaleString("de-CH", { weekday: "short", hour: "2-digit", minute: "2-digit" })
              : match.completedAt
              ? new Date(match.completedAt).toLocaleDateString("de-CH")
              : ""}
          </span>
        )}
      </div>

      {/* Teams */}
      <div className="space-y-2">
        {[
          [match.team1Player1, match.team1Player2, 1],
          [match.team2Player1, match.team2Player2, 2],
        ].map(([p1, p2, team]) => (
          <div key={team as number} className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span>{flag((p1 as Match["team1Player1"]).country)}</span>
              <span className="text-sm font-medium truncate">
                {(p1 as Match["team1Player1"]).name.split(" ").pop()} / {(p2 as Match["team1Player2"]).name.split(" ").pop()}
              </span>
            </div>
            <div className="flex gap-2 ml-2 shrink-0">
              {sets.map((s, i) => (
                <span key={i} className={`text-sm w-5 text-center font-mono ${
                  (team === 1 ? s.team1 > s.team2 : s.team2 > s.team1) ? "text-primary font-bold" : "text-muted"
                }`}>
                  {team === 1 ? s.team1 : s.team2}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TournamentCard({ tournament }: { tournament: Tournament }) {
  return (
    <div className="bg-surface rounded-2xl p-4 border border-white/5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <CategoryBadge category={tournament.category} />
            <StatusBadge status={tournament.status} />
          </div>
          <h3 className="font-semibold text-primary truncate">{tournament.name}</h3>
          <div className="flex items-center gap-1 mt-1 text-muted text-sm">
            <MapPin className="w-3 h-3" />
            <span>{tournament.location}</span>
            {tournament.country && <span>{flag(tournament.country)}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 text-muted text-xs shrink-0">
          <Calendar className="w-3 h-3" />
          <span>
            {new Date(tournament.startDate).toLocaleDateString("de-CH", { day: "2-digit", month: "short" })}
            {" – "}
            {new Date(tournament.endDate).toLocaleDateString("de-CH", { day: "2-digit", month: "short" })}
          </span>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16 text-muted">
      <WifiOff className="w-10 h-10 mx-auto mb-3 opacity-40" />
      <p>{message}</p>
    </div>
  );
}

export default function MatchesPage() {
  const { liveMatches, recentResults, tournaments, isLoading, error, fetch } = useMatchStore();
  const [tab, setTab] = useState<Tab>("live");

  useEffect(() => {
    fetch();
  }, [fetch]);

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "live", label: "Live", count: liveMatches.length },
    { key: "results", label: "Resultate" },
    { key: "season", label: "Saison" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Matches</h1>
        <button
          onClick={fetch}
          disabled={isLoading}
          className="p-2 rounded-xl hover:bg-surface transition"
        >
          <RefreshCw className={`w-5 h-5 text-muted ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-surface rounded-xl p-1 mb-6">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition ${
              tab === key ? "bg-accent text-white" : "text-muted hover:text-primary"
            }`}
          >
            {label}
            {count !== undefined && count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === key ? "bg-white/20" : "bg-white/10"}`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-accent/10 border border-accent/30 text-accent rounded-xl p-4 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface rounded-2xl p-4 h-24 animate-pulse" />
          ))}
        </div>
      )}

      {/* Content */}
      {!isLoading && (
        <div className="space-y-3">
          {tab === "live" && (
            liveMatches.length === 0
              ? <EmptyState message="Gerade keine Live-Matches" />
              : liveMatches.map((m) => <MatchCard key={m.id} match={m} />)
          )}
          {tab === "results" && (
            recentResults.length === 0
              ? <EmptyState message="Noch keine Resultate" />
              : recentResults.map((m) => <MatchCard key={m.id} match={m} />)
          )}
          {tab === "season" && (
            tournaments.length === 0
              ? <EmptyState message="Kein Turnierplan vorhanden" />
              : tournaments.map((t) => <TournamentCard key={t.id} tournament={t} />)
          )}
        </div>
      )}
    </div>
  );
}
