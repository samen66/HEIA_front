import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api, type FeedbackEntry } from "@/lib/api";
import { API_UNAVAILABLE_MESSAGE } from "@/lib/apiErrors";

interface Props {
  feedback: FeedbackEntry[];
  selectedCardId?: string;
  onSubmitted: () => void;
}

export function FeedbackPanel({
  feedback,
  selectedCardId = "",
  onSubmitted,
}: Props) {
  const [cardId, setCardId] = useState(selectedCardId);

  useEffect(() => {
    if (selectedCardId) setCardId(selectedCardId);
  }, [selectedCardId]);
  const [userRole, setUserRole] = useState("Relationship Manager");
  const [status, setStatus] = useState("Accepted");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardId.trim()) return;
    setLoading(true);
    setMessage("");
    try {
      await api.postFeedback({
        card_id: cardId,
        user_role: userRole,
        feedback_status: status,
        comment,
      });
      setMessage("Feedback saved.");
      setComment("");
      onSubmitted();
    } catch {
      setMessage(API_UNAVAILABLE_MESSAGE);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Submit Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="card_id">Card ID</Label>
              <Input
                id="card_id"
                value={cardId}
                onChange={(e) => setCardId(e.target.value)}
                placeholder="MC-KZ-00001"
              />
            </div>
            <div className="space-y-2">
              <Label>User Role</Label>
              <Select value={userRole} onValueChange={setUserRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Relationship Manager">
                    Relationship Manager
                  </SelectItem>
                  <SelectItem value="Credit Analyst">Credit Analyst</SelectItem>
                  <SelectItem value="Portfolio Manager">
                    Portfolio Manager
                  </SelectItem>
                  <SelectItem value="Branch Manager">Branch Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Accepted">Accepted</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Deferred">Deferred</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Rationale for decision…"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Submit Feedback"}
            </Button>
            {message && (
              <p className="text-sm text-[var(--color-muted-foreground)]">{message}</p>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feedback Log</CardTitle>
        </CardHeader>
        <CardContent className="max-h-[400px] overflow-y-auto space-y-3">
          {[...feedback].reverse().map((entry, i) => (
            <div
              key={`${entry.card_id}-${entry.date}-${i}`}
              className="rounded-md border border-[var(--color-border)] p-3 text-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs">{entry.card_id}</span>
                <span className="text-xs text-[var(--color-muted-foreground)]">
                  {entry.date}
                </span>
              </div>
              <p className="mt-1 font-medium">
                {entry.feedback_status} · {entry.user_role}
              </p>
              <p className="mt-1 text-[var(--color-muted-foreground)]">
                {entry.comment}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
