"use client";

import { useEffect, useState } from "react";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MapPin, UserCheck, Users } from "lucide-react";
import { apiService } from "@/lib/service";
import { useToast } from "@/hooks/use-toast";
import type { Judge, Round2Room, Team } from "@/lib/types";

interface Round2RoomMappingProps {
  teams: Team[];
  judges: Judge[];
}

export function Round2RoomMapping({ teams, judges }: Round2RoomMappingProps) {
  const [rooms, setRooms] = useState<Round2Room[]>([]);
  // Judge-room mapping isn't persisted by the backend yet; tracked client-side only.
  const [assignedJudges, setAssignedJudges] = useState<Record<string, string>>(
    {},
  );
  const [selectedJudge, setSelectedJudge] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [selectedRoomForTeam, setSelectedRoomForTeam] = useState<string>("");
  const [isJudgeMapOpen, setIsJudgeMapOpen] = useState(false);
  const [isTeamAssignOpen, setIsTeamAssignOpen] = useState(false);
  const { toast } = useToast();

  const loadRooms = async () => {
    try {
      const data = await apiService.getRound2Rooms();
      setRooms(data);
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Failed to load Round 2 rooms",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleMapJudgeToRoom = async () => {
    if (!selectedJudge || !selectedRoom) return;

    try {
      await apiService.mapJudgeToRoom(selectedJudge, selectedRoom);

      setAssignedJudges((prev) => ({ ...prev, [selectedRoom]: selectedJudge }));

      toast({
        title: "Success",
        description: "Judge mapped to room successfully",
      });
      setIsJudgeMapOpen(false);
      setSelectedJudge("");
      setSelectedRoom("");
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Failed to map judge to room",
        variant: "destructive",
      });
    }
  };

  const handleAssignTeamToRoom = async () => {
    if (!selectedTeam || !selectedRoomForTeam) return;

    try {
      await apiService.assignTeamToRoom(selectedTeam, selectedRoomForTeam);
      await loadRooms();

      toast({
        title: "Success",
        description: "Team assigned to room successfully",
      });
      setIsTeamAssignOpen(false);
      setSelectedTeam("");
      setSelectedRoomForTeam("");
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Failed to assign team to room",
        variant: "destructive",
      });
    }
  };

  const getJudgeName = (judgeId: string) => {
    return judges.find((j) => j.id === judgeId)?.name || "Unknown Judge";
  };

  const round2Teams = teams.filter((team) => team.round2Status === "Selected");
  const availableJudges = judges.filter(
    (judge) => !Object.values(assignedJudges).includes(judge.id),
  );
  const availableRooms = rooms.filter((room) => !assignedJudges[room.id]);
  const availableTeams = round2Teams.filter(
    (team) => !rooms.some((room) => room.teams.some((t) => t.id === team.id)),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight">
          Round 2 Room Management
        </h2>
        <div className="flex gap-2">
          <Dialog open={isJudgeMapOpen} onOpenChange={setIsJudgeMapOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserCheck className="mr-2 h-4 w-4" />
                Map Judges to Rooms
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Map Judge to Room</DialogTitle>
                <DialogDescription>
                  Assign judges to Round 2 evaluation rooms
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Judge</label>
                  <Select
                    value={selectedJudge}
                    onValueChange={setSelectedJudge}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a judge" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableJudges.map((judge) => (
                        <SelectItem key={judge.id} value={judge.id}>
                          {judge.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Room</label>
                  <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a room" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRooms.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.block}-{room.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsJudgeMapOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleMapJudgeToRoom}>Map Judge</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isTeamAssignOpen} onOpenChange={setIsTeamAssignOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Assign Teams
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Team to Room</DialogTitle>
                <DialogDescription>
                  Assign Round 2 teams to evaluation rooms
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Team</label>
                  <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a team" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTeams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Room</label>
                  <Select
                    value={selectedRoomForTeam}
                    onValueChange={setSelectedRoomForTeam}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a room" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms
                        .filter(
                          (room) =>
                            assignedJudges[room.id] &&
                            room.teams.length < room.capacity,
                        )
                        .map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.block}-{room.name} - Judge:{" "}
                            {getJudgeName(assignedJudges[room.id])}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsTeamAssignOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAssignTeamToRoom}>Assign Team</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <Card
            key={room.id}
            className={`border-l-2 ${assignedJudges[room.id] ? "border-l-ok" : "border-l-border"}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="">
                    {room.block}-{room.name}
                  </CardTitle>
                  <CardDescription>Capacity {room.capacity}</CardDescription>
                </div>
                <Badge
                  variant={assignedJudges[room.id] ? "default" : "secondary"}
                >
                  {assignedJudges[room.id] ? "Assigned" : "Available"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {assignedJudges[room.id] ? (
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <UserCheck className="text-ok-ink h-4 w-4" />
                      <span className="text-sm font-medium">
                        Judge: {getJudgeName(assignedJudges[room.id])}
                      </span>
                    </div>

                    {room.teams.length > 0 ? (
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <Users className="text-hackx h-4 w-4" />
                          <span className="text-sm font-medium">
                            Assigned Teams:
                          </span>
                        </div>
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
                      <div className="text-muted-foreground text-sm">
                        No teams assigned yet
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm">
                    <MapPin className="mr-1 inline h-4 w-4" />
                    Waiting for judge assignment
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignment Summary</CardTitle>
          <CardDescription>
            Overview of Round 2 room assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-hackx text-2xl font-semibold tracking-tight tabular-nums">
                {rooms.filter((r) => assignedJudges[r.id]).length}/
                {rooms.length}
              </div>
              <p className="text-muted-foreground text-sm">Rooms with Judges</p>
            </div>
            <div className="text-center">
              <div className="text-ok-ink text-2xl font-semibold tracking-tight tabular-nums">
                {rooms.reduce((sum, room) => sum + room.teams.length, 0)}
              </div>
              <p className="text-muted-foreground text-sm">Teams Assigned</p>
            </div>
            <div className="text-center">
              <div className="text-warn-ink text-2xl font-semibold tracking-tight tabular-nums">
                {availableTeams.length}
              </div>
              <p className="text-muted-foreground text-sm">Teams Pending</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
