import { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "database";

export const getShoppingAssistant = async (req: Request, res: Response): Promise<any> => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "AI features are not configured on the server." });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

    const text = response.text || "";
    // Extract json from markdown code block if present
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : text.trim();
    
    let result;
    try {
      result = JSON.parse(jsonStr as string);
      if (!result.searchTerms || !Array.isArray(result.searchTerms)) {
        result.searchTerms = [];
      }
      
      // Always include the user's original query as a fallback search term
      if (typeof query === 'string' && query.trim() !== '') {
        result.searchTerms.push(query.trim());
      }
    } catch (e) {
      console.error("Failed to parse Gemini response as JSON:", text);
      return res.status(500).json({ message: "Failed to process AI response" });
    }

    // Now query the database for matching products
    let products: any[] = [];
    if (result.searchTerms.length > 0) {
      products = await prisma.product.findMany({
        where: {
          isActive: true,
          OR: result.searchTerms.flatMap((term: string) => [
            { name: { contains: term.toLowerCase() } },
            { name: { contains: term.charAt(0).toUpperCase() + term.slice(1).toLowerCase() } },
            { name: { contains: term.toUpperCase() } }
          ]),
        },
        include: {
          shop: {
            select: { name: true, id: true }
          }
        },
        take: 10,
      });
    }

    return res.status(200).json({
      message: result.response,
      products,
    });
  } catch (error: any) {
    console.error("AI Assistant Error:", error);
    return res.status(500).json({ message: "Failed to process AI request: " + (error.message || error.toString()) });
  }
};

export const getRecommendations = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const orders = await prisma.order.findMany({
      where: { userId: userId as string },
      include: { items: { include: { product: true } } },
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    let searchTerms: string[] = [];

    if (orders.length > 0 && process.env.GEMINI_API_KEY) {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const pastItems = orders.flatMap(o => o.items.map(i => i.product.name)).join(", ");
      const prompt = `Based on a user's recent purchases: [${pastItems}], suggest 3 related product categories or types they might want to buy next on a local grocery app. Return ONLY a valid JSON array of strings. Example: ["milk", "eggs", "bread"]`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const text = response.text || "";
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : text.trim();
      try {
        searchTerms = JSON.parse(jsonStr as string);
      } catch (e) {
        console.error("Failed to parse recommendations JSON", text);
      }
    }

    let products;
    if (searchTerms.length > 0) {
        products = await prisma.product.findMany({
          where: {
            isActive: true,
            OR: searchTerms.flatMap(term => [
              { name: { contains: term.toLowerCase() } },
              { name: { contains: term.charAt(0).toUpperCase() + term.slice(1).toLowerCase() } },
              { name: { contains: term.toUpperCase() } }
            ])
          },
          include: { shop: { select: { name: true, id: true } } },
          take: 8,
        });
    }

    // fallback to recent products if no matches or no orders
    if (!products || products.length === 0) {
        products = await prisma.product.findMany({
          where: { isActive: true },
          include: { shop: { select: { name: true, id: true } } },
          take: 8,
          orderBy: { createdAt: 'desc' }
        });
    }

    return res.status(200).json({
      recommendations: products,
      title: searchTerms.length > 0 ? "Inspired by your recent orders" : "Trending Products"
    });
  } catch (error: any) {
    console.error("AI Recommendations Error:", error);
    return res.status(500).json({ message: "Failed to fetch recommendations" });
  }
};
