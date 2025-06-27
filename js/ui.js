import { exportCard } from "./export.js";
import { cargarClanes, cargarRecursos } from "./dataLoader.js";
import { renderCard } from "./cardRenderer.js";

const opciones = {
  tipo: "Estándar",
  tema: "Sangre",
  fondo: "",
  iconoTipo: "",
  clan: "",
  nombre: "",
  descripcion: "",
  imagen: null,
  imagenPosX: 0, // Posición horizontal de la imagen
  imagenPosY: 0, // Posición vertical de la imagen
  imagenAncho: 0, // Ancho original de la imagen
  imagenAlto: 0, // Alto original de la imagen
};

export async function initializeUI() {
  // Get references to static elements
  const tipoSelect = document.getElementById('tipoSelect');
  const temaMarcoSelect = document.getElementById('temaMarcoSelect');
  const fondoSelect = document.getElementById('fondoSelect');
  const iconoTipoSelect = document.getElementById('iconoTipoSelect');
  const clanSelect = document.getElementById('clanSelect');
  const nombreInput = document.getElementById('nombreInput');
  const descInput = document.getElementById('descInput');
  const fileInput = document.getElementById('fileInput');
  const urlInput = document.getElementById('urlInput');
  const sliderX = document.getElementById('sliderX');
  const sliderXValue = document.getElementById('sliderXValue');
  const sliderY = document.getElementById('sliderY');
  const sliderYValue = document.getElementById('sliderYValue');
  const exportBtn = document.getElementById('exportBtn');
  const card = document.getElementById('card');

  // Cargar recursos
  const recursos = await cargarRecursos();
  const clanes = await cargarClanes();

  // Populate Select Elements
  // Tipo de Carta
  ["Estándar", "Minimalista"].forEach(tipo => {
    const opt = document.createElement("option");
    opt.value = tipo;
    opt.textContent = tipo;
    tipoSelect.appendChild(opt);
  });

  // Tema del marco
  recursos.temasMarco.forEach(tema => {
    const opt = document.createElement("option");
    opt.value = tema;
    opt.textContent = tema;
    temaMarcoSelect.appendChild(opt);
  });

  // Fondo
  recursos.fondos.forEach(({ value, name }) => {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = name;
    fondoSelect.appendChild(opt);
  });

  // Icono Tipo
  recursos.iconosTipo.forEach(({ value, name }) => {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = name;
    iconoTipoSelect.appendChild(opt);
  });

  // Clan
  Object.entries(clanes).forEach(([nombre, ruta]) => {
    const opt = document.createElement("option");
    opt.value = ruta;
    opt.textContent = nombre;
    clanSelect.appendChild(opt);
  });

  // Attach Event Listeners
  tipoSelect.addEventListener("change", () => {
    opciones.tipo = tipoSelect.value;
    renderCard(card);
  });

  temaMarcoSelect.addEventListener("change", () => {
    opciones.tema = temaMarcoSelect.value;
    renderCard(card);
  });

  fondoSelect.addEventListener("change", () => {
    opciones.fondo = fondoSelect.value;
    renderCard(card);
  });

  iconoTipoSelect.addEventListener("change", () => {
    opciones.iconoTipo = iconoTipoSelect.value;
    renderCard(card);
  });

  clanSelect.addEventListener("change", () => {
    opciones.clan = clanSelect.value;
    renderCard(card);
  });

  nombreInput.addEventListener("input", () => {
    opciones.nombre = nombreInput.value;
    renderCard(card);
  });

  descInput.addEventListener("input", () => {
    opciones.descripcion = descInput.value;
    renderCard(card);
  });

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const imgTemp = new Image();
      imgTemp.onload = function() {
        opciones.imagen = ev.target.result;
        opciones.imagenAncho = imgTemp.naturalWidth;
        opciones.imagenAlto = imgTemp.naturalHeight;
        opciones.imagenPosX = 0;
        opciones.imagenPosY = 0;
        sliderX.value = 0;
        sliderY.value = 0;
        sliderXValue.textContent = "0";
        sliderYValue.textContent = "0";
        renderCard(card);
      };
      imgTemp.src = ev.target.result;
    };
  reader.readAsDataURL(file);
  });

  function handleUrlInput() {
    const url = urlInput.value.trim();
    if (!url) return;
    const imgTemp = new Image();
    imgTemp.crossOrigin = "anonymous";
    imgTemp.onload = function() {
      opciones.imagen = url;
      opciones.imagenAncho = imgTemp.naturalWidth;
      opciones.imagenAlto = imgTemp.naturalHeight;
      opciones.imagenPosX = 0;
      opciones.imagenPosY = 0;
      sliderX.value = 0;
      sliderY.value = 0;
      sliderXValue.textContent = "0";
      sliderYValue.textContent = "0";
      renderCard(card);
    };
    imgTemp.onerror = function() {
      console.error("Error loading image from URL:", url);
    };
    imgTemp.src = url;
  }

  urlInput.addEventListener("change", handleUrlInput);
  urlInput.addEventListener("input", handleUrlInput);

  sliderX.addEventListener("input", () => {
    opciones.imagenPosX = parseInt(sliderX.value);
    sliderXValue.textContent = sliderX.value;
    const cardElement = document.getElementById('card'); // or use the 'card' variable directly
    if (cardElement) {
      const imageElement = cardElement.querySelector('.imagen');
      if (imageElement) {
        imageElement.style.transform = `translate(${opciones.imagenPosX}px, ${opciones.imagenPosY}px)`;
      }
    }
  });

  sliderY.addEventListener("input", () => {
    opciones.imagenPosY = parseInt(sliderY.value);
    sliderYValue.textContent = sliderY.value;
    const cardElement = document.getElementById('card'); // or use the 'card' variable directly
    if (cardElement) {
      const imageElement = cardElement.querySelector('.imagen');
      if (imageElement) {
        imageElement.style.transform = `translate(${opciones.imagenPosX}px, ${opciones.imagenPosY}px)`;
      }
    }
  });

  exportBtn.onclick = exportCard;

  // Initial render
  renderCard(card, opciones);
}
