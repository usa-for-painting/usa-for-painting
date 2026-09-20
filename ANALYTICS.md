# Visitor and enquiry reporting

Status: configured with the owner's Google Analytics 4 Measurement ID `G-XT2K39QKCW`. After deployment, tracking starts automatically unless the visitor previously opted out on this browser. No visitor counts or past traffic can be recovered from before activation. Confirm actual receipt in your private Google Analytics Realtime report.

## Connect your account

1. Open https://analytics.google.com/ and create or choose your USA For Painting property.
2. Under Admin, open Data collection and modification > Data streams. Create a Web stream for https://usa-for-painting.github.io/usa-for-painting/.
3. Copy the Measurement ID beginning `G-` into `content/analytics.json`.
4. Deploy, visit your site, and confirm your visit in Reports > Realtime. Standard reports may take 24-48 hours.
5. In the web stream's enhanced measurement settings, disable Form interactions and Outbound clicks to keep automatically captured form metadata and message-link URLs out of analytics. Custom events below collect no typed form values.

## What to look at each week

- **Acquisition > Traffic acquisition:** visitors and sessions by source, such as Google search, Maps, social media, and direct visits.
- **Engagement > Pages and screens:** views and average engagement time by page.
- **Engagement > Events:** `contact_click` (phone or text), `estimate_click`, `estimate_prepared`, `project_view`, `film_start`, `film_progress` (25/50/75%), `film_complete`, and `film_download`.
- **Where people spend time on a page:** create an event-scoped custom dimension for `section_name` and a custom metric for `visible_seconds` (unit: seconds). In Explore, use event name `section_engagement`, rows `section_name`, and values `visible_seconds`. This counts visible time in the most visible section, only while the tab is visible and the visitor has interacted within the last minute.
- Mark `contact_click` and `estimate_prepared` as key events if these are useful business signals. They indicate intent, not a completed call, sent text, or confirmed sale.

Analytics starts automatically without a popup. Visitors can turn analytics off or on using the footer control. Existing saved declines remain respected. Ad storage and advertising personalization are disabled. Form names, phone numbers, postal codes, free text, and prepared messages are never included in custom event parameters. URLs are stripped of query strings and fragments in the page configuration.

Analytics reports include visitors whose browsers load the tag and who have not opted out. They will not count every visitor. Keep the dashboard private in your Google account; no account credentials belong in this repository.

Official references:
- https://support.google.com/analytics/answer/12926732
- https://support.google.com/analytics/answer/11109416
- https://developers.google.com/tag-platform/gtagjs/reference
