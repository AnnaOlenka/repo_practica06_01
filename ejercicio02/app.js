// Elementos del DOM
const textarea = document.getElementById("participantsInput");
const modeSelect = document.getElementById("modeSelect");
const quantityInput = document.getElementById("quantityInput");
const teamTitle = document.getElementById("teamTitle");
const screenConfig = document.getElementById("screen-config");
const screenResult = document.getElementById("screen-result");
const teamsContainer = document.getElementById("teamsContainer");
const resultTitle = document.getElementById("resultTitle");

// ================= LOCAL STORAGE =================
window.addEventListener("load", () => {
  const saved = localStorage.getItem("participants");
  const savedTitle = localStorage.getItem("teamTitle");
  const savedMode = localStorage.getItem("sortMode");
  
  if (saved) textarea.value = saved;
  if (savedTitle) teamTitle.value = savedTitle;
  if (savedMode) modeSelect.value = savedMode;
});

textarea.addEventListener("input", () => {
  let lines = textarea.value.split("\n").slice(0, 100);
  textarea.value = lines.join("\n");
  localStorage.setItem("participants", textarea.value);
});

teamTitle.addEventListener("change", () => {
  localStorage.setItem("teamTitle", teamTitle.value);
});

modeSelect.addEventListener("change", () => {
  localStorage.setItem("sortMode", modeSelect.value);
});

// ================= UTILIDADES =================
function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), 3000);
}

// ================= GENERAR SORTEO =================
document.getElementById("generateBtn").addEventListener("click", () => {
  let participants = textarea.value
    .split("\n")
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .slice(0, 100);

  if (participants.length === 0) {
    showNotification("Agrega al menos un participante", "error");
    return;
  }

  const mode = modeSelect.value;
  const qty = parseInt(quantityInput.value);

  if (!qty || qty <= 0) {
    showNotification("Ingresa una cantidad válida", "error");
    return;
  }

  if (mode === "teams" && qty > participants.length) {
    showNotification(`No puedes crear ${qty} equipos con solo ${participants.length} participantes`, "error");
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
  showNotification("Sorteo generado exitosamente", "success");
});

// ================= MOSTRAR EQUIPOS =================
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

    team.forEach((member, i) => {
      setTimeout(() => {
        const p = document.createElement("p");
        p.textContent = `👤 ${member}`;
        div.appendChild(p);
      }, i * 150);
    });

    teamsContainer.appendChild(div);
  });

  window.generatedTeams = teams;
  
  // Scroll suave hacia los resultados
  setTimeout(() => {
    teamsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 300);
}

// ================= CREAR CONTENEDOR LIMPIO =================
function createCleanContainer() {
  const container = document.createElement('div');
  container.style.cssText = `
    background: white;
    padding: 40px;
    font-family: Arial, sans-serif;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    width: 100%;
  `;
  
  const title = document.createElement('h1');
  title.textContent = resultTitle.textContent;
  title.style.cssText = `
    grid-column: 1 / -1;
    text-align: center;
    color: #333;
    margin-bottom: 20px;
  `;
  container.appendChild(title);
  
  window.generatedTeams.forEach((team, index) => {
    const teamDiv = document.createElement('div');
    teamDiv.style.cssText = `
      background: white;
      border: 2px solid #333;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    `;
    
    const h3 = document.createElement('h3');
    h3.textContent = `Equipo ${index + 1}`;
    h3.style.cssText = `
      color: #333;
      margin: 0 0 15px 0;
      text-align: center;
      font-size: 18px;
      border-bottom: 2px solid #ddd;
      padding-bottom: 10px;
    `;
    teamDiv.appendChild(h3);
    
    team.forEach(member => {
      const p = document.createElement('p');
      p.textContent = member;
      p.style.cssText = `
        margin: 8px 0;
        padding: 8px 12px;
        background: #f5f5f5;
        color: #000;
        font-weight: 600;
        border-radius: 4px;
        font-size: 14px;
      `;
      teamDiv.appendChild(p);
    });
    
    container.appendChild(teamDiv);
  });
  
  return container;
}

// ================= DESCARGAR JPG =================
document.getElementById("downloadBtn").addEventListener("click", async () => {
  try {
    const container = createCleanContainer();
    document.body.appendChild(container);
    
    const canvas = await html2canvas(container, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false
    });
    
    document.body.removeChild(container);
    
    const link = document.createElement("a");
    link.download = "equipos.jpg";
    link.href = canvas.toDataURL('image/jpeg', 0.98);
    link.click();
    showNotification("Imagen descargada", "success");
  } catch (error) {
    showNotification("Error al descargar", "error");
  }
});

// ================= COPIAR IMAGEN =================
document.getElementById("copyImgBtn").addEventListener("click", async () => {
  try {
    const container = createCleanContainer();
    document.body.appendChild(container);
    
    const canvas = await html2canvas(container, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false
    });
    
    document.body.removeChild(container);
    
    canvas.toBlob(async blob => {
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob })
      ]);
      showNotification("Imagen copiada al portapapeles", "success");
    }, 'image/png', 0.98);
  } catch (error) {
    showNotification("Error al copiar imagen", "error");
  }
});

// ================= COPIAR TEXTO =================
document.getElementById("copyTextBtn").addEventListener("click", async () => {
  try {
    let text = `${resultTitle.textContent}\n${'='.repeat(40)}\n\n`;

    window.generatedTeams.forEach((team, i) => {
      text += `Equipo ${i + 1}\n`;
      text += team.map(m => `  👤 ${m}`).join("\n") + "\n\n";
    });

    await navigator.clipboard.writeText(text);
    showNotification("Texto copiado al portapapeles", "success");
  } catch (error) {
    showNotification("Error al copiar texto", "error");
  }
});

// ================= NUEVO SORTEO =================
document.getElementById("rerollBtn").addEventListener("click", () => {
  screenConfig.classList.remove("hidden");
  screenResult.classList.add("hidden");
  window.scrollTo({ top: 0, behavior: 'smooth' });
});