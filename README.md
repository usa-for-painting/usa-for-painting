# USA For Painting

A responsive, static website for residential and commercial painting in New Castle County, Delaware. Uses the original company logo and selected photos from the owner's project collection. No production dependencies or paid hosting required.

## Preview and checks

Requires Node.js 20 or later.

```sh
npm run dev
npm test
npm run build
```

Preview at http://127.0.0.1:4173. The build outputs only public website files into `dist/`; original WhatsApp photos, videos, and working files are excluded.

## GitHub Pages

Target repository: https://github.com/usa-for-painting/usa-for-painting

1. Push the website source to the repository's `main` branch.
2. In repository **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source.
3. The included workflow checks the website, builds `dist/`, and deploys it. If needed, run **Actions → Deploy website to GitHub Pages → Run workflow**.
4. Expected address: https://usa-for-painting.github.io/usa-for-painting/

The site uses relative asset paths and supports a GitHub project subdirectory. Confirm the actual URL in the deployment result. When connecting a custom domain later, update canonical, Open Graph, structured-data, sitemap, and robots URLs together.

## Estimate requests

Phone: (302) 452-4001, sourced from the existing Webflow website. The form validates details and prepares an SMS message. Visitors must open their messaging app and send it themselves, or copy the message and text it from a phone. There is no fake success screen, server, email delivery, or database. Test the phone/SMS handoff on the business's target devices before marketing launch. SMS availability depends on device and messaging app.

If an inbox-based form is preferred later, connect a verified email address to a form provider or serverless endpoint, then update privacy information. Never put service secrets in client-side JavaScript.

## Site structure

The homepage is the visual introduction and estimate destination. Primary navigation now opens focused pages instead of stacking every feature into one long scroll: `services.html`, `work.html`, `designs.html`, `team.html`, and `reviews.html`. Each focused page keeps the same header, visual system, owner-supplied project photography, and a direct link back to the homepage estimate form.

## Adding content

Drop homepage rotation photos into `content/photos/homepage`, project photos into `content/photos/work`, design images into `content/photos/designs`, and videos into `content/video`. Run `npm run build`; the build creates `dist/content/media.json`, and the browser loads those folders automatically. Use unique filenames and include only photos you own or are authorized to publish.

To refresh reviews weekly, edit `content/reviews/reviews.json` with the latest verified excerpts, update the `updated` date, then run `npm test`, `npm run build`, and push `main`. Google does not provide a dependable unauthenticated live feed for a static site, so review text must be verified before adding it.

## Editing

- Content, phone, service area, SEO: `index.html`
- Design and responsive layout: `styles.css`
- Premium presentation, typography, and responsive refinements: `premium.css`
- Portfolio filters, modal, inspiration selection, before/after slider, SMS form: `app.js`
- Privacy notice: `privacy.html`
- Selected original photos and company logo: `assets/`
- Photo provenance: `ASSETS.md`

No unverified review totals, insurance claims, warranties, or years of experience are published. Photos are actual supplied project images. The before/after photos show the same porch from slightly different viewpoints.

The homepage leads with actual project photography and dated Google review evidence. Project viewer arrows browse the currently filtered collection; its estimate link carries the selected project into the message. Video chapter buttons seek within the existing 30-second film. Neither interaction submits customer information automatically.

## Hosting later

Keep GitHub Pages for a simple static site and connect a custom domain. If server-side form processing or other backend features are needed, the same static files can move to a suitable static/serverless host. Hosting and domain costs should be checked when selecting a provider.
