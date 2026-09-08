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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DoorOpen,
  MapPin,
  Plus,
  RefreshCw,
  Trash2,
  UserCheck,
  UserMinus,
  Users,
} from "lucide-react";
import { apiService } from "@/lib/service";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { Judge, Round2Room, Team } from "@/lib/types";

interface Round2RoomMappingProps {
  teams: Team[];
  judges: Judge[];
}

export function Round2RoomMapping({ teams, judges }: Round2RoomMappingProps) {
  const [rooms, setRooms] = useState<Round2Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);

  // Dialog states
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isJudgeMapOpen, setIsJudgeMapOpen] = useState(false);
  const [isTeamAssignOpen, setIsTeamAssignOpen] = useState(false);

  // Add Room form state
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomBlock, setNewRoomBlock] = useState("AB2");
  const [newRoomFloor, setNewRoomFloor] = useState("Third Floor");
  const [newRoomCapacity, setNewRoomCapacity] = useState("10");

  // Selection states
  const [selectedJudge, setSelectedJudge] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [selectedRoomForTeam, setSelectedRoomForTeam] = useState<string>("");

  const { toast } = useToast();

  const fetchRooms = useCallback(async () => {
    try {
      const data = await apiService.getRound2Rooms();
      if (Array.isArray(data)) {
        setRooms(data);
      } else {
        setRooms([]);
      }
    } catch (error) {
      console.error("Failed to load Round 2 rooms:", error);
      toast({
        title: "Error",
        description: "Failed to load Round 2 rooms from server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleAddRoom = async () => {
    if (!newRoomName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a room name (e.g. AB2-301)",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsBusy(true);
      await apiService.createRound2Room({
        name: newRoomName.trim(),
        block: newRoomBlock.trim() || "AB2",
        floor: newRoomFloor.trim() || "Third Floor",
        capacity: parseInt(newRoomCapacity, 10) || 10,
      });

      toast({
        title: "Success",
        description: `Room ${newRoomName.trim()} created successfully`,
      });
      setIsAddRoomOpen(false);
      setNewRoomName("");
      setNewRoomBlock("AB2");
      setNewRoomFloor("Third Floor");
      setNewRoomCapacity("10");
      await fetchRooms();
    } catch (error) {
      console.error("Failed to create room:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create Round 2 room",
        variant: "destructive",
      });
    } finally {
      setIsBusy(false);
    }
  };

  const handleDeleteRoom = async (roomId: string, roomName: string) => {
    try {
      setIsBusy(true);
      await apiService.deleteRound2Room(roomId);
      toast({
        title: "Success",
        description: `Room ${roomName} deleted successfully`,
      });
      await fetchRooms();
    } catch (error) {
      console.error("Failed to delete room:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete room",
        variant: "destructive",
      });
    } finally {
      setIsBusy(false);
    }
  };

  const handleMapJudgeToRoom = async () => {
    if (!selectedJudge || !selectedRoom) return;

    try {
      setIsBusy(true);
      await apiService.mapJudgeToRoom(selectedJudge, selectedRoom);

      toast({
        title: "Success",
        description: "Judge mapped to room successfully",
      });
      setIsJudgeMapOpen(false);
      setSelectedJudge("");
      setSelectedRoom("");
      await fetchRooms();
    } catch (error) {
      console.error("Failed to map judge:", error);
      toast({
        title: "Error",
        description: "Failed to map judge to room",
        variant: "destructive",
      });
    } finally {
      setIsBusy(false);
    }
  };

  const handleRemoveJudge = async (judgeId: string) => {
    try {
      setIsBusy(true);
      await apiService.removeJudgeFromRound2Room(judgeId);
      toast({
        title: "Success",
        description: "Judge unassigned from room successfully",
      });
      await fetchRooms();
    } catch (error) {
      console.error("Failed to remove judge from room:", error);
      toast({
        title: "Error",
        description: "Failed to remove judge from room",
        variant: "destructive",
      });
    } finally {
      setIsBusy(false);
    }
  };

  const handleAssignTeamToRoom = async () => {
    if (!selectedTeam || !selectedRoomForTeam) return;

    try {
      setIsBusy(true);
      await apiService.assignTeamToRoom(selectedTeam, selectedRoomForTeam);

      toast({
        title: "Success",
        description: "Team assigned to room successfully",
      });
      setIsTeamAssignOpen(false);
      setSelectedTeam("");
      setSelectedRoomForTeam("");
      await fetchRooms();
    } catch (error) {
      console.error("Failed to assign team to room:", error);
      toast({
        title: "Error",
        description: "Failed to assign team to room",
        variant: "destructive",
      });
    } finally {
      setIsBusy(false);
    }
  };

  // Helper getters
  const getRoomName = (room: Round2Room) =>
    room.name || room.roomNumber || "Room";
  const getRoomFloor = (room: Round2Room) =>
    room.floor || (room.block ? `${room.block} • Third Floor` : "Third Floor");

  const getJudgeForRoom = (room: Round2Room) => {
    if (room.judges && room.judges.length > 0) {
      return room.judges[0];
    }
    if (room.assignedJudge) {
      return (
        judges.find((j) => j.id === room.assignedJudge) || {
          id: room.assignedJudge,
          name: "Assigned Judge",
        }
      );
    }
    return null;
  };

  const getTeamsForRoom = (room: Round2Room) => {
    if (room.teams && room.teams.length > 0) {
      return room.teams;
    }
    if (room.assignedTeams && room.assignedTeams.length > 0) {
      return room.assignedTeams.map((tid) => {
        const match = teams.find((t) => t.id === tid || t.teamId === tid);
        return match || { id: tid, name: tid, teamId: tid };
      });
    }
    return [];
  };

  const round2Teams = teams.filter(
    (team) =>
      team.status === "ROUND1_QUALIFIED" ||
      team.status === "ROUND2_SUBMITTED" ||
      team.status === "ROUND2_QUALIFIED" ||
      team.round2Status === "Selected",
  );

  const assignedJudgeIds = new Set(
    rooms.flatMap(
      (room) =>
        room.judges?.map((j) => j.id) ??
        (room.assignedJudge ? [room.assignedJudge] : []),
    ),
  );
  const availableJudges = judges.filter(
    (judge) => !assignedJudgeIds.has(judge.id),
  );

  const availableRooms = rooms.filter((room) => {
    const hasJudge =
      (room.judges && room.judges.length > 0) || Boolean(room.assignedJudge);
    return !hasJudge;
  });

  const assignedTeamIds = new Set(
    rooms.flatMap(
      (room) => room.teams?.map((t) => t.id) ?? room.assignedTeams ?? [],
    ),
  );
  const availableTeams = round2Teams.filter(
    (team) => !assignedTeamIds.has(team.id),
  );

  const totalAssignedTeams = rooms.reduce(
    (sum, room) =>
      sum + (room.teams?.length ?? room.assignedTeams?.length ?? 0),
    0,
  );
  const roomsWithJudgesCount = rooms.filter(
    (r) => (r.judges && r.judges.length > 0) || Boolean(r.assignedJudge),
  ).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-6 w-52" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28 rounded-md" />
            <Skeleton className="h-9 w-36 rounded-md" />
            <Skeleton className="h-9 w-32 rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="space-y-3 p-5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-28" />
              <div className="border-border border-t pt-2">
                <Skeleton className="h-4 w-40" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            Round 2 Room Management
          </h2>
          <p className="text-muted-foreground text-xs">
            Create rooms dynamically, map judges, and assign semi-finalist teams
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchRooms()}
            disabled={isBusy}
            title="Refresh room assignments"
          >
            <RefreshCw className={`h-4 w-4 ${isBusy ? "animate-spin" : ""}`} />
          </Button>

          {/* Add Room Dialog */}
          <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="mr-1.5 h-4 w-4" />
                Add Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Round 2 Room</DialogTitle>
                <DialogDescription>
                  Create a new evaluation room for Round 2 semi-finals
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="room-name">Room Name / Number</Label>
                  <Input
                    id="room-name"
                    placeholder="e.g. AB2-301, Audi 1, Lab 402"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="room-block">Block / Building</Label>
                    <Input
                      id="room-block"
                      placeholder="e.g. AB2, Main Block"
                      value={newRoomBlock}
                      onChange={(e) => setNewRoomBlock(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="room-floor">Floor / Location</Label>
                    <Input
                      id="room-floor"
                      placeholder="e.g. Third Floor, Ground Floor"
                      value={newRoomFloor}
                      onChange={(e) => setNewRoomFloor(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room-capacity">Team Capacity</Label>
                  <Input
                    id="room-capacity"
                    type="number"
                    min="1"
                    max="50"
                    placeholder="10"
                    value={newRoomCapacity}
                    onChange={(e) => setNewRoomCapacity(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddRoomOpen(false)}
                  disabled={isBusy}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddRoom}
                  disabled={!newRoomName.trim() || isBusy}
                >
                  {isBusy ? "Creating..." : "Create Room"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Map Judges Dialog */}
          <Dialog open={isJudgeMapOpen} onOpenChange={setIsJudgeMapOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserCheck className="mr-1.5 h-4 w-4" />
                Map Judges to Rooms
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Map Judge to Room</DialogTitle>
                <DialogDescription>
                  Assign a judge to evaluate semi-finalist teams in this room
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Select Judge</Label>
                  <Select
                    value={selectedJudge}
                    onValueChange={setSelectedJudge}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          availableJudges.length > 0
                            ? "Choose a judge"
                            : "No judges available"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableJudges.length === 0 ? (
                        <div className="text-muted-foreground p-2 text-center text-xs">
                          All judges are already mapped
                        </div>
                      ) : (
                        availableJudges.map((judge) => (
                          <SelectItem key={judge.id} value={judge.id}>
                            {judge.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Select Room</Label>
                  <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          availableRooms.length > 0
                            ? "Choose a room"
                            : "No available rooms"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRooms.length === 0 ? (
                        <div className="text-muted-foreground p-2 text-center text-xs">
                          {rooms.length === 0
                            ? "No rooms created yet. Click 'Add Room' first."
                            : "All rooms already have judges assigned"}
                        </div>
                      ) : (
                        availableRooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            {getRoomName(room)} — {getRoomFloor(room)}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsJudgeMapOpen(false)}
                  disabled={isBusy}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleMapJudgeToRoom}
                  disabled={!selectedJudge || !selectedRoom || isBusy}
                >
                  {isBusy ? "Mapping..." : "Map Judge"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Assign Teams Dialog */}
          <Dialog open={isTeamAssignOpen} onOpenChange={setIsTeamAssignOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Users className="mr-1.5 h-4 w-4" />
                Assign Teams
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Team to Room</DialogTitle>
                <DialogDescription>
                  Assign qualified Round 2 teams to staffed evaluation rooms
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Select Team</Label>
                  <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          availableTeams.length > 0
                            ? "Choose a team"
                            : "No unassigned Round 2 teams"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTeams.length === 0 ? (
                        <div className="text-muted-foreground p-2 text-center text-xs">
                          No unassigned Round 2 teams found
                        </div>
                      ) : (
                        availableTeams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name} ({team.teamId})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Select Room</Label>
                  <Select
                    value={selectedRoomForTeam}
                    onValueChange={setSelectedRoomForTeam}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a room" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms
                        .filter((room) => {
                          const judge = getJudgeForRoom(room);
                          const roomTeams = getTeamsForRoom(room);
                          return (
                            judge !== null && roomTeams.length < room.capacity
                          );
                        })
                        .map((room) => {
                          const judge = getJudgeForRoom(room);
                          return (
                            <SelectItem key={room.id} value={room.id}>
                              {getRoomName(room)} — Judge:{" "}
                              {judge?.name || "Assigned"}
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsTeamAssignOpen(false)}
                  disabled={isBusy}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignTeamToRoom}
                  disabled={!selectedTeam || !selectedRoomForTeam || isBusy}
                >
                  {isBusy ? "Assigning..." : "Assign Team"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {rooms.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <div className="bg-muted mx-auto flex h-12 w-12 items-center justify-center rounded-full">
            <DoorOpen className="text-muted-foreground h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold">
            No Round 2 Rooms Added Yet
          </h3>
          <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">
            You can create rooms dynamically according to your venue layout.
            Once created, map judges and assign teams.
          </p>
          <div className="mt-6">
            <Button onClick={() => setIsAddRoomOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Room
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => {
            const judge = getJudgeForRoom(room);
            const roomTeams = getTeamsForRoom(room);
            const isAssigned = judge !== null;

            return (
              <Card
                key={room.id}
                className={`border-l-2 transition-colors ${
                  isAssigned ? "border-l-ok" : "border-l-border"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base font-semibold">
                        {getRoomName(room)}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {getRoomFloor(room)}
                      </CardDescription>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Badge variant={isAssigned ? "default" : "secondary"}>
                        {isAssigned ? "Assigned" : "Available"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-7 w-7"
                        onClick={() =>
                          handleDeleteRoom(room.id, getRoomName(room))
                        }
                        disabled={isBusy}
                        title="Delete room"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {isAssigned ? (
                      <div>
                        <div className="bg-muted/40 border-hairline mb-2 flex items-center justify-between gap-2 rounded-md border p-2">
                          <div className="flex items-center gap-2 truncate">
                            <UserCheck className="text-ok-ink h-4 w-4 shrink-0" />
                            <span className="truncate text-sm font-medium">
                              Judge: {judge.name}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-7 px-2 text-xs"
                            onClick={() => handleRemoveJudge(judge.id)}
                            disabled={isBusy}
                            title="Unassign judge from this room"
                          >
                            <UserMinus className="mr-1 h-3.5 w-3.5" />
                            Unassign
                          </Button>
                        </div>

                        {roomTeams.length > 0 ? (
                          <div className="border-border border-t pt-2">
                            <div className="text-muted-foreground mb-1.5 flex items-center gap-1.5 text-xs">
                              <Users className="text-hackx h-3.5 w-3.5" />
                              <span className="font-medium">
                                Assigned Teams ({roomTeams.length}/
                                {room.capacity}):
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {roomTeams.map((team) => (
                                <Badge
                                  key={team.id}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {team.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-muted-foreground border-hairline border-t pt-1 text-xs">
                            No teams assigned yet
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-muted-foreground flex items-center gap-1.5 py-1 text-sm">
                        <MapPin className="text-muted-foreground h-4 w-4 shrink-0" />
                        <span>Waiting for judge assignment</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            Assignment Summary
          </CardTitle>
          <CardDescription className="text-xs">
            Overview of Round 2 room assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="bg-surface border-hairline rounded-lg border p-3 text-center">
              <div className="text-hackx text-2xl font-semibold tracking-tight tabular-nums">
                {roomsWithJudgesCount}/{rooms.length}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                Rooms with Judges
              </p>
            </div>
            <div className="bg-surface border-hairline rounded-lg border p-3 text-center">
              <div className="text-ok-ink text-2xl font-semibold tracking-tight tabular-nums">
                {totalAssignedTeams}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                Teams Assigned
              </p>
            </div>
            <div className="bg-surface border-hairline rounded-lg border p-3 text-center">
              <div className="text-warn-ink text-2xl font-semibold tracking-tight tabular-nums">
                {Math.max(0, round2Teams.length - totalAssignedTeams)}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                Teams Pending
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
