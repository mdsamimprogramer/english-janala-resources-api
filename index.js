// Utility: create HTML for synonyms
const createElement = (arr) => {
    if (!arr || arr.length === 0) return "<p class='text-gray-400'>No synonyms available</p>";
    return arr.map(el => `<span class="badge badge-outline m-1">${el}</span>`).join(" ");
};

// Spinner
const manageSpinner = (status) => {
    const spinner = document.getElementById("spinner");
    const wordContainer = document.getElementById("word-container");
    status ? (spinner.classList.remove("hidden"), wordContainer.classList.add("hidden"))
        : (spinner.classList.add("hidden"), wordContainer.classList.remove("hidden"));
};

// Load lessons
const loadLessons = () => {
    fetch("https://openapi.programming-hero.com/api/levels/all")
        .then(res => res.json())
        .then(json => displayLesson(json.data))
        .catch(() => {
            document.getElementById("level-container").innerHTML =
                `<p class="text-red-500">Failed to load lessons!</p>`;
        });
};

// Remove active
const removeActive = () => {
    document.querySelectorAll(".lesson-btn").forEach(btn => btn.classList.remove("btn-active"));
};

// Load words by lesson
const loadLevelWord = (id) => {
    manageSpinner(true);
    fetch(`https://openapi.programming-hero.com/api/level/${id}`)
        .then(res => res.json())
        .then(data => {
            removeActive();
            document.getElementById(`lesson-btn-${id}`).classList.add("btn-active");
            displayLevelWord(data.data);
            window.scrollTo({ top: document.getElementById("word-container").offsetTop - 80, behavior: "smooth" });
        })
        .catch(() => {
            manageSpinner(false);
            document.getElementById("word-container").innerHTML =
                `<p class="text-red-500 col-span-full text-center">Failed to load words!</p>`;
        });
};

// Load word details
const loadWordDetail = async (id) => {
    try {
        const res = await fetch(`https://openapi.programming-hero.com/api/word/${id}`);
        const details = await res.json();
        displayWordDetails(details.data);
    } catch {
        document.getElementById("detailsContainer").innerHTML = "<p class='text-red-500'>Error loading details</p>";
    }
};

// Show word details
const displayWordDetails = (word) => {
    const detailsBox = document.getElementById("detailsContainer");
    detailsBox.innerHTML = `
    <h2 class="text-2xl font-bold">${word.word || "N/A"} : <span class="text-sky-500">${word.pronunciation || "Not found"}</span></h2>
    <p><span class="font-bold">Meaning:</span> ${word.meaning || "No meaning available"}</p>
    <p><span class="font-bold">Example:</span> ${word.sentence || "No example available"}</p>
    <div>
      <h3 class="font-bold">Synonyms:</h3>
      <div class="flex flex-wrap">${createElement(word.synonyms)}</div>
    </div>
  `;
    document.getElementById("word_modal").showModal();
};

// Speak word (TTS)
const speakWord = (text) => {
    if ("speechSynthesis" in window) {
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = "en-US";
        speechSynthesis.speak(utter);
    }
};

// Show words
const displayLevelWord = (words) => {
    const wordContainer = document.getElementById("word-container");
    wordContainer.innerHTML = "";

    if (!words || words.length === 0) {
        wordContainer.innerHTML = `
      <div class="text-center bg-sky-100 col-span-full rounded-xl py-10 space-y-6">
        <img class="mx-auto w-20" src="assets/alert-error.png" alt="error">
        <p class="text-lg font-medium text-gray-500">এই Lesson এ Vocabulary নেই।</p>
      </div>`;
        manageSpinner(false);
        return;
    }

    words.forEach(word => {
        const card = document.createElement("div");
        card.className = "word-card bg-white rounded-xl shadow text-center py-8 px-5";
        card.innerHTML = `
      <h2 class="font-bold text-2xl">${word.word || "Word not found"}</h2>
      <p class="my-3 text-gray-500">Meaning / Pronunciation</p>
      <div class="text-lg font-medium mb-4">
        "${word.meaning || "N/A"} / ${word.pronunciation || "N/A"}"
      </div>
      <div class="flex justify-center gap-3">
        <button onclick="loadWordDetail(${word.id})" class="btn btn-info btn-sm">
          <i class="fa-solid fa-circle-info"></i>
        </button>
        <button onclick="speakWord('${word.word}')" class="btn btn-success btn-sm">
          <i class="fa-solid fa-volume-high"></i>
        </button>
      </div>
    `;
        wordContainer.append(card);
    });

    manageSpinner(false);
};

// Show lesson buttons
const displayLesson = (lessons) => {
    const levelContainer = document.getElementById("level-container");
    levelContainer.innerHTML = "";
    lessons.forEach(lesson => {
        const btn = document.createElement("button");
        btn.id = `lesson-btn-${lesson.level_no}`;
        btn.className = "btn btn-outline btn-primary lesson-btn";
        btn.innerHTML = `<i class="fa-solid fa-book-open"></i> Lesson - ${lesson.level_no}`;
        btn.onclick = () => loadLevelWord(lesson.level_no);
        levelContainer.append(btn);
    });
};

// Initial load
loadLessons();
