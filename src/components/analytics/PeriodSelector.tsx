import React from "react";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Period = "day" | "week" | "month" | "year";

interface PeriodSelectorProps {
  value: Period;
  onChange: (period: Period) => void;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({ value, onChange }) => {
  const { t } = useTranslation('analytics');

  const periodOptions = [
    { value: "day" as Period, label: t('periods.7days') },
    { value: "week" as Period, label: t('periods.30days') },
    { value: "month" as Period, label: t('periods.90days') },
    { value: "year" as Period, label: t('periods.1year') }
  ];

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select period" />
      </SelectTrigger>
      <SelectContent>
        {periodOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};