// Utilidad para mostrar mensajes animados
function mostrarMensaje(id, mensaje, tipo = 'info') {
  let el = document.getElementById(id);
  if (!el) el = document.getElementById('mensajeGlobal');
  el.innerText = mensaje;
  el.className = tipo;
  el.style.opacity = 1;
  setTimeout(() => {
    el.style.opacity = 0;
  }, 2500);
}

// Mostrar secciones y limpiar mensajes/formularios
function mostrarSeccion(id) {
  // Si no hay usuario y no es login, redirige a login
  if (!localStorage.getItem('usuarioActivo') && id !== 'login') {
    mostrarMensaje('mensajeGlobal', 'Debes iniciar sesión para acceder.', 'error');
    id = 'login';
  }
  document.querySelectorAll('.seccion').forEach((s) => s.classList.remove('activa'));
  document.getElementById(id).classList.add('activa');
  limpiarMensajes();
  limpiarFormularios();
  if (id === 'asistencia') mostrarAsistencias();
  if (id === 'rutinas') mostrarRutinas();
  if (id === 'clases') mostrarClases();
}
// Limpiar mensajes
function limpiarMensajes() {
  ['loginMsg', 'registroMsg'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerText = '';
  });
}

// Limpiar formularios
function limpiarFormularios() {
  ['loginForm', 'registroForm'].forEach((id) => {
    const form = document.getElementById(id);
    if (form) form.reset();
  });
}

// Registro de nuevos usuarios
document.getElementById('registroForm').addEventListener('submit', function (e) {
  e.preventDefault();
  let nuevoUsuario = document.getElementById('nuevoUsuario').value.trim();
  let nuevaClave = document.getElementById('nuevaClave').value.trim();

  if (!nuevoUsuario || !nuevaClave) {
    mostrarMensaje('registroMsg', '⚠️ Completa todos los campos.', 'error');
    return;
  }

  let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
  if (usuarios.find((u) => u.usuario === nuevoUsuario)) {
    mostrarMensaje('registroMsg', '⚠️ Usuario ya existe.', 'error');
    return;
  }

  usuarios.push({ usuario: nuevoUsuario, clave: nuevaClave });
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
  mostrarMensaje('registroMsg', '✅ Usuario registrado con éxito.', 'success');
  limpiarFormularios();
});

// Login de usuarios registrados
document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();
  let usuario = document.getElementById('usuario').value.trim();
  let clave = document.getElementById('clave').value.trim();

  let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
  let encontrado = usuarios.find((u) => u.usuario === usuario && u.clave === clave);

  if (encontrado) {
    localStorage.setItem('usuarioActivo', usuario);
    mostrarMensaje('loginMsg', `✅ Bienvenido ${usuario}`, 'success');
    document.querySelector('header h1').innerText = `🏋️‍♂️ Gym App | ${usuario}`;
    setTimeout(() => mostrarSeccion('asistencia'), 1200);
  } else {
    mostrarMensaje('loginMsg', '❌ Usuario o contraseña incorrectos', 'error');
  }
});

// Logout
function cerrarSesion() {
  localStorage.removeItem('usuarioActivo');
  document.querySelector('header h1').innerText = '🏋️‍♂️ Gym App';
  mostrarSeccion('login');
}
window.cerrarSesion = cerrarSesion;

// ==========================
// FUNCIONES DE LA APP
// ==========================

// Asistencia
function registrarAsistencia() {
  let usuario = localStorage.getItem('usuarioActivo');
  if (!usuario) return mostrarMensaje('loginMsg', 'Debes iniciar sesión primero.', 'error');

  let fecha = new Date().toLocaleString();
  let asistencia = JSON.parse(localStorage.getItem('asistencias')) || [];
  asistencia.push({ usuario, fecha });
  localStorage.setItem('asistencias', JSON.stringify(asistencia));
  mostrarAsistencias();
  mostrarMensaje('loginMsg', '✅ Asistencia registrada', 'success');
}

function mostrarAsistencias() {
  let lista = document.getElementById('listaAsistencia');
  lista.innerHTML = '';
  let usuario = localStorage.getItem('usuarioActivo');
  let asistencia = JSON.parse(localStorage.getItem('asistencias')) || [];
  let asistenciasUsuario = asistencia.filter((a) => a.usuario === usuario);
  if (asistenciasUsuario.length === 0) {
    lista.innerHTML = '<li>No tienes asistencias registradas.</li>';
    return;
  }
  asistenciasUsuario.reverse().forEach((a) => {
    let li = document.createElement('li');
    li.textContent = `🕒 ${a.fecha}`;
    lista.appendChild(li);
  });
}

// ==========================
// RUTINAS DIVIDIDAS POR DÍAS Y GRUPOS
// ==========================
let rutinasDisponibles = [
  {
    dia: 'Lunes',
    grupos: [
      {
        nombre: 'Pecho y tríceps',
        ejercicios: [
          { ejercicio: 'Press banca', series: 4, repeticiones: 10, peso: '60kg' },
          { ejercicio: 'Fondos en paralelas', series: 3, repeticiones: 12, peso: 'Propio' },
        ],
      },
    ],
  },
  {
    dia: 'Martes',
    grupos: [
      {
        nombre: 'Espalda y bíceps',
        ejercicios: [
          { ejercicio: 'Dominadas', series: 4, repeticiones: 8, peso: 'Propio' },
          { ejercicio: 'Remo con barra', series: 4, repeticiones: 12, peso: '50kg' },
        ],
      },
    ],
  },
  {
    dia: 'Miércoles',
    grupos: [
      {
        nombre: 'Piernas',
        ejercicios: [
          { ejercicio: 'Sentadillas', series: 4, repeticiones: 10, peso: '80kg' },
          { ejercicio: 'Prensa', series: 4, repeticiones: 12, peso: '100kg' },
        ],
      },
    ],
  },
];

// Rutinas por usuario
function getRutinasUsuario() {
  let usuario = localStorage.getItem('usuarioActivo');
  if (!usuario) return [];
  let rutinas = JSON.parse(localStorage.getItem('rutinasUsuario')) || {};
  return rutinas[usuario] || [];
}

function setRutinasUsuario(rutinas) {
  let usuario = localStorage.getItem('usuarioActivo');
  if (!usuario) return;
  let allRutinas = JSON.parse(localStorage.getItem('rutinasUsuario')) || {};
  allRutinas[usuario] = rutinas;
  localStorage.setItem('rutinasUsuario', JSON.stringify(allRutinas));
  mostrarRutinas();
}

// Mostrar rutinas por días y grupos musculares
function mostrarRutinas() {
  let lista = document.getElementById('listaRutinas');
  lista.innerHTML = '';
  let rutinas = getRutinasUsuario();

  if (rutinas.length === 0) {
    lista.innerHTML = '<li>No tienes rutinas asignadas.</li>';
    return;
  }

  rutinas.forEach((r, indexDia) => {
    let liDia = document.createElement('li');
    let tituloDia = document.createElement('h2');
    tituloDia.textContent = r.dia;
    liDia.appendChild(tituloDia);

    r.grupos.forEach((grupo, indexGrupo) => {
      let tituloGrupo = document.createElement('h3');
      tituloGrupo.textContent = grupo.nombre;
      liDia.appendChild(tituloGrupo);

      let ulEjercicios = document.createElement('ul');
      grupo.ejercicios.forEach((e, i) => {
        let item = document.createElement('li');
        item.innerHTML = `
          <span>🏋️ ${e.ejercicio} - </span>
          <span>Series: <input type="number" min="1" value="${e.series}" style="width:40px" onchange="modificarEjercicio(${indexDia},${indexGrupo},${i},'series',this.value)" /></span>
          <span>Reps: <input type="number" min="1" value="${e.repeticiones}" style="width:40px" onchange="modificarEjercicio(${indexDia},${indexGrupo},${i},'repeticiones',this.value)" /></span>
          <span>Peso: <input type="text" value="${e.peso}" style="width:60px" onchange="modificarEjercicio(${indexDia},${indexGrupo},${i},'peso',this.value)" /></span>
          <button onclick="eliminarEjercicio(${indexDia},${indexGrupo},${i})">🗑️</button>
        `;
        ulEjercicios.appendChild(item);
      });
      liDia.appendChild(ulEjercicios);

      // Botón para agregar ejercicio al grupo
      let btnAgregarEjercicio = document.createElement('button');
      btnAgregarEjercicio.textContent = '➕ Agregar ejercicio';
      btnAgregarEjercicio.onclick = () => mostrarFormularioAgregarEjercicio(indexDia, indexGrupo);
      liDia.appendChild(btnAgregarEjercicio);
    });

    // Botón eliminar rutina/día
    let btnEliminar = document.createElement('button');
    btnEliminar.textContent = '❌ Eliminar día';
    btnEliminar.onclick = () => {
      if (confirm('¿Seguro que deseas eliminar este día?')) eliminarRutina(indexDia);
    };
    liDia.appendChild(btnEliminar);

    lista.appendChild(liDia);
  });
}

// Modificar ejercicio de una rutina por día y grupo
function modificarEjercicio(diaIdx, grupoIdx, ejercicioIdx, campo, valor) {
  let rutinas = getRutinasUsuario();
  rutinas[diaIdx].grupos[grupoIdx].ejercicios[ejercicioIdx][campo] =
    campo === 'series' || campo === 'repeticiones' ? parseInt(valor) : valor;
  setRutinasUsuario(rutinas);
}

// Eliminar ejercicio de un grupo en un día
function eliminarEjercicio(diaIdx, grupoIdx, ejercicioIdx) {
  let rutinas = getRutinasUsuario();
  rutinas[diaIdx].grupos[grupoIdx].ejercicios.splice(ejercicioIdx, 1);
  setRutinasUsuario(rutinas);
}

// Mostrar formulario para agregar ejercicio a un grupo en un día
function mostrarFormularioAgregarEjercicio(diaIdx, grupoIdx) {
  let nombre = prompt('Nombre del ejercicio:');
  if (!nombre) return;
  let series = parseInt(prompt('Cantidad de series:', '3'));
  let repeticiones = parseInt(prompt('Cantidad de repeticiones:', '10'));
  let peso = prompt('Peso:', '20kg');
  if (!series || !repeticiones || !peso) return;

  let rutinas = getRutinasUsuario();
  rutinas[diaIdx].grupos[grupoIdx].ejercicios.push({
    ejercicio: nombre,
    series: series,
    repeticiones: repeticiones,
    peso: peso,
  });
  setRutinasUsuario(rutinas);
}

// Eliminar rutina/día
function eliminarRutina(indexDia) {
  let rutinas = getRutinasUsuario();
  rutinas.splice(indexDia, 1);
  setRutinasUsuario(rutinas);
}

// Agregar rutina/día
function asignarRutina(dia) {
  let rutinas = getRutinasUsuario();
  let encontrada = rutinasDisponibles.find((r) => r.dia === dia);

  if (encontrada && !rutinas.some((r) => r.dia === encontrada.dia)) {
    rutinas.push(JSON.parse(JSON.stringify(encontrada))); // Copia profunda
    setRutinasUsuario(rutinas);
    mostrarMensaje('loginMsg', '✅ Rutina agregada', 'success');
  } else {
    mostrarMensaje('loginMsg', '⚠️ Ese día ya está en tu lista.', 'error');
  }
}

mostrarRutinas();

// ==========================
// CLASES POR USUARIO
// ==========================
function reservarClase() {
  let usuario = localStorage.getItem('usuarioActivo');
  if (!usuario) {
    mostrarMensaje('mensajeGlobal', 'Debes iniciar sesión primero.', 'error');
    mostrarSeccion('login');
    return;
  }

  let clase = document.getElementById('claseSelect').value;
  let reservas = JSON.parse(localStorage.getItem('clases')) || {};
  if (!reservas[usuario]) reservas[usuario] = [];
  reservas[usuario].push({ clase, fecha: new Date().toLocaleString() });
  localStorage.setItem('clases', JSON.stringify(reservas));
  mostrarMensaje('mensajeGlobal', '✅ Clase reservada', 'success');
  mostrarClases();
}

function mostrarClases() {
  let lista = document.getElementById('listaClases');
  lista.innerHTML = '';
  let usuario = localStorage.getItem('usuarioActivo');
  if (!usuario) {
    lista.innerHTML = '<li>Debes iniciar sesión para ver tus clases.</li>';
    return;
  }
  let reservas = JSON.parse(localStorage.getItem('clases')) || {};
  let clasesUsuario = reservas[usuario] || [];
  if (clasesUsuario.length === 0) {
    lista.innerHTML = '<li>No tienes clases reservadas.</li>';
    return;
  }
  clasesUsuario
    .slice()
    .reverse()
    .forEach((r, idx) => {
      let li = document.createElement('li');
      li.textContent = `📅 ${r.clase} - ${r.fecha}`;
      // Botón para cancelar clase
      let btnCancelar = document.createElement('button');
      btnCancelar.textContent = '❌ Cancelar';
      btnCancelar.onclick = () => cancelarClase(idx);
      li.appendChild(btnCancelar);
      lista.appendChild(li);
    });
}

// Cancelar clase reservada
function cancelarClase(index) {
  let usuario = localStorage.getItem('usuarioActivo');
  let reservas = JSON.parse(localStorage.getItem('clases')) || {};
  if (!reservas[usuario]) return;
  let clasesUsuario = reservas[usuario];
  let realIndex = clasesUsuario.length - 1 - index;
  clasesUsuario.splice(realIndex, 1);
  reservas[usuario] = clasesUsuario;
  localStorage.setItem('clases', JSON.stringify(reservas));
  mostrarClases();
}
function cerrarSesion() {
  localStorage.removeItem('usuarioActivo');
  // Actualiza el título correctamente
  const logoText = document.querySelector('.logo-text');
  if (logoText) logoText.innerText = 'Gym App';
  mostrarSeccion('login');
  limpiarMensajes();
  limpiarFormularios();
}
window.cerrarSesion = cerrarSesion;
// ==========================
// AUTOFOCUS EN LOGIN
// ==========================
window.onload = () => {
  document.getElementById('usuario').focus();
  if (localStorage.getItem('usuarioActivo')) {
    document.querySelector('header h1').innerText = `🏋️‍♂️ Gym App | ${localStorage.getItem('usuarioActivo')}`;
  }
};
