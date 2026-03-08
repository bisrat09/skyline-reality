const VAPI_BASE_URL = 'https://api.vapi.ai';

interface VapiClientConfig {
  apiKey: string;
  baseUrl?: string;
}

class VapiClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: VapiClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || VAPI_BASE_URL;
  }

  private async request(path: string, options?: RequestInit): Promise<unknown> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!res.ok) {
      throw new Error(`Vapi API error: ${res.status} ${res.statusText}`);
    }

    return res.json();
  }

  async getCall(callId: string): Promise<unknown> {
    return this.request(`/call/${callId}`);
  }

  async listCalls(params?: { limit?: number }): Promise<unknown> {
    const query = params?.limit ? `?limit=${params.limit}` : '';
    return this.request(`/call${query}`);
  }
}

function getVapiClient(): VapiClient {
  const apiKey = process.env.VAPI_API_KEY;

  if (!apiKey) {
    throw new Error('Missing VAPI_API_KEY environment variable');
  }

  return new VapiClient({ apiKey });
}

export const vapi = getVapiClient();
