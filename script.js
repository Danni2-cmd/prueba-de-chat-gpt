document.getElementById("rol").addEventListener("change", function () {
  const esAdmin = this.value === "ADMINISTRATIVO";
  document.getElementById("puestoLabel").style.display = esAdmin ? "block" : "none";
  document.getElementById("puesto").style.display = esAdmin ? "block" : "none";
});

document.getElementById("carnetForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const nombres = document.getElementById("nombres").value;
  const tipoDocumento = document.getElementById("tipoDocumento").value;
  const numeroDocumento = document.getElementById("numeroDocumento").value;
  const tipoSangre = document.getElementById("tipoSangre").value;
  const contactoEmergencia = document.getElementById("contactoEmergencia").value;
  const rol = document.getElementById("rol").value;
  const puesto = document.getElementById("puesto").value || "";
  const fotoFile = document.getElementById("foto").files[0];

  const reader = new FileReader();
  reader.onloadend = async function () {
    const fotoBase64 = reader.result;

    const qrText = `https://identilucha.vercel.app/carnet.html?doc=${numeroDocumento}`;
    const qrDataUrl = await generarQR(qrText);

    const data = {
      nombres,
      tipoDocumento,
      numeroDocumento,
      tipoSangre,
      contactoEmergencia,
      rol,
      puesto,
      foto: fotoBase64,
      qrDataUrl,
    };

    localStorage.setItem(numeroDocumento, JSON.stringify(data));
    mostrarCarnet(data);
  };
  reader.readAsDataURL(fotoFile);
});

function mostrarCarnet(data) {
  const container = document.getElementById("preview");
  container.innerHTML = `
    <div class="carnet" id="carnet">
      <img src="logo.png" class="logo">
      <img src="${data.foto}" class="foto">
      <div class="info">
        <strong>${data.nombres}</strong><br>
        ${data.tipoDocumento}: ${data.numeroDocumento}<br>
        Sangre: ${data.tipoSangre}<br>
        Emergencia: ${data.contactoEmergencia}<br>
        Rol: ${data.rol} ${data.puesto}
      </div>
      <img src="${data.qrDataUrl}" class="qr">
      <button id="descargarPDF" onclick="descargarCarnet()">Descargar PDF</button>
    </div>
  `;
  container.style.display = "block";
}

function descargarCarnet() {
  const carnet = document.getElementById("carnet");
  const boton = carnet.querySelector("button");

  if (boton) boton.style.display = "none"; // Ocultar el botón antes de exportar

  const opt = {
    margin: 0,
    filename: 'carnet_digital.pdf',
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 4, useCORS: true },
    jsPDF: {
      unit: 'mm',
      format: [85.6, 53.98],
      orientation: 'landscape'
    }
  };

  html2pdf().from(carnet).set(opt).save().then(() => {
    if (boton) boton.style.display = "inline-block"; // Mostrar botón nuevamente
  });
}

function generarQR(texto) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const qr = new QRious({
      element: canvas,
      value: texto,
      size: 100,
    });
    resolve(canvas.toDataURL("image/png"));
  });
}
