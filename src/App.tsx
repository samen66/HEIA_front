import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppLayout } from "@/components/layout/AppLayout";
import { RoleProvider } from "@/context/RoleContext";
import { ROUTES } from "@/lib/roles";
import { BeforeVsAfterPage } from "@/pages/BeforeVsAfterPage";
import { BusinessImpactPage } from "@/pages/BusinessImpactPage";
import { CardholderDetailPage } from "@/pages/CardholderDetailPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { FeatureImportancePage } from "@/pages/FeatureImportancePage";
import { FeedbackPage } from "@/pages/FeedbackPage";
import { AiAgentPage } from "@/pages/AiAgentPage";
import { JudgeDemoPage } from "@/pages/JudgeDemoPage";
import { ModelMetricsPage } from "@/pages/ModelMetricsPage";
import { ProductRecommendationsPage } from "@/pages/ProductRecommendationsPage";
import { RoleSelectionPage } from "@/pages/RoleSelectionPage";
import { SalesLeadsPage } from "@/pages/SalesLeadsPage";

export default function App() {
  return (
    <ErrorBoundary>
      <RoleProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<RoleSelectionPage />} />
          <Route element={<AppLayout />}>
            <Route path={ROUTES.dashboard} element={<DashboardPage />} />
            <Route path={ROUTES.businessImpact} element={<BusinessImpactPage />} />
            <Route path={ROUTES.beforeVsAfter} element={<BeforeVsAfterPage />} />
            <Route
              path={ROUTES.productRecommendations}
              element={<ProductRecommendationsPage />}
            />
            <Route path={ROUTES.salesLeads} element={<SalesLeadsPage />} />
            <Route path={`${ROUTES.cardholder}/:card_id`} element={<CardholderDetailPage />} />
            <Route path={ROUTES.feedback} element={<FeedbackPage />} />
            <Route path={ROUTES.modelMetrics} element={<ModelMetricsPage />} />
            <Route
              path={ROUTES.featureImportance}
              element={<FeatureImportancePage />}
            />
            <Route path={ROUTES.aiAgent} element={<AiAgentPage />} />
            <Route path={ROUTES.judgeDemo} element={<JudgeDemoPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </RoleProvider>
    </ErrorBoundary>
  );
}
