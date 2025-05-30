import { exportCard } from "./export.js";
import { cargarClanes, cargarRecursos } from "./dataLoader.js";

// createImageElement remains as it's used by card rendering functions
function createImageElement(opciones, imageClassName, containerElement) {
  if (!opciones.imagen) {
    return null;
  }

  const imagen = document.createElement("img");
  imagen.className = `imagen ${imageClassName || ""}`.trim();
  imagen.src = opciones.imagen;
  // Apply initial transform using current values from opciones
  imagen.style.transform = `translate(${opciones.imagenPosX}px, ${opciones.imagenPosY}px)`;

  const imgTemp = new Image();
  imgTemp.src = opciones.imagen;

  imgTemp.onload = function() {
    imagen.style.width = imgTemp.naturalWidth + "px";
    imagen.style.height = imgTemp.naturalHeight + "px";
    imagen.style.minWidth = "unset";
    imagen.style.minHeight = "unset";
    imagen.style.position = "absolute"; // Required for top/left centering

    // Centering logic, ensure containerElement is valid
    if (containerElement && typeof containerElement.offsetWidth === 'number' && typeof containerElement.offsetHeight === 'number') {
      if (imgTemp.naturalWidth < containerElement.offsetWidth) {
        imagen.style.left = ((containerElement.offsetWidth - imgTemp.naturalWidth) / 2) + "px";
      } else {
        imagen.style.left = "0px"; // Default if image is wider than container
      }
      if (imgTemp.naturalHeight < containerElement.offsetHeight) {
        imagen.style.top = ((containerElement.offsetHeight - imgTemp.naturalHeight) / 2) + "px";
      } else {
        imagen.style.top = "0px"; // Default if image is taller than container
      }
    } else {
        // Fallback if container dimensions aren't available, though this is not ideal.
        // This might happen if elements are not fully rendered/attached.
        imagen.style.left = "0px";
        imagen.style.top = "0px";
    }
  };

  imgTemp.onerror = function() {
    console.error("Error loading image for card:", opciones.imagen);
    // Optionally, clear the src or set a placeholder style
    imagen.src = ""; // Prevents broken image icon if desired
  };

  return imagen;
}

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
  renderCard(card);
}

function renderCard(card) {
  card.innerHTML = "";
  switch (opciones.tipo) {
    case "Estándar":
      createStandardCard(card, opciones);
      break;
    case "Minimalista":
      createMinimalisticCard(card, opciones);
      break;
  }
}

function createStandardCard(card, opciones) {
  const marco = document.createElement("div");
  marco.className = `marco ${opciones.tema}`;

  const imageContainer = document.createElement("div");
  imageContainer.className = "standard-image-container";

  const bloqueImagenFondo = document.createElement("div");
  bloqueImagenFondo.className = "standard-bloque-imagen-fondo";
  bloqueImagenFondo.style.background = opciones.fondo;

  const bloqueImagen = document.createElement("div");
  bloqueImagen.className = "standard-bloque-imagen";

  // Use the new helper function to create the image
  const imagenElement = createImageElement(opciones, "", bloqueImagen);
  if (imagenElement) {
    bloqueImagen.appendChild(imagenElement);
  }

  const textContainer = document.createElement("div");
  textContainer.className = "text-container";

  const bloqueTextoFondo = document.createElement("div");
  bloqueTextoFondo.className = "bloque-texto-fondo";
  bloqueTextoFondo.style.background = opciones.fondo;

  const bloqueTexto = document.createElement("div");
  bloqueTexto.className = "bloque-texto";

  const nombre = document.createElement("div");
  nombre.className = "nombre";
  nombre.textContent = opciones.nombre;

  const descripcion = document.createElement("div");
  descripcion.className = "descripcion";
  descripcion.textContent = opciones.descripcion;

  bloqueTexto.append(nombre, descripcion);
  bloqueTextoFondo.appendChild(bloqueTexto);
  textContainer.appendChild(bloqueTextoFondo);

  imageContainer.appendChild(bloqueImagenFondo);
  imageContainer.appendChild(bloqueImagen);

  const iconoTipo = document.createElement("img");
  iconoTipo.className = "icono-tipo";
  iconoTipo.src = opciones.iconoTipo;

  const iconoClan = document.createElement("img");
  iconoClan.className = "icono-clan";
  iconoClan.src = opciones.clan;

  marco.appendChild(imageContainer);
  marco.appendChild(textContainer);
  card.append(marco, iconoTipo, iconoClan);
}

function createMinimalisticCard(card, opciones) {
  const marco = document.createElement("div");
  marco.className = `marco ${opciones.tema}`;

  const imageContainer = document.createElement("div");
  imageContainer.className = "minimalista-image-container";

  const bloqueImagenFondo = document.createElement("div");
  bloqueImagenFondo.className = "minimalista-bloque-imagen-fondo";
  bloqueImagenFondo.style.background = opciones.fondo;

  const bloqueImagen = document.createElement("div");
  bloqueImagen.className = "minimalista-bloque-imagen";

  // Use the new helper function to create the image
  const imagenElement = createImageElement(opciones, "minimalista", bloqueImagen);
  if (imagenElement) {
    bloqueImagen.appendChild(imagenElement);
  }

  imageContainer.appendChild(bloqueImagenFondo);
  imageContainer.appendChild(bloqueImagen);
  marco.appendChild(imageContainer);

  card.append(marco);
}
