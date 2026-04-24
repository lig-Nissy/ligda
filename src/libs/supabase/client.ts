import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_AUTH_SERVICE_URL!,
    process.env.NEXT_PUBLIC_AUTH_SERVICE_KEY!
  );
}
