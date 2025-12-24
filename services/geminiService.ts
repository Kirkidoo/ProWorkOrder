
import { GoogleGenAI, Type } from "@google/genai";
import { ServiceNote } from "../types";

export const getDiagnosticSuggestions = async (concern: string, unitDetails: string, notes: ServiceNote[]) => {
  try {
    const ai = new GoogleGenAI({ apiKey: (import.meta as any).env.VITE_GEMINI_API_KEY });

    // Format existing notes for context
    const notesContext = notes.length > 0
      ? notes.map(n => `- ${n.timestamp}: ${n.content}`).join('\n')
      : "No service notes logged yet.";

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `As an expert Powersports mechanic, analyze this customer concern and unit details.
      
      Unit: ${unitDetails}
      Concern: ${concern}
      
      Existing Service History/Notes:
      ${notesContext}
      
      CRITICAL: Do not suggest diagnostic steps that have already been performed according to the notes.
      
      Provide:
      1. 3 potential causes.
      2. 3 suggested diagnostic steps (new actions).
      3. 3-4 specific pieces of missing information or follow-up questions for the customer to refine the diagnosis (e.g., specific conditions when the issue occurs, dashboard codes to check, or specific sounds).
      
      Keep all responses brief, technical, and professional.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            potentialCauses: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            suggestedSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            missingInformation: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Questions or checks to narrow down the root cause."
            }
          },
          required: ["potentialCauses", "suggestedSteps", "missingInformation"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Diagnostic Error:", error);
    return null;
  }
};
