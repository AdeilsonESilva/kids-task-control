"use client";

import { useChildren } from "@/hooks/use-children";
import { useSummaryPreloader } from "@/hooks/use-summary-preloader";
import { useEffect } from "react";

export const SummaryProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data: childrenData, isSuccess } = useChildren();
  const { preloadSummaries } = useSummaryPreloader();

  useEffect(() => {
    if (isSuccess && childrenData?.length) {
      const childIds = childrenData.map((child) => child.id);
      preloadSummaries(childIds);
    }
  }, [isSuccess, childrenData, preloadSummaries]);

  return <>{children}</>;
};
