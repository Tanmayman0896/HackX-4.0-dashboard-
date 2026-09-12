"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  Clock,
  DoorOpen,
  Eye,
  FileText,
  Filter,
  Github,
  RefreshCw,
  Search,
  UsersRound,
} from "lucide-react";
import { apiService } from "@/lib/service";
import type { Round3Team } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ScoreFilter = "all" | "complete" | "pending";

function formatScore(score: string | number) {
  return Number(score).toFixed(2);
}

export function TeamRound3Page() {
  const [teams, setTeams] = useState<Round3Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Round3Team | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const refreshTeams = useCallback(async () => {
    setIsLoading(true);
    try {
      setTeams(await apiService.getRound3Teams());
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to load Round 3 teams",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    refreshTeams();
  }, [refreshTeams]);

  const filteredTeams = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return teams.filter((team) => {
      const matchesSearch =
        team.name.toLowerCase().includes(query) ||
        team.teamId.toLowerCase().includes(query);
      const isComplete = team.round3FinalScore !== null;
      const matchesScore =
        scoreFilter === "all" ||
        (scoreFilter === "complete" && isComplete) ||
        (scoreFilter === "pending" && !isComplete);

      return matchesSearch && matchesScore;
    });
  }, [scoreFilter, searchTerm, teams]);

  const openDetails = (team: Round3Team) => {
    setSelectedTeam(team);
    setIsDialogOpen(true);
  };

  const scoreForJudge = (team: Round3Team, judgeId: string) =>
    team.teamScores.find((score) => score.judge.id === judgeId);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="text-muted-foreground h-6 w-6 animate-spin" />
      </div>
    );
  }

  const completedTeams = teams.filter(
    (team) => team.round3FinalScore !== null,
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            Team Round 3
          </h2>
          <p className="text-muted-foreground text-sm">
            Round 3 assignments and two-judge final scores
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refreshTeams}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filters
          </CardTitle>
          <CardDescription>
            Filter Round 3 teams and judging state
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="w-full space-y-2">
              <Label htmlFor="round3-team-search">Search Teams</Label>
              <div className="relative">
                <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                <Input
                  id="round3-team-search"
                  placeholder="Search by team name or ID"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2 md:w-56">
              <Label>Scoring</Label>
              <Select
                value={scoreFilter}
                onValueChange={(value: ScoreFilter) => setScoreFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All teams</SelectItem>
                  <SelectItem value="complete">Final score ready</SelectItem>
                  <SelectItem value="pending">Awaiting scores</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Badge variant="outline" className="mt-4">
            Showing {filteredTeams.length} teams
          </Badge>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredTeams.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground p-8 text-center">
              No Round 3 teams match these filters.
            </CardContent>
          </Card>
        ) : (
          filteredTeams.map((team) => {
            const isComplete = team.round3FinalScore !== null;

            return (
              <Card
                key={team.id}
                className={`border-l-2 ${isComplete ? "border-l-ok" : "border-l-warn"}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle className="flex flex-wrap items-center gap-2">
                        {team.name}
                        <Badge variant={isComplete ? "default" : "secondary"}>
                          {isComplete ? (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          ) : (
                            <Clock className="mr-1 h-3 w-3" />
                          )}
                          {isComplete ? "Final score ready" : "Scoring pending"}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {team.teamId} ·{" "}
                        {team.problemStatement?.title ?? "No problem statement"}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      <DoorOpen className="mr-1 h-3 w-3" />
                      {team.round3Room?.name ?? "Room not assigned"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="text-center">
                      <div className="text-hackx text-2xl font-semibold tabular-nums">
                        {isComplete
                          ? `${team.round3FinalScore?.toFixed(2)}/10`
                          : "N/A"}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Final Average
                      </p>
                    </div>
                    {team.evaluations.map((evaluation, index) => {
                      const score = scoreForJudge(team, evaluation.judge.id);
                      return (
                        <div key={evaluation.id} className="text-center">
                          <div className="text-sm font-medium">
                            {evaluation.judge.name}
                          </div>
                          <p className="text-muted-foreground text-xs">
                            Judge {index + 1}:{" "}
                            {score
                              ? `${formatScore(score.totalScore)}/10`
                              : "Pending"}
                          </p>
                        </div>
                      );
                    })}
                    {team.evaluations.length <
                      team.round3RequiredJudgeCount && (
                      <div className="text-center">
                        <div className="text-warn-ink text-sm font-medium">
                          Not assigned
                        </div>
                        <p className="text-muted-foreground text-xs">
                          Judge {team.evaluations.length + 1}
                        </p>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-sm font-medium tabular-nums">
                        {team.round3ScoredJudgeCount}/
                        {team.round3RequiredJudgeCount}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Scores Submitted
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!team.githubRepo}
                      onClick={() => window.open(team.githubRepo, "_blank")}
                    >
                      <Github className="mr-2 h-4 w-4" />
                      GitHub
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!team.presentationLink}
                      onClick={() =>
                        window.open(team.presentationLink, "_blank")
                      }
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Presentation
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDetails(team)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Round 3 Teams</CardTitle>
          </CardHeader>
          <CardContent className="text-hackx text-2xl font-semibold tabular-nums">
            {teams.length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Final Scores Ready</CardTitle>
          </CardHeader>
          <CardContent className="text-ok-ink text-2xl font-semibold tabular-nums">
            {completedTeams}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Awaiting Scores</CardTitle>
          </CardHeader>
          <CardContent className="text-warn-ink text-2xl font-semibold tabular-nums">
            {teams.length - completedTeams}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTeam?.name} · Round 3</DialogTitle>
            <DialogDescription>
              Individual judge results and final average
            </DialogDescription>
          </DialogHeader>
          {selectedTeam && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 rounded-md border p-4 sm:grid-cols-3">
                <div>
                  <Label>Team ID</Label>
                  <p className="mt-1 text-sm font-medium">
                    {selectedTeam.teamId}
                  </p>
                </div>
                <div>
                  <Label>Meeting Room</Label>
                  <p className="mt-1 text-sm font-medium">
                    {selectedTeam.round3Room?.name ?? "Not assigned"}
                  </p>
                </div>
                <div>
                  <Label>Final Average</Label>
                  <p className="text-hackx mt-1 text-lg font-semibold tabular-nums">
                    {selectedTeam.round3FinalScore !== null
                      ? `${selectedTeam.round3FinalScore.toFixed(2)}/10`
                      : "Awaiting both scores"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <UsersRound className="h-4 w-4" />
                  Judge Scores
                </h3>
                {selectedTeam.evaluations.map((evaluation, index) => {
                  const score = scoreForJudge(
                    selectedTeam,
                    evaluation.judge.id,
                  );
                  return (
                    <div key={evaluation.id} className="rounded-md border p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            Judge {index + 1}: {evaluation.judge.name}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {evaluation.status === "COMPLETED"
                              ? "Evaluation completed"
                              : "Evaluation pending"}
                          </p>
                        </div>
                        <Badge variant={score ? "default" : "secondary"}>
                          {score
                            ? `${formatScore(score.totalScore)}/10`
                            : "Pending"}
                        </Badge>
                      </div>
                      {score && (
                        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
                          <div>Innovation: {score.innovation}</div>
                          <div>Technical: {score.technical}</div>
                          <div>Presentation: {score.presentation}</div>
                          <div>Feasibility: {score.feasibility}</div>
                          <div>Impact: {score.impact}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
