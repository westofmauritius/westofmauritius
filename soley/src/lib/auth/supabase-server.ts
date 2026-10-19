import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * A Supabase client acting as the signed-in visitor (anon key + their
 * session cookie). Used only for authentication: reading the session,
 * sending magic links and completing sign-in. Data access goes through the
 * data layer.
 */
export async function createAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) => {
          try {
            for (const { name, value, options } of list)
              cookieStore.set(name, value, options);
          } catch {
            // Called from a server component, where cookies are read-only.
            // The proxy refreshes sessions, so this can be ignored.
          }
        },
      },
    },
  );
}
