import { z } from "zod"

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
const server = z.object({
  DATABASE_URL: z.string().url().or(z.string().startsWith("file:")),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  AI_PROVIDER: z.enum(["anthropic", "gemini"]).default("anthropic"),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  GEMINI_API_KEY: z.string().min(1).optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
})

/**
 * Specify your client-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
const client = z.object({
  // Add client-side env vars here if needed
  // NEXT_PUBLIC_APP_URL: z.string().url().optional(),
})

/**
 * You can't destruct `process.env` as a regular object in the Next.js
 * edge runtime (e.g. middlewares) or client-side so we need to destruct manually.
 * @type {Record<keyof z.infer<typeof server> | keyof z.infer<typeof client>, string | undefined>}
 */
const processEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  AI_PROVIDER: process.env.AI_PROVIDER,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  NODE_ENV: process.env.NODE_ENV,
}

// Don't touch the part below
// --------------------------

const merged = server.merge(client)

let env = /** @type {z.infer<typeof merged>} */ (process.env)

if (!!process.env.SKIP_ENV_VALIDATION == false) {
  const isServer = typeof window === "undefined"

  const parsed = /** @type {z.SafeParseReturnType<z.infer<typeof merged>>} */ (
    isServer
      ? merged.safeParse(processEnv) // on server we can validate all env vars
      : client.safeParse(processEnv) // on client we can only validate the ones that are exposed
  )

  if (parsed.success === false) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors,
    )
    throw new Error("Invalid environment variables")
  }

  env = new Proxy(parsed.data, {
    get(target, prop) {
      if (typeof prop !== "string") return undefined
      // Throw a descriptive error if a server-side env var is accessed on the client
      // Otherwise it would just be returning `undefined` and be annoying to debug
      if (!isServer && !prop.startsWith("NEXT_PUBLIC_"))
        throw new Error(
          process.env.NODE_ENV === "production"
            ? "❌ Attempted to access a server-side environment variable on the client"
            : `❌ Attempted to access server-side environment variable '${prop}' on the client`,
        )
      return target[/** @type {keyof typeof target} */ (prop)]
    },
  })
}

// Validate that at least one AI provider key is present
if (env.AI_PROVIDER === "anthropic" && !env.ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY is required when AI_PROVIDER is set to 'anthropic'")
}

if (env.AI_PROVIDER === "gemini" && !env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is required when AI_PROVIDER is set to 'gemini'")
}

export { env }