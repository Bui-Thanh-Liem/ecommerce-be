/**
 * Util retry cho các lệnh gọi tới Gemini (hoặc bất kỳ API nào hay bị 503 khi quá tải).
 *
 * - retryWithBackoff: dùng cho một Promise bình thường (ví dụ: tìm embedding sản phẩm).
 * - retryStreamOnFirstChunk: dùng cho AsyncGenerator streaming. Chỉ tự động retry nếu
 *   lỗi xảy ra TRƯỚC khi có chunk đầu tiên được yield ra ngoài. Nếu đã stream được vài
 *   chunk rồi mới lỗi, sẽ throw lỗi ra ngoài (không retry) để tránh gửi trùng nội dung
 *   cho client.
 */

export interface RetryOptions {
  /** Số lần thử lại tối đa (không tính lần gọi đầu tiên). Mặc định: 3 */
  maxRetries?: number;
  /** Độ trễ cơ bản (ms) cho lần retry đầu tiên. Mặc định: 1000ms */
  baseDelayMs?: number;
  /** Độ trễ tối đa (ms), tránh backoff tăng vô hạn. Mặc định: 10000ms */
  maxDelayMs?: number;
  /** Hàm kiểm tra lỗi có nên retry hay không. Mặc định: isGeminiOverloadedError */
  isRetryable?: (error: unknown) => boolean;
  /** Callback gọi mỗi khi sắp retry, dùng để log hoặc báo cho client biết đang thử lại */
  onRetry?: (error: unknown, attempt: number, delayMs: number) => void;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function tryParseJson(value: string): any {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

interface GeminiErrorDetails {
  code?: number;
  status?: string;
  message?: string;
  /** Ví dụ: "GenerateRequestsPerDayPerProjectPerModel-FreeTier" hoặc dạng PerMinute */
  quotaId?: string;
  /** Thời gian (ms) Google gợi ý chờ trước khi gọi lại, lấy từ RetryInfo nếu có */
  retryDelayMs?: number;
}

/**
 * Bóc lỗi lồng nhiều lớp JSON của Gemini SDK ra thành dữ liệu có cấu trúc.
 * Gemini thường throw lỗi dạng:
 *   ApiError: {"error":{"message":"{\"error\":{\"code\":...,\"status\":...,\"details\":[...]}}","code":...,"status":...}}
 * trong đó error.message lại là 1 JSON string lồng bên trong (lồng 2 lớp).
 */
function parseGeminiError(error: unknown): GeminiErrorDetails | null {
  if (!error) return null;
  const anyErr = error as any;

  const rawMessage: string = typeof anyErr.message === 'string' ? anyErr.message : '';
  const outer = tryParseJson(rawMessage) ?? (anyErr.error ? anyErr : null);
  const outerErr = outer?.error ?? anyErr.error ?? null;

  // message bên trong outerErr có thể lại là JSON string lồng thêm 1 lớp nữa
  const inner = outerErr ? tryParseJson(outerErr.message ?? '') : null;
  const innerErr = inner?.error ?? null;

  if (!outerErr && !innerErr) return null;

  const code = innerErr?.code ?? outerErr?.code ?? anyErr.code;
  const status = innerErr?.status ?? outerErr?.status ?? anyErr.status;
  const details: any[] = innerErr?.details ?? outerErr?.details ?? [];

  const quotaFailure = details.find((d) => String(d?.['@type'] ?? '').includes('QuotaFailure'));
  const quotaId = quotaFailure?.violations?.[0]?.quotaId;

  const retryInfo = details.find((d) => String(d?.['@type'] ?? '').includes('RetryInfo'));
  const retryDelayRaw: string | undefined = retryInfo?.retryDelay; // ví dụ "55s"
  const retryDelayMs = retryDelayRaw ? parseFloat(retryDelayRaw) * 1000 : undefined;

  return {
    code,
    status,
    quotaId,
    retryDelayMs,
    message: innerErr?.message ?? outerErr?.message,
  };
}

/** Lỗi "model đang quá tải" (503 / UNAVAILABLE) — tạm thời, nên retry. */
export function isGeminiOverloadedError(error: unknown): boolean {
  const parsed = parseGeminiError(error);
  if (parsed) {
    return parsed.code === 503 || parsed.status === 'UNAVAILABLE';
  }
  // Fallback: tìm theo từ khóa nếu không bóc được cấu trúc chuẩn
  const haystack = String((error as any)?.message ?? error ?? '');
  return haystack.includes('"code":503') || haystack.includes('UNAVAILABLE') || haystack.includes('high demand');
}

/**
 * Lỗi 429 do vượt quota TÍNH THEO NGÀY (ví dụ free tier 20 request/ngày).
 * KHÔNG nên retry — chờ bao lâu trong ngày đó vẫn sẽ fail tiếp.
 */
export function isGeminiDailyQuotaExceeded(error: unknown): boolean {
  const parsed = parseGeminiError(error);
  return parsed?.code === 429 && /PerDay/i.test(parsed.quotaId ?? '');
}

/**
 * Lỗi 429 do vượt rate limit ngắn hạn (theo phút/giây) — CÓ thể retry sau khoảng
 * thời gian Google gợi ý (retryDelay).
 */
export function isGeminiRateLimited(error: unknown): boolean {
  const parsed = parseGeminiError(error);
  return parsed?.code === 429 && !isGeminiDailyQuotaExceeded(error);
}

/** Lấy thời gian (ms) Google gợi ý chờ trước khi gọi lại, nếu lỗi có chứa RetryInfo. */
export function getGeminiSuggestedDelayMs(error: unknown): number | undefined {
  return parseGeminiError(error)?.retryDelayMs;
}

/** Mặc định: chỉ coi là "nên retry" với lỗi tạm thời (503 hoặc rate limit ngắn hạn). */
function defaultIsRetryable(error: unknown): boolean {
  return isGeminiOverloadedError(error) || isGeminiRateLimited(error);
}

function computeDelay(attempt: number, baseDelayMs: number, maxDelayMs: number, error?: unknown): number {
  // Nếu Google đã gợi ý thời gian chờ cụ thể (RetryInfo), tôn trọng con số đó
  const suggested = error ? getGeminiSuggestedDelayMs(error) : undefined;
  if (suggested) {
    return Math.min(suggested, maxDelayMs) + Math.random() * 300;
  }
  const exponential = baseDelayMs * 2 ** (attempt - 1);
  const jitter = Math.random() * 300;
  return Math.min(exponential, maxDelayMs) + jitter;
}

/**
 * Retry cho một Promise bình thường.
 * Mặc định CHỈ retry lỗi tạm thời (503 quá tải, hoặc 429 rate-limit theo phút/giây).
 * Lỗi 429 do hết quota THEO NGÀY sẽ không được retry (xem isGeminiDailyQuotaExceeded).
 */
export async function retryWithBackoff<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { maxRetries = 3, baseDelayMs = 1000, maxDelayMs = 10000, isRetryable = defaultIsRetryable, onRetry } = options;

  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= maxRetries || !isRetryable(error)) {
        throw error;
      }
      attempt++;
      const delay = computeDelay(attempt, baseDelayMs, maxDelayMs, error);
      onRetry?.(error, attempt, delay);
      await sleep(delay);
    }
  }
}

/**
 * Retry cho AsyncGenerator streaming. `factory` phải tạo generator MỚI mỗi lần gọi
 * (ví dụ: () => this.geminiRagService.generateChatbotResponseStream(...)).
 * Chỉ retry nếu chưa yield được chunk nào ở lần thử đó.
 */
export async function* retryStreamOnFirstChunk<T>(
  factory: () => AsyncGenerator<T>,
  options: RetryOptions = {},
): AsyncGenerator<T> {
  const { maxRetries = 3, baseDelayMs = 1000, maxDelayMs = 10000, isRetryable = defaultIsRetryable, onRetry } = options;

  let attempt = 0;
  while (true) {
    const generator = factory();
    let yieldedAny = false;
    try {
      for await (const chunk of generator) {
        yieldedAny = true;
        yield chunk;
      }
      return;
    } catch (error) {
      // Đã stream được nội dung rồi thì không retry nữa, để tránh gửi trùng cho client
      if (yieldedAny || attempt >= maxRetries || !isRetryable(error)) {
        throw error;
      }
      attempt++;
      const delay = computeDelay(attempt, baseDelayMs, maxDelayMs, error);
      onRetry?.(error, attempt, delay);
      await sleep(delay);
    }
  }
}
