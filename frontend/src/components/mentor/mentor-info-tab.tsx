"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  Metric,
  MetricRow,
  Panel,
  PanelBody,
  PanelHeader,
  PanelTitle,
  Section,
} from "@/components/shell/primitives";
import { Clock, RefreshCw, Users } from "lucide-react";
import { GoogleMeetLink } from "./google-meet-link";
import type { Mentor, QueueItem } from "@/lib/types";

interface MentorInfoTabProps {
  mentorInfo: Mentor;
  queue: QueueItem[];
  onRefreshAction: () => void;
}

export function MentorInfoTab({
  mentorInfo,
  queue,
  onRefreshAction,
}: MentorInfoTabProps) {
  const waiting = queue.filter((q) => q.status === "WAITING").length;

  return (
    <div className="space-y-7">
      <MetricRow className="lg:grid-cols-3">
        <Metric
          label="Teams in queue"
          value={`${waiting}/5`}
          hint="Waiting for this mentor"
          tone="brand"
          icon={<Clock />}
        />
        <Metric
          label="Mentoring mode"
          value={mentorInfo.mode === "ONLINE" ? "Online" : "In person"}
          hint={mentorInfo.domains.join(", ")}
          icon={<Users />}
        />
        <Metric
          label="Auto refresh"
          value="10s"
          hint="Queue updates automatically"
          icon={<RefreshCw />}
        />
      </MetricRow>

      <Section
        title="Mentor profile"
        actions={
          <Button size="sm" variant="outline" onClick={onRefreshAction}>
            <RefreshCw />
            Refresh now
          </Button>
        }
      >
        <Panel>
          <PanelHeader>
            <PanelTitle>
              <Users />
              Assignment
            </PanelTitle>
            <Badge variant={mentorInfo.isAvailable ? "green" : "red"}>
              {mentorInfo.isAvailable ? "Available" : "Not available"}
            </Badge>
          </PanelHeader>
          <PanelBody className="grid gap-5 sm:grid-cols-3">
            <Field label="Mentor ID">{mentorInfo.user.username}</Field>
            <Field label="Domains">{mentorInfo.domains.join(", ")}</Field>
            <Field label="Mode">
              <Badge variant="secondary">{mentorInfo.mode}</Badge>
            </Field>
          </PanelBody>
        </Panel>
      </Section>

      {mentorInfo.mode === "ONLINE" && <GoogleMeetLink />}
    </div>
  );
}
