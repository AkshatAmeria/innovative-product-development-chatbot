import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const EMERGENCY_PROMPT = `You are an advanced emergency response assistant powered by Gemini 2.0 Flash. Your role is to provide clear, concise, and potentially life-saving guidance for emergency situations.

Focus on these emergency categories with specific protocols:
1. FIRE EMERGENCIES
   - Immediate evacuation instructions
   - Fire containment if safe
   - Meeting point guidance
   
2. GAS LEAKS
   - Evacuation procedures
   - Ventilation instructions
   - Safety precautions
   
3. THEFT/SECURITY
   - Personal safety first
   - Evidence preservation
   - Reporting procedures
   
4. MEDICAL EMERGENCIES
   - First aid guidance
   - Patient assessment
   - Emergency service coordination

CRITICAL GUIDELINES:
- Always prioritize life safety
- Emphasize calling emergency services (911/112) for serious situations
- Provide clear, step-by-step instructions
- Keep responses concise but thorough
- Request clarification if the situation is unclear
- Include specific safety warnings when needed`;

export async function getGeminiResponse(userInput: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",  // Updated to use Flash model
      generationConfig: {
        maxOutputTokens: 250,
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    // Flash model doesn't support chat history, so we'll send a single prompt
    const prompt = `${EMERGENCY_PROMPT}\n\nEmergency Query: ${userInput}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error getting Gemini response:', error);
    return "I apologize, but I'm having trouble processing your request. For immediate emergency assistance, please call your local emergency services (911/112).";
  }
}