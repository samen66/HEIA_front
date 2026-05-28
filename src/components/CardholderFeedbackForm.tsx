import { useState } from "react";
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
import { Toast } from "@/components/Toast";
import { api } from "@/lib/api";
import { API_UNAVAILABLE_MESSAGE } from "@/lib/apiErrors";
import {
  FEEDBACK_STATUS_OPTIONS,
  roleToApiLabel,
} from "@/lib/cardholder";
import type { UserRole } from "@/lib/roles";

interface Props {
  cardId: string;
  initialStatus: string;
  role: UserRole;
  onSaved: (newStatus: string) => void;
}

export function CardholderFeedbackForm({
  cardId,
  initialStatus,
  role,
  onSaved,
}: Props) {
  const [savedStatus, setSavedStatus] = useState(initialStatus);
  const [status, setStatus] = useState(
    FEEDBACK_STATUS_OPTIONS.includes(
      initialStatus as (typeof FEEDBACK_STATUS_OPTIONS)[number],
    )
      ? initialStatus
      : "Not contacted",
  );
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const oldStatus = savedStatus;
    const userRole = roleToApiLabel(role);
    const timestamp = new Date().toISOString();

    try {
      await api.postFeedback({
        card_id: cardId,
        user_role: userRole,
        feedback_status: status,
        comment,
      });
      await api.postAuditLog({
        card_id: cardId,
        user_role: userRole,
        old_status: oldStatus,
        new_status: status,
        timestamp,
      });
      setToast(true);
      setSavedStatus(status);
      onSaved(status);
    } catch {
      setError(API_UNAVAILABLE_MESSAGE);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Field Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Feedback status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FEEDBACK_STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback-comment">Comment</Label>
              <Textarea
                id="feedback-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Outreach notes, conversion outcome, or rationale…"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback-card">Card ID</Label>
              <Input id="feedback-card" value={cardId} readOnly className="font-mono text-xs" />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save Feedback"}
            </Button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>
        </CardContent>
      </Card>
      {toast && (
        <Toast
          message="Feedback saved. This result can be used in future model retraining."
          onDismiss={() => setToast(false)}
        />
      )}
    </>
  );
}
