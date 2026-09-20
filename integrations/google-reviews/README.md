# Live Google reviews connection

Prepared but not connected. The owner confirmed that they manage the Google Business Profile. The runtime currently has no Google OAuth credentials or backend hosting credentials, so the live feed cannot be activated yet.

The public website remains on GitHub Pages. `worker.mjs` runs separately on Cloudflare Workers, keeps credentials private, and requests reviews from Google's Business Profile API for each GET /reviews request. It requests 12 reviews ordered by `updateTime desc` (most recently updated, including recently edited reviews), together with the current average rating and total count. It does not filter out low ratings. Responses are marked `Cache-Control: no-store`.

## One-time account connection

1. In an owner-controlled Google Cloud project, obtain access to the Business Profile APIs, enable the required APIs, and configure OAuth consent and an OAuth client. Access/approval must be granted by Google; managing a listing alone does not provision API access.
2. Authorize the Google account managing the verified listing with the `https://www.googleapis.com/auth/business.manage` scope and offline access, then obtain its refresh token. Google's documentation covers the OAuth flow. Do not put the client secret or refresh token in the website, repository, or chat.
3. Identify the account and verified location resource, `accounts/ACCOUNT_ID/locations/LOCATION_ID`. This is not the public Maps CID.
4. In the owner-controlled Cloudflare account, deploy this folder as a Worker. Add encrypted secrets `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REFRESH_TOKEN`, plus the variable `GOOGLE_LOCATION`. Keep `ALLOWED_ORIGIN` set to the website origin.
5. Put the deployed `https://YOUR-WORKER.workers.dev/reviews` URL into `content/reviews/live.json`, then deploy the website.
6. Open the homepage and Reviews page. Confirm the live status, Google rating, total count, and the most recently updated review. Reload to confirm a new backend request.

CLI after the owner signs into Cloudflare and supplies credentials securely:

```
npx wrangler login
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put GOOGLE_REFRESH_TOKEN
npx wrangler deploy
```

The website requests the saved review data with `cache: no-store`, then calls the configured live endpoint without caching on every new visit and when a page is restored from the browser's back/forward cache. If the endpoint fails, it retains the dated saved excerpts and explicitly indicates refresh was unavailable. No fake timestamps or invented reviews are generated.

Until connected, the site shows dated selected excerpts and links directly to Google for the full current review history. A fresh fetch of the static JSON does not make the underlying reviews live.

## Official references

- https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews/list
- https://developers.google.com/my-business/content/implement-oauth
- https://developers.cloudflare.com/workers/configuration/secrets/

Keep Cloudflare request logs and Google quotas under review once active. Each fresh site visit calls the API; quotas and temporary Google failures can prevent a refresh. Google can change or remove reviews between visits.
