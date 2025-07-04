export function exportCard() {
  const canvas = document.getElementById("canvas");
  html2canvas(canvas, { useCORS: true }).then((canvas) => {
    const link = document.createElement("a");
    link.download = "carta.png";
    link.href = canvas.toDataURL();
    link.click();
  });
}
