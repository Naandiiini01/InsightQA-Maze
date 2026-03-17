import { GoogleGenAI } from "@google/genai";
import { Study, StudyResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateStudyInsights(study: Study, responses: StudyResponse[]) {
  if (!responses.length) return "No data available for analysis yet.";

  const prompt = `
    Analyze the following user testing data for the study: "${study.title}".
    Study Type: ${study.type}
    Total Responses: ${responses.length}
    
    Data Summary:
    ${responses.map(r => `
      - Success Rate: ${r.metrics.successRate}%
      - Avg Time: ${r.metrics.timeTaken}s
      - Results: ${JSON.stringify(r.results)}
    `).join('\n')}

    Please provide:
    1. A summary of findings.
    2. Top 3 issues detected.
    3. Suggested improvements for the product.
    
    Format the response in Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Failed to generate insights.";
  } catch (error) {
    console.error("AI Insight Error:", error);
    return "Error generating AI insights.";
  }
}
