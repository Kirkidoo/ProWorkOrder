import { GoogleGenAI, Type } from "@google/genai";

// Fix: Use process.env.API_KEY directly for initialization and create the instance inside the function to ensure the most up-to-date configuration.
export const getDiagnosticSuggestions = async (concern: string, unitDetails: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `As an expert Powersports mechanic, analyze this customer concern and unit details.
      Unit: ${unitDetails}
      Concern: ${concern}
      
      Provide 3 potential causes and 3 suggested diagnostic steps. Keep it brief and technical.`,
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
            }
          },
          required: ["potentialCauses", "suggestedSteps"]
        }
      }
    });

    // response.text is a getter, use it directly.
    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Diagnostic Error:", error);
    return null;
  }
};
