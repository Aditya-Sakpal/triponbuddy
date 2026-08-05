import { API_BASE_URL } from "@/constants/api";

export interface BudgetEstimationParams {
  destinations: string[];
  duration_days: number;
  start_date: string;
  start_location?: string;
  route_distance_km?: number;
}

export interface BudgetEstimationResult {
  success: boolean;
  minimum_budget: number;
}

const BUDGET_CACHE_TTL_MS = 10 * 60 * 1000;
const budgetCache = new Map<string, { value: number; timestamp: number }>();

const roundToNearestHundred = (value: number): number => Math.max(500, Math.round(value / 100) * 100);

const estimateFallbackBudget = (params: BudgetEstimationParams): number => {
  const { duration_days, route_distance_km, destinations } = params;
  const dailyStayMealsAndLocal = 2200;
  const tripBase = duration_days * dailyStayMealsAndLocal;
  const normalizedDistanceKm = route_distance_km && route_distance_km > 0 ? route_distance_km : 120;
  const distanceTransport = Math.max(400, normalizedDistanceKm * 3.5);
  const multiStopOverhead = Math.max(0, (destinations.length - 1) * 300);
  return roundToNearestHundred(tripBase + distanceTransport + multiStopOverhead);
};

const buildBudgetCacheKey = (params: BudgetEstimationParams): string => {
  const normalizedDestinations = params.destinations.map((d) => d.trim().toLowerCase());
  return JSON.stringify({
    d: normalizedDestinations,
    days: params.duration_days,
    date: params.start_date.trim(),
    start: (params.start_location || "").trim().toLowerCase(),
    dist: params.route_distance_km ? Math.round(params.route_distance_km) : 0,
  });
};

/**
 * Estimate minimum budget per person via backend.
 * Gemini API key must NEVER be used in the browser.
 */
export async function estimateBudget(params: BudgetEstimationParams): Promise<BudgetEstimationResult> {
  const cacheKey = buildBudgetCacheKey(params);
  const now = Date.now();
  const cached = budgetCache.get(cacheKey);

  if (cached && now - cached.timestamp < BUDGET_CACHE_TTL_MS) {
    return {
      success: true,
      minimum_budget: cached.value,
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/budget/estimate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Budget API failed with status ${response.status}`);
    }

    const data = await response.json();
    const minimumBudget = Number(data?.minimum_budget);
    if (!Number.isFinite(minimumBudget) || minimumBudget <= 0) {
      throw new Error("Invalid budget response");
    }

    const value = Math.round(minimumBudget);
    budgetCache.set(cacheKey, { value, timestamp: now });
    return { success: true, minimum_budget: value };
  } catch (error) {
    console.warn("Budget estimate API failed; using local fallback.", error);
    const fallbackBudget = estimateFallbackBudget(params);
    budgetCache.set(cacheKey, { value: fallbackBudget, timestamp: now });
    return { success: true, minimum_budget: fallbackBudget };
  }
}

export const budgetService = {
  estimateBudget,
};
