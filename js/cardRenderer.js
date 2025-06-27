export function renderCard(card, opciones) {
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

function createImageElement(opciones, imageClassName, containerElement) {
  if (!opciones.imagen) {
    return null;
  }

  const imagen = document.createElement("img");
  imagen.className = `imagen ${imageClassName || ""}`.trim();
  if (!opciones.imagen.startsWith('data:')) {
    imagen.crossOrigin = 'anonymous';
  }
  imagen.src = opciones.imagen;
  imagen.style.transform = `translate(${opciones.imagenPosX}px, ${opciones.imagenPosY}px)`;

  const imgTemp = new Image();
  if (!opciones.imagen.startsWith('data:')) {
    imgTemp.crossOrigin = 'anonymous';
  }
  imgTemp.src = opciones.imagen;

  imgTemp.onload = function () {
    imagen.style.width = `${imgTemp.naturalWidth}px`;
    imagen.style.height = `${imgTemp.naturalHeight}px`;
    imagen.style.minWidth = "unset";
    imagen.style.minHeight = "unset";
    imagen.style.position = "absolute";

    if (
      containerElement &&
      typeof containerElement.offsetWidth === "number" &&
      typeof containerElement.offsetHeight === "number"
    ) {
      if (imgTemp.naturalWidth < containerElement.offsetWidth) {
        imagen.style.left = `${(containerElement.offsetWidth - imgTemp.naturalWidth) / 2}px`;
      } else {
        imagen.style.left = "0px";
      }

      if (imgTemp.naturalHeight < containerElement.offsetHeight) {
        imagen.style.top = `${(containerElement.offsetHeight - imgTemp.naturalHeight) / 2}px`;
      } else {
        imagen.style.top = "0px";
      }
    } else {
      imagen.style.left = "0px";
      imagen.style.top = "0px";
    }
  };

  imgTemp.onerror = function () {
    console.error("Error loading image for card:", opciones.imagen);
    imagen.src = "";
  };

  return imagen;
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

  const imagenElement = createImageElement(opciones, "minimalista", bloqueImagen);
  if (imagenElement) {
    bloqueImagen.appendChild(imagenElement);
  }

  imageContainer.appendChild(bloqueImagenFondo);
  imageContainer.appendChild(bloqueImagen);
  marco.appendChild(imageContainer);

  card.append(marco);
}

