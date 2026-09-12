"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  ClipboardList,
  RefreshCw,
  Shuffle,
  Trophy,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { apiService } from "@/lib/service";
import { useToast } from "@/hooks/use-toast";
import type { Judge, Round3Candidate, Round3Room } from "@/lib/types";

const TOP_TEAMS_COUNT = 30;
const REQUIRED_JUDGES_PER_ROOM = 2;

export function Round3RoomManagement({ judges }: { judges: Judge[] }) {
  const [candidates, setCandidates] = useState<Round3Candidate[]>([]);
  const [rooms, setRooms] = useState<Round3Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [isAutoAssignOpen, setIsAutoAssignOpen] = useState(false);
  const [isMoveTeamOpen, setIsMoveTeamOpen] = useState(false);
  const [moveTeamId, setMoveTeamId] = useState<string>("");
  const [moveTargetRoom, setMoveTargetRoom] = useState<string>("");
  const [isBusy, setIsBusy] = useState(false);
  const { toast } = useToast();

  const refreshData = useCallback(async () => {
    try {
      const [candidatesData, roomsData] = await Promise.all([
        apiService.getRound3Candidates(),
        apiService.getRound3Rooms(),
      ]);
      setCandidates(candidatesData);
      setRooms(roomsData);
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Failed to load Round 3 data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const selectedTeams = candidates.filter(
    (t) => t.status === "ROUND2_QUALIFIED",
  );
  const assignedJudgeIds = new Set(
    rooms.flatMap((room) => room.judges.map((j) => j.id)),
  );
  const availableJudges = judges.filter((j) => !assignedJudgeIds.has(j.id));
  const allRoomsStaffed =
    rooms.length > 0 &&
    rooms.every((room) => room.judges.length === REQUIRED_JUDGES_PER_ROOM);
  const assignedTeamCount = rooms.reduce(
    (sum, room) => sum + room.teams.length,
    0,
  );
  const pendingTeams = selectedTeams.length - assignedTeamCount;

  const handleSelectTop30 = async () => {
    setIsBusy(true);
    try {
      const result = await apiService.selectTopTeamsForRound3(TOP_TEAMS_COUNT);
      toast({
        title: "Success",
        description: result.message,
      });
      setIsSelectOpen(false);
      await refreshData();
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to select top teams",
        variant: "destructive",
      });
    } finally {
      setIsBusy(false);
    }
  };

  const handleAutoAssign = async () => {
    setIsBusy(true);
    try {
      const result = await apiService.autoAssignRound3Teams();
      toast({
        title: "Success",
        description: `${result.summary.teamsAssigned} teams divided into ${result.summary.roomsAssigned.length} rooms (${result.summary.evaluationsCreated} evaluations created)`,
      });
      setIsAutoAssignOpen(false);
      await refreshData();
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to divide teams",
        variant: "destructive",
      });
    } finally {
      setIsBusy(false);
    }
  };

  const handleAssignJudge = async (judgeId: string, roomId: string) => {
    if (!judgeId || !roomId) return;
    try {
      await apiService.assignJudgeToRound3Room(judgeId, roomId);
      toast({
        title: "Success",
        description: "Judge assigned to meeting room",
      });
      await refreshData();
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to assign judge",
        variant: "destructive",
      });
    }
  };

  const handleRemoveJudge = async (judgeId: string) => {
    try {
      await apiService.removeJudgeFromRound3Room(judgeId);
      toast({
        title: "Success",
        description: "Judge removed from meeting room",
      });
      await refreshData();
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to remove judge",
        variant: "destructive",
      });
    }
  };

  const handleMoveTeam = async () => {
    if (!moveTeamId || !moveTargetRoom) return;
    try {
      await apiService.assignTeamToRound3Room(moveTeamId, moveTargetRoom);
      toast({
        title: "Success",
        description: "Team moved successfully",
      });
      setIsMoveTeamOpen(false);
      setMoveTeamId("");
      setMoveTargetRoom("");
      await refreshData();
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to move team",
        variant: "destructive",
      });
    }
  };

  const getJudgeName = (judgeId: string) => {
    return judges.find((j) => j.id === judgeId)?.name ?? "Unknown Judge";
  };

  const previewTeams = candidates
    .filter((c) => c.averageScore !== null)
    .slice(0, TOP_TEAMS_COUNT);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="text-muted-foreground h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h2 className="text-base font-semibold tracking-tight">
          Round 3 Room Management
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={refreshData} size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          <Dialog open={isSelectOpen} onOpenChange={setIsSelectOpen}>
            <Button onClick={() => setIsSelectOpen(true)}>
              <Trophy className="mr-2 h-4 w-4" />
              Select Top {TOP_TEAMS_COUNT}
            </Button>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  Select Top {TOP_TEAMS_COUNT} Teams for Round 3
                </DialogTitle>
                <DialogDescription>
                  Ranked by average Round 2 score across judges. Confirming will
                  promote these teams.
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-72 space-y-1 overflow-y-auto rounded-md border p-2">
                {previewTeams.length === 0 ? (
                  <p className="text-muted-foreground p-4 text-center text-sm">
                    No scored teams available yet.
                  </p>
                ) : (
                  previewTeams.map((team, index) => (
                    <div
                      key={team.id}
                      className="odd:bg-muted/50 flex items-center justify-between rounded px-2 py-1 text-sm"
                    >
                      <span>
                        <span className="text-muted-foreground mr-2 inline-block w-6 text-right font-semibold">
                          {index + 1}.
                        </span>
                        <span className="font-medium">{team.name}</span>
                        <span className="text-muted-foreground ml-2 text-xs">
                          ({team.teamId})
                        </span>
                      </span>
                      <Badge variant="outline">
                        Avg {team.averageScore?.toFixed(1)} · {team.judgeCount}{" "}
                        judges
                      </Badge>
                    </div>
                  ))
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsSelectOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSelectTop30} disabled={isBusy}>
                  {isBusy ? "Selecting..." : "Confirm Selection"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAutoAssignOpen} onOpenChange={setIsAutoAssignOpen}>
            <Button
              variant="secondary"
              disabled={!allRoomsStaffed || selectedTeams.length === 0}
              onClick={() => setIsAutoAssignOpen(true)}
            >
              <Shuffle className="mr-2 h-4 w-4" />
              Auto-Divide Teams
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Divide Teams Across Meeting Rooms</DialogTitle>
                <DialogDescription>
                  {selectedTeams.length} selected teams will be distributed
                  evenly ({rooms.map((r) => r.capacity).join("/")}) based on
                  rank, and evaluations will be created for each room&apos;s
                  judges.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAutoAssignOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAutoAssign} disabled={isBusy}>
                  {isBusy ? "Dividing..." : "Divide Teams"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!allRoomsStaffed && (
        <Card className="border-l-warn border-l-2">
          <CardContent className="text-muted-foreground pt-4 text-sm">
            Assign exactly {REQUIRED_JUDGES_PER_ROOM} judges to each meeting
            room before dividing teams. Rooms needing attention:{" "}
            <span className="font-medium">
              {rooms
                .filter(
                  (room) => room.judges.length !== REQUIRED_JUDGES_PER_ROOM,
                )
                .map((room) => `${room.name} (${room.judges.length})`)
                .join(", ") || "none"}
            </span>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {rooms.map((room) => (
          <Card
            key={room.id}
            className={`border-l-2 ${
              room.judges.length > 0 ? "border-l-ok" : "border-l-border"
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="">{room.name}</CardTitle>
                  <CardDescription>Capacity: {room.capacity}</CardDescription>
                </div>
                <Badge
                  variant={
                    room.judges.length === REQUIRED_JUDGES_PER_ROOM
                      ? "default"
                      : "secondary"
                  }
                >
                  {room.judges.length}/{REQUIRED_JUDGES_PER_ROOM} Judges
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="space-y-1">
                {room.judges.map((judge) => (
                  <div
                    key={judge.id}
                    className="bg-muted flex items-center justify-between rounded-md px-2 py-1"
                  >
                    <span className="flex items-center gap-1.5 text-sm">
                      <UserCheck className="text-ok-ink h-3.5 w-3.5" />
                      {judge.name}
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${judge.name}`}
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded p-0.5"
                      onClick={() => handleRemoveJudge(judge.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {room.judges.length < REQUIRED_JUDGES_PER_ROOM && (
                  <Select
                    value=""
                    onValueChange={(judgeId) =>
                      handleAssignJudge(judgeId, room.id)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="+ Add judge to room" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableJudges.map((judge) => (
                        <SelectItem key={judge.id} value={judge.id}>
                          {judge.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div>
                <div className="text-muted-foreground mb-1 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> Teams
                  </span>
                  <span>
                    {room.teams.length}/{room.capacity}
                  </span>
                </div>
                <Progress
                  value={(room.teams.length / room.capacity) * 100}
                  className="h-2"
                />
              </div>

              <div className="min-h-[2rem]">
                {room.teams.length > 0 ? (
                  <div>
                    {room.teams.map((team) => (
                      <Badge
                        key={team.id}
                        variant="outline"
                        className="mr-1 mb-1"
                      >
                        {team.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-xs">
                    No teams assigned yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Assignment Summary</CardTitle>
              <CardDescription>
                Overview of Round 3 meeting room assignments
              </CardDescription>
            </div>
            <Dialog open={isMoveTeamOpen} onOpenChange={setIsMoveTeamOpen}>
              <Button variant="outline" onClick={() => setIsMoveTeamOpen(true)}>
                <ClipboardList className="mr-2 h-4 w-4" />
                Move Team
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Move Team to Meeting Room</DialogTitle>
                  <DialogDescription>
                    Manually override a team&apos;s meeting room assignment.
                    Evaluations are rebuilt for the destination room&apos;s
                    judges.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Team</label>
                    <Select value={moveTeamId} onValueChange={setMoveTeamId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a team" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedTeams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name} ({team.teamId})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Destination Room
                    </label>
                    <Select
                      value={moveTargetRoom}
                      onValueChange={setMoveTargetRoom}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a room" />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.name} — {room.teams.length}/{room.capacity},
                            Judges:{" "}
                            {room.judges.length > 0
                              ? room.judges
                                  .map((j) => getJudgeName(j.id))
                                  .join(", ")
                              : "none"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsMoveTeamOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleMoveTeam}>Move Team</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-hackx text-2xl font-semibold tracking-tight tabular-nums">
                {
                  rooms.filter(
                    (room) => room.judges.length === REQUIRED_JUDGES_PER_ROOM,
                  ).length
                }
                /{rooms.length}
              </div>
              <p className="text-muted-foreground text-sm">Rooms Ready</p>
            </div>
            <div className="text-center">
              <div className="text-info-ink text-2xl font-semibold tracking-tight tabular-nums">
                {assignedJudgeIds.size}
              </div>
              <p className="text-muted-foreground text-sm">Judges Assigned</p>
            </div>
            <div className="text-center">
              <div className="text-ok-ink text-2xl font-semibold tracking-tight tabular-nums">
                {assignedTeamCount}
              </div>
              <p className="text-muted-foreground text-sm">Teams Assigned</p>
            </div>
            <div className="text-center">
              <div className="text-warn-ink text-2xl font-semibold tracking-tight tabular-nums">
                {pendingTeams >= 0 ? pendingTeams : selectedTeams.length}
              </div>
              <p className="text-muted-foreground text-sm">Teams Pending</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
