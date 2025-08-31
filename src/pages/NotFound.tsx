import { useLocation, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-foreground">404</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-md mx-auto">
          {t('notFound.subtitle')}
        </p>
        <Link to="/" className="text-accent-foreground hover:text-accent-foreground/80 underline">
          {t('notFound.backHome')}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
