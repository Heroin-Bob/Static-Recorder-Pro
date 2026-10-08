# Static Recorder Pro

> Record calls, get accurate transcripts, and draft AI notes — **all in your browser. Nothing is uploaded. Nothing leaves your machine.**

Static Recorder Pro is a fully self-contained, single-file web app. It records call audio (microphone + system audio simultaneously), transcribes it locally with Whisper, and writes summaries/notes/replies with a small local language model. It has no backend, no API keys, no accounts, and no data ever leaves your device.

---

## What it does

| Feature | Description |
| --- | --- |
| **Dual-track call recording** | Records the **Agent (microphone)** and **Caller (system audio)** as separate tracks so voices are easy to tell apart. |
| **Local transcription** | Whisper runs in-browser via [Transformers.js](https://huggingface.co/docs/transformers.js). Produces timestamped, speaker-labeled transcripts. |
| **Local AI notes** | A small instruction-following LLM summarizes the call, drafts reply emails, lists action items, and more — from the transcript. |
| **Call history** | Every recording + transcript is saved locally and listed with timestamps, durations, and quick actions. |
| **Export** | Download individual tracks (WAV), the full transcript (.txt), or the AI response (.txt). |

---

## 100% in-browser & local-first

- **No server.** The app is a single static `index.html`. It can be opened straight from disk (`file://`) or hosted on any static host (e.g. GitHub Pages).
- **No API keys, no accounts, no analytics.**
- **Nothing is uploaded.** Recordings, transcripts, and AI runs never leave your machine.
- **Works offline** after the models have been downloaded & cached once.

### Models that run on device

**Transcription (Whisper)**

| Model | Purpose | Size |
| --- | --- | --- |
| [whisper-tiny.en](https://huggingface.co/onnx-community/whisper-tiny.en) | Fastest | ~40 MB |
| [whisper-base.en](https://huggingface.co/onnx-community/whisper-base.en) | Default — balanced | ~40–90 MB |
| [whisper-small.en](https://huggingface.co/onnx-community/whisper-small.en) | High accuracy | ~150–230 MB |

**AI notes (LLM)**

| Model | Purpose | Size |
| --- | --- | --- |
| [Qwen2.5 1.5B Instruct](https://huggingface.co/onnx-community/Qwen2.5-1.5B-Instruct) | Best quality (recommended on WebGPU) | ~1.1 GB |
| [Qwen2.5 0.5B Instruct](https://huggingface.co/onnx-community/Qwen2.5-0.5B-Instruct) | Default — balanced | ~0.5 GB |
| [SmolLM2 360M Instruct](https://huggingface.co/onnx-community/SmolLM2-360M-Instruct-ONNX) | Fast / CPU mode | ~0.3 GB |
| [SmolLM2 135M Instruct](https://huggingface.co/onnx-community/SmolLM2-135M-Instruct-ONNX) | Smallest / fastest | ~0.2 GB |

Models are downloaded from Hugging Face **once** and cached by the browser; every run afterward works fully offline.

---

## Tech stack

| Technology | Role |
| --- | --- |
| HTML + CSS + vanilla JavaScript | Entire UI (single self-contained file) |
| [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder) | Browser audio capture (mic + tab/system audio) |
| [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) | Analyzers, live waveform visualizer, native 16 kHz resampling |
| [Transformers.js](https://huggingface.co/docs/transformers.js) | Rust/WASM + WebGPU runtime for Whisper & the LLM |
| [WebGPU](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API) | Accelerated inference when available (falls back to WASM/CPU) |
| [OPFS](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API) | Disk-backed streaming for large recordings |
| [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) | Local storage for recordings & transcripts |
| [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Worker_API) | Keeps transcription/AI off the main thread for a smooth UI |

---

## How to use it

### 1. Open the app

Simply open `index.html` in any modern browser (Chrome, Edge, Firefox). For **best AI model performance**, use Chrome or Edge with **hardware acceleration / WebGPU enabled**.

### 2. Record a call

1. Press **Start Recording**.
2. When prompted, choose your microphone, then share the call tab/window **and include system audio** (so the Caller's voice is captured).
3. Watch the live waveform meters, then press **Stop**.

> Your recording is saved locally the moment you stop.

### 3. Transcribe

1. Click **Transcribe Audio**.
2. Whisper processes the audio in chunks with live, streaming output.
3. You get a timestamped, speaker-labeled transcript (`[Agent]` / `[Caller]`).

### 4. Generate AI notes

1. The transcript appears in the **AI Assistant** box below.
2. (Optional) type a prompt, e.g. *"Summarize this call in 5 bullets"* or *"Draft a reply email to the client."*
3. Pick a **model** and **output style**, then press **Generate with AI**.
4. Responses stream in token-by-token. Select all or download as `.txt`.

### 5. Manage history

Use the **Call History** tab to listen, re-transcribe, load any saved transcript back into the AI, or delete recordings — all wiped cleanly when you choose **Clear All**.

---

## Fix slow AI generation

AI note generation is dramatically faster when it runs on the GPU. The page shows which mode you're currently using in a small badge in the **top-right of the screen** (the Status bar): `WebGPU Active` (GPU accelerated) or `WASM CPU Mode` (running on the CPU, often several times slower).

**If you see `WASM CPU Mode`, here's how to get `WebGPU Active`:**

1. Open `chrome://flags/#enable-vulkan` and set **Vulkan** to **Enabled**.
2. (Optional, to be safe) set these to **Enabled** too:
   - `chrome://flags/#enable-unsafe-webgpu`
   - `chrome://flags/#ignore-gpu-blocklist`
3. **Restart Chrome.**
4. Reload this page — the badge should now read **WebGPU Active**.

Notes & requirements:

- WebGPU requires **Chrome or Edge**. Firefox and Safari don't expose a working WebGPU adapter for this app, so they always fall back to CPU. **Note for Firefox users:** everything still works, it's just slower — the app runs in "WASM CPU Mode" and defaults to the smaller SmolLM2 model to keep generation usable. Firefox has experimental WebGPU (enable `dom.webgpu.enabled` in `about:config`), but support for this app's runtime is limited and unstable, so **Chrome/Edge is recommended for GPU-accelerated AI**.
- Make sure **hardware acceleration** is on: Settings → System → "Use graphics acceleration when available."
- On **Linux**, the WebGPU flag is the usual missing piece — Chrome's WebGPU backend needs Vulkan to reach the GPU, and it ships disabled by default.
- When running on **Windows/macOS**, WebGPU is generally on by default; if you still see WASM mode, check the three flags above.
- If a model still runs out of memory even on WebGPU, the app automatically retries with the next smaller model.

---

## Tips & notes

- **First run downloads models.** Allow time for the initial model download; it's cached afterwards.
- **Choose the right AI model for your machine.** Use `SmolLM2 360M` on CPU-only machines, `Qwen2.5 1.5B` on WebGPU for best quality. If a model runs out of memory, the app automatically retries with the next smaller one.
- **Trim long transcripts** in the editor if the AI seems to lose context on very long calls.
- **Privacy by design.** Close a long call, restart the browser — your history persists locally in IndexedDB.

---

## Privacy & security

- **Zero network transmission** of your audio or text (except the one-time model downloads from Hugging Face).
- **No telemetry, no analytics, no cookies.**
- All data lives in your browser's local storage. **Clearing site data erases it permanently.**

---

## Project structure

| File | Purpose |
| --- | --- |
| `index.html` | The entire application (HTML, CSS, JS) |
| `sw.js`, `coi-serviceworker.js` | Service worker + COOP/COEP so WebGPU/WASM works when hosted |
| `manifest.webmanifest` | PWA metadata |
| `icon.svg` | App icon |

---

## Requirements

| Requirement | Notes |
| --- | --- |
| **Modern browser** | Chrome / Edge / Firefox recommended |
| **Microphone + screen-share permission** | Required to record calls |
| **WebGPU** (optional) | Needed for large AI models; plain WASM/CPU works without it |
| **Storage space** | A few GB free for models + long recordings |

---

## Known limitations

- Small local models are fast and private, but less capable than cloud LLMs — they can occasionally simplify nuance or follow formatting loosely.
- Transcribing very long audio takes time (a few minutes per ~30 min of audio on CPU).
- Without WebGPU, large LLMs may hit browser memory limits (the app auto-falls back to smaller models).

---

## License

Provided for personal/learning use. Models are covered by their respective licenses (Whisper + Llama-derived ONNX repos — see Hugging Face).