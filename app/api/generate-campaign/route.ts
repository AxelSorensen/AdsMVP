import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- Simple Web Scraper ---

async function scrapeWebsite(url: string) {
  console.log(`🔍 Next.js API: Scraping website: ${url}`);
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      timeout: 8000,
    });
    const $ = cheerio.load(response.data as string);

    // Get images before removing elements
    const images: string[] = [];
    $("img").each((_, el) => {
      let src = $(el).attr("src") || $(el).attr("data-src");
      if (src) {
        try {
          // Resolve relative URLs
          const absoluteUrl = new URL(src, url).toString();
          // Filter out tiny icons, spacers, or base64 if needed, but for now let's just grab them
          if (absoluteUrl.startsWith("http")) {
            images.push(absoluteUrl);
          }
        } catch (e) {}
      }
    });

    // Remove unnecessary elements
    $("script, style, nav, footer, header, noscript").remove();

    // Get text content and clean it up
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();

    // Return text and a selection of images
    return {
      text: bodyText.slice(0, 10000),
      images: Array.from(new Set(images)).slice(0, 10), // Unique images, max 10
    };
  } catch (error: any) {
    console.warn("Scraping failed:", error.message);
    return { text: "Failed to scrape website.", images: [] };
  }
}

// --- Main API Route Handler ---

export async function POST(req: Request) {
  try {
    const {
      productName,
      websiteUrl,
      productDescription,
      targetAudience,
      budget,
      location,
    } = await req.json();

    if (!productName) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 },
      );
    }

    let scrapedData = {
      text: "No additional context found.",
      images: [] as string[],
    };
    if (websiteUrl) {
      scrapedData = await scrapeWebsite(websiteUrl);
    }

    // AI Generation Logic (Structured Outputs)
    const prompt = `
      You are an expert Google Ads specialist. Generate a comprehensive, high-performing Google Ads Search campaign for the following:
      
      Product Name: ${productName}
      URL: ${websiteUrl || "N/A"}
      User Brief: ${productDescription || "N/A"}
      Audience Hint: ${targetAudience || "Not specified"}
      Budget Hint: ${budget || "Not specified"}
      Location Hint: ${location || "Not specified"}

      SCRAPED WEBSITE CONTENT:
      ${scrapedData.text}

      Generate at least 3 distinct headlines and 3 distinct descriptions so we can show different ad variations.
      Generate a campaign where EVERY choice is backed by a specific explanation.
      Include a list of "keywordInsights" with at least 8-10 additional relevant keywords, their estimated monthly search volume, competition level (Low/Medium/High), and average CPC (e.g., "$1.25").
      IMPORTANT: If a choice (like targeting or copy) is based on specific information you found on the website, you MUST explicitly mention it in the explanation (e.g., "Because the website is in Danish" or "Based on the services listed on the homepage").
    `;

    const campaignSchema = {
      name: "google_ads_campaign",
      strict: true,
      schema: {
        type: "object",
        properties: {
          campaignName: { type: "string" },
          headlines: {
            type: "array",
            items: {
              type: "object",
              properties: {
                text: { type: "string" },
                explanation: { type: "string" },
              },
              required: ["text", "explanation"],
              additionalProperties: false,
            },
          },
          descriptions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                text: { type: "string" },
                explanation: { type: "string" },
              },
              required: ["text", "explanation"],
              additionalProperties: false,
            },
          },
          keywords: {
            type: "array",
            items: {
              type: "object",
              properties: {
                term: { type: "string" },
                explanation: { type: "string" },
              },
              required: ["term", "explanation"],
              additionalProperties: false,
            },
          },
          locations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                explanation: { type: "string" },
              },
              required: ["name", "explanation"],
              additionalProperties: false,
            },
          },
          languages: { type: "array", items: { type: "string" } },
          demographics: {
            type: "object",
            properties: {
              age: { type: "array", items: { type: "string" } },
              gender: { type: "array", items: { type: "string" } },
              explanation: { type: "string" },
            },
            required: ["age", "gender", "explanation"],
            additionalProperties: false,
          },
          biddingStrategy: {
            type: "object",
            properties: {
              name: { type: "string" },
              explanation: { type: "string" },
            },
            required: ["name", "explanation"],
            additionalProperties: false,
          },
          audienceSegments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                explanation: { type: "string" },
              },
              required: ["name", "explanation"],
              additionalProperties: false,
            },
          },
          adGroupName: { type: "string" },
          keywordInsights: {
            type: "array",
            items: {
              type: "object",
              properties: {
                term: { type: "string" },
                monthlyVolume: { type: "number" },
                avgCPC: { type: "string" },
                competition: { type: "string" },
              },
              required: ["term", "monthlyVolume", "avgCPC", "competition"],
              additionalProperties: false,
            },
          },
        },
        required: [
          "campaignName",
          "headlines",
          "descriptions",
          "keywords",
          "locations",
          "languages",
          "demographics",
          "biddingStrategy",
          "audienceSegments",
          "adGroupName",
          "keywordInsights",
        ],
        additionalProperties: false,
      },
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: {
        type: "json_schema",
        json_schema: campaignSchema,
      },
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    // Merge scraped images into the result
    return NextResponse.json({ ...result, images: scrapedData.images });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
