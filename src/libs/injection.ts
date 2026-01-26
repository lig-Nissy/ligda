const INJECTION_PATTERNS = [
  // SQL injection
  /['";]\s*(OR|AND)\s+/i,
  /(['";])\s*--/,
  /\b(DROP|DELETE|INSERT|UPDATE|ALTER|UNION|SELECT)\b.*\b(TABLE|FROM|INTO|SET|ALL)\b/i,
  /\bOR\s+1\s*=\s*1/i,
  /\bUNION\s+SELECT\b/i,
  // XSS
  /<\s*script/i,
  /<\s*img\b/i,
  /\bon\w+\s*=/i,
  /javascript\s*:/i,
  // Path traversal
  /\.\.\//,
  /\.\.\\/,
];

export function detectInjection(input: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}
