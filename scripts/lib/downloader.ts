import * as fs from 'fs';
import * as path from 'path';
import { createLogger, Logger } from './logger';

const DEFAULT_RATE_LIMIT_MS = 500;
const DEFAULT_MAX_RETRIES = 3;

export interface FetchHtmlResult {
  html: string;
  status: number;
  url: string;
}

export interface DownloaderOptions {
  rateLimitMs?: number;
  maxRetries?: number;
  verbose?: boolean;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch an HTML page with retry and exponential backoff.
 */
export async function fetchHtml(
  url: string,
  options: DownloaderOptions = {},
): Promise<FetchHtmlResult> {
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  const rateLimitMs = options.rateLimitMs ?? DEFAULT_RATE_LIMIT_MS;
  const log = createLogger(options.verbose ?? false);
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const html = await response.text();
      return { html, status: response.status, url };
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        const backoff = rateLimitMs * Math.pow(2, attempt - 1);
        log.warn(`Retry ${attempt}/${maxRetries} for ${url} (waiting ${backoff}ms)`);
        await delay(backoff);
      }
    }
  }

  throw lastError;
}

/**
 * Download a binary file (e.g. image) with retry and exponential backoff.
 * Returns the raw Buffer.
 */
export async function downloadBinary(
  url: string,
  options: DownloaderOptions = {},
): Promise<Buffer> {
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  const rateLimitMs = options.rateLimitMs ?? DEFAULT_RATE_LIMIT_MS;
  const log = createLogger(options.verbose ?? false);
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        const backoff = rateLimitMs * Math.pow(2, attempt - 1);
        log.warn(`Retry ${attempt}/${maxRetries} for ${url} (waiting ${backoff}ms)`);
        await delay(backoff);
      }
    }
  }

  throw lastError;
}

/**
 * Stream a binary file directly to disk with retry logic.
 */
export async function downloadToFile(
  url: string,
  outputPath: string,
  options: DownloaderOptions = {},
): Promise<string> {
  const dir = path.dirname(outputPath);
  fs.mkdirSync(dir, { recursive: true });

  const buffer = await downloadBinary(url, options);
  fs.writeFileSync(outputPath, buffer);
  return outputPath;
}
