import React from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, RefreshCw, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AnalyticsErrorProps {
  error: string | null;
  onRetry: () => void;
}

export const AnalyticsError: React.FC<AnalyticsErrorProps> = ({ error, onRetry }) => {
  const { t } = useTranslation('analytics');

  if (!error) return null;

  if (error === "rate_limited") {
    return (
      <Card className="border-warning bg-warning-light">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center space-y-3">
            <Clock className="h-12 w-12 text-warning mx-auto" />
            <h3 className="font-medium text-warning-foreground">
              Analytics Temporarily Rate Limited
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              We're fetching fresh data but hit a rate limit. Your cached data is shown below.
              Please wait a moment before refreshing.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-error bg-error-light">
      <CardContent className="flex items-center justify-center py-8">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-error mx-auto" />
          <h3 className="font-medium text-error-foreground">
            Analytics Unavailable
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            We're having trouble loading your analytics data. This could be a temporary connection issue.
          </p>
          <Button
            variant="outline"
            onClick={onRetry}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};