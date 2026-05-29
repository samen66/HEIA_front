import { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { Toast } from "@/components/Toast";
import { api } from "@/lib/api";
import { API_UNAVAILABLE_MESSAGE } from "@/lib/apiErrors";
import {
  FEEDBACK_STATUS_OPTIONS,
  roleToApiLabel,
} from "@/lib/cardholder";
import { translateFeedbackStatus } from "@/lib/i18nLabels";
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
  const { t } = useTranslation();
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
        comment,
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
          <CardTitle>{t("cardholder.feedback_title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-[var(--color-muted-foreground)]">
            {t("cardholder.current_status")}:{" "}
            <span className="font-medium text-[var(--color-foreground)]">
              {translateFeedbackStatus(t, savedStatus)}
            </span>
          </p>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("cardholder.change_status")}</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FEEDBACK_STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {translateFeedbackStatus(t, opt)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback-comment">{t("cardholder.comment")}</Label>
              <Input
                id="feedback-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t("cardholder.comment_placeholder")}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? t("cardholder.saving") : t("cardholder.feedback_save")}
            </Button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>
        </CardContent>
      </Card>
      {toast && (
        <Toast
          message={t("cardholder.feedback_saved")}
          onDismiss={() => setToast(false)}
        />
      )}
    </>
  );
}
