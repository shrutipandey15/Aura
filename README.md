
# Aura: A Deep Dive into Real-Time AI Character Chat

Aura is an interactive web application that allows you to design, test, and have real-time voice conversations with custom AI characters. It serves as a comprehensive demonstration of the Google Gemini Live API, showcasing how to build low-latency, engaging, and dynamic conversational experiences with modern web technologies.

This document provides an in-depth look at the project's architecture, technology stack, and core mechanics.

---

## Core Features

-   **Real-Time, Two-Way Voice Conversation:** Engage in natural, fluid voice chats with an AI that can listen and respond simultaneously.
-   **Dynamic Character Creation:** Design your own "Auras" by defining their name, personality, appearance (color), and voice.
-   **Pre-built Voices:** Utilizes a library of high-quality, pre-trained text-to-speech voice models provided by Google.
-   **Expressive, Audio-Reactive Animation:** The character's face animates in real-time, with its mouth moving in sync with the AI's speech, creating a more lifelike interaction.
-   **Modern, Build-less Frontend Architecture:** Leverages native ES Modules and Import Maps, eliminating the need for a complex build setup and enabling rapid development.

---

## Architectural Philosophy

The application is built around three core principles:

1.  **Low Latency is Paramount:** Every technical decision is made to minimize the delay between user speech, AI processing, and audio response. This is achieved through bidirectional streaming and efficient, off-the-main-thread audio processing.
2.  **Simplicity and Portability:** By avoiding a traditional build step (like Webpack or Vite), the project is incredibly simple to run. It's just a set of static files that can be served from any basic HTTP server, making it highly portable.
3.  **Clear Separation of Concerns:** The code is logically divided into distinct modules:
    - **API Communication (`GenAILiveClient`):** A dedicated client to handle all interactions with the Gemini Live API.
    - **Global State (`Zustand`):** A centralized store for agent profiles, user settings, and UI state.
    - **Audio Handling (`AudioRecorder`, `AudioStreamer`):** Specialized classes for managing the complexities of microphone input and speaker output.
    - **UI (`React Components`):** The declarative UI layer, which reacts to changes in state and API events.

---

## Technology Deep Dive

### 1. Google Gemini Live API (`@google/genai`)

This is the core engine of the application. The Gemini Live API is not a simple request-response service; it's a stateful, bidirectional streaming service that handles the entire conversational pipeline on the server.

-   **Bidirectional Streaming:** The connection is established via a WebSocket. The app continuously streams the user's microphone audio *to* the server while simultaneously receiving the AI's audio response *from* the server.
-   **Server-Side Speech-to-Text (STT):** The application sends raw audio data. The Gemini service transcribes this audio into text in real-time.
-   **LLM Processing:** The transcribed text is fed to the Gemini model. The model uses the **System Instruction** (the character's personality prompt) and the conversation history to generate a text response.
-   **Server-Side Text-to-Speech (TTS):** The model's text response is immediately converted into audio on Google's servers using the specified high-quality, pre-built voice (e.g., `Leda`, `Fenrir`). This audio is then streamed back to the application as PCM data chunks.

### 2. Web Audio API & AudioWorklets

To handle audio with high performance and without blocking the user interface, the application makes extensive use of the Web Audio API and, crucially, **AudioWorklets**. AudioWorklets run in a separate thread, ensuring that complex audio processing doesn't cause UI stutter or lag.

#### Input Pipeline (`AudioRecorder`)

1.  **Capture:** `navigator.mediaDevices.getUserMedia` captures the raw microphone stream.
2.  **Processing:** The stream is piped into a custom `AudioProcessingWorklet`. This worklet's job is to:
    -   Receive the audio as a `Float32Array`.
    -   Convert it into the 16-bit PCM format expected by the Gemini API.
    -   Buffer the data into appropriately sized chunks.
    -   Send these chunks back to the main thread using `port.postMessage`.
3.  **Transmission:** The main thread receives these chunks from the worklet and sends them to the Gemini API via the WebSocket connection.

#### Output Pipeline (`AudioStreamer`)

1.  **Receiving Data:** The app receives PCM audio chunks from the Gemini API.
2.  **Scheduling Playback:** The `AudioStreamer` class is responsible for playing these chunks seamlessly. It does this by:
    -   Creating an `AudioBufferSourceNode` for each incoming chunk.
    -   Precisely scheduling each node to start playing the moment the previous one finishes, using `source.start(scheduledTime)`. This prevents gaps or overlaps in the audio.
3.  **Volume Metering:** A second `VolMeterWorklet` is attached to this output pipeline. It calculates the Root Mean Square (RMS) of the audio samples in real-time, which provides an accurate measure of the audio's volume. This volume data is sent back to the main thread and is used to drive the character's mouth animation.

### 3. State Management (`Zustand`)

Zustand is used for a simple and clean global state solution. The state is divided into logical "stores":

-   `useUser`: Stores the user's name and any provided info. This is used to personalize the system prompt.
-   `useAgent`: Manages the list of available agents (both presets and user-created ones) and tracks which agent is currently active.
-   `useUI`: Controls the visibility of UI elements like the settings and agent editor modals.

### 4. Rendering (`React`)

React is used to build the user interface. The `LiveAPIContext` is a key piece, providing the `GenAILiveClient` instance and its state (like `connected` status and `volume`) to any component that needs it, avoiding complex prop-drilling.

---

## Execution Flow: A Step-by-Step User Journey

1.  **App Load:** The `index.html` loads. The import map resolves dependencies from `esm.sh`, and `index.tsx` renders the React `App`.
2.  **Initialization:** The `LiveAPIProvider` is rendered, which initializes the `useLiveApi` hook. The `GenAILiveClient` is created but remains disconnected.
3.  **User Clicks Play:** The user clicks the "Play" button in the `ControlTray`.
4.  **Configuration:** The `KeynoteCompanion` component reads the current agent's profile (e.g., 'Chef Shane') and the user's info from the Zustand stores. It uses `createSystemInstructions` to build the full personality prompt.
5.  **Connection:** The `connect` function is called. The `GenAILiveClient` establishes a WebSocket connection to the Gemini Live API, sending the system instruction and voice configuration as part of the handshake.
6.  **Microphone Activation:** An effect in `ControlTray` detects the `connected` state change and calls `audioRecorder.start()`. The browser prompts the user for microphone permission.
7.  **User Speaks:** The **Input Pipeline** activates. The user's voice is captured, processed by the worklet, and streamed to the Gemini API.
8.  **AI Responds:** Gemini processes the input and begins streaming back audio. The **Output Pipeline** activates. `AudioStreamer` receives the audio chunks and schedules them for seamless playback.
9.  **Animation Sync:** As the AI's voice is played, the `VolMeterWorklet` calculates the volume. This value is passed up to the `BasicFace` component, which adjusts the `mouthScale` parameter in its render loop, causing the character's mouth to open and close in sync with the sound.
10. **User Clicks Pause:** The `disconnect` function is called, which closes the WebSocket. `audioRecorder.stop()` and `audioStreamer.stop()` are called to release the microphone and clear any remaining audio queues. The app returns to its idle state.

---

## How to Run Locally

This is a build-less application. You only need a simple local web server.

### Prerequisites

-   A **Google AI Studio API key**.
-   A modern web browser (e.g., Chrome, Firefox).
-   A working microphone.

### Setup

1.  **API Key Configuration:** The application is hardcoded to look for the API key in `process.env.API_KEY`. Since this is a browser-based app without a build step, you must manually replace this in the code.
    -   Open the file `App.tsx`.
    -   Find the line: `const API_KEY = process.env.API_KEY as string;`
    -   Replace it with your actual API key: `const API_KEY = 'YOUR_API_KEY_HERE';`

2.  **Start a Local Server:**
    -   Navigate to the project's root directory in your terminal.
    -   `npm run dev`

3.  **Open the App:**
    -   Open your web browser and navigate to the local URL provided by your server (e.g., `http://localhost:8000` or `http://localhost:3000`).

---

## Customizing and Extending

### Adding a New Character

1.  **Define the Agent:** Open `lib/presets/agents.ts`. Create a new `Agent` object, defining its `id`, `name`, `personality` prompt, `bodyColor`, and `voice`.
2.  **Register the Agent:** Open `lib/state.ts`. Import your new agent and add it to the `availablePresets` array within the `useAgent` store.

The new character will now appear in the character selection dropdown.