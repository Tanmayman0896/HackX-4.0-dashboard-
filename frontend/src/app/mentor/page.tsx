"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Video } from "lucide-react";
import { MentorInfoTab } from "@/components/mentor/mentor-info-tab";
import { QueueManagement } from "@/components/mentor/queue-management";
import { apiService } from "@/lib/service";
import { authService } from "@/lib/auth";
import { AppShell, ShellIdentity } from "@/components/shell/app-shell";
import { BootScreen } from "@/components/shell/primitives";
import { LayoutGrid, ListOrdered } from "lucide-react";
import type { Mentor, QueueItem } from "@/lib/types";

export default function MentorDashboard() {
  const router = useRouter();
  const [passwordChanged, setPasswordChanged] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [mentorInfo, setMentorInfo] = useState<Mentor | null>(null);

  useEffect(() => {
    const currentUser = authService.getUser();
    if (
      !currentUser ||
      (currentUser.role !== "MENTOR" &&
        currentUser.role !== "ADMIN" &&
        currentUser.role !== "SUPER_ADMIN")
    ) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    setPasswordChanged(true); // TODO: Remove this line after implementing password change feature
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (passwordChanged) {
      loadData();
      // Auto-refresh queue every 10 seconds
      loadQueue();
      const refreshTimer = setInterval(loadQueue, 10000);
      return () => clearInterval(refreshTimer);
    }
  }, [passwordChanged]);

  const loadData = async () => {
    try {
      const profile = (await apiService.getProfile()) as Mentor;
      setMentorInfo(profile);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const loadQueue = async () => {
    try {
      apiService.getMyQueue().then(setQueue);
    } catch (error) {
      console.error("Failed to load queue:", error);
    }
  };

  const handleMarkResolved = (queueItemId: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== queueItemId));
  };

  // if (!passwordChanged) {
  //   return <PasswordChangeForm onPasswordChanged={() => setPasswordChanged(true)} />
  // }

  if (!mentorInfo) {
    return <BootScreen label="Loading mentor data" />;
  }

  return (
    <Tabs defaultValue="overview">
      <AppShell
        role="Mentor"
        title={mentorInfo.name}
        subtitle={`${mentorInfo.mode === "ONLINE" ? "Online" : "In person"} · ${queue.filter((q) => q.status === "WAITING").length} waiting`}
        identity={
          <ShellIdentity
            name={mentorInfo.name}
            meta={mentorInfo.user?.username}
          />
        }
        actions={
          <div className="border-border bg-card hidden items-baseline gap-2 rounded-md border px-2.5 py-1.5 sm:flex">
            <span className="eyebrow">Now</span>
            <span
              data-numeric
              className="text-foreground text-[0.8125rem] font-medium"
            >
              {currentTime.toLocaleTimeString()}
            </span>
          </div>
        }
        nav={
          <TabsList>
            <TabsTrigger value="overview">
              <LayoutGrid />
              Overview
            </TabsTrigger>
            <TabsTrigger value="queue">
              <ListOrdered />
              Queue Management
            </TabsTrigger>
          </TabsList>
        }
      >
        <TabsContent value="overview">
          <MentorInfoTab
            mentorInfo={mentorInfo}
            queue={queue}
            onRefreshAction={loadQueue}
          />
        </TabsContent>

        <TabsContent value="queue">
          <QueueManagement
            queue={queue}
            onMarkResolvedAction={handleMarkResolved}
          />
        </TabsContent>

        {/* Mode-specific alerts */}
        {mentorInfo.mode === "IN_PERSON" && (
          <Alert className="mt-4 sm:mt-6">
            <MapPin className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Offline Mentoring:</strong> Please visit the team rooms in
              the order shown above. Click &#34;Mark as Resolved&#34; after
              completing each mentoring session.
            </AlertDescription>
          </Alert>
        )}

        {mentorInfo.mode === "ONLINE" && (
          <Alert className="mt-4 sm:mt-6" variant={"default"}>
            <Video className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Online Mentoring:</strong> The assigned CC will notify
              teams via WhatsApp group. Teams will join your Google Meet link
              for mentoring sessions.
            </AlertDescription>
          </Alert>
        )}
      </AppShell>
    </Tabs>
  );
}
