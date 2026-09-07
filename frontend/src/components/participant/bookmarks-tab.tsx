"use client";

import { Label } from "@/components/ui/label";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ProblemStatement } from "@/lib/types";

interface BookmarksTabProps {
  bookmarkedPS: ProblemStatement[];
  onBookmarkUpdateAction: (psId: string) => void;
}

export function BookmarksTab({
  bookmarkedPS,
  onBookmarkUpdateAction,
}: BookmarksTabProps) {
  const { toast } = useToast();

  const handleRemoveBookmark = async (psId: string) => {
    try {
      onBookmarkUpdateAction(psId);
      toast({
        title: "Success",
        description: "Bookmark removed",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to remove bookmark",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight">
          Bookmarked Problem Statements
        </h2>
        <Badge variant="outline" className="bg-warn/12">
          <Star className="fill-warn text-warn mr-1 h-3 w-3" />
          {bookmarkedPS.length} bookmarked
        </Badge>
      </div>

      <div className="space-y-4">
        {bookmarkedPS.length > 0 ? (
          bookmarkedPS.map((ps) => (
            <Card key={ps.id} className="border-l-warn border-l-2">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Star className="fill-warn text-warn h-4 w-4" />
                      {ps.title}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {ps.description}
                    </CardDescription>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline">{ps.domain.name}</Badge>
                      <Badge variant="secondary">
                        Selected by {ps._count.teams}{" "}
                        {ps._count.teams > 1 ? "teams" : "team"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveBookmark(ps.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div>
                  <Label className="text-sm font-medium">Deliverables:</Label>
                  <ul className="text-muted-foreground mt-1 list-inside list-disc text-sm">
                    {ps.deliverables.map((deliverable, index) => (
                      <li key={index}>{deliverable}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <Star className="text-muted-foreground/60 mx-auto mb-4 h-12 w-12" />
              <p className="text-muted-foreground">
                No bookmarked problem statements
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                Bookmark problem statements from the Problem Statements tab to
                save them here
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
