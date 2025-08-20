import React from 'react';
import { useTranslation } from 'react-i18next';

const Workspace: React.FC = () => {
  const { t } = useTranslation('workspace');

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="font-syne text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('workspace:title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('workspace:subtitle')}
          </p>
        </div>

        <div className="bg-card rounded-3xl border shadow-soft p-8">
          <p className="text-center text-muted-foreground">
            Workspace functionality will be implemented here...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Workspace;