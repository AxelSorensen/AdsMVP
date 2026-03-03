import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import axios from "axios";
import * as cheerio from "cheerio";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// --- Simple Web Scraper ---

async function scrapeWebsite(url: string) {
  console.log(`🔍 Scraping website: ${url}`);
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
          const absoluteUrl = new URL(src, url).toString();
          if (absoluteUrl.startsWith("http")) {
            images.push(absoluteUrl);
          }
        } catch (e) {}
      }
    });

    $("script, style, nav, footer, header, noscript").remove();
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();
    return {
      text: bodyText.slice(0, 10000),
      images: Array.from(new Set(images)).slice(0, 10),
    };
  } catch (error: any) {
    console.warn("Scraping failed:", error.message);
    return { text: "Failed to scrape website.", images: [] };
  }
}

// Initialize OpenAI client for the final campaign generation
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Ad Campaign Generator Server is running.");
});

app.post("/api/generate-campaign", async (req, res) => {
  const {
    productName,
    websiteUrl,
    productDescription,
    targetAudience,
    budget,
    location,
  } = req.body;

  if (!productName) {
    return res.status(400).json({ error: "Product name is required" });
  }

  let scrapedData = { text: "No content.", images: [] as string[] };
  if (websiteUrl) {
    scrapedData = await scrapeWebsite(websiteUrl);
    console.log("📝 Scraping complete. Insights gathered.");
  }

  // Fallback for missing API Key to make it work for demo purposes
  if (
    !process.env.OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY === "your_openai_api_key_here"
  ) {
    console.warn(
      "⚠️  OpenAI API Key is missing. Returning mock data for demo.",
    );
    await new Promise((r) => setTimeout(r, 1500)); // Simulate delay
    return res.json({
      campaignName: `${productName} - Search Campaign`,
      headlines: [
        {
          text: `Unlock the power of ${productName}`,
          explanation: "Clear brand benefit.",
        },
        {
          text: `Best solution for ${targetAudience || "your business"}`,
          explanation: "Targeted appeal.",
        },
        { text: "Launch your campaign today!", explanation: "Strong CTA." },
      ],
      descriptions: [
        {
          text: `Transform your brand with ${productName}. Experience limited-time offers and expert support.`,
          explanation: "Urgency and support.",
        },
        {
          text: "The ultimate AI-powered solution for your business growth. Start your trial today.",
          explanation: "Process and value.",
        },
        {
          text: `High ROI ads for ${productName}. Scale your impact with our AI tools.`,
          explanation: "ROI focused.",
        },
      ],
      keywords: [
        productName,
        "buy " + productName,
        "best ads",
        targetAudience || "marketing",
      ],
      locations: [location || "United States", "United Kingdom", "Canada"],
      languages: ["English"],
      demographics: {
        age: ["25-34", "35-44", "45-54"],
        gender: ["Male", "Female"],
        reason:
          "Based on the professional tone and target audience mentioned on your website, these age groups represent the main decision-makers.",
      },
      biddingStrategy: "Maximize Conversions",
      audienceSegments: [
        {
          name: "Technology Buffs",
          reason: "Likely to adopt new software solutions quickly.",
        },
        {
          name: "Business Professionals",
          reason:
            "Directly aligns with the product's utility in professional workflows.",
        },
      ],
      adGroupName: productName + " Ad Group",
      images:
        scrapedData.images.length > 0
          ? scrapedData.images
          : [
              "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80",
              "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80",
              "https://images.unsplash.com/photo-1542744095-2ad48707b1d7?w=400&q=80",
            ],
      keywordInsights: [
        {
          term: productName + " ads",
          monthlyVolume: 1200,
          avgCPC: "$1.45",
          competition: "Medium",
        },
        {
          term: "best " + productName + " services",
          monthlyVolume: 850,
          avgCPC: "$2.10",
          competition: "High",
        },
        {
          term: productName + " solutions",
          monthlyVolume: 500,
          avgCPC: "$1.80",
          competition: "Low",
        },
        {
          term: "affordable " + productName,
          monthlyVolume: 320,
          avgCPC: "$0.95",
          competition: "Medium",
        },
      ],
    });
  }

  try {
    const prompt = `
      You are an expert Google Ads specialist. Generate a comprehensive, high-performing Google Ads Search campaign for the following product:
      
      Product Name: ${productName}
      Website URL: ${websiteUrl || "N/A"}
      Product Description (User Input): ${productDescription || "N/A"}
      Target Audience: ${targetAudience || "Not specified"}
      Budget: ${budget || "Not specified"}
      Location: ${location || "Not specified"}

      CONTENT FROM THE WEBSITE (SCRAPED):
      ${scrapedData.text || "No content scraped from website."}

      Generate a campaign where EVERY choice (headlines, keywords, targeting) is backed by a specific explanation.
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
                text: { type: "string", description: "max 30 characters" },
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
                text: { type: "string", description: "max 90 characters" },
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

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("Failed to generate content");
    }

    const campaignData = JSON.parse(content);
    res.json({ ...campaignData, images: scrapedData.images });
  } catch (error: any) {
    console.error("Error generating campaign:", error);
    res
      .status(500)
      .json({ error: "Failed to generate campaign", details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
