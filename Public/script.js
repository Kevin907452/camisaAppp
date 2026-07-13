// ==========================
// VARIABLES GLOBALES
// ==========================
let parteSeleccionada = null;

// ==========================
// ELEMENTOS DOM
// ==========================
const pantallaAuth = document.getElementById('pantallaAuth');
const pantallaApp = document.getElementById('pantallaApp');
const tabLogin = document.getElementById('tabLogin');
const tabRegistro = document.getElementById('tabRegistro');
const formLogin = document.getElementById('formLogin');
const formRegistro = document.getElementById('formRegistro');
const btnRegistro = document.getElementById('btnRegistro');
const btnLogin = document.getElementById('btnLogin');
const btnLogout = document.getElementById('btnLogout');
const btnCambiarCuenta = document.getElementById('btnCambiarCuenta');
const perfilNombre = document.getElementById('perfilNombre');
const perfilEmail = document.getElementById('perfilEmail');
const avatarUsuario = document.getElementById('avatarUsuario');
const colorPicker = document.getElementById('colorPicker');
const parteActual = document.getElementById('parteActual');
const btnGuardar = document.getElementById('btnGuardar');
const btnActualizar = document.getElementById('btnActualizar');
const btnCancelar = document.getElementById('btnCancelar');
const btnLimpiar = document.getElementById('btnLimpiar');
const contenedorCamisetas = document.getElementById('contenedorCamisetas');
const inputAvatar = document.getElementById('inputAvatar');
const buscadorInput = document.getElementById('buscadorCamisetas');

// Todas las partes editables (con clase 'parte-camiseta')
const partes = document.querySelectorAll('.parte-camiseta');

// Almacenar todas las camisetas para filtrar
let todasLasCamisetas = [];

// ==========================
// FUNCIONES DE ALERTA
// ==========================
function alertaExito(texto) {
  Swal.fire({ icon: 'success', title: '¡Éxito!', text: texto, confirmButtonColor: '#3F5D44', timer: 2000, showConfirmButton: true });
}
function alertaError(texto) {
  Swal.fire({ icon: 'error', title: 'Error', text: texto, confirmButtonColor: '#dc2626' });
}
function alertaInfo(texto) {
  Swal.fire({ icon: 'info', title: 'Información', text: texto, confirmButtonColor: '#3F5D44' });
}
function alertaConfirmacion(texto, callback) {
  Swal.fire({ 
    title: '¿Estás seguro?', text: texto, icon: 'warning', showCancelButton: true,
    confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar', confirmButtonColor: '#dc2626'
  }).then((result) => { if (result.isConfirmed) callback(); });
}

// ==========================
// UTILIDADES
// ==========================
function emailValido(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function obtenerToken() { return localStorage.getItem('tokenCamisa'); }
function obtenerUsuario() { const u = localStorage.getItem('usuarioCamisa'); return u ? JSON.parse(u) : null; }
function headersConToken() { return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${obtenerToken()}` }; }
function escapeHTML(str) { if (!str) return ''; return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;'); }

// ==========================
// AUTENTICACIÓN
// ==========================
function mostrarLogin() {
  pantallaAuth.classList.remove('oculto');
  pantallaApp.classList.add('oculto');
}
function mostrarApp() {
  const usuario = obtenerUsuario();
  if (!usuario || !obtenerToken()) { mostrarLogin(); return; }
  perfilNombre.textContent = usuario.nombre;
  perfilEmail.textContent = usuario.email;
  cargarAvatar();
  pantallaAuth.classList.add('oculto');
  pantallaApp.classList.remove('oculto');
  cargarCamisetas();
  cargarEstadisticas();
}
function cerrarSesion() {
  localStorage.removeItem('tokenCamisa');
  localStorage.removeItem('usuarioCamisa');
  limpiarFormularioCompleto();
  mostrarLogin();
}
async function cargarAvatar() {
  try {
    const res = await fetch('/api/me', { headers: { 'Authorization': `Bearer ${obtenerToken()}` } });
    if (res.ok) {
      const datos = await res.json();
      avatarUsuario.src = datos.avatar ? '/uploads/' + datos.avatar : `https://ui-avatars.com/api/?background=3F5D44&color=fff&bold=true&size=120&name=${encodeURIComponent(perfilNombre.textContent)}`;
    } else {
      avatarUsuario.src = `https://ui-avatars.com/api/?background=3F5D44&color=fff&bold=true&size=120&name=${encodeURIComponent(perfilNombre.textContent)}`;
    }
  } catch { avatarUsuario.src = `https://ui-avatars.com/api/?background=3F5D44&color=fff&bold=true&size=120&name=${encodeURIComponent(perfilNombre.textContent)}`; }
}

// ==========================
// ESTADÍSTICAS
// ==========================
async function cargarEstadisticas() {
  try {
    const res = await fetch('/api/estadisticas');
    const datos = await res.json();
    document.getElementById('statDisenos').textContent = datos.totalDisenos || 0;
    document.getElementById('statUsuarios').textContent = datos.totalUsuarios || 0;
    document.getElementById('statVotos').textContent = datos.totalVotos || 0;
    document.getElementById('statPromedio').textContent = datos.promedioGeneral || 0;
  } catch (e) { console.error(e); }
}

// ==========================
// CREAR MINIATURA SVG DE LA CAMISETA
// ==========================
function crearMiniaturaCamiseta(camiseta) {
  const torso = camiseta.torsoColor || '#E8E3D6';
  const mangaIzq = camiseta.mangaIzquierdaColor || '#E8E3D6';
  const mangaDer = camiseta.mangaDerechaColor || '#E8E3D6';
  const cuello = camiseta.cuelloColor || '#D7D0C3';
  const bordeIzq = camiseta.bordeMangaIzquierdaColor || '#3F5D44';
  const bordeDer = camiseta.bordeMangaDerechaColor || '#3F5D44';
  const bolsillo = camiseta.bolsilloColor || '#E8E3D6';
  const textoDB = camiseta.textoDBColor || '#2B2E2C';
  const solapaIzq = camiseta.solapaIzquierdaColor || '#E8E3D6';
  const solapaDer = camiseta.solapaDerechaColor || '#E8E3D6';
  
  return `
    <svg class="mini-svg" viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 48 L22 82 L50 120 L76 98 Z" fill="${mangaIzq}" stroke="#2B2E2C" stroke-width="2"/>
      <path d="M22 82 L50 120 L58 112 L30 74 Z" fill="${bordeIzq}" stroke="#2B2E2C" stroke-width="1.5"/>
      <path d="M140 48 L178 82 L150 120 L124 98 Z" fill="${mangaDer}" stroke="#2B2E2C" stroke-width="2"/>
      <path d="M178 82 L150 120 L142 112 L170 74 Z" fill="${bordeDer}" stroke="#2B2E2C" stroke-width="1.5"/>
      <path d="M60 48 L140 48 L152 200 Q100 212 48 200 Z" fill="${torso}" stroke="#2B2E2C" stroke-width="2"/>
      <path d="M74 42 Q100 50 126 42 L118 58 Q100 80 82 58 Z" fill="${cuello}" stroke="#2B2E2C" stroke-width="1.5"/>
      <polygon points="70,38 100,68 88,82 58,48" fill="${solapaIzq}" stroke="#2B2E2C" stroke-width="1.5"/>
      <polygon points="130,38 100,68 112,82 142,48" fill="${solapaDer}" stroke="#2B2E2C" stroke-width="1.5"/>
      <path d="M58 88 L84 88 L80 116 L62 116 Z" fill="${bolsillo}" stroke="#3F5D44" stroke-width="2.5"/>
      <text x="70.8" y="105" text-anchor="middle" font-size="10" font-weight="bold" fill="${textoDB}" font-family="Inter, sans-serif">DB</text>
      <text x="100" y="158" text-anchor="middle" font-size="20" font-weight="800" fill="#2B2E2C" font-family="Inter, sans-serif">GEN 27</text>
    </svg>
  `;
}

// ==========================
// CRUD DE CAMISETAS
// ==========================
function obtenerColoresCompletos() {
  const getFill = (id, defaultValue) => {
    const el = document.getElementById(id);
    return el ? el.getAttribute('fill') || defaultValue : defaultValue;
  };
  return {
    torsoColor: getFill('torso', '#E8E3D6'),
    mangaIzquierdaColor: getFill('mangaIzquierda', '#E8E3D6'),
    mangaDerechaColor: getFill('mangaDerecha', '#E8E3D6'),
    cuelloColor: getFill('cuello', '#D7D0C3'),
    bordeMangaIzquierdaColor: getFill('bordeMangaIzquierda', '#3F5D44'),
    bordeMangaDerechaColor: getFill('bordeMangaDerecha', '#3F5D44'),
    bolsilloColor: getFill('bolsillo', '#E8E3D6'),
    textoDBColor: getFill('logoDB', '#2B2E2C'),
    solapaIzquierdaColor: getFill('solapaIzquierda', '#E8E3D6'),
    solapaDerechaColor: getFill('solapaDerecha', '#E8E3D6')
  };
}

function obtenerDatosFormulario() {
  const nombreDiseno = document.getElementById('nombreDiseno').value.trim();
  if (!nombreDiseno) { alertaError('Debes escribir el nombre del diseño.'); return null; }
  const colores = obtenerColoresCompletos();
  return {
    nombreDiseno,
    descripcion: document.getElementById('descripcion').value.trim(),
    ...colores
  };
}

function limpiarFormularioCompleto() {
  document.getElementById('camisetaId').value = '';
  document.getElementById('nombreDiseno').value = '';
  document.getElementById('descripcion').value = '';
  // Colores por defecto
  const def = { torso: '#E8E3D6', manga: '#E8E3D6', cuello: '#D7D0C3', borde: '#3F5D44', bolsillo: '#E8E3D6', textoDB: '#2B2E2C', solapa: '#E8E3D6' };
  document.getElementById('torso').setAttribute('fill', def.torso);
  document.getElementById('mangaIzquierda').setAttribute('fill', def.manga);
  document.getElementById('mangaDerecha').setAttribute('fill', def.manga);
  document.getElementById('cuello').setAttribute('fill', def.cuello);
  document.getElementById('bordeMangaIzquierda').setAttribute('fill', def.borde);
  document.getElementById('bordeMangaDerecha').setAttribute('fill', def.borde);
  document.getElementById('bolsillo').setAttribute('fill', def.bolsillo);
  document.getElementById('logoDB').setAttribute('fill', def.textoDB);
  document.getElementById('solapaIzquierda').setAttribute('fill', def.solapa);
  document.getElementById('solapaDerecha').setAttribute('fill', def.solapa);
  // Reset selección
  partes.forEach(p => p.classList.remove('parte-activa'));
  parteSeleccionada = null;
  colorPicker.value = def.torso;
  parteActual.innerHTML = '🔍 Selecciona una parte de la camiseta';
  btnGuardar.classList.remove('oculto');
  btnActualizar.classList.add('oculto');
  btnCancelar.classList.add('oculto');
}

async function cargarCamisetas() {
  try {
    const res = await fetch('/api/camisetas');
    const camisetas = await res.json();
    todasLasCamisetas = camisetas;
    const usuario = obtenerUsuario();
    if (camisetas.length === 0) {
      contenedorCamisetas.innerHTML = `<div class="mensaje-vacio">🎨 Todavía no hay diseños. ¡Sé el primero en crear uno!</div>`;
      return;
    }
    renderizarCamisetas(camisetas, usuario);
    
    // Asignar eventos después de crear las tarjetas
    document.querySelectorAll('.voto-btn').forEach(btn => btn.addEventListener('click', () => votar(btn.dataset.id, parseInt(btn.dataset.valor))));
    document.querySelectorAll('.editar-btn').forEach(btn => btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const camiseta = todasLasCamisetas.find(c => c._id === id);
      if (camiseta) editarCamiseta(camiseta);
    }));
    document.querySelectorAll('.eliminar-btn').forEach(btn => btn.addEventListener('click', () => eliminarCamiseta(btn.dataset.id)));
    
  } catch (e) { console.error(e); alertaError('Error al cargar las camisetas.'); }
}

function renderizarCamisetas(camisetas, usuario) {
  contenedorCamisetas.innerHTML = '';
  if (camisetas.length === 0) {
    contenedorCamisetas.innerHTML = `<div class="mensaje-vacio">🔎 No se encontraron diseños con ese criterio.</div>`;
    return;
  }
  camisetas.forEach(c => {
    const calificacion = Number(c.calificacion || 0).toFixed(1);
    const totalVotos = c.votos?.length || 0;
    const esCreador = usuario && c.creador?._id === usuario.id;
    
    // Generar estrellas visuales
    let estrellasHTML = '';
    const promedioRedondeado = Math.round(calificacion);
    for (let i = 1; i <= 5; i++) {
      estrellasHTML += i <= promedioRedondeado ? '⭐' : '☆';
    }
    
    // Desglose de votos
    const votosCount = {};
    if (c.votos) {
      c.votos.forEach(v => { votosCount[v.valor] = (votosCount[v.valor] || 0) + 1; });
    }
    const desglose = Object.entries(votosCount).map(([k, v]) => `${k}⭐: ${v}`).join(', ');
    
    // Crear miniatura SVG de la camiseta
    const miniaturaSVG = crearMiniaturaCamiseta(c);
    
    // Paleta de colores
    const colores = [
      { nombre: 'Torso', color: c.torsoColor || '#E8E3D6' },
      { nombre: 'Manga Izq', color: c.mangaIzquierdaColor || '#E8E3D6' },
      { nombre: 'Manga Der', color: c.mangaDerechaColor || '#E8E3D6' },
      { nombre: 'Cuello', color: c.cuelloColor || '#D7D0C3' },
      { nombre: 'Borde Izq', color: c.bordeMangaIzquierdaColor || '#3F5D44' },
      { nombre: 'Borde Der', color: c.bordeMangaDerechaColor || '#3F5D44' },
      { nombre: 'Bolsillo', color: c.bolsilloColor || '#E8E3D6' },
      { nombre: 'Texto DB', color: c.textoDBColor || '#2B2E2C' },
      { nombre: 'Solapa Izq', color: c.solapaIzquierdaColor || '#E8E3D6' },
      { nombre: 'Solapa Der', color: c.solapaDerechaColor || '#E8E3D6' }
    ];
    
    const paletaHTML = colores.map(item => `
      <span class="paleta-item">
        <span class="color-dot-mini" style="background:${item.color}" title="${item.nombre}"></span>
      </span>
    `).join('');
    
    const tarjeta = document.createElement('div');
    tarjeta.classList.add('tarjeta-camiseta');
    tarjeta.innerHTML = `
      <div class="camiseta-info">
        <h3>${escapeHTML(c.nombreDiseno)}</h3>
        <p class="autor">🎨 ${escapeHTML(c.autor)}</p>
        <div class="calificacion">
          <span class="estrellas">${estrellasHTML}</span>
          <span><strong>${calificacion}</strong></span>
          <span class="votos">👥 ${totalVotos} voto${totalVotos !== 1 ? 's' : ''}</span>
        </div>
        ${desglose ? `<p class="desglose">📊 ${desglose}</p>` : ''}
        <p class="descripcion">📝 ${escapeHTML(c.descripcion || 'Sin descripción.')}</p>
        <div class="paleta-colores">
          ${paletaHTML}
        </div>
        <div class="mini-camisa-wrapper">
          ${miniaturaSVG}
        </div>
      </div>
      <div class="acciones-card">
        <div class="estrellas-votacion">
          ${[1,2,3,4,5].map(v => `<button class="voto-btn" data-id="${c._id}" data-valor="${v}">${v}⭐</button>`).join('')}
        </div>
        <div class="acciones-crud">
          ${esCreador ? `
            <button class="btn-edit editar-btn" data-id="${c._id}">✏️ Editar</button>
            <button class="btn-delete eliminar-btn" data-id="${c._id}">🗑️ Eliminar</button>
          ` : '<span class="info-text">🔒 Solo el creador puede editar</span>'}
        </div>
      </div>
    `;
    contenedorCamisetas.appendChild(tarjeta);
  });
}

function filtrarCamisetas() {
  const texto = buscadorInput.value.trim().toLowerCase();
  if (!texto) {
    renderizarCamisetas(todasLasCamisetas, obtenerUsuario());
  } else {
    const filtradas = todasLasCamisetas.filter(c => 
      (c.nombreDiseno && c.nombreDiseno.toLowerCase().includes(texto)) ||
      (c.autor && c.autor.toLowerCase().includes(texto))
    );
    renderizarCamisetas(filtradas, obtenerUsuario());
  }
  // Reasignar eventos después de filtrar
  document.querySelectorAll('.voto-btn').forEach(btn => btn.addEventListener('click', () => votar(btn.dataset.id, parseInt(btn.dataset.valor))));
  document.querySelectorAll('.editar-btn').forEach(btn => btn.addEventListener('click', () => {
    const id = btn.dataset.id;
    const camiseta = todasLasCamisetas.find(c => c._id === id);
    if (camiseta) editarCamiseta(camiseta);
  }));
  document.querySelectorAll('.eliminar-btn').forEach(btn => btn.addEventListener('click', () => eliminarCamiseta(btn.dataset.id)));
}

function editarCamiseta(camiseta) {
  // Cargar datos del formulario
  document.getElementById('camisetaId').value = camiseta._id;
  document.getElementById('nombreDiseno').value = camiseta.nombreDiseno;
  document.getElementById('descripcion').value = camiseta.descripcion || '';
  
  // Aplicar colores guardados al SVG (incluye cuello, bolsillo, DB, torso)
  document.getElementById('torso').setAttribute('fill', camiseta.torsoColor || '#E8E3D6');
  document.getElementById('mangaIzquierda').setAttribute('fill', camiseta.mangaIzquierdaColor || '#E8E3D6');
  document.getElementById('mangaDerecha').setAttribute('fill', camiseta.mangaDerechaColor || '#E8E3D6');
  document.getElementById('cuello').setAttribute('fill', camiseta.cuelloColor || '#D7D0C3');
  document.getElementById('bordeMangaIzquierda').setAttribute('fill', camiseta.bordeMangaIzquierdaColor || '#3F5D44');
  document.getElementById('bordeMangaDerecha').setAttribute('fill', camiseta.bordeMangaDerechaColor || '#3F5D44');
  document.getElementById('bolsillo').setAttribute('fill', camiseta.bolsilloColor || '#E8E3D6');
  document.getElementById('logoDB').setAttribute('fill', camiseta.textoDBColor || '#2B2E2C');
  document.getElementById('solapaIzquierda').setAttribute('fill', camiseta.solapaIzquierdaColor || '#E8E3D6');
  document.getElementById('solapaDerecha').setAttribute('fill', camiseta.solapaDerechaColor || '#E8E3D6');
  
  // Quitar selección activa
  partes.forEach(p => p.classList.remove('parte-activa'));
  parteSeleccionada = null;
  colorPicker.value = camiseta.torsoColor || '#E8E3D6';
  parteActual.innerHTML = '✏️ Editando diseño. Selecciona cualquier parte y cambia su color.';
  
  // Cambiar botones
  btnGuardar.classList.add('oculto');
  btnActualizar.classList.remove('oculto');
  btnCancelar.classList.remove('oculto');
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
  alertaInfo('Modo edición activado. Modifica los colores y presiona "Actualizar diseño".');
}

async function votar(id, valor) {
  if (!obtenerToken()) { alertaError('Debes iniciar sesión para votar.'); return; }
  try {
    const res = await fetch(`/api/camisetas/${id}/votar`, { method: 'POST', headers: headersConToken(), body: JSON.stringify({ valor }) });
    const datos = await res.json();
    if (res.ok) {
      alertaExito(datos.mensaje);
      await cargarCamisetas();
      await cargarEstadisticas();
    } else {
      alertaError(datos.mensaje);
    }
  } catch (e) { alertaError('Error al votar.'); }
}

async function eliminarCamiseta(id) {
  if (!obtenerToken()) { alertaError('Debes iniciar sesión para eliminar un diseño.'); return; }
  alertaConfirmacion('No podrás recuperar este diseño.', async () => {
    try {
      const res = await fetch(`/api/camisetas/${id}`, { method: 'DELETE', headers: headersConToken() });
      const datos = await res.json();
      if (res.ok) {
        alertaExito(datos.mensaje);
        await cargarCamisetas();
        await cargarEstadisticas();
        if (document.getElementById('camisetaId').value === id) limpiarFormularioCompleto();
      } else {
        alertaError(datos.mensaje);
      }
    } catch (e) { alertaError('Error al eliminar.'); }
  });
}

// ==========================
// EVENTOS DE INTERFAZ
// ==========================
tabLogin.addEventListener('click', () => { tabLogin.classList.add('activo'); tabRegistro.classList.remove('activo'); formLogin.classList.remove('oculto'); formRegistro.classList.add('oculto'); });
tabRegistro.addEventListener('click', () => { tabRegistro.classList.add('activo'); tabLogin.classList.remove('activo'); formRegistro.classList.remove('oculto'); formLogin.classList.add('oculto'); });

btnRegistro.addEventListener('click', async () => {
  const nombre = document.getElementById('registroNombre').value.trim();
  const email = document.getElementById('registroEmail').value.trim();
  const clave = document.getElementById('registroClave').value.trim();
  if (!nombre || !email || !clave) { alertaError('Completa todos los campos.'); return; }
  if (!emailValido(email)) { alertaError('Correo inválido.'); return; }
  if (clave.length < 4) { alertaError('Contraseña mínima 4 caracteres.'); return; }
  try {
    const res = await fetch('/api/registro', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre, email, clave }) });
    const datos = await res.json();
    if (res.ok) {
      alertaExito(datos.mensaje);
      document.getElementById('registroNombre').value = '';
      document.getElementById('registroEmail').value = '';
      document.getElementById('registroClave').value = '';
      tabLogin.click();
      document.getElementById('loginEmail').value = email;
    } else {
      alertaError(datos.mensaje);
    }
  } catch (e) { alertaError('Error al registrar.'); }
});

btnLogin.addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value.trim();
  const clave = document.getElementById('loginClave').value.trim();
  if (!email || !clave) { alertaError('Completa email y contraseña.'); return; }
  if (!emailValido(email)) { alertaError('Correo inválido.'); return; }
  try {
    const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, clave }) });
    const datos = await res.json();
    if (res.ok) {
      localStorage.setItem('tokenCamisa', datos.token);
      localStorage.setItem('usuarioCamisa', JSON.stringify(datos.usuario));
      document.getElementById('loginEmail').value = '';
      document.getElementById('loginClave').value = '';
      alertaExito('¡Bienvenido/a!');
      mostrarApp();
    } else {
      alertaError(datos.mensaje);
    }
  } catch (e) { alertaError('Error al iniciar sesión.'); }
});

btnLogout.addEventListener('click', cerrarSesion);
btnCambiarCuenta.addEventListener('click', cerrarSesion);

inputAvatar.addEventListener('change', async () => {
  const archivo = inputAvatar.files[0];
  if (!archivo) return;
  const formData = new FormData();
  formData.append('avatar', archivo);
  try {
    const res = await fetch('/api/avatar', { method: 'POST', headers: { 'Authorization': 'Bearer ' + obtenerToken() }, body: formData });
    const datos = await res.json();
    if (res.ok) {
      alertaExito(datos.mensaje);
      cargarAvatar();
    } else {
      alertaError(datos.mensaje);
    }
  } catch (e) { alertaError('Error al subir avatar.'); }
});

// Eventos para seleccionar partes del SVG
partes.forEach(parte => {
  parte.addEventListener('click', (e) => {
    e.stopPropagation();
    partes.forEach(p => p.classList.remove('parte-activa'));
    parteSeleccionada = parte;
    parteSeleccionada.classList.add('parte-activa');
    const colorActual = parteSeleccionada.getAttribute('fill');
    colorPicker.value = colorActual;
    const nombreParte = parteSeleccionada.id.replace(/([A-Z])/g, ' $1').trim();
    parteActual.innerHTML = `🎨 Parte seleccionada: ${nombreParte}`;
  });
});

colorPicker.addEventListener('input', () => {
  if (parteSeleccionada) {
    parteSeleccionada.setAttribute('fill', colorPicker.value);
  } else {
    alertaError('Primero selecciona una parte de la camiseta.');
  }
});

btnLimpiar.addEventListener('click', limpiarFormularioCompleto);

btnGuardar.addEventListener('click', async () => {
  if (!obtenerToken()) { alertaError('Debes iniciar sesión para guardar un diseño.'); return; }
  const camiseta = obtenerDatosFormulario();
  if (!camiseta) return;
  try {
    const res = await fetch('/api/camisetas', { method: 'POST', headers: headersConToken(), body: JSON.stringify(camiseta) });
    const datos = await res.json();
    if (res.ok) {
      alertaExito(datos.mensaje);
      limpiarFormularioCompleto();
      await cargarCamisetas();
      await cargarEstadisticas();
    } else {
      alertaError(datos.mensaje);
    }
  } catch (e) { alertaError('Error al guardar.'); }
});

btnActualizar.addEventListener('click', async () => {
  if (!obtenerToken()) { alertaError('Debes iniciar sesión para actualizar un diseño.'); return; }
  const id = document.getElementById('camisetaId').value;
  if (!id) { alertaError('No hay diseño seleccionado para actualizar.'); return; }
  const camiseta = obtenerDatosFormulario();
  if (!camiseta) return;
  
  console.log('Enviando actualización con todos los colores:', camiseta);
  
  try {
    const res = await fetch(`/api/camisetas/${id}`, {
      method: 'PUT',
      headers: headersConToken(),
      body: JSON.stringify(camiseta)
    });
    const datos = await res.json();
    if (res.ok) {
      alertaExito(datos.mensaje);
      limpiarFormularioCompleto();
      await cargarCamisetas();
      await cargarEstadisticas();
    } else {
      alertaError(datos.mensaje);
    }
  } catch (e) { 
    console.error(e);
    alertaError('Error al actualizar.'); 
  }
});

btnCancelar.addEventListener('click', limpiarFormularioCompleto);

if (buscadorInput) {
  buscadorInput.addEventListener('input', filtrarCamisetas);
}

// Iniciar
mostrarApp();