# Static Recorder Pro

> Record calls, get accurate transcripts, and draft AI notes — in your browser, on your machine, with your choice of AI.

Static Recorder Pro is a fully self-contained, single-file web app. It records call audio (microphone + system audio simultaneously), transcribes it locally with Whisper, and drafts notes, replies, and follow-ups — either with a **local in-browser LLM** or (optionally) a **third-party cloud LLM API** of your choice. No backend is required; everything runs from a static page.

---

## What it does

| Feature | Description |
| --- | --- |
| **Dual-track call recording** | Records the **Agent (microphone)** and **Caller (system audio)** as separate tracks so voices are easy to tell apart. |
| **Local transcription** | Whisper runs in-browser via [Transformers.js](https://huggingface.co/docs/transformers.js). Produces timestamped, speaker-labeled transcripts. |
| **Local AI notes** | A small in-browser LLM (WebGPU/WASM) summarizes the call, drafts reply emails, lists action items, and more — no internet needed. |
| **Cloud AI notes** | Optional: connect OpenAI, Anthropic (Claude), Google Gemini, Groq, OpenRouter, or any OpenAI-compatible endpoint with an API key. Streams quality results with huge context. |
| **Smart transcript compaction** | Timestamps are stripped and consecutive same-speaker lines merged before AI processing — often ~45% smaller, so the AI gets more call in fewer tokens. |
| **Rich text formatting** | The note template has a formatting toolbar (bold, italic, underline, headers, lists); the AI output renders that formatting and copies it as rich text. |
| **Custom AI prompt presets** | Save your own one-click prompt chips (and format references), persist them between visits, manage them by right-click. |
| **Call history** | Every recording + transcript is saved locally with timestamps, durations, and quick actions — re-transcribe, load into the AI, save transcript `.txt`, or delete. |
| **Export** | Download individual tracks (WAV), the full transcript (.txt), the AI response (.txt), or copy the AI response *with formatting*. |

---

## Local-First, With an Optional Cloud Mode

The AI Co-Pilot has two modes, switched with a tab at the top of the AI panel:

### Local (In-Browser) — default
- Entirely offline after the one-time model download; **no API keys, no accounts, no data leaves your device**.
- Runs Whisper + a small LLM through [Transformers.js](https://huggingface.co/docs/transformers.js) on **WebGPU** (falling back to WASM/CPU).
- Private and free, but constrained by browser memory and the size of small local models (see [Known limitations](#known-limitations)).

### Cloud API — optional
- Bring your own key from **OpenAI, Anthropic (Claude), Google Gemini, Groq, OpenRouter**, or a **Custom OpenAI-compatible endpoint** (LM Studio, Ollama, enterprise gateways, etc.).
- Per-provider model dropdowns (e.g. `gemini-3.8-flash`, `claude-sonnet-4-5`, `gpt-4o-mini`), or type any model in Custom.
- Responses **stream token-by-token**; the same prompt instruction, format reference, compaction, and presets apply.
- No browser memory limits — full 128k+ context handling of long calls.

> **Note:** the API key is stored only in the page's `localStorage` and is sent **directly** from your browser to the provider. Use a restricted/limited key — anyone with access to the device can read it.

**Providers that are CORS-enabled** (work directly from a static page): OpenAI, Anthropic (via its browser-access header), Google Gemini, Groq, OpenRouter, and Custom endpoints that send CORS headers. **OpenCode Go is notably excluded** — its API sends no CORS headers, so it cannot be called from a static page; it must be used from the OpenCode app itself.

---

## Models

### Local transcription (Whisper)

| Model | Purpose | Size |
| --- | --- | --- |
| [whisper-tiny.en](https://huggingface.co/onnx-community/whisper-tiny.en) | Fastest | ~40 MB |
| [whisper-base.en](https://huggingface.co/onnx-community/whisper-base.en) | Default — balanced | ~40–90 MB |
| [whisper-small.en](https://huggingface.co/onnx-community/whisper-small.en) | High accuracy | ~150–230 MB |

### Local AI notes (in-browser LLM)

| Model | Purpose | Size |
| --- | --- | --- |
| [Qwen2.5 1.5B Instruct](https://huggingface.co/onnx-community/Qwen2.5-1.5B-Instruct) | Best quality (recommended on WebGPU) | ~1.1 GB |
| [Qwen2.5 0.5B Instruct](https://huggingface.co/onnx-community/Qwen2.5-0.5B-Instruct) | Default — balanced | ~0.5 GB |
| [SmolLM2 360M Instruct](https://huggingface.co/onnx-community/SmolLM2-360M-Instruct-ONNX) | Fast / CPU mode | ~0.3 GB |
| [SmolLM2 135M Instruct](https://huggingface.co/onnx-community/SmolLM2-135M-Instruct-ONNX) | Smallest / fastest | ~0.2 GB |

Local models are downloaded from Hugging Face **once** and cached by the browser; every run afterward works fully offline.

### Cloud AI notes
Model lists are populated per provider (e.g. `gemini-3.8-flash` for Gemini, `gpt-4o-mini` for OpenAI, `claude-sonnet-4-5` for Anthropic). If your saved model isn't in the list, it appears as an extra `(custom)` option so nothing is lost.

---

## Tech stack

| Technology | Role |
| --- | --- |
| HTML + CSS + vanilla JavaScript | Entire UI (single self-contained file) |
| [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder) | Browser audio capture (mic + tab/system audio) |
| [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) | Analyzers, live waveform visualizer, native 16 kHz resampling |
| [Transformers.js](https://huggingface.co/docs/transformers.js) | Runtime for local Whisper & LLM (WebGPU → WASM fallback) |
| [WebGPU](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API) | GPU acceleration for local inference when available |
| [OPFS](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API) | Disk-backed streaming for large recordings |
| [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) | Local storage for recordings, transcripts & prompt presets |
| [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Worker_API) | Keeps local transcription/AI off the main thread |
| [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) + SSE streaming | Direct browser-to-provider streaming calls to third-party LLMs |
| `localStorage` | Cloud API config, API key, AI mode & custom presets |

---

## How to use it

### 1. Open the app

Open `index.html` in any modern browser (Chrome, Edge, Firefox — **Chrome/Edge recommended for WebGPU**). It works from `file://`, GitHub Pages, or any static host.

### 2. Record a call

1. Press **Start Recording**.
2. Choose your microphone, then share the call tab/window **and include system audio** (so the Caller's voice is captured).
3. Watch the live waveform meters, then press **Stop** — the recording saves locally instantly.

### 3. Transcribe

1. Click **Transcribe Audio**.
2. Whisper processes the audio in chunks with live, streaming output.
3. You get a timestamped, speaker-labeled transcript (`[Agent]` / `[Caller]`).

### 4. Generate AI notes (Local mode)

1. The transcript appears in the **AI Assistant** box.
2. Choose **Local (In-Browser)** (default), pick a model + output style.
3. (Optional) type a prompt instruction, e.g. *"Summarize this call in 5 bullets."*
4. Press **Generate with AI** — responses stream in token-by-token.

### 5. Generate AI notes (Cloud mode)

1. Switch to the **Cloud API** tab.
2. Pick a **provider** (e.g. OpenAI), choose its **model**, and paste your **API key** (saved in this browser only).
3. For **Custom**, enter your base URL (e.g. `https://my-endpoint.example/v1`) and model name.
4. Press **Generate with AI** — the request goes straight from your browser to the provider and streams back.

### 6. Note templates & formatting

- Use the **Format Reference / Template** box to show the AI the layout you want (ConnectWise notes, emails, etc.).
- The small toolbar (B / I / U / H / • / 1.) inserts formatting into the template: `**bold**`, `*italic*`, `## headers`, and lists.
- The AI output **renders that formatting live**, and **Copy AI Text (Rich)** pastes it into ConnectWise/Word/email with the formatting intact.

### 7. Custom prompt & reference presets

- Click the **`+`** button next to the AI Prompt Instruction chips to save your own prompt as a reusable chip.
- Do the same for Format References — both persist across visits.
- **Right-click** a custom chip to delete it.

### 8. Manage history

The **Call History** tab lets you: listen to tracks, **Save Agent/Caller (.wav)**, **Save Transcript (.txt)**, re-transcribe, **Use Transcript** (load into the AI), **AI Draft** (load + generate immediately), refresh, or **Clear All** — all stored locally in IndexedDB.

---

## Fix slow local AI generation

Local AI generation is dramatically faster on the GPU. A badge in the **top-right of the screen** shows the mode:

- `WebGPU Active` — GPU accelerated (fast)
- `WASM CPU Mode` — CPU (works, slower)
- `Cloud API Mode` — using your configured cloud provider

**If you see `WASM CPU Mode` and want WebGPU:**

1. Open `chrome://flags/#enable-vulkan` and set **Vulkan** to **Enabled**.
2. (Optional, to be safe) enable:
   - `chrome://flags/#enable-unsafe-webgpu`
   - `chrome://flags/#ignore-gpu-blocklist`
3. **Restart Chrome.**
4. Reload — the badge should read **WebGPU Active**.

Notes:

- WebGPU requires **Chrome or Edge**. Firefox/Safari always fall back to CPU (everything still works, just slower).
- Keep hardware acceleration on: Settings → System → *"Use graphics acceleration when available."*
- On **Linux**, the Vulkan flag is the usual missing piece — Chrome ships it disabled by default.
- If a local model runs out of memory, the app automatically retries with the next smaller model, and switches to CPU if WebGPU execution fails.

---

## Smart transcript compaction

When you press **Generate with AI**, the transcript is compacted in the background (the visible box stays unchanged):

`[00:00:01.290 - 00:00:07.930] [Caller] "Well the issue with our system"`  
`[00:00:07.930 - 00:00:11.210] [Caller] "we think is related to memory."`

becomes:

`[Caller] "Well the issue with our system we think is related to memory"`

Timestamps are removed and consecutive same-speaker lines are merged — typically **~45% fewer characters**, so the AI reads more of the call within its context budget.

---

## Tips & notes

- **First local run downloads models.** Allow time; they're cached afterwards.
- **Long calls + local mode:** browser memory limits the local path. Keep transcripts compact (the app does this automatically) or use **Cloud mode**, which handles full-length calls easily.
- **Cloud keys are stored in the browser** — use a restricted key with a spend cap.
- **OpenCode Go isn't supported from a static page** (no CORS); use it with the official OpenCode app.
- **Choose the right local model for your machine.** SmolLM2 360M for CPU-only machines; Qwen2.5 on WebGPU for best quality.

---

## Privacy & security

- **Local mode: zero network transmission** of your audio or text (except one-time model downloads from Hugging Face).
- **Cloud mode:** your transcript, prompt, reference, and key are sent **directly** from your browser to the provider you configure — with no intermediaries in between, but the provider's terms apply.
- **No telemetry, no analytics, no cookies.**
- Recordings, transcripts, and settings live in your browser's local storage. **Clearing site data erases them permanently.**

---

## Requirements

| Requirement | Notes |
| --- | --- |
| **Modern browser** | Chrome / Edge / Firefox recommended |
| **Microphone + screen-share permission** | Required to record calls |
| **WebGPU** (optional) | Speeds up local AI; plain WASM/CPU works without it |
| **API key** (optional) | Only needed for Cloud API mode |
| **Storage space** | A few GB free for local models + long recordings |

---

## Known limitations

- **Small local models** are private but less capable than cloud LLMs — they can simplify nuance or follow formatting loosely.
- **Local mode memory ceiling:** WebAssembly is 32-bit (~4 GB heap cap), so long conversations in local mode can hit ONNX "tensor too large" / out-of-memory errors. The app auto-falls back to CPU and smaller models, but **Cloud mode is the reliable route for long calls**.
- **Cloud mode requires CORS-enabled providers** — OpenAI, Anthropic, Gemini, Groq, OpenRouter, and custom CORS-enabled endpoints work; others (e.g. OpenCode Go) don't.
- Trimming/compaction helps the AI, but the visible transcript is never modified without your say-so.

---

## License

Provided for personal/learning use. Local models are covered by their respective licenses (Whisper + ONNX repos — see Hugging Face). Cloud usage is subject to your provider's terms.
