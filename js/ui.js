import { exportCard } from "./export.js";
import { cargarClanes, cargarRecursos } from "./dataLoader.js";

// Helper functions
function createLabeledSelect(labelText, optionsArray, onChangeCallback) {
  const label = document.createElement("label");
  label.textContent = labelText;

  const select = document.createElement("select");
  optionsArray.forEach((option) => {
    const opt = document.createElement("option");
    if (typeof option === "string") {
      opt.value = option;
      opt.textContent = option;
    } else {
      opt.value = option.value;
      opt.textContent = option.name;
    }
    select.appendChild(opt);
  });

  if (onChangeCallback) {
    select.addEventListener("change", onChangeCallback);
  }

  // Returning the select element directly, label is handled by text node or specific label element.
  // The original code often had text nodes like "Tipo de carta:" directly appended.
  // For more complex cases, a container div might be better, but this aligns with current structure.
  // Let's refine this: the prompt asked for label and select.
  // The original code uses text nodes for labels. We'll create a proper label element.
  const container = document.createElement('div');
  // container.appendChild(label); // The original code appends text nodes, then the select.
                                // We will return select and the caller can decide how to add the label.
                                // Let's return an object with label and select for flexibility.
  // No, the prompt says: "Appends the label and select to a container div or directly returns them"
  // "Returns the created elements (e.g., the container div or the select element itself if the label is handled separately)."
  // The original code structure is `controles.append(document.createTextNode("Label text:"), selectElement)`.
  // So, it's better to return just the select element and let the caller handle the label.
  // Or, create the label and return both, and the caller can append them.
  // Let's stick to returning the select element and let createUI handle the label text node for now to minimize changes to createUI's append structure.
  // Upon review, the prompt is clearer: "Creates a `<label>`, a `<select>` element... Appends the label and select to a container `div`... Returns the created elements (e.g., the container div)"
  // So, a container div with label and select is appropriate.
  
  const controlContainer = document.createElement("div");
  controlContainer.appendChild(label);
  controlContainer.appendChild(select);
  // To maintain similar spacing as original (which used <br>), we might add a br here or handle it in createUI
  return { element: controlContainer, selectElement: select };
}

function createTextInput(placeholder, onInputCallback) {
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = placeholder;
  if (onInputCallback) {
    input.addEventListener("input", onInputCallback);
  }
  return input;
}

function createTextArea(placeholder, onInputCallback) {
  const textarea = document.createElement("textarea");
  textarea.placeholder = placeholder;
  if (onInputCallback) {
    textarea.addEventListener("input", onInputCallback);
  }
  return textarea;
}

function createFileInput(accept, onChangeCallback) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = accept;
  if (onChangeCallback) {
    input.addEventListener("change", onChangeCallback);
  }
  return input;
}

function createImagePositionSliders(min, max, initialValue, onInputXCallback, onInputYCallback) {
  const container = document.createElement("div");
  container.className = "slider-container";

  // Slider X
  const labelX = document.createElement("label");
  labelX.textContent = "Posición horizontal:";
  const sliderX = document.createElement("input");
  sliderX.type = "range";
  sliderX.min = min;
  sliderX.max = max;
  sliderX.value = initialValue;
  sliderX.className = "position-slider";
  const valueX = document.createElement("span");
  valueX.className = "slider-value";
  valueX.textContent = initialValue;

  sliderX.addEventListener("input", (event) => {
      if (onInputXCallback) onInputXCallback(event);
      valueX.textContent = sliderX.value; // Update value display
  });
  

  // Slider Y
  const labelY = document.createElement("label");
  labelY.textContent = "Posición vertical:";
  const sliderY = document.createElement("input");
  sliderY.type = "range";
  sliderY.min = min;
  sliderY.max = max;
  sliderY.value = initialValue;
  sliderY.className = "position-slider";
  const valueY = document.createElement("span");
  valueY.className = "slider-value";
  valueY.textContent = initialValue;

  sliderY.addEventListener("input", (event) => {
      if (onInputYCallback) onInputYCallback(event);
      valueY.textContent = sliderY.value; // Update value display
  });
  
  container.append(labelX, sliderX, valueX, document.createElement("br"), labelY, sliderY, valueY);
  // Return all relevant elements so they can be accessed if needed (e.g. for resetting values)
  return { sliderContainer: container, sliderX, sliderY, sliderXValue: valueX, sliderYValue: valueY };
}

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

export async function createUI() {
  const app = document.getElementById("app");
  const controles = document.createElement("div");
  controles.className = "controls";

  const card = document.createElement("div"); // Defined early as it's needed by listeners
  card.id = "card";
  card.className = "carta";

  // Cargar recursos
  const recursos = await cargarRecursos();
  const clanes = await cargarClanes();

  // Helper function for select callbacks
  const createSelectCallback = (optionKey) => (event) => {
    opciones[optionKey] = event.target.value;
    renderCard(card);
  };

  // Tipo de Carta
  const tipoCartaControl = createLabeledSelect(
    "Tipo de carta:",
    ["Estándar", "Minimalista"],
    createSelectCallback("tipo")
  );
  const tipoSelect = tipoCartaControl.selectElement; // Keep ref for direct access if needed later

  // Tema del marco
  const temaMarcoControl = createLabeledSelect(
    "Tema del marco:",
    recursos.temasMarco,
    createSelectCallback("tema")
  );
  const temaMarcoSelect = temaMarcoControl.selectElement;

  // Fondo
  const fondoControl = createLabeledSelect(
    "Fondo:",
    recursos.fondos, // Assuming this is an array of { value, name }
    createSelectCallback("fondo")
  );
  const fondoSelect = fondoControl.selectElement;

  // Icono Tipo
  const iconoTipoControl = createLabeledSelect(
    "Icono Tipo:",
    recursos.iconosTipo, // Assuming this is an array of { value, name }
    createSelectCallback("iconoTipo")
  );
  const iconoTipoSelect = iconoTipoControl.selectElement;

  // Clan
  const clanOptions = Object.entries(clanes).map(([nombre, ruta]) => ({ name: nombre, value: ruta }));
  const clanControl = createLabeledSelect(
    "Clan:",
    clanOptions,
    createSelectCallback("clan")
  );
  const clanSelect = clanControl.selectElement;

  // Nombre
  const nombreInput = createTextInput("Nombre", (event) => {
    opciones.nombre = event.target.value;
    renderCard(card);
  });

  // Descripción
  const descInput = createTextArea("Descripción", (event) => {
    opciones.descripcion = event.target.value;
    renderCard(card);
  });

  // Sliders for image position - must be defined before fileInput if fileInput resets them
  const imageSliders = createImagePositionSliders(-2000, 2000, 0,
    (event) => { // onInputXCallback
      opciones.imagenPosX = parseInt(event.target.value);
      const cardElement = document.getElementById('card');
      if (cardElement) {
        const imageElement = cardElement.querySelector('.imagen');
        if (imageElement) {
          imageElement.style.transform = `translate(${opciones.imagenPosX}px, ${opciones.imagenPosY}px)`;
        }
      }
    },
    (event) => { // onInputYCallback
      opciones.imagenPosY = parseInt(event.target.value);
      const cardElement = document.getElementById('card');
      if (cardElement) {
        const imageElement = cardElement.querySelector('.imagen');
        if (imageElement) {
          imageElement.style.transform = `translate(${opciones.imagenPosX}px, ${opciones.imagenPosY}px)`;
        }
      }
    }
  );
  // Destructure for clarity if needed, or use imageSliders.sliderX, etc.
  const { sliderContainer, sliderX, sliderY, sliderXValue, sliderYValue } = imageSliders;


  // File Input
  const fileInput = createFileInput("image/*", (e) => {
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
        // Reset sliders to 0 when a new image is loaded
        if (sliderX) sliderX.value = 0;
        if (sliderY) sliderY.value = 0;
        if (sliderXValue) sliderXValue.textContent = "0";
        if (sliderYValue) sliderYValue.textContent = "0";
        renderCard(card);
      };
      imgTemp.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  const exportBtn = document.createElement("button");
  exportBtn.textContent = "Exportar como PNG";
  exportBtn.onclick = exportCard;

  controles.append(
    tipoCartaControl.element,
    temaMarcoControl.element,
    fondoControl.element,
    iconoTipoControl.element,
    clanControl.element,
    nombreInput,
    descInput,
    document.createElement("br"), // Maintain some separation if needed
    fileInput,
    document.createElement("br"), // Maintain some separation
    sliderContainer, // This is the container div from createImagePositionSliders
    document.createElement("br"),
    exportBtn
  );

  const canvas = document.createElement("div");
  canvas.id = "canvas";
  canvas.className = "canvas";

  // Card element was created earlier
  canvas.appendChild(card);
  app.append(controles, canvas);

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
