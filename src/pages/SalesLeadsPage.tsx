import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DataLoadState } from "@/components/DataLoadState";
import { OpportunityDisclaimer } from "@/components/OpportunityDisclaimer";
import { PageShell } from "@/components/PageShell";
import { SalesLeadsTable } from "@/components/SalesLeadsTable";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRole } from "@/context/RoleContext";
import { api, type CardholderScore, type LeadsListResponse } from "@/lib/api";
import { API_UNAVAILABLE_MESSAGE } from "@/lib/apiErrors";
import { isLeadsListRestricted, type LeadSortKey } from "@/lib/cardholder";
import { ROUTES } from "@/lib/roles";

const PAGE_SIZE = 20;

function isLeadsListResponse(
  data: LeadsListResponse | { view?: string },
): data is LeadsListResponse {
  return Array.isArray((data as LeadsListResponse).leads);
}

export function SalesLeadsPage() {
  const { t } = useTranslation();
  const { role } = useRole();
  const restricted = isLeadsListRestricted(role);

  const [loading, setLoading] = useState(!restricted);
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<CardholderScore[]>([]);
  const [total, setTotal] = useState(0);
  const [banks, setBanks] = useState<string[]>([]);

  const [segmentFilter, setSegmentFilter] = useState("");
  const [bankFilter, setBankFilter] = useState("");
  const [feedbackFilter, setFeedbackFilter] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<LeadSortKey>("score_desc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (restricted) return;
    let cancelled = false;
    (async () => {
      try {
        const bankRows = await api.getBanks();
        if (!cancelled) {
          setBanks(bankRows.map((b) => b.bank_name).sort());
        }
      } catch {
        if (!cancelled) setBanks([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [restricted]);

  const load = useCallback(async () => {
    if (restricted || !role) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getLeads({
        role,
        bank: bankFilter || undefined,
        segment: segmentFilter || undefined,
        feedback: feedbackFilter || undefined,
        search: debouncedSearch || undefined,
        sort,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      });
      if (!isLeadsListResponse(data)) {
        setLeads([]);
        setTotal(0);
        return;
      }
      setLeads(data.leads);
      setTotal(data.total);
    } catch {
      setError(API_UNAVAILABLE_MESSAGE);
      setLeads([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [
    restricted,
    role,
    bankFilter,
    segmentFilter,
    feedbackFilter,
    debouncedSearch,
    sort,
    page,
  ]);

  useEffect(() => {
    load();
  }, [load]);

  const resetPage = () => setPage(1);

  if (restricted) {
    return (
      <PageShell
        title={t("leads.page_title")}
        description={t("leads.page_description")}
        className="pb-24"
      >
        <Card>
          <CardHeader>
            <CardTitle>{t("leads.access_restricted_title")}</CardTitle>
            <CardDescription>{t("leads.restricted")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="default">
              <Link to={ROUTES.dashboard}>{t("dashboard.open_dashboard")}</Link>
            </Button>
          </CardContent>
        </Card>
        <OpportunityDisclaimer />
      </PageShell>
    );
  }

  return (
    <PageShell
      title={t("leads.page_title")}
      description={t("leads.page_description")}
      className="pb-24"
    >
      <DataLoadState
        loading={loading}
        error={error}
        onRetry={load}
        skeleton="table"
      >
        <SalesLeadsTable
          leads={leads}
          total={total}
          role={role}
          banks={banks}
          segmentFilter={segmentFilter}
          bankFilter={bankFilter}
          feedbackFilter={feedbackFilter}
          search={search}
          sort={sort}
          page={page}
          pageSize={PAGE_SIZE}
          onSegmentFilterChange={(v) => {
            setSegmentFilter(v);
            resetPage();
          }}
          onBankFilterChange={(v) => {
            setBankFilter(v);
            resetPage();
          }}
          onFeedbackFilterChange={(v) => {
            setFeedbackFilter(v);
            resetPage();
          }}
          onSearchChange={(v) => {
            setSearch(v);
            resetPage();
          }}
          onSortChange={(v) => {
            setSort(v);
            resetPage();
          }}
          onPageChange={setPage}
        />
      </DataLoadState>
      <OpportunityDisclaimer />
    </PageShell>
  );
}
