import { GoogleGenAI } from "@google/genai";

// Initialize Gemini AI client
const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GOOGLE_GEMINI_API_KEY
});

export interface BudgetEstimationParams {
  destinations: string[];
  duration_days: number;
  start_date: string;
}

export interface BudgetEstimationResult {
  success: boolean;
  minimum_budget: number;
}

/**
 * Estimate minimum budget per person for a trip using Gemini AI
 */
export async function estimateBudget(params: BudgetEstimationParams): Promise<BudgetEstimationResult> {
  const { destinations, duration_days, start_date } = params;
  
  const destinationsText = destinations.join(" -> ");
  
  const prompt = `Estimate a realistic budget per person in INR for this trip:
- Destinations: ${destinationsText}
- Duration: ${duration_days} days
- Start Date: ${start_date}

Consider: accommodation (budget hotels), local transport, meals (budget-friendly), entry fees.
Respond with ONLY a JSON object: {"minimum_budget": <number>}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const text = response.text;
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format from AI");
    }
    
    const budgetData = JSON.parse(jsonMatch[0]);
    
    return {
      success: true,
      minimum_budget: budgetData.minimum_budget || (duration_days * 2000), // Fallback
    };
  } catch (error) {
    console.error("Error estimating budget with Gemini:", error);
    
    // Return fallback budget based on duration
    const fallbackBudget = duration_days * 2000; // ₹2000 per day as fallback
    return {
      success: true,
      minimum_budget: fallbackBudget,
    };
  }
}

export const geminiService = {
  estimateBudget,
};
