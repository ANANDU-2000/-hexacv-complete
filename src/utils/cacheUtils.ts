/**
 * REQUEST CACHING & OPTIMIZATION UTILITIES
 * 
 * Performance utilities for:
 * - Session storage caching for API responses
 * - Request debouncing
 * - Parallel request execution
 * - Hash generation for cache keys
 */

// ============== HASH GENERATION ==============
/**
 * Generate a simple hash string for cache keys
 */
export function hashString(str: string): string {
  let hash = 0;
  if (str.length === 0) return hash.toString(36);
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(36);
}

// ============== SESSION STORAGE CACHE ==============
interface CacheOptions {
  /** Time to live in milliseconds (default: 30 minutes) */
  ttl?: number;
  /** Storage type (default: sessionStorage) */
  storage?: 'session' | 'local';
}

interface CachedItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Get item from cache
 */
export function getCached<T>(key: string, options: CacheOptions = {}): T | null {
  const { storage = 'session' } = options;
  const store = storage === 'local' ? localStorage : sessionStorage;
  
  try {
    const item = store.getItem(`cache_${key}`);
    if (!item) return null;
    
    const cached: CachedItem<T> = JSON.parse(item);
    const now = Date.now();
    
    // Check if expired
    if (now - cached.timestamp > cached.ttl) {
      store.removeItem(`cache_${key}`);
      return null;
    }
    
    return cached.data;
  } catch {
    return null;
  }
}

/**
 * Set item in cache
 */
export function setCached<T>(key: string, data: T, options: CacheOptions = {}): void {
  const { ttl = DEFAULT_TTL, storage = 'session' } = options;
  const store = storage === 'local' ? localStorage : sessionStorage;
  
  try {
    const cached: CachedItem<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };
    store.setItem(`cache_${key}`, JSON.stringify(cached));
  } catch (e) {
    // Storage might be full, clear old items
    clearExpiredCache(storage);
    try {
      const cached: CachedItem<T> = {
        data,
        timestamp: Date.now(),
        ttl
      };
      store.setItem(`cache_${key}`, JSON.stringify(cached));
    } catch {
      // Give up if still failing
      console.warn('Cache storage full');
    }
  }
}

/**
 * Clear expired cache items
 */
export function clearExpiredCache(storage: 'session' | 'local' = 'session'): void {
  const store = storage === 'local' ? localStorage : sessionStorage;
  const now = Date.now();
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < store.length; i++) {
    const key = store.key(i);
    if (key?.startsWith('cache_')) {
      try {
        const item = store.getItem(key);
        if (item) {
          const cached = JSON.parse(item);
          if (now - cached.timestamp > cached.ttl) {
            keysToRemove.push(key);
          }
        }
      } catch {
        keysToRemove.push(key!);
      }
    }
  }
  
  keysToRemove.forEach(key => store.removeItem(key));
}

/**
 * Cached fetch wrapper
 */
export async function cachedFetch<T>(
  url: string,
  fetchOptions?: RequestInit,
  cacheOptions: CacheOptions = {}
): Promise<T> {
  const cacheKey = hashString(url + JSON.stringify(fetchOptions));
  
  // Check cache first
  const cached = getCached<T>(cacheKey, cacheOptions);
  if (cached !== null) {
    return cached;
  }
  
  // Fetch and cache
  const response = await fetch(url, fetchOptions);
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
  
  const data = await response.json();
  setCached(cacheKey, data, cacheOptions);
  
  return data;
}

// ============== DEBOUNCE ==============
type AnyFunction = (...args: any[]) => any;

/**
 * Create a debounced version of a function
 */
export function debounce<T extends AnyFunction>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return function debounced(...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, wait);
  };
}

/**
 * Create a debounced async function that returns a promise
 */
export function debounceAsync<T extends AnyFunction>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let resolvePromise: ((value: Awaited<ReturnType<T>>) => void) | null = null;
  let rejectPromise: ((reason?: any) => void) | null = null;
  
  return function debounced(...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    
    return new Promise((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
      
      timeoutId = setTimeout(async () => {
        try {
          const result = await func(...args);
          resolvePromise?.(result);
        } catch (error) {
          rejectPromise?.(error);
        }
        timeoutId = null;
      }, wait);
    });
  };
}

// ============== THROTTLE ==============
/**
 * Create a throttled version of a function
 */
export function throttle<T extends AnyFunction>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function throttled(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// ============== PARALLEL EXECUTION ==============
/**
 * Execute multiple async functions in parallel
 */
export async function parallel<T extends readonly (() => Promise<any>)[]>(
  ...fns: T
): Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> }> {
  return Promise.all(fns.map(fn => fn())) as any;
}

/**
 * Execute async functions in parallel with error handling
 */
export async function parallelSafe<T extends readonly (() => Promise<any>)[]>(
  ...fns: T
): Promise<{ [K in keyof T]: { success: true; data: Awaited<ReturnType<T[K]>> } | { success: false; error: Error } }> {
  const results = await Promise.allSettled(fns.map(fn => fn()));
  
  return results.map(result => {
    if (result.status === 'fulfilled') {
      return { success: true as const, data: result.value };
    } else {
      return { success: false as const, error: result.reason };
    }
  }) as any;
}

// ============== RETRY ==============
interface RetryOptions {
  /** Maximum number of retries (default: 3) */
  maxRetries?: number;
  /** Delay between retries in ms (default: 1000) */
  delay?: number;
  /** Exponential backoff multiplier (default: 2) */
  backoff?: number;
  /** Function to determine if error is retryable */
  shouldRetry?: (error: Error) => boolean;
}

/**
 * Retry an async function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = 2,
    shouldRetry = () => true
  } = options;
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries || !shouldRetry(lastError)) {
        throw lastError;
      }
      
      const waitTime = delay * Math.pow(backoff, attempt);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
}

// ============== MEMOIZATION ==============
/**
 * Memoize a function with optional TTL
 */
export function memoize<T extends AnyFunction>(
  fn: T,
  options: { ttl?: number; maxSize?: number } = {}
): T {
  const { ttl, maxSize = 100 } = options;
  const cache = new Map<string, { value: ReturnType<T>; timestamp: number }>();
  
  return function memoized(...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);
    const cached = cache.get(key);
    
    if (cached) {
      if (!ttl || Date.now() - cached.timestamp < ttl) {
        return cached.value;
      }
      cache.delete(key);
    }
    
    const result = fn(...args);
    
    // Enforce max size
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    cache.set(key, { value: result, timestamp: Date.now() });
    return result;
  } as T;
}

// ============== BATCH REQUESTS ==============
interface BatchOptions {
  /** Maximum batch size (default: 10) */
  maxSize?: number;
  /** Maximum wait time before executing batch (default: 50ms) */
  maxWait?: number;
}

/**
 * Batch multiple requests into a single call
 */
export function createBatcher<TInput, TOutput>(
  batchFn: (inputs: TInput[]) => Promise<TOutput[]>,
  options: BatchOptions = {}
): (input: TInput) => Promise<TOutput> {
  const { maxSize = 10, maxWait = 50 } = options;
  
  let batch: TInput[] = [];
  let resolvers: Array<{ resolve: (value: TOutput) => void; reject: (error: Error) => void }> = [];
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  async function executeBatch() {
    const currentBatch = batch;
    const currentResolvers = resolvers;
    batch = [];
    resolvers = [];
    timeoutId = null;
    
    try {
      const results = await batchFn(currentBatch);
      results.forEach((result, i) => {
        currentResolvers[i].resolve(result);
      });
    } catch (error) {
      currentResolvers.forEach(({ reject }) => {
        reject(error as Error);
      });
    }
  }
  
  return function batched(input: TInput): Promise<TOutput> {
    return new Promise((resolve, reject) => {
      batch.push(input);
      resolvers.push({ resolve, reject });
      
      if (batch.length >= maxSize) {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        executeBatch();
      } else if (!timeoutId) {
        timeoutId = setTimeout(executeBatch, maxWait);
      }
    });
  };
}

// ============== CACHING HOOKS FOR REACT ==============
/**
 * Create a cached JD analysis key
 */
export function getJDCacheKey(jobDescription: string): string {
  return `jd_analysis_${hashString(jobDescription)}`;
}

/**
 * Cache JD analysis result
 */
export function cacheJDAnalysis(jobDescription: string, analysis: any): void {
  const key = getJDCacheKey(jobDescription);
  setCached(key, analysis, { ttl: 2 * 60 * 60 * 1000 }); // 2 hours
}

/**
 * Get cached JD analysis
 */
export function getCachedJDAnalysis(jobDescription: string): any | null {
  const key = getJDCacheKey(jobDescription);
  return getCached(key);
}

/**
 * Create a cached resume score key
 */
export function getResumeCacheKey(resumeText: string, jdHash?: string): string {
  const baseHash = hashString(resumeText);
  return jdHash ? `resume_score_${baseHash}_${jdHash}` : `resume_score_${baseHash}`;
}
