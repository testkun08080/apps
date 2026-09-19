---
title: Support
docType: support
appSlug: shitagaki
locale: en
updated: 2026-09-19
---

Replies can take a few days. For bug reports, it helps to include your device model, your iOS version, and what you were doing when it happened.

## Requirements

- iPhone / iPad (iOS 26 or later)
- English and Japanese. The App follows your device language, and you can pick one under Settings > Language
- No account or sign-in
- On the [App Store](https://apps.apple.com/app/id6774141263) (current version 1.2.0)

## Frequently asked questions

### Where are my photos and recordings stored?

Photos, audio, memos and drafts are stored on your device. With Settings → iCloud sync enabled, they also sync across iPhone and iPad on the same Apple ID via CloudKit. We do not keep a copy of your drafts on our servers.

Only when you generate an outline do we send memo text, photo details (title, capture time, optional place name), and a **small list thumbnail of each photo** via a Cloudflare Worker to Google Gemini (text only to Groq if Gemini fails). Original photo files and audio are never sent.

### Is the capture location sent?

A place name is passed to outline generation only when "Send the capture location to the AI" is on for that draft (off by default). With it off, a photo's location never leaves your device. Latitude and longitude are never sent.

### Is there a limit on outline generation?

The free plan allows **10 runs in total** and never resets (counted on the server by device identifier, so reinstall does not restore it). AI Plus raises that to **50 a month**, restored on the 1st. The remaining count is shown in the App's settings screen.

### Are there ads?

Only a rewarded video you choose to watch. Banners and interstitials never appear on their own. Once the free AI outline quota is gone, you can optionally watch one to earn a single run (AI: once a day, up to five a calendar month; export: once a day). Closing the video early grants nothing. AI Plus subscribers are never shown the offer. If you bought the one-time export plan, the export video is hidden, but the AI video may still appear after the free AI quota is gone. Ads are always non-personalised, and ATT permission is never requested.

### Which plan should I pick?

If exporting is all you need, the one-time purchase is the one — pay once, keep it for good. If you want to rebuild with AI over and over, pick AI Plus (50 generations a month, plus unlimited exporting while subscribed). You can compare them any time under Settings > See plans.

### What happens if I cancel AI Plus?

The monthly generation allowance and the exporting that came with AI Plus stop. The free quota returns to whatever was left before you subscribed. To keep exporting afterwards, consider the one-time export purchase.

### What is iCloud sync?

Check status under Settings → iCloud sync. Drafts (photos, memos and voice) sync across devices on the same Apple ID. Purchases, the free AI quota and rewarded-video credits do not sync. After changing devices, also use Settings → Restore purchases.

### I want to change the quality of exported images

Under Settings > Image settings you can change the long-edge size, the format (JPEG / PNG) and the quality. The original photos on your device are untouched.

### The text is too small to read

Under Settings > Preview settings you can change the body font, the text size and the line height. Settings > Colors offers the light / dark theme and the accent color.

## Troubleshooting

### I cannot pick photos, or they do not appear

Check that access is allowed under Settings > Draft > Photos on your device. With "Selected Photos", anything you did not select will not show up.

### Speech is not being transcribed well

Both microphone and speech recognition permissions are needed; check them under Settings > Draft on your device. The quieter your surroundings, the better the accuracy.

### Exporting fails

Conversion takes longer with many photos, and it can fail partway when the device is low on free space. Free up space and try again.

### I bought a plan but cannot export

Try Settings > Restore purchases. You need to be signed in with the same Apple ID you bought it with.

## Purchases, cancellation and restoring

- Purchases, renewals, cancellations and refunds are all processed through your Apple ID. Refunds follow Apple's policy.
- Review and cancel subscriptions under Settings > Apple ID > Subscriptions on your device. They renew automatically unless cancelled at least 24 hours before the end of the period.
- After changing devices or reinstalling, carry your purchases over with Settings > Restore purchases in the App.
- The one-time export plan keeps exporting available after a single purchase.
