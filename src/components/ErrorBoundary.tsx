import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_UNAVAILABLE_MESSAGE } from "@/lib/apiErrors";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("HEIA render error:", error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-[#EB001B]" aria-hidden />
          </div>
          <p className="max-w-md text-sm text-slate-700">
            {API_UNAVAILABLE_MESSAGE}
          </p>
          <Button type="button" onClick={this.handleRetry}>
            Retry
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
