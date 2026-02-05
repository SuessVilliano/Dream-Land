import Replicate from "replicate";
import { NextRequest } from "next/server";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: NextRequest) {
  try {
    const { messages, appContext } = await req.json();

    if (!process.env.REPLICATE_API_TOKEN) {
      return Response.json(
        { error: "REPLICATE_API_TOKEN not configured" },
        { status: 500 }
      );
    }

    const systemPrompt = buildSystemPrompt(appContext);

    // Build the prompt string for Llama from the messages array
    let prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n${systemPrompt}<|eot_id|>`;

    for (const msg of messages) {
      const role = msg.role === "assistant" ? "assistant" : "user";
      prompt += `<|start_header_id|>${role}<|end_header_id|>\n\n${msg.content}<|eot_id|>`;
    }

    prompt += `<|start_header_id|>assistant<|end_header_id|>\n\n`;

    const output = await replicate.run("meta/meta-llama-3-70b-instruct", {
      input: {
        prompt,
        max_tokens: 1024,
        temperature: 0.7,
        top_p: 0.9,
        repetition_penalty: 1.1,
      },
    });

    // output is an array of string tokens from Replicate
    const responseText = Array.isArray(output) ? output.join("") : String(output);

    return Response.json({ response: responseText.trim() });
  } catch (error: unknown) {
    console.error("Replicate API error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to get AI response";
    return Response.json({ error: message }, { status: 500 });
  }
}

function buildSystemPrompt(appContext: AppContext | undefined): string {
  let prompt = `You are Scout, the AI assistant for LandScout — "The Zillow for Off-Gridders." You help users find affordable land through sheriff sales, tax deed auctions, foreclosures, and surplus property sales across Florida and Georgia.

Your personality: Friendly, knowledgeable, and direct. You speak like a savvy real estate advisor who genuinely wants to help people find affordable land for RV living, off-grid homesteading, or mobile home placement.

Your capabilities:
- Explain auction types (tax deed, sheriff sale, foreclosure) and their pros/cons
- Analyze properties and compare deals
- Help users understand AI scores, flood zones, zoning codes, and utility availability
- Walk users through the NACA calculator and loan qualification
- Explain redemption periods (2 years FL, 12 months GA)
- Advise on RV/mobile home friendly zoning
- Help users narrow down properties based on their budget and needs

Important rules:
- Always remind users this is informational only, not legal or financial advice
- If asked about a specific property, reference its data accurately
- Keep responses concise but thorough — users are on mobile too
- When discussing money, use exact numbers from the data when available
- If you don't know something, say so honestly`;

  if (appContext) {
    if (appContext.currentPage === "calculator" && appContext.calculatorData) {
      const calc = appContext.calculatorData;
      prompt += `\n\n--- CURRENT CONTEXT: NACA CALCULATOR ---
The user is on the NACA Affordability Calculator page.
Their inputs:
- Annual income: $${calc.income?.toLocaleString()}
- Monthly debts: $${calc.monthlyDebts?.toLocaleString()}
- Interest rate: ${calc.interestRate}%
- Loan term: ${calc.loanTerm} years
Results:
- Max loan amount: $${calc.maxLoanAmount?.toLocaleString()}
- Max monthly payment: $${calc.effectiveMaxPayment?.toLocaleString()}
- Front-end DTI: ${calc.frontEndDTI}%
- Projected back-end DTI: ${calc.projectedBackEndDTI}%
- Qualified: ${calc.isQualified ? "Yes" : "No"}`;
    }

    if (appContext.properties && appContext.properties.length > 0) {
      prompt += `\n\n--- AVAILABLE PROPERTIES (${appContext.properties.length} total) ---`;
      for (const p of appContext.properties) {
        const price = p.openingBid || p.listPrice || 0;
        const discount = Math.round(
          (1 - price / p.estimatedValue) * 100
        );
        prompt += `\n
Property #${p.id}: ${p.address}, ${p.city}, ${p.state} ${p.zip}
- Type: ${p.auctionType.replace("_", " ")} | County: ${p.county}
- Price: $${price.toLocaleString()} | Est. Value: $${p.estimatedValue.toLocaleString()} | Discount: ${discount}%
- Acres: ${p.acres} | Zoning: ${p.zoning}
- RV: ${p.rvAllowed ? "Yes" : "No"} | Mobile: ${p.mobileHomeAllowed ? "Yes" : "No"}
- Utilities: Water(${p.utilities.water ? "Y" : "N"}) Electric(${p.utilities.electric ? "Y" : "N"}) Sewer(${p.utilities.sewer ? "Y" : "N"})
- Flood Zone: ${p.floodZone} | AI Score: ${p.aiScore}/100
- Verdict: ${p.aiAnalysis.verdict}
- Reasons: ${p.aiAnalysis.reasons.join(", ")}
- Risks: ${p.aiAnalysis.risks.join(", ")}${p.auctionDate ? `\n- Auction: ${p.auctionDate} @ ${p.auctionTime}` : ""}
- Platform: ${p.platform}`;
      }
    }

    if (appContext.selectedProperty) {
      prompt += `\n\n--- USER IS CURRENTLY VIEWING ---
Property #${appContext.selectedProperty.id}: ${appContext.selectedProperty.address}
The user has this property selected/open in the detail panel.`;
    }

    if (appContext.activeFilters) {
      const f = appContext.activeFilters;
      prompt += `\n\n--- ACTIVE FILTERS ---
State: ${f.state} | Auction Type: ${f.auctionType} | Max Price: $${f.maxPrice.toLocaleString()} | Min Acres: ${f.minAcres}
RV Required: ${f.rvAllowed} | Mobile Required: ${f.mobileHomeAllowed} | No Flood: ${f.noFloodZone} | Min Score: ${f.minScore}`;
    }

    if (appContext.filteredCount !== undefined) {
      prompt += `\nShowing ${appContext.filteredCount} of ${appContext.totalCount} properties after filters.`;
    }
  }

  return prompt;
}

interface AppContext {
  currentPage?: string;
  properties?: Array<{
    id: number;
    address: string;
    city: string;
    state: string;
    zip: string;
    county: string;
    auctionType: string;
    auctionDate: string | null;
    auctionTime: string | null;
    openingBid: number | null;
    listPrice?: number;
    estimatedValue: number;
    acres: number;
    zoning: string;
    rvAllowed: boolean;
    mobileHomeAllowed: boolean;
    utilities: { water: boolean; electric: boolean; sewer: boolean };
    floodZone: string;
    aiScore: number;
    aiAnalysis: {
      verdict: string;
      reasons: string[];
      risks: string[];
    };
    platform: string;
  }>;
  selectedProperty?: { id: number; address: string } | null;
  activeFilters?: {
    state: string;
    auctionType: string;
    maxPrice: number;
    minAcres: number;
    rvAllowed: boolean;
    mobileHomeAllowed: boolean;
    noFloodZone: boolean;
    minScore: number;
  };
  filteredCount?: number;
  totalCount?: number;
  calculatorData?: {
    income: number;
    monthlyDebts: number;
    interestRate: number;
    loanTerm: number;
    maxLoanAmount: number;
    effectiveMaxPayment: number;
    frontEndDTI: string;
    projectedBackEndDTI: string;
    isQualified: boolean;
  };
}
