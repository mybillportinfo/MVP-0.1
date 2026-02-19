import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { fuzzyMatchProvider } from '../../lib/fuzzyMatch';
import {
  checkRateLimit,
  getContentHash,
  checkFileHashDuplicate,
  validateAndSanitizeExtraction,
} from '../../lib/extractionGuards';

const DEFAULT_MODEL = "claude-sonnet-4-5";

const EXTRACTION_PROMPT = `You are an expert bill/invoice data extractor for Canadian bills. Analyze this bill and extract the following information as accurately as possible.

Return ONLY a valid JSON object with these fields:
{
  "vendor": "Company/vendor name (clean, official name)",
  "amount": <number or null if not found>,
  "dueDate": "YYYY-MM-DD format or null if not found",
  "billingPeriod": "e.g. Jan 1 - Jan 31, 2026 or null",
  "accountNumber": "account/customer number or null",
  "currency": "CAD or USD",
  "category": "one of: utilities, telecom, government, insurance, banking, transportation, education, subscriptions, property, miscellaneous, or null",
  "confidenceVendor": <0.0 to 1.0>,
  "confidenceAmount": <0.0 to 1.0>,
  "confidenceDueDate": <0.0 to 1.0>
}

Rules:
- For amount: prefer "Total Due", "Amount Due", "Balance Due", "Total Amount" over subtotals. Choose the final payable amount.
- For dates: prefer "Due Date", "Payment Due" over invoice date or billing date.
- For vendor: use the official company name, not abbreviations.
- Canadian bills may use DD/MM/YYYY format. Normalize to YYYY-MM-DD.
- If multiple amounts exist, pick the one closest to "Total Due" or "Amount Due".
- Confidence scores reflect how certain you are about each extracted value.
- Return ONLY the JSON object, no markdown, no explanation.`;


export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY;
    const baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;
    if (!apiKey || !baseURL) {
      return NextResponse.json({ success: false, error: 'AI service not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { fileData, fileType, mimeType, userId } = body;

    if (!fileData || !fileType) {
      return NextResponse.json({ success: false, error: 'Missing file data' }, { status: 400 });
    }

    const MAX_BASE64_SIZE = 14 * 1024 * 1024;
    if (typeof fileData !== 'string' || fileData.length > MAX_BASE64_SIZE) {
      return NextResponse.json({ success: false, error: 'File is too large. Please use a file under 10MB.' }, { status: 413 });
    }

    const validFileTypes = ['image', 'pdf'];
    if (!validFileTypes.includes(fileType)) {
      return NextResponse.json({ success: false, error: 'Unsupported file type' }, { status: 400 });
    }

    const rateLimitKey = userId || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    const rateCheck = checkRateLimit(rateLimitKey);
    if (!rateCheck.allowed) {
      const hoursLeft = Math.ceil(rateCheck.resetsIn / (1000 * 60 * 60));
      return NextResponse.json({
        success: false,
        error: `You've reached the daily scan limit (10 scans/day). Try again in ${hoursLeft} hour${hoursLeft > 1 ? 's' : ''}.`,
        rateLimited: true,
        resetsIn: rateCheck.resetsIn,
      }, { status: 429 });
    }

    const fileHash = getContentHash(fileData);
    if (checkFileHashDuplicate(rateLimitKey, fileHash)) {
      return NextResponse.json({
        success: false,
        error: 'This file was already scanned recently. Use the previous result or try a different file.',
        duplicateFile: true,
      }, { status: 409 });
    }

    const startTime = Date.now();
    const anthropic = new Anthropic({ apiKey, baseURL });
    let extractedJson: any;

    if (fileType === 'image') {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const mediaType = validTypes.includes(mimeType) ? mimeType : 'image/jpeg';

      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL,
        max_tokens: 8192,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: EXTRACTION_PROMPT },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: fileData,
              },
            },
          ],
        }],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      extractedJson = parseJsonResponse(text);
    } else if (fileType === 'pdf') {
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL,
        max_tokens: 8192,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: EXTRACTION_PROMPT },
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: fileData,
              },
            } as any,
          ],
        }],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      extractedJson = parseJsonResponse(text);
    } else {
      return NextResponse.json({ success: false, error: 'Unsupported file type' }, { status: 400 });
    }

    const processingMs = Date.now() - startTime;
    console.log(`[extract-bill] userId=${userId || 'anon'} fileType=${fileType} processingMs=${processingMs} success=${!!extractedJson}`);

    if (!extractedJson) {
      return NextResponse.json({ success: false, error: 'Failed to parse bill data. Please try again or enter manually.' }, { status: 422 });
    }

    const providerMatch = fuzzyMatchProvider(extractedJson.vendor || '');

    const rawResult = {
      vendor: extractedJson.vendor || '',
      amount: extractedJson.amount ?? null,
      dueDate: extractedJson.dueDate || null,
      billingPeriod: extractedJson.billingPeriod || null,
      accountNumber: extractedJson.accountNumber || null,
      currency: extractedJson.currency || 'CAD',
      category: providerMatch?.category || extractedJson.category || null,
      subcategory: providerMatch?.types?.[0] || null,
      confidence: {
        overall: calculateOverall(extractedJson),
        vendor: extractedJson.confidenceVendor ?? 0.5,
        amount: extractedJson.confidenceAmount ?? 0.5,
        dueDate: extractedJson.confidenceDueDate ?? 0.5,
      },
      matchedProviderId: providerMatch?.providerId || undefined,
      matchedProviderName: providerMatch?.providerName || undefined,
      isCustomProvider: !providerMatch,
    };

    const validation = validateAndSanitizeExtraction(rawResult as any);

    if (validation.correctedAmount !== undefined) {
      rawResult.amount = validation.correctedAmount;
    }
    if (validation.correctedDate !== undefined) {
      rawResult.dueDate = validation.correctedDate;
    }

    return NextResponse.json({
      success: true,
      data: rawResult,
      validation: {
        warnings: validation.warnings,
        errors: validation.errors,
      },
    });
  } catch (error: any) {
    console.error('Bill extraction error:', error);
    const errorMsg = error?.message || '';
    if (errorMsg.includes('Could not process image') || error?.status === 400) {
      return NextResponse.json(
        { success: false, error: 'Could not read the image. Please ensure the photo is clear, well-lit, and shows the bill details.' },
        { status: 400 }
      );
    }
    if (error?.status === 429) {
      return NextResponse.json(
        { success: false, error: 'AI service is temporarily busy. Please wait a moment and try again.' },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to process bill. Please try again or enter manually.' },
      { status: 500 }
    );
  }
}

function parseJsonResponse(text: string): any {
  try {
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { return null; }
    }
    return null;
  }
}

function calculateOverall(data: any): number {
  const v = data.confidenceVendor ?? 0.5;
  const a = data.confidenceAmount ?? 0.5;
  const d = data.confidenceDueDate ?? 0.5;
  return Math.round((v * 0.3 + a * 0.4 + d * 0.3) * 100) / 100;
}
