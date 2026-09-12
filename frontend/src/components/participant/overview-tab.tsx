"use client";

import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Field,
  Panel,
  PanelBody,
  PanelHeader,
  PanelTitle,
  Section,
} from "@/components/shell/primitives";
import { CircleX, Clock, MapPin, Trophy, Users } from "lucide-react";
import type {
  MentorshipSession,
  ProblemStatement,
  Submission,
  Team,
} from "@/lib/types";

interface OverviewTabProps {
  team: Team;
  selectedPS: ProblemStatement | null;
  selectedMentor: MentorshipSession | null;
  psLocked: boolean;
  mentorshipLocked: boolean;
  round3Selected: boolean;
  round3ResultsPublished: boolean;
  round1Locked: boolean;
  submissions: Submission[];
}

export function OverviewTab({
  team,
  selectedPS,
  selectedMentor,
  psLocked,
  round1Locked,
  submissions,
  mentorshipLocked,
  round3Selected,
  round3ResultsPublished,
}: OverviewTabProps) {
  const progress = [
    {
      label: "Problem statement",
      value: selectedPS?.title ? "Selected" : "Not selected",
      tone: selectedPS?.title ? ("green" as const) : ("secondary" as const),
      detail: selectedPS?.title ?? "Choose one from the Problem Statements tab",
    },
    {
      label: "Mentor booking",
      value: selectedMentor
        ? "Booked"
        : mentorshipLocked
          ? "Locked"
          : "Available",
      tone: selectedMentor
        ? ("green" as const)
        : mentorshipLocked
          ? ("red" as const)
          : ("secondary" as const),
      detail: selectedMentor
        ? (selectedMentor.mentor?.name ?? "Session booked")
        : mentorshipLocked
          ? "Bookings are closed"
          : "Book a slot from the Mentorship tab",
    },
    {
      label: "Round 1 submission",
      value: round1Locked
        ? "Locked"
        : submissions.length > 0
          ? "Submitted"
          : "Pending",
      tone: round1Locked
        ? ("red" as const)
        : submissions.length > 0
          ? ("green" as const)
          : ("yellow" as const),
      detail: round1Locked
        ? "Submissions are closed"
        : submissions.length > 0
          ? `${submissions.length} submission${submissions.length > 1 ? "s" : ""} on record`
          : "Add your repo and deck in the Submissions tab",
    },
  ];

  return (
    <div className="space-y-7">
      {round3Selected && (
        <Alert className="border-ok/25 bg-ok/8 text-foreground before:bg-ok [&>svg]:text-ok">
          <Trophy className="h-4 w-4" />
          <AlertDescription>
            <strong>Congratulations — you are through to Round 3.</strong>
            {team.round3Room ? (
              <> Report to {team.round3Room.name}.</>
            ) : (
              " Room details will be announced soon."
            )}
          </AlertDescription>
        </Alert>
      )}

      {round3ResultsPublished && !round3Selected && (
        <Alert>
          <CircleX className="h-4 w-4" />
          <AlertDescription>
            <strong>Your team was not selected for Round 3.</strong> Thank you
            for your participation in MUJ HackX.
          </AlertDescription>
        </Alert>
      )}

      <Section
        title="Progress"
        description="Where your team stands across the three gated stages."
      >
        <Panel>
          <div className="divide-hairline divide-y">
            {progress.map((row) => (
              <div
                key={row.label}
                className="flex items-start justify-between gap-4 px-4 py-3.5"
              >
                <div className="min-w-0">
                  <div className="text-foreground text-[0.8125rem] font-medium">
                    {row.label}
                  </div>
                  <p className="text-muted-foreground mt-0.5 truncate text-xs">
                    {row.detail}
                  </p>
                </div>
                <Badge variant={row.tone} className="mt-0.5 shrink-0">
                  {row.value}
                </Badge>
              </div>
            ))}
          </div>
        </Panel>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Team">
          <Panel>
            <PanelHeader>
              <PanelTitle>
                <Users />
                Team details
              </PanelTitle>
              <span className="eyebrow">{team.teamId}</span>
            </PanelHeader>
            <PanelBody className="grid gap-5 sm:grid-cols-2">
              <Field label="Team name">{team.name}</Field>
              <Field label="Round 1 room">
                <span className="flex items-center gap-1.5">
                  <MapPin className="text-faint size-3.5" />
                  {team?.round1Room
                    ? `${team.round1Room.block} ${team.round1Room.name}`
                    : "Not assigned"}
                </span>
              </Field>
              <Field label="Status" className="sm:col-span-2">
                <Badge variant="secondary">
                  {team.status?.replaceAll("_", " ") ?? "—"}
                </Badge>
              </Field>
            </PanelBody>
          </Panel>
        </Section>

        <Section title="Members">
          <Panel>
            <PanelHeader>
              <PanelTitle>
                <Users />
                Roster
              </PanelTitle>
              <span className="eyebrow">
                {team.participants?.length ?? 0} members
              </span>
            </PanelHeader>
            <div className="divide-hairline divide-y">
              {(team.participants ?? []).map((member, index) => (
                <div
                  key={member.id ?? index}
                  className="flex items-center gap-3 px-4 py-2.5"
                >
                  <span className="bg-muted text-muted-foreground border-hairline flex size-7 shrink-0 items-center justify-center rounded-md border text-[0.6875rem] font-semibold">
                    {member.name?.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-foreground block truncate text-[0.8125rem] font-medium">
                      {member.name}
                    </span>
                    <span className="text-faint block truncate text-xs">
                      {member.email}
                    </span>
                  </span>
                  {member.role === "LEADER" && (
                    <Badge variant="outline">Leader</Badge>
                  )}
                </div>
              ))}
            </div>
          </Panel>
        </Section>
      </div>

      {psLocked && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Problem statement selection is now locked.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
