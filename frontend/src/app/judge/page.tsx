"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Calculator,
  Edit,
  FileText,
  Gavel,
  Github,
  MapPin,
  Users,
} from "lucide-react";
import { Evaluation, Judge } from "@/lib/types";
import { apiService } from "@/lib/service";
import { AppShell, ShellIdentity } from "@/components/shell/app-shell";
import {
  EmptyState,
  Metric,
  MetricRow,
  Panel,
  PanelBody,
  PanelHeader,
  PanelTitle,
  Section,
} from "@/components/shell/primitives";
import {
  JudgeDashboardSkeleton,
  EvaluationCardsSkeleton,
} from "@/components/ui/dashboard-skeletons";
import { useToast } from "@/hooks/use-toast";

type ScoreKeys =
  | "innovation"
  | "technical"
  | "presentation"
  | "feasibility"
  | "impact";
interface Criterion {
  id: ScoreKeys;
  name: string;
  weight: number;
  maxScore: number;
}

export default function JudgeDashboard() {
  // const [passwordChanged, setPasswordChanged] = useState(true);
  const [hideEvaluated, setHideEvaluated] = useState(false);
  const [scores, setScores] = useState<
    Record<ScoreKeys, number> & { feedback: string }
  >({
    innovation: 0,
    technical: 0,
    feasibility: 0,
    presentation: 0,
    impact: 0,
    feedback: "",
  });
  const [judge, setJudge] = useState<Judge>();
  const [assignedTeams, setAssignedTeams] = useState<Evaluation[]>([]);
  const [openTeamId, setOpenTeamId] = useState<string | null>(null);
  const [activeRound, setActiveRound] = useState<1 | 3>(1);
  const [isTeamsLoading, setIsTeamsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    apiService
      .getProfile()
      .then((value) => setJudge(value as Judge))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setIsTeamsLoading(true);
    apiService
      .getEvaluations(activeRound)
      .then((res) => setAssignedTeams(Array.isArray(res) ? res : []))
      .catch(() => setAssignedTeams([]))
      .finally(() => setIsTeamsLoading(false));
  }, [activeRound]);

  const scoringCriteria: Criterion[] = [
    {
      id: "innovation",
      name: "Innovation & Creativity",
      weight: 25,
      maxScore: 10,
    },
    {
      id: "technical",
      name: "Technical Implementation",
      weight: 30,
      maxScore: 10,
    },
    {
      id: "presentation",
      name: "Presentation Quality",
      weight: 15,
      maxScore: 10,
    },
    {
      id: "feasibility",
      name: "Feasibility of the Project",
      weight: 15,
      maxScore: 10,
    },
    {
      id: "impact",
      name: "Impact on Real Life",
      weight: 15,
      maxScore: 10,
    },
  ];

  const loadScores = async (teamId: string) => {
    const teamScores = await apiService.getTeamScoresById(teamId, activeRound);
    if (!teamScores) {
      resetScores();
    } else {
      setScores({
        innovation: teamScores.innovation,
        impact: teamScores.impact,
        technical: teamScores.technical,
        presentation: teamScores.presentation,
        feasibility: teamScores.feasibility,
        feedback: teamScores.feedback || "",
      });
    }
    setOpenTeamId(teamId);
  };

  const calculateWeightedScore = () => {
    let totalWeightedScore = 0;

    scoringCriteria.forEach((criteria) => {
      const score = scores[criteria.id] || 0;
      totalWeightedScore += (score * criteria.weight) / 100;
    });
    return totalWeightedScore.toFixed(1);
  };

  const handleScoreChange = (criteriaId: string, value: number[]) => {
    setScores((prev) => ({
      ...prev,
      [criteriaId]: value[0],
    }));
  };

  const handleSaveScore = async (teamId: string) => {
    const payload = { teamId, round: activeRound, scores };
    await apiService.submitScore(payload);
    apiService
      .getEvaluations(activeRound)
      .then((res) => setAssignedTeams(Array.isArray(res) ? res : []));
    toast({
      title: "Team marked!",
      description: `Successfully updated the score of ${teamId}`,
    });
    setOpenTeamId(null);
  };

  const resetScores = () => {
    const reset = scoringCriteria.reduce(
      (acc, criteria) => {
        acc[criteria.id] = 0;
        return acc;
      },
      {} as Record<ScoreKeys, number>,
    );

    setScores({ ...reset, feedback: "" });
  };

  const filteredEvaluations = hideEvaluated
    ? assignedTeams.filter((team) => !team.evaluated)
    : assignedTeams;

  // if (!passwordChanged) {
  //   return (
  //     <div className="min-h-screen bg-background flex items-center justify-center p-6">
  //       <Card className="w-full max-w-md">
  //         <CardHeader>
  //           <CardTitle>Change Password Required</CardTitle>
  //           <CardDescription>You must change your password before accessing the dashboard.</CardDescription>
  //         </CardHeader>
  //         <CardContent className="space-y-4">
  //           <div className="space-y-2">
  //             <Label htmlFor="current-password">Current Password</Label>
  //             <Input id="current-password" type="password" />
  //           </div>
  //           <div className="space-y-2">
  //             <Label htmlFor="new-password">New Password</Label>
  //             <Input id="new-password" type="password" />
  //           </div>
  //           <div className="space-y-2">
  //             <Label htmlFor="confirm-password">Confirm New Password</Label>
  //             <Input id="confirm-password" type="password" />
  //           </div>
  //           <Button className="w-full" onClick={() => setPasswordChanged(true)}>
  //             Change Password
  //           </Button>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   )
  // }

  if (!judge) {
    return <JudgeDashboardSkeleton />;
  }

  const evaluatedCount = assignedTeams.filter((t) => t.evaluated).length;
  const averageScore =
    evaluatedCount > 0
      ? (
          assignedTeams
            .filter((t) => t.evaluated)
            .reduce((sum, t) => sum + t.team.latestScore.totalScore, 0) /
          evaluatedCount
        ).toFixed(1)
      : "0.0";

  return (
    <AppShell
      role="Judge"
      title={judge.name}
      subtitle={`Round ${activeRound} · ${evaluatedCount} of ${assignedTeams.length} evaluated`}
      identity={<ShellIdentity name={judge.name} meta={judge.user.username} />}
      nav={
        <div className="flex w-full flex-col gap-0.5">
          <p className="eyebrow px-3 pb-2">Evaluation round</p>
          {([1, 3] as const).map((round) => (
            <button
              key={round}
              type="button"
              onClick={() => setActiveRound(round)}
              aria-current={activeRound === round}
              className={`focus-visible:ring-ring/40 relative flex w-full shrink-0 cursor-pointer items-center justify-start gap-2.5 rounded-md px-3 py-2 text-[0.8125rem] font-medium whitespace-nowrap transition-colors duration-150 outline-none before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:content-[''] focus-visible:ring-2 ${
                activeRound === round
                  ? "bg-hackx-soft text-hackx-ink before:bg-hackx font-semibold"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground before:opacity-0"
              }`}
            >
              <Gavel className="size-4 shrink-0" />
              Round {round}
            </button>
          ))}
        </div>
      }
      actions={
        <div className="border-border bg-card flex h-8.5 items-center gap-2 rounded-md border px-2.5">
          <Switch
            id="hide-evaluated"
            checked={hideEvaluated}
            onCheckedChange={setHideEvaluated}
          />
          <Label
            htmlFor="hide-evaluated"
            className="cursor-pointer text-xs whitespace-nowrap"
          >
            Hide evaluated
          </Label>
        </div>
      }
    >
      <div className="space-y-7">
        <MetricRow className="sm:grid-cols-3">
          <Metric
            label="Assigned"
            value={assignedTeams.length}
            hint={`Judge ID ${judge.user.username}`}
            icon={<Users />}
          />
          <Metric
            label="Evaluated"
            value={`${evaluatedCount}/${assignedTeams.length}`}
            hint="Teams scored this round"
            tone="ok"
            icon={<Gavel />}
          />
          <Metric
            label="Average score"
            value={averageScore}
            hint="Out of 10.0"
            tone="brand"
            icon={<Calculator />}
          />
        </MetricRow>

        <Section
          title="Teams assigned for evaluation"
          description={`Round ${activeRound} · showing ${filteredEvaluations.length} of ${assignedTeams.length}`}
        >
          {isTeamsLoading ? (
            <EvaluationCardsSkeleton count={3} />
          ) : filteredEvaluations.length === 0 ? (
            <EmptyState
              icon={<MapPin />}
              title="Nothing to evaluate"
              description={
                hideEvaluated
                  ? "Every assigned team for this round has been scored."
                  : "No teams have been assigned to you for this round yet."
              }
            />
          ) : (
            <div className="space-y-3">
              {filteredEvaluations.map((evaluation) => (
                <Panel key={evaluation.evaluationId} className="relative">
                  <span
                    aria-hidden
                    className={`absolute inset-y-0 left-0 w-0.5 ${
                      evaluation.evaluated ? "bg-ok" : "bg-hackx/45"
                    }`}
                  />
                  <PanelHeader className="items-start">
                    <div className="min-w-0">
                      <PanelTitle className="flex-wrap text-sm">
                        <span className="truncate">{evaluation.team.name}</span>
                        {evaluation.evaluated ? (
                          <Badge variant="green">Evaluated</Badge>
                        ) : (
                          <Badge variant="yellow">Pending</Badge>
                        )}
                        <Badge
                          variant={
                            evaluation.team.submissionStatus === "SUBMITTED"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {evaluation.team.submissionStatus === "SUBMITTED"
                            ? "Submitted"
                            : "Not submitted"}
                        </Badge>
                      </PanelTitle>
                      <p className="text-muted-foreground mt-1.5 text-[0.8125rem]">
                        {evaluation.team?.problemStatement?.title || "N/A"}
                      </p>
                    </div>
                    {evaluation.evaluated && (
                      <div className="shrink-0 text-right">
                        <div className="eyebrow">Score</div>
                        <div
                          data-numeric
                          className="text-foreground mt-1 text-lg leading-none font-semibold"
                        >
                          {evaluation.team.latestScore.totalScore}
                          <span className="text-faint text-xs font-normal">
                            /10
                          </span>
                        </div>
                      </div>
                    )}
                  </PanelHeader>

                  <PanelBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                      <span className="text-muted-foreground flex items-center gap-1.5 text-[0.8125rem]">
                        <MapPin className="text-faint size-3.5" />
                        {activeRound === 3
                          ? (evaluation.team?.round3Room?.name ??
                            "Room not assigned")
                          : evaluation.team?.round1Room
                            ? `${evaluation.team.round1Room.block} ${evaluation.team.round1Room.name}`
                            : "Room not assigned"}
                      </span>

                      {evaluation.team.latestSubmission?.githubRepo ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            window.open(
                              evaluation.team.latestSubmission?.githubRepo,
                              "_blank",
                            )
                          }
                        >
                          <Github />
                          GitHub
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          <Github />
                          No GitHub
                        </Button>
                      )}

                      {evaluation.team.latestSubmission?.presentationLink ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            window.open(
                              evaluation.team.latestSubmission
                                ?.presentationLink,
                              "_blank",
                            )
                          }
                        >
                          <FileText />
                          Presentation
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          <FileText />
                          No presentation
                        </Button>
                      )}
                    </div>

                    <Dialog
                      open={openTeamId === evaluation.team.id}
                      onOpenChange={(open) =>
                        setOpenTeamId(open ? evaluation.team.id : null)
                      }
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant={evaluation.evaluated ? "outline" : "default"}
                          className="w-full sm:w-auto"
                          onClick={() => loadScores(evaluation.team.id)}
                        >
                          {evaluation.evaluated ? (
                            <>
                              <Edit />
                              Edit score
                            </>
                          ) : (
                            <>
                              <Gavel />
                              Evaluate
                            </>
                          )}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-h-[90vh] w-[95vw] max-w-2xl overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            Evaluate: {evaluation.team.name}
                          </DialogTitle>
                          <DialogDescription>
                            Score each criterion from 0–10. The weighted total
                            is calculated automatically.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-5">
                          {scoringCriteria.map((criteria) => (
                            <div key={criteria.id} className="space-y-2.5">
                              <div className="flex items-center justify-between gap-3">
                                <Label className="text-[0.8125rem]">
                                  {criteria.name}
                                </Label>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">
                                    {criteria.weight}%
                                  </Badge>
                                  <span
                                    data-numeric
                                    className="text-foreground w-11 text-right text-[0.8125rem] font-semibold"
                                  >
                                    {scores[criteria.id] || 0}
                                    <span className="text-faint font-normal">
                                      /{criteria.maxScore}
                                    </span>
                                  </span>
                                </div>
                              </div>
                              <Slider
                                value={[scores[criteria.id] || 0]}
                                onValueChange={(value) =>
                                  handleScoreChange(criteria.id, value)
                                }
                                max={criteria.maxScore}
                                step={0.1}
                                className="w-full"
                              />
                            </div>
                          ))}
                          <Separator />
                          <div className="bg-muted/60 border-hairline flex items-center justify-between rounded-md border px-3.5 py-3">
                            <span className="eyebrow">Weighted total</span>
                            <span
                              data-numeric
                              className="text-hackx text-2xl leading-none font-semibold"
                            >
                              {calculateWeightedScore()}
                              <span className="text-faint text-sm font-normal">
                                /10.0
                              </span>
                            </span>
                          </div>
                        </div>
                        <DialogFooter className="flex-col gap-2 sm:flex-row">
                          <Button
                            variant="outline"
                            className="w-full sm:w-auto"
                            onClick={() => setOpenTeamId(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="outline"
                            onClick={resetScores}
                            className="w-full sm:w-auto"
                          >
                            Reset
                          </Button>
                          <Button
                            onClick={() => handleSaveScore(evaluation.team.id)}
                            className="w-full sm:w-auto"
                          >
                            Save score
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </PanelBody>
                </Panel>
              ))}
            </div>
          )}
        </Section>
      </div>
    </AppShell>
  );
}
