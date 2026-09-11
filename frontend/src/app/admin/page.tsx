"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppShell } from "@/components/shell/app-shell";
import { Metric, MetricRow } from "@/components/shell/primitives";
import { GitBranch, LayoutGrid } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Clock,
  Eye,
  Gavel,
  Megaphone,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import {
  Checkpoint1Modal,
  CreateTeamModal,
  JudgeTeamMappingTab,
} from "@/components/admin";
import {
  Announcement,
  Checkpoint,
  Checkpoint2Data,
  Judge,
  Mentor,
  ProblemStatement,
  Team,
  WebsocketData,
} from "@/lib/types";
import { apiService } from "@/lib/service";
import { wsService } from "@/lib/ws";
import { authService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

function ago(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const seconds = Math.floor((now - date) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  for (const [unit, value] of Object.entries(intervals)) {
    const amount = Math.floor(seconds / value);
    if (amount >= 1) {
      return amount === 1 ? `${amount} ${unit} ago` : `${amount} ${unit}s ago`;
    }
  }
  return "Just Now";
}

export default function AdminDashboard() {
  const router = useRouter();
  // const [passwordChanged, setPasswordChanged] = useState(true); // Bypass password change logic
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const [teamSearch, setTeamSearch] = useState("");
  const [checkpoint1DialogOpen, setCheckpoint1DialogOpen] = useState(false);
  const [selectedTeamForCheckpoint1, setSelectedTeamForCheckpoint1] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [createTeamModalOpen, setCreateTeamModalOpen] = useState(false);
  const [checkpoint2Data, setCheckpoint2Data] = useState({
    username: "",
    password: "",
    round1Room: "",
  });
  const [authenticated, setAuthenticated] = useState(false);
  const [socket, setSocket] = useState<WebSocket>();

  // Mock data with real-time updates
  const [teams, setTeams] = useState<Team[]>([]);
  const [judges, setJudges] = useState<Judge[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [problemStatements, setProblemStatements] = useState<
    ProblemStatement[]
  >([]);
  const { toast } = useToast();

  // Add filtered teams logic
  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(teamSearch.toLowerCase()),
  );

  function updateTeamCheckpoint(teamId: string, checkpoint: Checkpoint) {
    setTeams((prev) =>
      prev.map((team) =>
        team.id === teamId
          ? { ...team, checkpoints: [checkpoint, ...team.checkpoints] }
          : team,
      ),
    );
  }

  function updateWebsocketCheckpoint(checkpoint: Checkpoint) {
    if (!socket) return;

    socket.send(
      JSON.stringify({
        type: "checkpoint",
        checkpoint,
      }),
    );
  }

  const handleCheckpoint1Complete = async (checkpoint: Checkpoint) => {
    // Convert TeamCheckpoint1Data to Checkpoint format for internal use
    updateWebsocketCheckpoint(checkpoint);
    updateTeamCheckpoint(selectedTeamForCheckpoint1?.id || "", checkpoint);
    setCheckpoint1DialogOpen(false);
    setSelectedTeamForCheckpoint1(null);
  };

  const handleCheckpoint2Complete = async (teamId: string) => {
    const { username, password, round1Room, checkpoint } =
      (await apiService.updateCheckpoint(2, { teamId })) as Checkpoint2Data;
    updateWebsocketCheckpoint(checkpoint);
    setCheckpoint2Data({
      username,
      password,
      round1Room: round1Room.block + "-" + round1Room.name,
    });
    updateTeamCheckpoint(teamId, checkpoint);
  };

  const handleCheckpoint3Complete = async (teamId: string) => {
    const checkpoint = (await apiService.updateCheckpoint(3, {
      teamId,
    })) as Checkpoint;
    updateWebsocketCheckpoint(checkpoint);
    updateTeamCheckpoint(teamId, checkpoint);
  };

  const handleRefreshToCheckpoint1 = async (teamId: string) => {
    try {
      const result = await apiService.refreshTeamToCheckpoint1(teamId);
      // Reload teams to reflect the changes
      apiService.getTeams().then(setTeams);
      toast({
        title: "Success",
        description: result.message,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to refresh team to checkpoint 1",
        variant: "destructive",
      });
    }
  };

  const handleTeamCreated = () => {
    // Reload teams after creation
    apiService.getTeams().then(setTeams);
  };

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete team "${teamName}"? This action cannot be undone and will remove all team data including checkpoints, submissions, and participant records.`,
      )
    ) {
      return;
    }

    try {
      const result = await apiService.deleteTeam(teamId);

      // Reload teams after deletion
      apiService.getTeams().then(setTeams);

      toast({
        title: "Success",
        description: result.message,
      });
    } catch (err) {
      console.error("Failed to delete team:", err);
      toast({
        title: "Error",
        description: "Failed to delete team. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const currentUser = authService.getUser();
    if (
      !currentUser ||
      (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN")
    ) {
      router.push("/login");
      return;
    }

    apiService
      .getTeams()
      .then((res) => setTeams(Array.isArray(res) ? res : []))
      .catch(() => setTeams([]));
    apiService
      .getJudges()
      .then((res) => setJudges(Array.isArray(res) ? res : []))
      .catch(() => setJudges([]));
    apiService
      .getMentors()
      .then((res) => setMentors(Array.isArray(res) ? res : []))
      .catch(() => setMentors([]));
    apiService
      .getProblemStatements()
      .then((res) => setProblemStatements(Array.isArray(res) ? res : []))
      .catch(() => setProblemStatements([]));
    apiService
      .getAnnouncements()
      .then((res) => setAnnouncements(Array.isArray(res) ? res : []))
      .catch(() => setAnnouncements([]));

    async function onWebsocketMessage(ws: WebSocket, ev: MessageEvent) {
      const data = JSON.parse(ev.data) as WebsocketData;
      if (data.type === "authenticated") {
        setAuthenticated(true);
      }

      if (data.type === "checkpoint") {
        updateTeamCheckpoint(data.teamId, data.checkpoint);
      } else if (data.type === "subscribed") {
        toast({
          title: "Event subscribed!",
          description: `Updating ${data.channel} in real time`,
        });
      }
    }

    function waitForOpen(ws: WebSocket): Promise<void> {
      return new Promise((resolve) => {
        if (ws.readyState === WebSocket.OPEN) {
          resolve();
        } else {
          ws.addEventListener("open", () => resolve(), { once: true });
        }
      });
    }

    async function handleWebsocket(ws: WebSocket) {
      setSocket(ws);
      await waitForOpen(ws);
      console.log("sending");
      ws.send(
        JSON.stringify({
          type: "authenticate",
          token: authService.getToken(),
        }),
      );
      ws.onmessage = (data) => onWebsocketMessage(ws, data);
    }

    wsService.connect().then(handleWebsocket);

    return () => {
      wsService.disconnect();
    };
  }, [toast]);

  // 🔑 second effect reacts when authenticated/socket changes
  useEffect(() => {
    if (!socket || !authenticated) return;

    socket.send(
      JSON.stringify({
        type: "subscribe_checkpoints",
      }),
    );
  }, [authenticated, socket]);

  const handleResetPassword = (teamId: string) => {
    console.log(`Resetting password for team: ${teamId}`);
    // Implementation for password reset
  };

  const handlePostAnnouncement = () => {
    if (announcement.trim()) {
      console.log("Posting announcement:", announcement);
      setAnnouncement("");
    }
  };

  function isCheckpointCompleted(
    team: Team,
    checkpoint: number,
    allowPartial: boolean = false,
  ): boolean {
    if (!team?.checkpoints || !Array.isArray(team.checkpoints)) {
      return false;
    }
    return team.checkpoints.some(
      (c) =>
        c.checkpoint === checkpoint &&
        (allowPartial
          ? c.status === "COMPLETED" || c.status === "PARTIALLY_COMPLETED"
          : c.status === "COMPLETED"),
    );
  }

  function getCheckpointStatus(team: Team, checkpoint: number): string {
    if (!team?.checkpoints || !Array.isArray(team.checkpoints)) {
      return "pending";
    }
    const cp = team.checkpoints.find((c) => c.checkpoint === checkpoint);
    return cp?.status || "pending";
  }

  function getCheckpoint1ButtonText(team: Team): string {
    const status = getCheckpointStatus(team, 1);
    if (status === "COMPLETED") return "CP1 Complete";
    if (status === "PARTIALLY_COMPLETED") return "CP1 Partial";
    return "Checkpoint 1";
  }

  function getCheckpointBadgeProps(team: Team, checkpoint: number) {
    const status = getCheckpointStatus(team, checkpoint);
    if (status === "COMPLETED") {
      return { variant: "default" as const, className: "text-xs" };
    }
    if (status === "PARTIALLY_COMPLETED") {
      return {
        variant: "outline" as const,
        className: "text-xs border-warn/40 text-warn-ink",
      };
    }
    return { variant: "secondary" as const, className: "text-xs" };
  }
  return (
    <>
      <Tabs defaultValue="overview">
        <AppShell
          role="Admin"
          title="Admin Dashboard"
          subtitle="MUJ HackX 4.0 · operations"
          actions={
            <Badge variant="green" className="h-8.5 px-2.5" data-dot={false}>
              <span className="relative flex size-1.5">
                <span className="bg-ok absolute inline-flex size-full animate-ping rounded-full opacity-70" />
                <span className="bg-ok relative inline-flex size-1.5 rounded-full" />
              </span>
              Live
            </Badge>
          }
          nav={
            <TabsList>
              <TabsTrigger value="overview">
                <LayoutGrid />
                Overview
              </TabsTrigger>
              <TabsTrigger value="teams">
                <Users />
                Teams
              </TabsTrigger>
              <TabsTrigger value="judges">
                <Gavel />
                Judges
              </TabsTrigger>
              <TabsTrigger value="judge-mapping">
                <GitBranch />
                Judge Mapping
              </TabsTrigger>
              <TabsTrigger value="mentors">
                <UserCheck />
                Mentors
              </TabsTrigger>
              <TabsTrigger value="announcements">
                <Megaphone />
                Announcements
              </TabsTrigger>
            </TabsList>
          }
        >
          <TabsContent value="overview">
            <MetricRow className="lg:grid-cols-4">
              <Metric
                label="Total teams"
                value={teams.length}
                hint="Registered"
                tone="brand"
                icon={<Users />}
              />
              <Metric
                label="Completed CP3"
                value={
                  teams.filter((team) => isCheckpointCompleted(team, 3)).length
                }
                hint="Ready for judging"
                tone="ok"
                icon={<UserCheck />}
              />
              <Metric
                label="Judges active"
                value={judges.length}
                hint="Currently evaluating"
                icon={<Gavel />}
              />
              <Metric
                label="Avg. evaluation"
                value="12m"
                hint="Per team"
                icon={<Clock />}
              />
            </MetricRow>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="">
                    Problem Statement Statistics
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Distribution of team selections across problem statements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {problemStatements.map((ps) => (
                      <div
                        key={ps.id}
                        className="bg-muted flex flex-col space-y-2 rounded-lg p-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0"
                      >
                        <div className="flex-1">
                          <span className="text-sm font-medium sm:text-base">
                            {ps.title}
                          </span>
                          <p className="text-muted-foreground text-xs sm:text-sm">
                            {ps.domain.name}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-foreground w-fit text-xs"
                        >
                          {ps.selectedCount} teams
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="">Registration Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teams.slice(0, 5).map((team) => (
                      <div
                        key={team.id}
                        className="bg-muted flex flex-col space-y-3 rounded-lg p-4 xl:flex-row xl:items-center xl:justify-between xl:space-y-0"
                      >
                        <div className="flex-1">
                          <h4 className="text-sm font-medium sm:text-base">
                            {team.name}
                          </h4>
                          <p className="text-muted-foreground text-xs break-words sm:text-sm">
                            ID: {team.generatedId}
                            {team.round1Room ? (
                              <>
                                {" "}
                                | Room: {team.round1Room.block}{" "}
                                {team.round1Room.name}
                              </>
                            ) : (
                              <> | Room: Not Assigned</>
                            )}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                          <div className="flex items-center gap-2">
                            <Badge {...getCheckpointBadgeProps(team, 1)}>
                              CP1
                            </Badge>
                            <Badge
                              variant={
                                isCheckpointCompleted(team, 2)
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              CP2
                            </Badge>
                            <Badge
                              variant={
                                isCheckpointCompleted(team, 3)
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              CP3
                            </Badge>
                          </div>
                          <Badge variant="outline" className="w-fit text-xs">
                            {team.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="registration">
            <Card>
              <CardHeader>
                <CardTitle className="">Registration Status</CardTitle>
                <CardDescription className="text-sm">
                  Real-time checkpoint completion status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      className="flex flex-col space-y-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0"
                    >
                      <div>
                        <h4 className="text-sm font-medium sm:text-base">
                          {team.name}
                        </h4>
                        <p className="text-muted-foreground text-xs sm:text-sm">
                          Room:{" "}
                          {team.round1Room
                            ? `${team.round1Room.block} ${team.round1Room.name}`
                            : "Not Assigned"}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                        <div className="flex items-center gap-2">
                          <Badge {...getCheckpointBadgeProps(team, 1)}>
                            CP1
                          </Badge>
                          <Badge
                            variant={
                              isCheckpointCompleted(team, 2)
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            CP2
                          </Badge>
                          <Badge
                            variant={
                              isCheckpointCompleted(team, 3)
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            CP3
                          </Badge>
                        </div>
                        <Badge variant="outline" className="w-fit text-xs">
                          {team.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <h2 className="text-base font-semibold tracking-tight">
                  Registration Checkpoints
                </h2>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Button
                    onClick={() => setCreateTeamModalOpen(true)}
                    className="w-full text-sm sm:w-auto"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Team
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent sm:w-auto"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Real-time Updates
                  </Button>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="">Checkpoint 1</CardTitle>
                      <CardDescription className="text-sm">
                        AB1 Entrance & Main Gate
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-xs sm:text-sm">
                        <li>• Team details confirmation</li>
                        <li>• Govt ID verification</li>
                        <li>• Consent form collection</li>
                        <li>• WiFi opt-in form</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="">Checkpoint 2</CardTitle>
                      <CardDescription className="text-sm">
                        AB1 Lobby
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-xs sm:text-sm">
                        <li>• Participant ID cards</li>
                        <li>• Welcome kits distribution</li>
                        <li>• Team login creation</li>
                        <li>• Website credentials</li>
                        <li>• Room number assignment</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="">Checkpoint 3</CardTitle>
                      <CardDescription className="text-sm">
                        Auditorium Entrance
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-xs sm:text-sm">
                        <li>• Confirm checkpoint 1 & 2</li>
                        <li>• Final verification</li>
                        <li>• Entry to hackathon venue</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Search Bar */}
              <CardContent className="px-0">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Input
                    placeholder="Search teams..."
                    className="border-border flex-1 text-sm outline-none"
                    value={teamSearch}
                    onChange={(e) => setTeamSearch(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    className="w-full bg-transparent sm:w-auto"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </Button>
                </div>
              </CardContent>

              <div className="space-y-4">
                {filteredTeams.map((team) => (
                  <Card key={team.id}>
                    <CardHeader className="pb-3">
                      <div className="flex flex-col space-y-3 xl:flex-row xl:items-center xl:justify-between xl:space-y-0">
                        <div className="flex-1">
                          <CardTitle className="">{team.name}</CardTitle>
                          <CardDescription className="mt-1 text-sm">
                            {team.problemStatement?.title ||
                              "No Problem Statement Selected"}
                          </CardDescription>
                          <p className="text-muted-foreground mt-1 text-xs break-words sm:text-sm">
                            Team ID: {team.teamId}
                            {` | `}
                            Participants: {team.participants.length}
                            {team.round1Room
                              ? ` | Room: ${team.round1Room.block} ${team.round1Room.name}`
                              : " | Room: Not Assigned"}
                            {getCheckpointStatus(team, 1) ===
                              "PARTIALLY_COMPLETED" && (
                              <span className="text-warn-ink ml-2 font-medium">
                                ⚠ CP1 Partial
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="text-left lg:text-right">
                          <p className="text-muted-foreground text-xs sm:text-sm">
                            Status
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {team.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Checkpoint Status */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge {...getCheckpointBadgeProps(team, 1)}>CP1</Badge>
                        <Badge
                          variant={
                            isCheckpointCompleted(team, 2)
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          CP2
                        </Badge>
                        <Badge
                          variant={
                            isCheckpointCompleted(team, 3)
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          CP3
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {team.status}
                        </Badge>
                      </div>

                      {/* Checkpoint Actions */}
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        {/* Checkpoint 1 */}
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isCheckpointCompleted(team, 1)} // Always allow editing CP1
                          className={`bg-transparent text-xs ${
                            getCheckpointStatus(team, 1) ===
                            "PARTIALLY_COMPLETED"
                              ? "border-warn/40 text-warn-ink"
                              : ""
                          }`}
                          onClick={() => {
                            setSelectedTeamForCheckpoint1({
                              id: team.id,
                              name: team.name,
                            });
                            setCheckpoint1DialogOpen(true);
                          }}
                        >
                          {getCheckpoint1ButtonText(team)}
                        </Button>

                        {/* Checkpoint 2 */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={
                                isCheckpointCompleted(team, 2) ||
                                !isCheckpointCompleted(team, 1, true)
                              }
                              className="bg-transparent text-xs"
                              onClick={() => handleCheckpoint2Complete(team.id)}
                            >
                              {isCheckpointCompleted(team, 2)
                                ? "CP2 Complete"
                                : "Checkpoint 2"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-[95vw] max-w-md">
                            <DialogHeader>
                              <DialogTitle className="text-lg">
                                Checkpoint 2 - {team.name}
                              </DialogTitle>
                              <DialogDescription className="text-sm">
                                Generate team credentials and distribute
                                materials
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="bg-muted rounded-lg p-4">
                                <h4 className="mb-2 text-sm font-medium">
                                  Team Credentials
                                </h4>
                                <div className="space-y-2">
                                  <div>
                                    <Label className="text-xs font-medium">
                                      Team ID:
                                    </Label>
                                    <p className="font-mono text-sm sm:text-base">
                                      {checkpoint2Data.username}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-xs font-medium">
                                      Password:
                                    </Label>
                                    <p className="font-mono text-sm sm:text-base">
                                      {checkpoint2Data.password}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-xs font-medium">
                                      Room Number:
                                    </Label>
                                    <p className="font-mono text-sm sm:text-base">
                                      {checkpoint2Data.round1Room ||
                                        "Not Assigned"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="text-muted-foreground text-xs sm:text-sm">
                                <p>✓ Participant ID cards distributed</p>
                                <p>✓ Welcome kits given</p>
                              </div>
                            </div>
                            <DialogFooter className="flex-col gap-2 sm:flex-row">
                              <DialogClose className="bg-hackx hover:text-hackx hover:border-hackx hover:bg-card w-full rounded-sm border-[1px] px-3 py-1 text-white sm:w-auto">
                                Done
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {/* Checkpoint 3 */}
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={
                            isCheckpointCompleted(team, 3) ||
                            !isCheckpointCompleted(team, 2)
                          }
                          onClick={() => handleCheckpoint3Complete(team.id)}
                          className="text-xs"
                        >
                          {isCheckpointCompleted(team, 3)
                            ? "CP3 Complete"
                            : "Checkpoint 3"}
                        </Button>
                      </div>

                      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              team.credentialsGiven ? "default" : "secondary"
                            }
                            className="text-xs"
                          >
                            {team.credentialsGiven
                              ? "Credentials Given"
                              : "Pending"}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResetPassword(team.id)}
                            className="text-xs"
                          >
                            Reset Password
                          </Button>
                          {(isCheckpointCompleted(team, 2) ||
                            isCheckpointCompleted(team, 3)) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleRefreshToCheckpoint1(team.id)
                              }
                              className="text-warn-ink hover:text-warn text-xs"
                            >
                              ↻ Reset to CP1
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteTeam(team.id, team.name)}
                            className="hover:border-destructive/45 text-danger-ink hover:text-danger text-xs"
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="judges">
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-base font-semibold tracking-tight">
                Judge Management
              </h2>

              <Card>
                <CardHeader>
                  <CardTitle className="">Judge Progress Overview</CardTitle>
                  <CardDescription className="text-sm">
                    Monitor evaluation progress - scores are hidden from admin
                    view
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 space-y-4">
                    {judges.map((judge) => (
                      <Card
                        key={judge.id}
                        className="border-l-hackx m-0 border-l-2"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                            <div>
                              <CardTitle className="">{judge.name}</CardTitle>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <p className="text-ok-ink text-2xl font-semibold tracking-tight tabular-nums">
                                  {judge.teamsCompleted}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  Completed
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-warn-ink text-2xl font-semibold tracking-tight tabular-nums">
                                  {judge.teamsLeft}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  Remaining
                                </p>
                              </div>
                            </div>
                            <div className="bg-muted h-2 w-full rounded-full sm:w-32">
                              <div
                                className="bg-ok h-2 rounded-full"
                                style={{
                                  width: `${(judge.teamsCompleted / (judge.teamsCompleted + judge.teamsLeft)) * 100}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="judge-mapping">
            <JudgeTeamMappingTab judges={judges} teams={teams} />
          </TabsContent>

          <TabsContent value="mentors">
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-base font-semibold tracking-tight">
                Mentor Queue Management
              </h2>

              <Card>
                <CardHeader>
                  <CardTitle className="">Mentor Status Overview</CardTitle>
                  <CardDescription className="text-sm">
                    Real-time mentor queue status and availability
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mentors.map((mentor) => (
                      <Card
                        key={mentor.id}
                        className="border-l-hackx border-l-2"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                            <div>
                              <CardTitle className="">{mentor.name}</CardTitle>
                              <CardDescription className="text-sm">
                                {mentor.domains.join(", ")} | ID:{" "}
                                {mentor.user.username} | Meet Link:{" "}
                                {mentor.meetLink || "Not Set"}
                              </CardDescription>
                            </div>
                            <Badge
                              variant={
                                mentor.isAvailable ? "outline" : "default"
                              }
                              className={`w-fit text-xs ${mentor.isAvailable ? "text-hackx border-hackx border-[1px]" : ""}`}
                            >
                              {mentor.isAvailable
                                ? "Available"
                                : "Not available"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <p className="text-hackx text-2xl font-semibold tracking-tight tabular-nums">
                                  {
                                    mentor.mentorshipQueue.filter(
                                      (q) => q.status === "WAITING",
                                    ).length
                                  }
                                  /5
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  Queue Status
                                </p>
                              </div>
                            </div>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full bg-transparent text-xs sm:w-auto"
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Queue
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="h-auto w-[95vw] max-w-md overflow-y-scroll">
                                <DialogHeader>
                                  <DialogTitle className="text-lg">
                                    {mentor.user.username}&#39;s Queue Details
                                  </DialogTitle>
                                  <DialogDescription className="text-sm">
                                    Current teams in mentorship queue
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-2">
                                  <div className="text-muted-foreground text-sm">
                                    {mentor.mentorshipQueue.length === 0
                                      ? "No teams in the queue."
                                      : mentor.mentorshipQueue.map((item) => (
                                          <div
                                            key={item.id}
                                            className="border-b pb-2"
                                          >
                                            <div className="flex w-full items-end justify-between gap-2">
                                              <p className="font-medium">
                                                Team: {item.team.name}
                                              </p>
                                              <Badge
                                                variant={
                                                  item.status === "WAITING"
                                                    ? "yellow"
                                                    : item.status ===
                                                        "CANCELLED"
                                                      ? "red"
                                                      : item.status ===
                                                          "RESOLVED"
                                                        ? "green"
                                                        : "outline"
                                                }
                                                className="mt-1 text-xs"
                                              >
                                                {item.status}
                                              </Badge>
                                            </div>
                                            <p className="text-muted-foreground font-medium">
                                              {ago(item.createdAt)}
                                            </p>
                                            <p className="text-sm">
                                              Query: {item.query}
                                            </p>
                                            {item.notes && (
                                              <p className="text-sm italic">
                                                Notes: {item.notes}
                                              </p>
                                            )}
                                          </div>
                                        ))}
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="announcements">
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-base font-semibold tracking-tight">
                Announcement Management
              </h2>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4 sm:h-5 sm:w-5" />
                    Post New Announcement
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Broadcast important updates to all participants
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="announcement-title" className="text-sm">
                      Announcement Title
                    </Label>
                    <Input
                      id="announcement-title"
                      placeholder="Enter announcement title"
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="announcement-message" className="text-sm">
                      Message
                    </Label>
                    <Textarea
                      id="announcement-message"
                      placeholder="Enter your announcement message..."
                      value={announcement}
                      onChange={(e) => setAnnouncement(e.target.value)}
                      rows={4}
                      className="text-sm"
                    />
                  </div>
                  <Button
                    onClick={handlePostAnnouncement}
                    className="w-full text-sm"
                    variant="default"
                  >
                    <Megaphone className="mr-2 h-4 w-4" />
                    Post Announcement
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="">Recent Announcements</CardTitle>
                  <CardDescription className="text-sm">
                    Previously posted announcements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      // Made announcement cards responsive
                      <div
                        key={announcement.id}
                        className="rounded-lg border p-4"
                      >
                        <div className="mb-2 flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                          <h4 className="text-sm font-medium sm:text-base">
                            {announcement.title}
                          </h4>
                          <Badge variant="outline" className="w-fit text-xs">
                            {ago(announcement.createdAt)}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-xs sm:text-sm">
                          {announcement.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </AppShell>
      </Tabs>

      {/* Enhanced Checkpoint 1 Modal */}
      <Checkpoint1Modal
        isOpen={checkpoint1DialogOpen}
        onClose={() => {
          setCheckpoint1DialogOpen(false);
          setSelectedTeamForCheckpoint1(null);
        }}
        teamId={selectedTeamForCheckpoint1?.id || ""}
        teamName={selectedTeamForCheckpoint1?.name || ""}
        onComplete={handleCheckpoint1Complete}
      />

      {/* Create Team Modal */}
      <CreateTeamModal
        isOpen={createTeamModalOpen}
        onClose={() => setCreateTeamModalOpen(false)}
        onTeamCreated={handleTeamCreated}
      />
    </>
  );
}
