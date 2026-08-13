const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const query = "Bread";
  const prompt = `You are an AI shopping assistant for MohallaMart, a local grocery and essentials marketplace.
A user says: "${query}"

Analyze this query and extract 1 to 5 key product names or categories they might need to buy for this. 
Return ONLY a valid JSON object in the following format:
{
  "response": "A friendly, short (1-2 sentences) message acknowledging their request and saying here is what they might need.",
  "searchTerms": ["term1", "term2", "term3"]
}`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
  });
  console.log(response.text);
}
run();
