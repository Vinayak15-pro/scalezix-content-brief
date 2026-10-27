import { BriefGenerationRequest, ContentBrief, BrandAuditResult } from "@/types/brief";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number = 500) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = "An unexpected error occurred.";
    try {
      const errorJson = await res.json();
      errorDetail = errorJson.detail || errorJson.message || errorDetail;
    } catch {
      errorDetail = `Request failed with status ${res.status}: ${res.statusText}`;
    }
    throw new ApiError(errorDetail, res.status);
  }
  return res.json();
}

export async function checkBackendHealth(): Promise<{
  status: string;
  service: string;
  gemini_model: string;
  api_key_configured: boolean;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      cache: "no-store",
    });
    return await handleResponse(res);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      `Cannot connect to backend server at ${API_BASE_URL}. Ensure FastAPI is running on port 8000.`,
      0
    );
  }
}

export async function fetchSampleBrief(): Promise<ContentBrief> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/briefs/sample`, {
      method: "GET",
      cache: "no-store",
    });
    return await handleResponse<ContentBrief>(res);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError("Failed to fetch sample brief.", 0);
  }
}

export async function generateBrief(
  request: BriefGenerationRequest
): Promise<ContentBrief> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/briefs/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    return await handleResponse<ContentBrief>(res);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      `Network connection error: Unable to reach backend at ${API_BASE_URL}. Please ensure the server is running.`,
      0
    );
  }
}

export async function exportBriefFile(
  brief: ContentBrief,
  format: "markdown" | "json"
): Promise<{ filename: string; content: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/briefs/export`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ brief, format }),
    });
    return await handleResponse(res);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError("Failed to export content brief.", 0);
  }
}

export async function reauditBrief(
  request: BriefGenerationRequest,
  brief: ContentBrief
): Promise<BrandAuditResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/briefs/audit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ request, brief }),
    });
    return await handleResponse<BrandAuditResult>(res);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError("Failed to re-audit content brief.", 0);
  }
}
