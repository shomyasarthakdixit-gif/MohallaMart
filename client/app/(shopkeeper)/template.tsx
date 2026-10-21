"use client";

import { PageTransition } from "@/components/page-transition";

export default function ShopkeeperTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransition>{children}</PageTransition>;
}
