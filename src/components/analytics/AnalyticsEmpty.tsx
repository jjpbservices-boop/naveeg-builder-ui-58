import React from "react";
import { useTranslation } from "react-i18next";
import { BarChart3, Share } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const AnalyticsEmpty: React.FC = () => {
  const { t } = useTranslation('analytics');

  return (
    <Card>
      <CardContent className="flex items-center justify-center py-12">
        <div className="text-center space-y-4 max-w-md">
          <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-medium">
            {t('empty.title')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('empty.description')}
          </p>
          <div className="bg-muted rounded-lg p-4 mt-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              💡 {t('empty.tip')}
            </p>
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share Website
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};