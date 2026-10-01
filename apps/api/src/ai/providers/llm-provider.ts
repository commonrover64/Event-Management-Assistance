export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmRequest {
  messages: LlmMessage[];
  temperature?: number;
}

// The only contract the rest of the app depends on; swapping vendors means one new file
export interface LlmProvider {
  readonly name: string;
  // Returns the raw JSON text; callers parse and validate it
  completeJson(request: LlmRequest): Promise<string>;
}
