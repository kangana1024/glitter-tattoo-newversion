/**
 * Colored terminal progress output with verbose mode support.
 */

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
} as const;

export interface Logger {
  info(message: string): void;
  success(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  verbose(message: string): void;
  progress(current: number, total: number, label: string): void;
}

/**
 * Create a logger that writes colored output to stderr.
 * When verbose is false, verbose() calls are silently ignored.
 */
export function createLogger(verbose: boolean = false): Logger {
  function write(color: string, prefix: string, message: string): void {
    process.stderr.write(`${color}${prefix}${COLORS.reset} ${message}\n`);
  }

  return {
    info(message: string): void {
      write(COLORS.blue, '[INFO]', message);
    },
    success(message: string): void {
      write(COLORS.green, '[OK]', message);
    },
    warn(message: string): void {
      write(COLORS.yellow, '[WARN]', message);
    },
    error(message: string): void {
      write(COLORS.red, '[ERROR]', message);
    },
    verbose(message: string): void {
      if (verbose) {
        write(COLORS.dim, '[DEBUG]', message);
      }
    },
    progress(current: number, total: number, label: string): void {
      const pct = total > 0 ? Math.round((current / total) * 100) : 0;
      write(COLORS.cyan, `[${current}/${total}]`, `${pct}% ${label}`);
    },
  };
}
