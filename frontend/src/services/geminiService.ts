import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini AI client
const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GOOGLE_GEMINI_API_KEY
});

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

const QUOTA_BLOCK_STORAGE_KEY = "triponbuddy_budget_quota_block_until_ms";
const DEFAULT_QUOTA_BLOCK_MS = 60 * 1000;
const BUDGET_CACHE_TTL_MS = 10 * 60 * 1000;
const budgetCache = new Map<string, { value: number; timestamp: number }>();
let inMemoryQuotaBlockUntil = 0;

const roundToNearestHundred = (value: number): number => Math.max(500, Math.round(value / 100) * 100);

const estimateFallbackBudget = (params: BudgetEstimationParams): number => {
  const { duration_days, route_distance_km, destinations } = params;

  // Practical baseline for budget-friendly travel per person/day.
  const dailyStayMealsAndLocal = 2200;
  const tripBase = duration_days * dailyStayMealsAndLocal;

  // Intercity movement cost should vary by distance so nearby trips are cheaper.
  const normalizedDistanceKm = route_distance_km && route_distance_km > 0 ? route_distance_km : 120;
  const distanceTransport = Math.max(400, normalizedDistanceKm * 3.5);

  // Extra destination hops generally add packing/check-in/transit overhead.
  const multiStopOverhead = Math.max(0, (destinations.length - 1) * 300);

  return roundToNearestHundred(tripBase + distanceTransport + multiStopOverhead);
};

const parseMinimumBudget = (raw: string | undefined): number | null => {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    const directValue = parsed?.minimum_budget;
    if (typeof directValue === "number" && Number.isFinite(directValue) && directValue > 0) {
      return Math.round(directValue);
    }
    if (typeof directValue === "string") {
      const normalized = Number(directValue.replace(/[^\d.]/g, ""));
      if (Number.isFinite(normalized) && normalized > 0) {
        return Math.round(normalized);
      }
    }
  } catch {
    // Try regex fallback below.
  }

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      const value = parsed?.minimum_budget;
      if (typeof value === "number" && Number.isFinite(value) && value > 0) {
        return Math.round(value);
      }
      if (typeof value === "string") {
        const normalized = Number(value.replace(/[^\d.]/g, ""));
        if (Number.isFinite(normalized) && normalized > 0) {
          return Math.round(normalized);
        }
      }
    } catch {
      // Continue to regex number extraction.
    }
  }

  const numericMatch = raw.match(/(\d[\d,]{2,})/);
  if (numericMatch?.[1]) {
    const normalized = Number(numericMatch[1].replace(/,/g, ""));
    if (Number.isFinite(normalized) && normalized > 0) {
      return Math.round(normalized);
    }
  }

  return null;
};

const buildBudgetCacheKey = (params: BudgetEstimationParams): string => {
  const normalizedDestinations = params.destinations.map((d) => d.trim().toLowerCase());
  const normalizedDate = params.start_date.trim();
  const normalizedStart = (params.start_location || "").trim().toLowerCase();
  const normalizedDistance = params.route_distance_km ? Math.round(params.route_distance_km) : 0;

  return JSON.stringify({
    d: normalizedDestinations,
    days: params.duration_days,
    date: normalizedDate,
    start: normalizedStart,
    dist: normalizedDistance,
  });
};

const getQuotaBlockUntil = (): number => {
  if (inMemoryQuotaBlockUntil > Date.now()) {
    return inMemoryQuotaBlockUntil;
  }

  if (typeof window === "undefined") {
    return 0;
  }

  const stored = window.localStorage.getItem(QUOTA_BLOCK_STORAGE_KEY);
  if (!stored) return 0;

  const parsed = Number(stored);
  if (!Number.isFinite(parsed) || parsed <= Date.now()) {
    window.localStorage.removeItem(QUOTA_BLOCK_STORAGE_KEY);
    return 0;
  }

  inMemoryQuotaBlockUntil = parsed;
  return parsed;
};

const setQuotaBlockUntil = (untilMs: number): void => {
  inMemoryQuotaBlockUntil = untilMs;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(QUOTA_BLOCK_STORAGE_KEY, String(untilMs));
  }
};

const isQuotaError = (error: unknown): boolean => {
  const text = error instanceof Error ? error.message : String(error);
  const lower = text.toLowerCase();
  return (
    lower.includes("resource_exhausted") ||
    lower.includes("quota") ||
    lower.includes("rate limit") ||
    lower.includes("\"code\":429") ||
    lower.includes("status of 429")
  );
};

const extractRetryDelayMs = (error: unknown): number => {
  const text = error instanceof Error ? error.message : String(error);
  const retryDelayMatch = text.match(/"retryDelay":"(\d+(?:\.\d+)?)s"/i);
  if (retryDelayMatch?.[1]) {
    const seconds = Number(retryDelayMatch[1]);
    if (Number.isFinite(seconds) && seconds > 0) {
      return Math.ceil(seconds * 1000);
    }
  }

  const retryInMatch = text.match(/retry in (\d+(?:\.\d+)?)s/i);
  if (retryInMatch?.[1]) {
    const seconds = Number(retryInMatch[1]);
    if (Number.isFinite(seconds) && seconds > 0) {
      return Math.ceil(seconds * 1000);
    }
  }

  return DEFAULT_QUOTA_BLOCK_MS;
};

/**
 * Estimate minimum budget per person for a trip using Gemini AI
 */
export async function estimateBudget(params: BudgetEstimationParams): Promise<BudgetEstimationResult> {
  const { destinations, duration_days, start_date, start_location, route_distance_km } = params;
  const cacheKey = buildBudgetCacheKey(params);
  const now = Date.now();
  const cached = budgetCache.get(cacheKey);

  if (cached && now - cached.timestamp < BUDGET_CACHE_TTL_MS) {
    return {
      success: true,
      minimum_budget: cached.value,
    };
  }

  const quotaBlockedUntil = getQuotaBlockUntil();
  if (quotaBlockedUntil > now) {
    const fallbackBudget = estimateFallbackBudget(params);
    budgetCache.set(cacheKey, { value: fallbackBudget, timestamp: now });
    return {
      success: true,
      minimum_budget: fallbackBudget,
    };
  }
  
  const destinationsText = destinations.join(" -> ");
  
  const prompt = `Estimate a realistic budget per person in INR for this trip:
- Destinations: ${destinationsText}
- Duration: ${duration_days} days
- Start Date: ${start_date}
${start_location ? `- Start Location: ${start_location}` : ""}
${route_distance_km !== undefined ? `- Approx travel distance: ${route_distance_km} km` : ""}

Consider: accommodation (budget hotels), transport (distance-sensitive), meals (budget-friendly), entry fees.
Return ONLY valid JSON with this exact shape: {"minimum_budget": <number>}.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["minimum_budget"],
          properties: {
            minimum_budget: { type: Type.NUMBER, minimum: 1 },
          },
        },
      },
    });

    const parsedBudget = parseMinimumBudget(response.text);
    if (parsedBudget !== null) {
      budgetCache.set(cacheKey, { value: parsedBudget, timestamp: now });
      return {
        success: true,
        minimum_budget: parsedBudget,
      };
    }

    // Retry once with a stricter minimalist prompt if first parse fails.
    const retryResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents:
        `Give only one number (no symbols, no commas): minimum INR budget per person for ${duration_days} days in ${destinationsText}.` +
        `${route_distance_km !== undefined ? ` Approx travel distance ${route_distance_km} km.` : ""}`,
      config: {
        responseMimeType: "text/plain",
      },
    });

    const retryBudget = parseMinimumBudget(retryResponse.text);
    if (retryBudget !== null) {
      budgetCache.set(cacheKey, { value: retryBudget, timestamp: now });
      return {
        success: true,
        minimum_budget: retryBudget,
      };
    }

    throw new Error("Unable to parse minimum budget from LLM response");
  } catch (error) {
    if (isQuotaError(error)) {
      const delayMs = extractRetryDelayMs(error);
      setQuotaBlockUntil(Date.now() + delayMs);
      console.warn(`Gemini budget quota reached; using fallback for ${Math.ceil(delayMs / 1000)}s.`);
    } else {
      console.warn("Error estimating budget with Gemini. Using fallback budget.", error);
    }

    const fallbackBudget = estimateFallbackBudget(params);
    budgetCache.set(cacheKey, { value: fallbackBudget, timestamp: now });

    return {
      success: true,
      minimum_budget: fallbackBudget,
    };
  }
}

export const geminiService = {
  estimateBudget,
};
