"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTab } from "@/components/participant/overview-tab";
import { ProblemStatements } from "@/components/participant/problem-statements";
import { Mentorship } from "@/components/participant/mentorship";
import { AnnouncementsTab } from "@/components/participant/announcements-tab";
import { SubmissionsTab } from "@/components/participant/submissions-tab";
import { BookmarksTab } from "@/components/participant/bookmarks-tab";
import { apiService } from "@/lib/service";
import { AppShell, ShellIdentity } from "@/components/shell/app-shell";
import { BootScreen, EmptyState } from "@/components/shell/primitives";
import {
  Bookmark,
  FileText,
  LayoutGrid,
  Megaphone,
  MessagesSquare,
  UploadCloud,
} from "lucide-react";
import type {
  Announcement,
  Domain,
  Mentor,
  MentorshipSession,
  ProblemStatement,
  Submission,
  Team,
} from "@/lib/types";

export default function TeamDashboard() {
  const [passwordChanged, setPasswordChanged] = useState(true);
  const [selectedPS, setSelectedPS] = useState<ProblemStatement | null>(null);
  const [bookmarkedPS, setBookmarkedPS] = useState<ProblemStatement[]>([]);
  const [selectedMentor, setSelectedMentor] =
    useState<MentorshipSession | null>(null);
  const [psLocked, setPsLocked] = useState(false);
  const [mentorshipLocked, setMentorshipLocked] = useState(false);
  const [round1Locked, setRound1Locked] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [team, setTeam] = useState<Team | null>(null);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [notDonePreviousMentorship, setNotDonePreviousMentorship] =
    useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // TODO remove later
    setPasswordChanged(true);
    if (passwordChanged) {
      loadData();
    }
  }, [passwordChanged]);

  const loadData = async () => {
    try {
      const user = await apiService.getAuthProfile();
      if (user?.teamId) {
        const teamData = await apiService.getMyTeam();
        setTeam(teamData);
      }

      const [
        domainsData,
        mentorsData,
        bookmarks,
        announcementsData,
        selectedPsData,
        lockedData,
        selectedMentorData,
        submissionsData,
        notDonePreviousMentorshipData,
      ] = await Promise.all([
        apiService.getDomains(),
        apiService.getMentors(),
        apiService.getBookmarkedPS(),
        apiService.getAnnouncements(),
        apiService.getSelectedProblemStatement(),
        apiService.getLockedOverview(),
        apiService.getSelectedMentor(),
        apiService.getTeamSubmission(),
        apiService.getTeamPreviousMentorshipStatus(),
      ]);

      setDomains(domainsData);
      setMentors(mentorsData);
      setBookmarkedPS(bookmarks);
      setAnnouncements(announcementsData);
      setSelectedPS(selectedPsData);
      setPsLocked(lockedData.problem_statements_locked === "true");
      setMentorshipLocked(lockedData.mentorship_locked === "true");
      setRound1Locked(lockedData.round1_locked === "true");
      setSelectedMentor(selectedMentorData);
      setSubmissions(submissionsData);
      setNotDonePreviousMentorship(notDonePreviousMentorshipData);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const handleBookmark = async (psId: string) => {
    await apiService.bookmarkProblemStatement(psId);
    const updatedBookmarks = await apiService.getBookmarkedPS();
    setBookmarkedPS(updatedBookmarks);
  };

  const handleSubmissionUpdate = () => {
    apiService.getTeamSubmission().then(setSubmissions).catch(console.error);
  };

  const refreshDomains = () => {
    apiService
      .getDomains()
      .then((res) => setDomains(Array.isArray(res) ? res : []))
      .catch(() => setDomains([]));
  };

  const refreshMentors = () => {
    apiService
      .getMentors()
      .then((res) => setMentors(Array.isArray(res) ? res : []))
      .catch(() => setMentors([]));
  };

  const refreshAnnouncements = () => {
    apiService
      .getAnnouncements()
      .then((res) => setAnnouncements(Array.isArray(res) ? res : []))
      .catch(() => setAnnouncements([]));
  };

  // if (!passwordChanged) {
  //   return <PasswordChangeForm onPasswordChanged={() => setPasswordChanged(true)} />
  // }

  if (!team) {
    return <BootScreen label="Loading team data" />;
  }

  return (
    <Tabs defaultValue="overview">
      <AppShell
        role="Participant"
        title={team.name}
        subtitle={team.teamId}
        identity={
          <ShellIdentity
            name={team.name}
            meta={team.teamId ? `Team ${team.teamId}` : undefined}
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
            <TabsTrigger value="problem-statements">
              <FileText />
              Problem Statements
            </TabsTrigger>
            <TabsTrigger value="mentorship">
              <MessagesSquare />
              Mentorship
            </TabsTrigger>
            <TabsTrigger value="announcements">
              <Megaphone />
              Announcements
            </TabsTrigger>
            <TabsTrigger value="submissions">
              <UploadCloud />
              Submissions
            </TabsTrigger>
            <TabsTrigger value="bookmarks">
              <Bookmark />
              Bookmarks
            </TabsTrigger>
          </TabsList>
        }
      >
        <TabsContent value="overview">
          <OverviewTab
            team={team}
            selectedPS={selectedPS}
            selectedMentor={selectedMentor}
            psLocked={psLocked}
            mentorshipLocked={mentorshipLocked}
            round3Selected={team.status === "ROUND2_QUALIFIED"}
            round1Locked={round1Locked}
            submissions={submissions}
          />
        </TabsContent>

        <TabsContent value="problem-statements">
          <ProblemStatements
            domains={domains}
            selectedPS={selectedPS}
            bookmarkedPS={bookmarkedPS}
            psLocked={psLocked}
            onSelectPSAction={setSelectedPS}
            onBookmarkAction={handleBookmark}
            refreshDomainsAction={refreshDomains}
          />
        </TabsContent>

        <TabsContent value="mentorship">
          {mentorshipLocked && !selectedMentor ? (
            <EmptyState
              icon={<MessagesSquare />}
              title="Mentorship is locked"
              description="Booking is closed right now. Check back later or watch the Announcements tab."
            />
          ) : notDonePreviousMentorship ? (
            <Mentorship
              mentors={mentors}
              mentorshipSession={selectedMentor}
              onSelectMentorAction={setSelectedMentor}
              refreshMentorsAction={refreshMentors}
            />
          ) : (
            <EmptyState
              icon={<MessagesSquare />}
              title="Session complete"
              description="You have already used your mentorship session for this round."
            />
          )}
        </TabsContent>

        <TabsContent value="announcements">
          <AnnouncementsTab
            announcements={announcements}
            refreshAnnouncementAction={refreshAnnouncements}
          />
        </TabsContent>

        <TabsContent value="submissions">
          <SubmissionsTab
            submissions={submissions}
            round1Locked={round1Locked}
            onSubmissionUpdateAction={handleSubmissionUpdate}
          />
        </TabsContent>

        <TabsContent value="bookmarks">
          <BookmarksTab
            bookmarkedPS={bookmarkedPS}
            onBookmarkUpdateAction={handleBookmark}
          />
        </TabsContent>
      </AppShell>
    </Tabs>
  );
}
