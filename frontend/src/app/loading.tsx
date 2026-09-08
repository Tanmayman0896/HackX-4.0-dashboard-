import {
  AppShellSkeleton,
  MetricRowSkeleton,
} from "@/components/ui/dashboard-skeletons";

export default function RootLoading() {
  return (
    <AppShellSkeleton role="Loading" tabCount={4}>
      <div className="space-y-6">
        <MetricRowSkeleton count={3} />
        <div className="border-border bg-card h-64 animate-pulse rounded-lg border p-6" />
      </div>
    </AppShellSkeleton>
  );
}
