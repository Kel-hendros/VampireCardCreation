import { exportCard } from "./export.js";
import { cargarClanes, cargarRecursos } from "./dataLoader.js";

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

  // Cargar recursos
  const recursos = await cargarRecursos();
  const clanes = await cargarClanes();

  // Selectores

  // Tipo de Carta
  const tipoSelect = document.createElement("select");
  ["Estándar", "Minimalista"].forEach((tipo) => {
    const opt = document.createElement("option");
    opt.value = tipo;
    opt.textContent = tipo;
    tipoSelect.appendChild(opt);
  });

  // Tema del marco
  const temaMarcoSelect = document.createElement("select");
  recursos.temasMarco.forEach((tema) => {
    const opt = document.createElement("option");
    opt.value = tema;
    opt.textContent = tema;
    temaMarcoSelect.appendChild(opt);
  });

  // Fondo
  const fondoSelect = document.createElement("select");
  recursos.fondos.forEach(({ value, name }) => {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = name;
    fondoSelect.appendChild(opt);
  });

  // Icono Tipo
  const iconoTipoSelect = document.createElement("select");
  recursos.iconosTipo.forEach(({ value, name }) => {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = name;
    iconoTipoSelect.appendChild(opt);
  });

  // Clan
  const clanSelect = document.createElement("select");
  Object.entries(clanes).forEach(([nombre, ruta]) => {
    const opt = document.createElement("option");
    opt.value = ruta;
    opt.textContent = nombre;
    clanSelect.appendChild(opt);
  });

  const nombreInput = document.createElement("input");
  nombreInput.placeholder = "Nombre";

  const descInput = document.createElement("textarea");
  descInput.placeholder = "Descripción";

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";

  // Crear sliders para posición de imagen
  const sliderContainer = document.createElement("div");
  sliderContainer.className = "slider-container";
  
  // Slider horizontal
  const sliderXLabel = document.createElement("label");
  sliderXLabel.textContent = "Posición horizontal:";
  const sliderX = document.createElement("input");
  sliderX.type = "range";
  sliderX.min = "-2000";
  sliderX.max = "2000";
  sliderX.value = "0";
  sliderX.className = "position-slider";
  
  // Valor numérico para posición horizontal
  const sliderXValue = document.createElement("span");
  sliderXValue.className = "slider-value";
  sliderXValue.textContent = "0";
  
  // Slider vertical
  const sliderYLabel = document.createElement("label");
  sliderYLabel.textContent = "Posición vertical:";
  const sliderY = document.createElement("input");
  sliderY.type = "range";
  sliderY.min = "-2000";
  sliderY.max = "2000";
  sliderY.value = "0";
  sliderY.className = "position-slider";
  
  // Valor numérico para posición vertical
  const sliderYValue = document.createElement("span");
  sliderYValue.className = "slider-value";
  sliderYValue.textContent = "0";
  
  sliderContainer.append(
    sliderXLabel, sliderX, sliderXValue, document.createElement("br"),
    sliderYLabel, sliderY, sliderYValue
  );

  const exportBtn = document.createElement("button");
  exportBtn.textContent = "Exportar como PNG";
  exportBtn.onclick = exportCard;

  controles.append(
    document.createTextNode("Tipo de carta:"),
    tipoSelect,
    document.createElement("br"),
    document.createTextNode("Tema del marco:"),
    temaMarcoSelect,
    document.createElement("br"),
    document.createTextNode("Fondo:"),
    fondoSelect,
    document.createElement("br"),
    document.createTextNode("Icono Tipo:"),
    iconoTipoSelect,
    document.createTextNode(" Clan:"),
    clanSelect,
    document.createElement("br"),
    nombreInput,
    descInput,
    document.createElement("br"),
    fileInput,
    document.createElement("br"),
    sliderContainer,
    document.createElement("br"),
    exportBtn
  );

  const canvas = document.createElement("div");
  canvas.id = "canvas";
  canvas.className = "canvas";

  const card = document.createElement("div");
  card.id = "card";
  card.className = "carta";

  canvas.appendChild(card);
  app.append(controles, canvas);

  // Listeners (todos actualizan opciones + redibujan)
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
    const reader = new FileReader();
    reader.onload = (ev) => {
      // Crear una imagen temporal para verificar dimensiones
      const imgTemp = new Image();
      imgTemp.onload = function() {
        opciones.imagen = ev.target.result;
        opciones.imagenAncho = imgTemp.naturalWidth;
        opciones.imagenAlto = imgTemp.naturalHeight;
        
        // Reset position when new image is loaded
        opciones.imagenPosX = 0;
        opciones.imagenPosY = 0;
        sliderX.value = 0;
        sliderY.value = 0;
        renderCard(card);
      };
      imgTemp.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
  
  // Event listeners para los sliders
  sliderX.addEventListener("input", () => {
    opciones.imagenPosX = parseInt(sliderX.value);
    // Actualizar el valor numérico
    sliderXValue.textContent = opciones.imagenPosX;
    // Actualizar solo la posición de la imagen sin redibujar toda la carta
    const imagenes = document.querySelectorAll('.imagen');
    imagenes.forEach(img => {
      img.style.transform = `translate(${opciones.imagenPosX}px, ${opciones.imagenPosY}px)`;
    });
  });
  
  sliderY.addEventListener("input", () => {
    opciones.imagenPosY = parseInt(sliderY.value);
    // Actualizar el valor numérico
    sliderYValue.textContent = opciones.imagenPosY;
    // Actualizar solo la posición de la imagen sin redibujar toda la carta
    const imagenes = document.querySelectorAll('.imagen');
    imagenes.forEach(img => {
      img.style.transform = `translate(${opciones.imagenPosX}px, ${opciones.imagenPosY}px)`;
    });
  });

  // Render inicial
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

  if (opciones.imagen) {
    const imagen = document.createElement("img");
    imagen.className = "imagen";
    imagen.src = opciones.imagen;
    imagen.style.transform = `translate(${opciones.imagenPosX}px, ${opciones.imagenPosY}px)`;
    
    // Crear una imagen temporal para obtener dimensiones reales
    const imgTemp = new Image();
    imgTemp.src = opciones.imagen;
    imgTemp.onload = function() {
      // Establecer el tamaño real de la imagen
      imagen.style.width = imgTemp.naturalWidth + "px";
      imagen.style.height = imgTemp.naturalHeight + "px";
      imagen.style.minWidth = "unset";
      imagen.style.minHeight = "unset";
      
      // Si la imagen es más pequeña que el contenedor, centrarla
      if (imgTemp.naturalWidth < bloqueImagen.offsetWidth) {
        imagen.style.left = ((bloqueImagen.offsetWidth - imgTemp.naturalWidth) / 2) + "px";
      }
      if (imgTemp.naturalHeight < bloqueImagen.offsetHeight) {
        imagen.style.top = ((bloqueImagen.offsetHeight - imgTemp.naturalHeight) / 2) + "px";
      }
    };
    
    bloqueImagen.appendChild(imagen);
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

  if (opciones.imagen) {
    const imagen = document.createElement("img");
    imagen.className = "imagen minimalista";
    imagen.src = opciones.imagen;
    imagen.style.transform = `translate(${opciones.imagenPosX}px, ${opciones.imagenPosY}px)`;
    
    // Crear una imagen temporal para obtener dimensiones reales
    const imgTemp = new Image();
    imgTemp.src = opciones.imagen;
    imgTemp.onload = function() {
      // Establecer el tamaño real de la imagen
      imagen.style.width = imgTemp.naturalWidth + "px";
      imagen.style.height = imgTemp.naturalHeight + "px";
      imagen.style.minWidth = "unset";
      imagen.style.minHeight = "unset";
      
      // Si la imagen es más pequeña que el contenedor, centrarla
      if (imgTemp.naturalWidth < bloqueImagen.offsetWidth) {
        imagen.style.left = ((bloqueImagen.offsetWidth - imgTemp.naturalWidth) / 2) + "px";
      }
      if (imgTemp.naturalHeight < bloqueImagen.offsetHeight) {
        imagen.style.top = ((bloqueImagen.offsetHeight - imgTemp.naturalHeight) / 2) + "px";
      }
    }; bloqueImagen.appendChild(imagen);
  }

  imageContainer.appendChild(bloqueImagenFondo);
  imageContainer.appendChild(bloqueImagen);
  marco.appendChild(imageContainer);

  card.append(marco);
}
