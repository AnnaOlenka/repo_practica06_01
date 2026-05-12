const textarea = document.getElementById("participantsInput");
const modeSelect = document.getElementById("modeSelect");
const quantityInput = document.getElementById("quantityInput");
const teamTitle = document.getElementById("teamTitle");

const screenConfig = document.getElementById("screen-config");
const screenResult = document.getElementById("screen-result");

const teamsContainer = document.getElementById("teamsContainer");
const resultTitle = document.getElementById("resultTitle");

// ================= LOCAL STORAGE =================
window.onload = () => {
  const saved = localStorage.getItem("participants");
  if (saved) textarea.value = saved;
};

textarea.addEventListener("input", () => {
  let lines = textarea.value.split("\n").slice(0, 100);
  textarea.value = lines.join("\n");
  localStorage.setItem("participants", textarea.value);
});

// ================= UTIL =================
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// ================= GENERAR =================
document.getElementById("generateBtn").addEventListener("click", () => {

  let participants = textarea.value
    .split("\n")
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .slice(0, 100);

  if (participants.length === 0) {
    alert("Agrega participantes");
    return;
  }

  const mode = modeSelect.value;
  const qty = parseInt(quantityInput.value);

  if (!qty || qty <= 0) {
    alert("Ingresa una cantidad válida");
    return;
  }

  participants = shuffle(participants);

  let teams = [];

  if (mode === "teams") {
    let teamCount = qty;
    for (let i = 0; i < teamCount; i++) teams.push([]);

    participants.forEach((p, i) => {
      teams[i % teamCount].push(p);
    });

  } else {
    let perTeam = qty;
    for (let i = 0; i < participants.length; i += perTeam) {
      teams.push(participants.slice(i, i + perTeam));
    }
  }

  showTeams(teams);
});

// ================= MOSTRAR =================
function showTeams(teams) {

  screenConfig.classList.add("hidden");
  screenResult.classList.remove("hidden");

  resultTitle.textContent = teamTitle.value || "Equipos Generados";

  teamsContainer.innerHTML = "";

  teams.forEach((team, index) => {

    const div = document.createElement("div");
    div.className = "team";

    const title = document.createElement("h3");
    title.textContent = `Equipo ${index + 1}`;

    div.appendChild(title);

    // animación uno por uno
    team.forEach((member, i) => {
      setTimeout(() => {
        const p = document.createElement("p");
        p.textContent = member;
        div.appendChild(p);
      }, i * 300);
    });

    teamsContainer.appendChild(div);
  });

  window.generatedTeams = teams;
}

// ================= DESCARGAR JPG =================
document.getElementById("downloadBtn").addEventListener("click", () => {
  html2canvas(teamsContainer).then(canvas => {
    const link = document.createElement("a");
    link.download = "equipos.jpg";
    link.href = canvas.toDataURL();
    link.click();
  });
});

// ================= COPIAR IMAGEN =================
document.getElementById("copyImgBtn").addEventListener("click", async () => {
  const canvas = await html2canvas(teamsContainer);
  canvas.toBlob(async blob => {
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob })
    ]);
    alert("Imagen copiada");
  });
});

// ================= COPIAR TEXTO =================
document.getElementById("copyTextBtn").addEventListener("click", () => {

  let text = "";

  window.generatedTeams.forEach((team, i) => {
    text += `Equipo ${i + 1}\n`;
    text += team.join("\n") + "\n\n";
  });

  navigator.clipboard.writeText(text);
  alert("Texto copiado");
});

// ================= VOLVER A SORTEAR =================
document.getElementById("rerollBtn").addEventListener("click", () => {
  screenConfig.classList.remove("hidden");
  screenResult.classList.add("hidden");
});