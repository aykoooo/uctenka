// ============================================================
// Domain Types - Stable frontend types that pages/components use.
// These are decoupled from any backend schema.
// ============================================================

import type { ComponentType, CSSProperties } from "react";

export type ReceiptStatus = "processed" | "pending" | "error";

export type ConfidenceLevel = "high" | "medium" | "low";

export type ReviewIssueType =
  | "low_confidence"
  | "missing_category"
  | "missing_date"
  | "missing_amount"
  | "missing_merchant";

export interface ReviewIssue {
  type: ReviewIssueType;
  label: string;
}

export type CategoryId =
  | "food"
  | "transport"
  | "office"
  | "services"
  | "electronics"
  | "health"
  | "entertainment"
  | "clothing"
  | "other";

export interface Category {
  id: CategoryId;
  label: string;
  color: string;
  icon: ComponentType<{ className?: string; style?: CSSProperties }>;
}

export interface Receipt {
  id: string;
  merchantName: string;
  companyName: string | null;
  ico: string | null;
  dic: string | null;
  date: Date | null;
  categoryId: CategoryId | null;
  amount: number | null;
  currency: string;
  status: ReceiptStatus;
  confidence: number; // 0–100
  confidenceLevel: ConfidenceLevel;
  imageUrl: string | null;
  rawText: string | null;
  reviewIssues: ReviewIssue[];
  needsReview: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Technical metadata
  telegramMessageId: string | null;
  ocrEngine: string | null;
  processingDurationMs: number | null;
}

export interface DashboardStats {
  monthlyExpenses: number;
  previousMonthExpenses: number;
  receiptCount: number;
  previousMonthReceiptCount: number;
  topCategory: {
    categoryId: CategoryId;
    amount: number;
  } | null;
  previousTopCategory: {
    categoryId: CategoryId;
    amount: number;
  } | null;
  pendingReviewCount: number;
  previousPendingReviewCount: number;
}

export interface MonthlyExpense {
  month: string; // e.g. "2025-01"
  label: string; // e.g. "Leden", "Únor"
  amount: number;
  income: number;
}

export interface CategoryBreakdown {
  categoryId: CategoryId;
  amount: number;
  count: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  telegramLinked: boolean;
}
