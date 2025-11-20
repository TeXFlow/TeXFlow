import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateProblem = async (topic: string): Promise<{ latex: string; description: string }> => {
  try {
    const modelId = 'gemini-2.5-flash';
    
    const prompt = `Generate a valid LaTeX equation related to the topic: "${topic}". 
    It should be mathematically meaningful (e.g. a known formula, identity, or definition).
    Return the result as a JSON object with two fields: "latex" (the raw latex string without $ delimiters) and "description" (a very brief explanation of what it is).`;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            latex: { type: Type.STRING },
            description: { type: Type.STRING },
          },
          required: ['latex', 'description'],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback if API fails or key is missing
    return {
      latex: '\\text{Error generating content. Check API Key.}',
      description: 'System Error'
    };
  }
};

export const explainLatex = async (latex: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Explain this LaTeX equation in simple terms for a student:
            
            $$${latex}$$
            
            Keep it under 3 sentences.`,
        });
        return response.text || "Could not generate explanation.";
    } catch (e) {
        return "Unable to explain at this time.";
    }
}
