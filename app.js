const story = {
  start: {
    chapter: "CHAPTER 01",
    progress: "THE CALLING",
    location: "The Shoreline",
    kicker: "THE NIGHT THE STARS WENT OUT",
    title: "A light beneath the waves",
    text: "At the edge of the world, where the sea keeps its oldest secrets, you hear a voice beneath the tide. The lighthouse has been dark for a hundred years. Tonight, a blue light flickers in its abandoned tower — and the water is whispering your name.",
    choices: [
      { label: "Follow the light", next: "lighthouse" },
      { label: "Answer the voice", next: "voice" }
    ]
  },
  lighthouse: {
    chapter: "CHAPTER 02",
    progress: "THE LIGHTHOUSE",
    location: "The Old Lighthouse",
    kicker: "A DOOR THAT REMEMBERS",
    title: "The key of moonlight",
    text: "You climb the cliff path toward the tower. Its iron door opens before you touch it. Inside, a silver key hangs in the air, turning slowly. A child's voice drifts from above: “Only one promise may wake the flame.”",
    choices: [
      { label: "Take the silver key", next: "keeper" },
      { label: "Call out to the child", next: "library" }
    ]
  },
  voice: {
    chapter: "CHAPTER 02",
    progress: "THE TIDE CAVERN",
    location: "The Singing Caves",
    kicker: "WHERE THE OCEAN DREAMS",
    title: "The voice in the dark",
    text: "You answer, and the sea pulls back like a curtain. A staircase appears beneath the foam. Down below, a constellation glows inside the cavern wall. The voice asks, “Will you carry our story to the shore?”",
    choices: [
      { label: "Promise to remember", next: "keeper" },
      { label: "Ask who is speaking", next: "library" }
    ]
  },
  keeper: {
    chapter: "CHAPTER 03",
    progress: "THE LAST PROMISE",
    location: "The Lantern Room",
    kicker: "THE KEEPER AWAKENS",
    title: "A flame for every heart",
    text: "The key melts into your palm, warm as sunrise. The tower fills with the memory of every sailor it once guided home. You understand now: the lighthouse was never powered by oil, but by a promise kept across generations.",
    choices: [
      { label: "Light the beacon", next: "ending-light" },
      { label: "Carry the flame home", next: "ending-home" }
    ]
  },
  library: {
    chapter: "CHAPTER 03",
    progress: "THE HIDDEN LIBRARY",
    location: "The Archive Below",
    kicker: "A STORY WITHOUT AN END",
    title: "The book that breathes",
    text: "A hidden library unfolds beneath the lighthouse. Every book is blank except one, whose pages turn in the wind. On the final page, you find your own name — followed by a question waiting for your voice.",
    choices: [
      { label: "Write your own ending", next: "ending-light" },
      { label: "Close the book", next: "ending-home" }
    ]
  },
  "ending-light": {
    chapter: "EPILOGUE",
    progress: "THE BEACON RETURNS",
    location: "The Horizon",
    kicker: "A NEW CONSTELLATION",
    title: "The shore remembers",
    text: "You speak the promise aloud. The lighthouse ignites, and a warm golden beam sweeps across the sea. Far away, lanterns answer one by one. By dawn, the village knows your name — not as a hero, but as the voice that brought the stars home.",
    choices: []
  },
  "ending-home": {
    chapter: "EPILOGUE",
    progress: "THE STORY GOES ON",
    location: "Your Doorstep",
    kicker: "THE QUIETEST KIND OF MAGIC",
    title: "A light you can carry",
    text: "You leave the tower before sunrise, carrying a small blue flame in a glass jar. It does not burn your hand. Wherever you go, lost travelers find their way — and the sea keeps one secret less than it did before.",
    choices: []
  }
};

const state = { scene: "start", muted: false, recognition: null };
const $ = (id) => document.getElementById(id);
let toastTimer;

function speak(text) {
  if (state.muted || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.92;
  utterance.pitch = 0.92;
  utterance.onstart = () => {
    $("narration-label").textContent = "Narrating...";
    $("narration-dot").classList.add("speaking");
  };
  utterance.onend = () => {
    $("narration-label").textContent = "Narration ready";
    $("narration-dot").classList.remove("speaking");
  };
  window.speechSynthesis.speak(utterance);
}

function renderScene(shouldSpeak = true) {
  const scene = story[state.scene];
  $("chapter-label").textContent = scene.chapter;
  $("progress-label").textContent = scene.progress;
  $("location-label").textContent = scene.location;
  $("scene-kicker").textContent = scene.kicker;
  $("scene-title").textContent = scene.title;
  $("story-text").textContent = scene.text;
  const sceneNumber = state.scene === "start" ? 1 : scene.chapter === "EPILOGUE" ? 4 : 2 + (["keeper", "library"].includes(state.scene) ? 1 : 0);
  $("scene-count").textContent = `${sceneNumber} / 4`;
  $("progress-bar").style.width = `${sceneNumber * 25}%`;
  $("choices").innerHTML = scene.choices.length
    ? scene.choices.map((choice, index) => `<button class="choice-button" type="button" data-next="${choice.next}"><span class="choice-index">${index + 1}</span><strong>${choice.label}</strong></button>`).join("")
    : `<button class="choice-button" type="button" data-next="start"><span class="choice-index">↻</span><strong>Begin a new story</strong></button>`;
  document.querySelectorAll(".choice-button").forEach((button) => button.addEventListener("click", () => choose(button.dataset.next)));
  $("voice-title").textContent = scene.choices.length ? "Listening for your voice" : "The story is complete";
  $("voice-hint").textContent = scene.choices.length ? "Press the microphone, then say your choice" : "Restart to explore another path";
  $("mic-button").disabled = !scene.choices.length;
  $("mic-button").style.opacity = scene.choices.length ? "1" : ".45";
  if (shouldSpeak) speak(`${scene.title}. ${scene.text}`);
}

function choose(nextScene) {
  state.scene = nextScene;
  $("heard-text").textContent = "—";
  renderScene();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 3500);
}

function matchChoice(transcript) {
  const choices = story[state.scene].choices;
  const words = transcript.toLowerCase().split(/\s+/);
  return choices.find((choice) => choice.label.toLowerCase().split(/\s+/).some((word) => words.includes(word)));
}

function startListening() {
  if (!state.recognition) {
    showToast("Voice input is not supported here. Use the buttons or type a choice.");
    return;
  }
  state.recognition.start();
  $("mic-button").classList.add("listening");
  $("voice-orb").classList.add("listening");
  $("voice-title").textContent = "Listening...";
  $("voice-hint").textContent = "Say one of the choices";
}

function setupRecognition() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    $("voice-title").textContent = "Voice input unavailable";
    $("voice-hint").textContent = "Use the choices or type your answer";
    return;
  }
  state.recognition = new Recognition();
  state.recognition.lang = "en-US";
  state.recognition.interimResults = false;
  state.recognition.maxAlternatives = 1;
  state.recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim();
    $("heard-text").textContent = `"${transcript}"`;
    const matched = matchChoice(transcript);
    if (matched) choose(matched.next);
    else showToast("I didn't catch one of the choices. Try again.");
  };
  state.recognition.onerror = (event) => {
    if (event.error !== "no-speech") showToast(`Microphone error: ${event.error}. You can tap a choice instead.`);
  };
  state.recognition.onend = () => {
    $("mic-button").classList.remove("listening");
    $("voice-orb").classList.remove("listening");
    $("voice-title").textContent = "Listening for your voice";
    $("voice-hint").textContent = "Press the microphone, then say your choice";
  };
}

$("mic-button").addEventListener("click", startListening);
$("listen-button").addEventListener("click", () => speak(`${story[state.scene].title}. ${story[state.scene].text}`));
$("restart-button").addEventListener("click", () => {
  if (state.recognition) state.recognition.abort();
  state.scene = "start";
  renderScene();
});
$("sound-toggle").addEventListener("click", () => {
  state.muted = !state.muted;
  $("sound-toggle").textContent = state.muted ? "◌" : "◖";
  $("sound-toggle").setAttribute("aria-label", state.muted ? "Unmute narration" : "Mute narration");
  if (state.muted) window.speechSynthesis?.cancel();
  showToast(state.muted ? "Narration muted" : "Narration on");
});
$("submit-typed").addEventListener("click", () => {
  const value = $("choice-input").value.trim();
  if (!value) return;
  $("heard-text").textContent = `"${value}"`;
  const matched = matchChoice(value);
  if (matched) {
    $("choice-input").value = "";
    choose(matched.next);
  } else showToast("Try using a word from one of the choices.");
});
$("choice-input").addEventListener("keydown", (event) => {
  if (event.key === "Enter") $("submit-typed").click();
});

setupRecognition();
renderScene();
