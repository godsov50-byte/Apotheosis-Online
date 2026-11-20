# Grand Meridian OAuth consent host

This is a static GitHub Pages consent UI for the isolated AO Grand Meridian experiment. It contains only the Supabase publishable key; it does not contain a service-role key or user credentials.

## Publish the consent page

1. Open the repository's **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select branch `prototype/ao-chatgpt-oauth-consent` and folder `/docs`, then save.
4. Wait for GitHub Pages to publish the site.

Expected consent URL:

`https://godsov50-byte.github.io/Apotheosis-Online/oauth/consent/`

This repository setting is intentionally left for the owner to enable. No deployment or merge to `main` has been performed.

## Configure the isolated Supabase project's Auth

In project `ao-grand-meridian-experiment` (`hixbtiuibtyiqrtacver`):

1. Under **Authentication → OAuth Server**, enable the OAuth 2.1 server.
2. Set **Authorization Path** to `/Apotheosis-Online/oauth/consent`.
3. Enable **Dynamic Client Registration**. This is required by the current AO WorldHeart MCP package. Keep user approval enabled, validate redirect URIs, and review registered clients periodically.
4. Under **Authentication → URL Configuration**, set the Site URL to `https://godsov50-byte.github.io`.
5. Add `https://godsov50-byte.github.io/Apotheosis-Online/**` to the allowed redirect URLs.
6. Under **Authentication → JWT Signing Keys**, verify the active signing algorithm is asymmetric (ES256 or RS256). Supabase's `withSupabase` MCP middleware requires asymmetric signing. Do not rotate signing keys without reviewing impact on existing sessions.

The resulting consent URL is the Site URL plus Authorization Path:
`https://godsov50-byte.github.io/Apotheosis-Online/oauth/consent`.

## Connect in ChatGPT

After Pages and Supabase Auth are configured, open the private AO WorldHeart plugin and complete its OAuth connection. The consent page will show the client and scopes and let the user approve or deny access.

## Scope

The OAuth grant is for the isolated Grand Meridian MCP endpoint only. Its tools can read the experimental scene and ledger, create/retrieve a provisional Visitor Envoy, submit experimental movement, inspect entities, and invoke the allowlisted door/exhibit/sconce interactions. It does not connect to the main AO project.

The current experiment still lacks server-side wall/obstacle/stair/capsule collision checks and general combat or Kernel-rule resolution.
