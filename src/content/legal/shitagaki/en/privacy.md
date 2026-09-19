---
title: Privacy Policy
appSlug: shitagaki
docType: privacy
locale: en
updated: 2026-09-19
---

> This is a translation of the Japanese original. If the two differ, the [Japanese version](https://apps.testkun.net/shitagaki/privacy/) governs.

## 1. Introduction

Draft (Japanese App Store display name **下書き - Photo Diary**; English **Draft - Photo Diary**; "the App") respects your privacy. This policy explains what information the App handles.

## 2. Information we collect

The App **does not require an account**. Drafts, photo references, recordings and memos are, as a rule, stored **on your device** (in SQLite and similar local storage). When sync is on, they also use **iCloud (CloudKit)** as described below. We do not collect your name or email address.

| Data | Purpose | Where it is stored |
|------|---------|--------------------|
| Drafts (title, outline, memos) | Providing the App's features | SQLite on your device; also in your iCloud when sync is enabled |
| Photo references and photos / list thumbnails copied into the App | Showing, exporting and syncing photos used in an article | On your device; photo files also in your iCloud when sync is enabled. **Original photo files are never sent to our servers** (list thumbnails for outline generation are covered in §3) |
| Recordings and transcripts | Input while you talk | On your device. Transcription runs on the device. Voice memo files tied to a draft also sync via iCloud when enabled |
| Capture time and place name (optional) | On-screen display and as a hint for AI outline generation | On your device. Sending to the AI is opt-in (off by default) |
| Free AI outline generation counts | Calculating what is left of the free quota | Counted on our **Cloudflare Worker using the device identifier (iOS IDFV)**. The count does not reset on reinstall. Monthly AI Plus quotas and similar are also kept on device |
| App settings (theme, export quality and so on) | Keeping your preferences | On your device (not synced via iCloud) |
| Purchase state | Deciding which purchased features are unlocked | RevenueCat, under an anonymous ID that is not tied to an account. Not synced via iCloud |
| Advertising identifiers and usage data | Serving rewarded video and preventing abuse | Google AdMob, only when you choose to watch a video |

## 3. What is sent out for AI outline generation

Only when you run AI outline generation, the following is sent to **Google Gemini via a Cloudflare Worker**. If Gemini is unavailable, **text only** is sent to **Groq** (no images).

- The title, memo text and outline instructions
- The capture time
- An optional place name (latitude and longitude are never sent; you can turn this off on the outline screen; off by default)
- **A small list thumbnail of each photo** (the downscaled JPEG used in lists, not the original full-resolution file)

**Original photo files and audio are not sent** — transcription happens on the device.

Before the first send, a consent sheet names what is sent and where. If the disclosure changes, devices that already consented see the sheet again.

To count the free AI quota, the App sends the **device identifier (IDFV)** to the Worker when generating or checking the quota. It is not used for sign-in or tracking.

The Worker's operational logs may record processing volume such as token counts, estimated cost and the number of photos. Memo text and titles are not written to those logs.

## 4. iCloud sync

When Settings → iCloud sync is enabled, drafts (photos, memos, voice, outlines and per-photo AI history) sync across iPhone and iPad on the same Apple ID via **Apple CloudKit (private database)**. The data lives on your Apple account; we do not keep a copy of your drafts on our servers.

The following do **not** sync via iCloud:

- App Store purchases (restore under Settings → Restore purchases)
- Free AI quota and rewarded-video credits
- App appearance and similar settings

Deleting the App from a device removes local data on that device, but drafts already in your iCloud may remain. Handling of iCloud data follows Apple's settings and policies.

## 5. Third-party services

| Service | Purpose | Provider |
|---------|---------|----------|
| Apple App Store | Processing in-app purchases | Apple Inc. |
| Apple iCloud / CloudKit | Syncing drafts across devices on the same Apple ID | Apple Inc. |
| RevenueCat | Checking purchase state | RevenueCat, Inc. |
| Cloudflare Workers | Relaying AI outline generation and counting the free AI quota | Cloudflare, Inc. |
| Google Gemini | Generating the article outline (including list thumbnails) | Google LLC |
| Groq | Text-only outline generation if Gemini fails | Groq, Inc. |
| Google AdMob | Serving rewarded video | Google LLC |

Information handled by each service is subject to that service's own privacy policy.

- Apple: https://www.apple.com/legal/privacy/
- RevenueCat: https://www.revenuecat.com/privacy
- Cloudflare: https://www.cloudflare.com/privacypolicy/
- Google: https://policies.google.com/privacy
- Groq: https://groq.com/privacy-policy

## 6. Device permissions

The App may ask for the permissions below, always after explaining why it needs them. The App still launches if you decline, and the other features keep working.

- **Photo library**: picking the photos used in an article
- **Microphone**: recording while you talk
- **Speech recognition**: transcribing what you recorded

**The App never asks for location permission.** When a photo carries a capture location, the App may show a place name derived from it, but it does not request Location Services access.

## 7. Advertising and tracking

The only advertising in the App is a **rewarded video you choose to watch**. Banners and interstitials are never shown on their own. The rewarded video exists so that, once the free AI outline quota is gone, you can earn one more generation (once a day, up to five a calendar month), or one export (once a day).

- **AI Plus** subscribers are not shown the AI or export video offers.
- Anyone who has bought the **one-time export** plan is not shown the export video, but may still see the **AI video** after the free AI quota is gone.

Rewarded video is served by Google AdMob. Ads are always requested as **non-personalised** — not based on your behaviour.

- **App Tracking Transparency (ATT) permission is never requested.** No tracking consent dialog appears.
- You are never tracked across other apps or websites for advertising.
- No analytics SDK is embedded in the App.

Information AdMob handles to serve ads and prevent abuse is subject to [Google's privacy policy](https://policies.google.com/privacy).

## 8. Retention and deletion

Data on your device stays there until you delete it. Drafts can be deleted in the App at any time, and **removing the App from your device deletes everything it stored locally**. Drafts already synced to your iCloud may remain (see §4).

Text and list thumbnails sent for AI outline generation are processed to return the response and are not stored as drafts on our servers. Device identifiers and free-quota counts are retained on the Worker. Purchase state is retained by Apple and RevenueCat.

## 9. Children

The App is not directed at any particular age group, and we do not knowingly collect personal information from children under 13.

## 10. Changes to this policy

If we change this policy we will update this page and revise the last-updated date shown at the top. Significant changes will also be noted in the App's release notes.

## 11. Contact

For questions about this policy, please use the [support page](https://apps.testkun.net/en/shitagaki/support/) or the email address at the bottom of this page.
