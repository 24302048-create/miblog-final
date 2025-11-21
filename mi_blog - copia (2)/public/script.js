// public/script.js
const API = "https://server2-hzwu.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  // Mostrar usuario si existe
  const usuario_nombre = localStorage.getItem("usuario_nombre");
  const usuario_id = localStorage.getItem("usuario_id");
  const invitado = localStorage.getItem("invitado") === "true";

  const usuarioLog = document.getElementById("usuarioLog");
  if (usuarioLog) {
    usuarioLog.textContent = usuario_nombre ? `Conectado como: ${usuario_nombre}` : "No has iniciado sesión.";
  }

  // Login/invitado UI en las páginas
  const linkLogin = document.getElementById("linkLogin");
  const btnLogout = document.getElementById("btnLogout");
  if (usuario_id) {
    if (linkLogin) linkLogin.style.display = "none";
    if (btnLogout) btnLogout.style.display = "inline";
  }

  // Cerrar sesión
  btnLogout?.addEventListener("click", () => {
    localStorage.removeItem("usuario_id");
    localStorage.removeItem("usuario_nombre");
    localStorage.removeItem("invitado");
    window.location.href = "index.html";
  });

  // Mostrar caja de publicar solo si está autenticado (no invitado)
  const crearPublicacion = document.getElementById("crearPublicacion");
  if (crearPublicacion) {
    if (usuario_id && !invitado) crearPublicacion.style.display = "block";
    else crearPublicacion.style.display = "none";
  }

  // Cargar publicaciones si existe la sección
  if (document.getElementById("publicaciones")) {
    cargarPublicaciones();
  }

  // Handlers para publicar / comentar dependiendo de la página
  document.getElementById("btnPublicar")?.addEventListener("click", async () => {
    if (!usuario_id) { alert("Inicia sesión para publicar."); return; }
    if (localStorage.getItem("invitado") === "true") { alert("Invitados no pueden publicar."); return; }

    const contenido = document.getElementById("postTexto").value.trim();
    if (!contenido) { alert("Escribe algo."); return; }

    const res = await fetch(`${API}/publicar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario_id, contenido })
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById("postTexto").value = "";
      cargarPublicaciones();
    } else {
      alert("Error al publicar");
    }
  });

  // Comentar 'sobre mi'
  document.getElementById("btnComentarSobreMi")?.addEventListener("click", async () => {
    if (!usuario_id) { alert("Inicia sesión para comentar."); return; }
    if (localStorage.getItem("invitado") === "true") { alert("Invitados no pueden comentar."); return; }

    const texto = document.getElementById("comentarioSobreMi").value.trim();
    if (!texto) return;
    const res = await fetch(`${API}/comentario-sobre-mi`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ usuario_id, comentario: texto })
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById("comentarioSobreMi").value = "";
      cargarComentariosSobreMi();
    } else {
      alert("Error al enviar comentario");
    }
  });

  // Cargar comentarios sobre mi si existe la sección
  if (document.getElementById("listaComentariosSobreMi")) {
    cargarComentariosSobreMi();
  }
});

// ----------------- funciones auxiliares -----------------
async function cargarPublicaciones() {
  const res = await fetch(`${API}/publicaciones`);
  const publicaciones = await res.json();
  const cont = document.getElementById("publicaciones");
  cont.innerHTML = "";

  for (const pub of publicaciones) {
    // Obtener comentarios
    const resCom = await fetch(`${API}/comentarios/${pub.id}`);
    const comentarios = await resCom.json();

    const div = document.createElement("div");
    div.style = "background:#fff;padding:12px;margin-bottom:18px;border-radius:8px;";
    div.innerHTML = `
      <strong>${pub.nombre}</strong>
      <p>${pub.contenido}</p>
      <small>${pub.fecha}</small>
      <div id="comments-${pub.id}" style="margin-top:8px;">
        <h4>Comentarios</h4>
        ${comentarios.map(c => `<div style="background:#eee;padding:6px;border-radius:6px;margin:6px 0;"><strong>${c.nombre}</strong><br>${c.comentario}</div>`).join("")}
      </div>
      <div style="margin-top:8px;">
        ${ localStorage.getItem("usuario_id") ? `<textarea id="com-${pub.id}" rows="2" style="width:100%"></textarea>
        <button onclick="comentarPublicacion(${pub.id})">Enviar</button>` : `<em>Inicia sesión para comentar</em>` }
      </div>
    `;
    cont.appendChild(div);
  }
}

async function comentarPublicacion(publicacionID) {
  if (!localStorage.getItem("usuario_id")) { alert("Inicia sesión para comentar."); return; }
  if (localStorage.getItem("invitado") === "true") { alert("Invitados no pueden comentar."); return; }

  const texto = document.getElementById(`com-${publicacionID}`).value.trim();
  if (!texto) return;

  const res = await fetch(`${API}/comentar`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      usuario_id: localStorage.getItem("usuario_id"),
      publicacion_id: publicacionID,
      comentario: texto
    })
  });
  const data = await res.json();
  if (data.success) cargarPublicaciones();
}

async function cargarComentariosSobreMi() {
  const res = await fetch(`${API}/comentarios-sobre-mi`);
  const datos = await res.json();
  const cont = document.getElementById("listaComentariosSobreMi");
  cont.innerHTML = datos.map(c => `<div style="background:#eee;padding:8px;border-radius:6px;margin-bottom:6px;"><strong>${c.nombre}</strong><p>${c.comentario}</p></div>`).join("");
}

const API_KEY = "a10ce1cd396630a4bdf88b2c4af8c3f1";

  const form = document.getElementById("formClima");
  const inputCiudad = document.getElementById("inputCiudad");
  const errorClima = document.getElementById("errorClima");
  const resultado = document.getElementById("resultadoClima");

  const nombre = document.getElementById("nombreCiudad");
  const temp = document.getElementById("temp");
  const humedad = document.getElementById("humedad");
  const viento = document.getElementById("viento");
  const estado = document.getElementById("estado");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const ciudad = inputCiudad.value.trim();
    errorClima.textContent = "";
    resultado.classList.add("oculto");

    try {
      const resp = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&units=metric&lang=es&appid=${API_KEY}`
      );

      if (!resp.ok) throw new Error("Ciudad no encontrada");

      const data = await resp.json();

      nombre.textContent = `${data.name}, ${data.sys.country}`;
      temp.textContent = `Temperatura: ${data.main.temp}°C`;
      humedad.textContent = ` Humedad: ${data.main.humidity}%`;
      viento.textContent = ` Viento: ${data.wind.speed} m/s`;
      estado.textContent = ` Estado: ${data.weather[0].description}`;

      resultado.classList.remove("oculto");

    } catch (error) {
      errorClima.textContent = error.message;
    }
  });
