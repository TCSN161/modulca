# MCA-SPEC-WALKTHROUGH-VIDEO-2026-11-21

**Status**: Design spec — ready for Phase 3 implementation
**Owner**: Chat 3 (AI Engines & Rendering)
**Why this exists**: User asked for step-by-step video walkthrough plan after discovering we can do it free in the browser without AI.

---

## 1. Core insight — AI is NOT the right tool here

The ModulCA walkthrough step already renders a live Three.js scene (WebGL) with:
- Full house geometry (modules, walls, doors, windows)
- Furniture GLBs placed per module preset
- Lighting (sun + per-module point lights)
- PointerLockControls for WASD movement
- **An AutoTour feature that walks the camera through every room automatically**

Everything needed for a video walkthrough is ALREADY rendering on screen.
We just need to **record the canvas** while AutoTour plays.

Cost: **$0** · Latency: **real-time** · Geometry: **exact** (no AI hallucinations)

AI video (LTX, Wan, Kling, Pika) is only useful for post-walkthrough
"cinematic polish" shots — a Phase 5 feature at best, not Phase 3.

---

## 2. Implementation — 7 steps, ~4-6 hours total

### Step 1 — Add `canvas.captureStream()` hook (30 min)

File: `src/features/design/components/walkthrough/useVideoRecorder.ts` (new)

```ts
export function useVideoRecorder(canvasRef, opts) {
  // Grab the underlying HTMLCanvasElement from react-three-fiber's gl.domElement
  // Call canvas.captureStream(opts.fps ?? 30)
  // Return { start, stop, isRecording, blob, duration }
}
```

Native browser API — no npm dependency.

### Step 2 — Add MediaRecorder wrapper (30 min)

Inside the hook:
```ts
const recorder = new MediaRecorder(stream, {
  mimeType: 'video/webm;codecs=vp9',
  videoBitsPerSecond: opts.quality === 'high' ? 8_000_000 : 3_000_000,
});
```

Quality presets:
- **Preview** (720p, 3 Mbps) — free tier, ~45 MB / 60 sec
- **Standard** (1080p, 8 Mbps) — Premium tier, ~60 MB / 60 sec
- **Ultra** (1440p, 16 Mbps) — Architect tier, ~120 MB / 60 sec

### Step 3 — Wire record button to UI (45 min)

File: `src/features/design/components/walkthrough/WalkthroughPage.tsx`

Add button next to the existing AutoTour toggle:
```
[▶ Start Auto-Tour] [⏺ Record Video (720p) ▼]
```

When clicked:
1. Switch to "Cinematic" camera mode automatically
2. Hide HUD/minimap/room-list overlay (so video is clean)
3. Start recording
4. Fire AutoTour
5. On AutoTour `onFinished`, stop recording
6. Show "Download video" button with the blob

### Step 4 — Browser-native MP4 fallback via Media Capture (60 min)

Chrome Nov 2026 supports `video/mp4;codecs=avc1` via MediaRecorder natively.
WebM works everywhere; MP4 preferred for client sharing / PowerPoint embed.

```ts
const supportedMime = MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')
  ? 'video/mp4;codecs=avc1'
  : 'video/webm;codecs=vp9';
```

### Step 5 — Audio narration (optional, 90 min)

Two paths:
- **A. Web Speech API** (`speechSynthesis.speak`) — free, built-in, Romanian voices available but robotic.
- **B. Pre-generated ElevenLabs track** — architect writes script, we TTS-render once per project, attach as separate audio track in MediaRecorder stream.

For Beta: **A (free)**. For Architect tier polish later: **B**.

To mix narration with the canvas stream:
```ts
const audioStream = (new SpeechSynthesisUtterance(script)) ... /* via AudioContext */
const combined = new MediaStream([...stream.getTracks(), ...audioStream.getTracks()]);
```

### Step 6 — Upload to gallery (30 min)

Repurpose the existing `src/features/gallery/components/PublishButton.tsx` —
extend to accept `video/*` MIME in addition to `image/*`. The /api/renders/publish
route needs a small branch:
- Current: Sharp WebP compression
- Add: Video passthrough (store raw MP4/WebM, generate first-frame thumbnail
  with ffmpeg.wasm or canvas.toBlob at seek-to-0)

Supabase Storage bucket `renders-public` already accepts video via `video/*` MIME.

### Step 7 — Phase 3 polish: AI "director mode" (optional, defer)

Future: use LTX-2.5 Fast (our scaffold) or Wan 2.2 to generate a 3-second
"cinematic opening shot" that slides into the walkthrough. Totally skippable
for Beta.

---

## 3. Deliverables when Phase 3 starts

A single PR touching:
```
src/features/design/components/walkthrough/
  useVideoRecorder.ts                              (new, ~120 lines)
  WalkthroughPage.tsx                              (add Record button + state)
  WalkthroughScene.tsx                             (expose canvas ref via forwardRef)
src/app/api/renders/publish/
  route.ts                                         (accept video/* in branch)
src/features/gallery/
  types.ts                                         (add mediaType: 'image' | 'video')
  components/PublishButton.tsx                     (accept MP4/WebM payload)
  components/GalleryCard.tsx                       (<video> tag when mediaType=video)
```

Tests:
```
src/features/design/components/walkthrough/__tests__/useVideoRecorder.test.ts
```

Smoke on prod after deploy:
1. Load `/project/demo/walkthrough`
2. Click "Record Video (720p)"
3. Wait ~60s for AutoTour to complete
4. Download the webm/mp4
5. Open the file — should see smooth camera glide through all rooms

---

## 4. Browser support Nov 2026

| Browser | WebM recording | MP4 recording | AutoTour JS | WebGL 2 |
|---|---|---|---|---|
| Chrome 142+ | ✅ VP9 | ✅ H.264 | ✅ | ✅ |
| Safari 18+ | ✅ VP9 | ✅ H.264 | ✅ | ✅ |
| Firefox 143+ | ✅ VP9 | ⚠️ (depends on OS codecs) | ✅ | ✅ |
| Mobile Chrome Android | ✅ | ✅ | ⚠️ pointer-lock not supported — use touch-drag mode | ✅ |
| Mobile Safari iOS 17+ | ✅ VP9 | ✅ H.264 | ⚠️ pointer-lock partial | ✅ |

Recommendation: ship desktop-first; add touch-gesture path for mobile in
follow-up. AutoTour works on both because it doesn't need user input.

---

## 5. Cost + storage

| Scenario | File size | Storage impact |
|---|---|---|
| 30s WebM 720p 3 Mbps | ~12 MB | 10 videos / month per user = 120 MB storage |
| 60s MP4 1080p 8 Mbps | ~60 MB | Premium+ tier |
| Supabase Storage free tier | 1 GB | ~8 Architect-tier hero videos |
| Supabase Storage Pro | 100 GB | ~800 videos before upgrade |

Cache strategy: videos served from Supabase CDN with 1-year cache header
(same as our image renders).

---

## 6. Rollout

- **Phase 3 (post-Beta Jan-Feb 2027)**: implement + ship Steps 1-6 as "Record Walkthrough" feature on walkthrough page.
- **Phase 4**: wire into gallery as video entries.
- **Phase 5**: add Web Speech narration + ElevenLabs upgrade for Architect tier.
- **Phase 6+**: AI "director mode" overlay (LTX/Wan intro shots).

No user action needed to unblock — this is purely engineering work in Chat 3 scope. When Phase 3 kicks off, I execute Steps 1-6 end-to-end.
