/**
 * Trip API Service
 * Centralized API calls for trip operations
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export interface BudgetEstimateRequest {
  destinations: string[];
  duration_days: number;
  start_date: string;
}

export interface BudgetEstimateResponse {
  success: boolean;
  minimum_budget: number;
}

export const tripApi = {
  async estimateBudget(request: BudgetEstimateRequest): Promise<BudgetEstimateResponse> {
    const response = await fetch(`${API_BASE_URL}/api/trips/estimate-budget`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error("Failed to estimate budget");
    }
    
    return response.json();
  },
};
