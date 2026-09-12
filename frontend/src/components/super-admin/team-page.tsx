"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Filter,
  Github,
  Pencil,
  Search,
  Trophy,
} from "lucide-react";
import { apiService } from "@/lib/service";
import { useToast } from "@/hooks/use-toast";
import type { Judge, Team } from "@/lib/types";

interface TeamPageProps {
  teams: Team[];
  judges: Judge[];
  onTeamUpdatedAction?: (team: Team) => void;
}

export function TeamPage({
  teams,
  judges,
  onTeamUpdatedAction,
}: TeamPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editName, setEditName] = useState("");
  const [editTeamId, setEditTeamId] = useState("");
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const { toast } = useToast();

  // Filter teams based on search and filters
  const filteredTeams = useMemo(() => {
    return (teams || []).filter((team) => {
      if (!team) return false;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (team.name || "").toLowerCase().includes(searchLower) ||
        (team.teamId || "").toLowerCase().includes(searchLower);
      const matchesStatus =
        statusFilter === "all" || team.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [teams, searchTerm, statusFilter]);

  const getTeamScore = (team: Team) => {
    const score = team.teamScores?.[0]?.totalScore;
    return score != null ? `${score}/10` : "Not Judged";
  };

  const viewTeamDetails = (team: Team) => {
    setSelectedTeam(team);
    setIsTeamDialogOpen(true);
    setIsEditingInfo(false);
  };

  const startEditingInfo = () => {
    if (!selectedTeam) return;
    setEditName(selectedTeam.name);
    setEditTeamId(selectedTeam.teamId);
    setIsEditingInfo(true);
  };

  const cancelEditingInfo = () => {
    setIsEditingInfo(false);
  };

  const saveTeamInfo = async () => {
    if (!selectedTeam) return;
    if (!editName.trim() || !editTeamId.trim()) {
      toast({
        title: "Error",
        description: "Team name and Team ID cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsSavingInfo(true);
    try {
      const updated = await apiService.updateTeam(selectedTeam.id, {
        name: editName.trim(),
        teamId: editTeamId.trim(),
      });
      const merged = { ...selectedTeam, ...updated };
      setSelectedTeam(merged);
      onTeamUpdatedAction?.(merged);
      setIsEditingInfo(false);
      toast({ title: "Success", description: "Team info updated" });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update team info",
        variant: "destructive",
      });
    } finally {
      setIsSavingInfo(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  function getJudgingTime(team: Team) {
    return team.teamScores &&
      team.teamScores.length > 0 &&
      team.teamScores[0]?.updatedAt
      ? new Date(team.teamScores[0].updatedAt).toLocaleString()
      : "Not Judged";
  }

  if (!teams || !judges) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-center">
              Loading team data...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            Team Management
          </h2>
          <p className="text-muted-foreground">
            View team status, scores, submissions, and judging details
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filters
          </CardTitle>
          <CardDescription>Filter teams by name or status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full flex-col gap-2 md:flex-row">
            <div className="w-full space-y-2">
              <Label>Search Teams</Label>
              <div className="relative">
                <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                <Input
                  placeholder="Search by team name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="REGISTERED">Registered</SelectItem>
                  <SelectItem value="PROBLEM_SELECTED">PS Selected</SelectItem>
                  <SelectItem value="ROUND1_SUBMITTED">R1 Submitted</SelectItem>
                  <SelectItem value="ROUND1_QUALIFIED">R1 Qualified</SelectItem>
                  <SelectItem value="ROUND2_SUBMITTED">R2 Submitted</SelectItem>
                  <SelectItem value="ROUND2_QUALIFIED">
                    R2 Qualified (Round 3)
                  </SelectItem>
                  <SelectItem value="ELIMINATED">Eliminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Actions</Label>
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full bg-transparent"
              >
                Clear Filters
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <Badge variant="outline">
              Showing {filteredTeams.length} teams
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Teams List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            All Teams
          </CardTitle>
          <CardDescription>
            Complete team overview with scores and submission status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTeams.map((team) => {
              const score = getTeamScore(team);
              const judgingTime = getJudgingTime(team);
              const judgeName =
                team.evaluations?.[0]?.judge?.name ?? "Not assigned";
              const isJudged = team.evaluations?.[0]?.status === "COMPLETED";

              return (
                <Card
                  key={team.id}
                  className={`border-l-2 ${isJudged ? "border-l-ok" : "border-l-warn"}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {team.name}
                          {isJudged ? (
                            <Badge variant="default">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Judged
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Clock className="mr-1 h-3 w-3" />
                              Pending
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          PS: {team.problemStatement?.title ?? "-"} • Room:{" "}
                          {team.round1Room?.block ?? ""}{" "}
                          {team.round1Room?.name ?? ""}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            team.submissionStatus === "SUBMITTED"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {team.submissionStatus === "SUBMITTED"
                            ? "Submitted"
                            : "Not Submitted"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Team Stats */}
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div className="text-center">
                          <div className="text-hackx text-2xl font-semibold tracking-tight tabular-nums">
                            {isJudged ? score : "N/A"}
                          </div>
                          <p className="text-muted-foreground text-xs">Score</p>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium">{judgeName}</div>
                          <p className="text-muted-foreground text-xs">Judge</p>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium">
                            {judgingTime}
                          </div>
                          <p className="text-muted-foreground text-xs">
                            Judged At
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium">
                            {team.status}
                          </div>
                          <p className="text-muted-foreground text-xs">
                            Team Status
                          </p>
                        </div>
                      </div>

                      {/* Submission Links */}
                      <div className="flex gap-2">
                        {team.githubRepo ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              window.open(team.githubRepo, "_blank")
                            }
                          >
                            <Github className="mr-2 h-4 w-4" />
                            GitHub
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" disabled>
                            <Github className="mr-2 h-4 w-4" />
                            No GitHub
                          </Button>
                        )}

                        {team.presentationLink !== null ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              window.open(team.presentationLink, "_blank")
                            }
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Presentation
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" disabled>
                            <FileText className="mr-2 h-4 w-4" />
                            No Presentation
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => viewTeamDetails(team)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Team Details Dialog */}
      <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Team Details: {selectedTeam?.name}</DialogTitle>
            <DialogDescription>
              Complete team information and evaluation details
            </DialogDescription>
          </DialogHeader>
          {selectedTeam && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="">Team Information</CardTitle>
                    {!isEditingInfo && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={startEditingInfo}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm font-medium *:space-y-1">
                    {isEditingInfo ? (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label htmlFor="edit-team-name" className="font-bold">
                            Team Name
                          </Label>
                          <Input
                            id="edit-team-name"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="edit-team-id" className="font-bold">
                            Team ID
                          </Label>
                          <Input
                            id="edit-team-id"
                            value={editTeamId}
                            onChange={(e) => setEditTeamId(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={saveTeamInfo}
                            disabled={isSavingInfo}
                          >
                            {isSavingInfo ? "Saving..." : "Save"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEditingInfo}
                            disabled={isSavingInfo}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <Label className="font-bold">Team Name:</Label>
                          <p>{selectedTeam.name}</p>
                        </div>
                        <div>
                          <Label className="font-bold">Team ID:</Label>
                          <p>{selectedTeam.teamId}</p>
                        </div>
                      </>
                    )}
                    <div>
                      <Label className="font-bold">Problem Statement:</Label>
                      <p>
                        {selectedTeam.problemStatement?.title ?? "-"} (
                        {selectedTeam.problemStatement?.id ?? "-"})
                      </p>
                    </div>
                    <div>
                      <Label className="font-bold">Room Number:</Label>
                      <p>
                        {selectedTeam.round1Room?.block ?? ""}{" "}
                        {selectedTeam.round1Room?.name ?? ""}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="">Evaluation Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm font-medium *:space-y-1">
                    <div>
                      <Label className="font-bold">Judge:</Label>
                      <p>
                        {selectedTeam.evaluations?.[0]?.judge?.name ??
                          "Not assigned"}
                      </p>
                    </div>
                    <div>
                      <Label className="font-bold">Score:</Label>
                      <p>
                        {selectedTeam.evaluations?.[0]?.status === "COMPLETED"
                          ? getTeamScore(selectedTeam)
                          : "Not judged"}
                      </p>
                    </div>
                    <div>
                      <Label className="font-bold">Judging Time:</Label>
                      <p>{getJudgingTime(selectedTeam)}</p>
                    </div>
                    <div>
                      <Label className="font-bold">Status:</Label>
                      <p>{selectedTeam.status || "Not Selected"}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="">Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>GitHub Repository:</span>
                      {selectedTeam.githubRepo ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            window.open(selectedTeam?.githubRepo, "_blank")
                          }
                        >
                          <Github className="mr-2 h-4 w-4" />
                          View Repository
                        </Button>
                      ) : (
                        <Badge variant="destructive">Not Submitted</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Presentation:</span>
                      {selectedTeam.presentationLink ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            window.open(
                              selectedTeam.presentationLink!,
                              "_blank",
                            )
                          }
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          View Presentation
                        </Button>
                      ) : (
                        <Badge variant="destructive">Not Submitted</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Overall Status:</span>
                      <Badge
                        variant={
                          selectedTeam.submissionStatus === "SUBMITTED"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {selectedTeam.submissionStatus === "SUBMITTED"
                          ? "Complete"
                          : "Not Submitted"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-hackx text-2xl font-semibold tracking-tight tabular-nums">
              {teams.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Teams Judged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-ok-ink text-2xl font-semibold tracking-tight tabular-nums">
              {teams.filter((t) => t.judgementStatus === "Completed").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Submissions Complete</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-info-ink text-2xl font-semibold tracking-tight tabular-nums">
              {teams.filter((t) => t.submissionStatus === "SUBMITTED").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Round 2 Selected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-warn-ink text-2xl font-semibold tracking-tight tabular-nums">
              {teams.filter((t) => t.round2Status === "Selected").length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
