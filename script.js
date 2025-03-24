        // Funciones para mostrar y ocultar secciones
        function mostrarSeccion(seccionId) {
            document.querySelectorAll('.card').forEach(card => card.style.display = 'none');
            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

            document.getElementById(seccionId).style.display = 'block';
            document.querySelector(`a[href="#${seccionId}"]`).classList.add('active');
        }

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                mostrarSeccion(this.getAttribute('href').substring(1));
            });
        });

        // Función para mostrar mensajes de alerta
        function mostrarMensaje(mensaje, tipo, elementoId) {
            const elemento = document.getElementById(elementoId);
            elemento.textContent = mensaje;
            elemento.className = `mt-4 alert alert-${tipo}`;
            elemento.style.display = 'block';
            setTimeout(() => {
                elemento.style.display = 'none';
            }, 5000); // El mensaje desaparece después de 5 segundos
        }

        // --- Funciones de Administración de Máquinas ---
        function cargarMaquinas() {
            const listaMaquinas = document.getElementById('lista-maquinas');
            listaMaquinas.innerHTML = '';
            const maquinas = JSON.parse(localStorage.getItem('maquinas')) || [];
            maquinas.forEach(maquina => {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.textContent = maquina.nombre;
                listaMaquinas.appendChild(li);
            });

            // Llena el select de máquinas en otros formularios
            const maquinaSelects = document.querySelectorAll('select[name="maquina"], select[name="maquina-reporte"], #maquina-campo');
            maquinaSelects.forEach(select => {
                select.innerHTML = '<option value="">Seleccione una máquina</option>';
                maquinas.forEach(maquina => {
                    const option = document.createElement('option');
                    option.value = maquina.nombre;
                    option.textContent = maquina.nombre;
                    select.appendChild(option);
                });
            });
        }

        document.getElementById('form-agregar-maquina').addEventListener('submit', (event) => {
            event.preventDefault();
            const nombre = document.getElementById('nombre-maquina').value.trim();

            if (!nombre) {
                mostrarMensaje('Por favor, ingrese el nombre de la máquina.', 'danger', 'mensaje-maquina');
                return;
            }

            const nuevaMaquina = { nombre };
            const maquinas = JSON.parse(localStorage.getItem('maquinas')) || [];
            maquinas.push(nuevaMaquina);
            localStorage.setItem('maquinas', JSON.stringify(maquinas));
            cargarMaquinas();
            document.getElementById('nombre-maquina').value = '';
            mostrarMensaje('Máquina agregada correctamente.', 'success', 'mensaje-maquina');
        });

        // --- Funciones de Administración de Turnos ---
        function cargarTurnos() {
            const listaTurnos = document.getElementById('lista-turnos');
            listaTurnos.innerHTML = '';
            const turnos = JSON.parse(localStorage.getItem('turnos')) || [];
            turnos.forEach(turno => {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.textContent = `${turno.nombre} (${turno.horaInicio} - ${turno.horaFin})`;
                listaTurnos.appendChild(li);
            });

             // Llena el select de turnos en el formulario de registro
            const turnoSelect = document.getElementById('turno');
            turnoSelect.innerHTML = '<option value="">Seleccione un turno</option>';
            turnos.forEach(turno => {
                const option = document.createElement('option');
                option.value = turno.nombre;
                option.textContent = `${turno.nombre} (${turno.horaInicio} - ${turno.horaFin})`;
turnoSelect.appendChild(option);
            });
        }

        document.getElementById('form-agregar-turno').addEventListener('submit', (event) => {
            event.preventDefault();
            const nombre = document.getElementById('nombre-turno').value.trim();
            const horaInicio = document.getElementById('hora-inicio-turno').value.trim();
            const horaFin = document.getElementById('hora-fin-turno').value.trim();

            if (!nombre || !horaInicio || !horaFin) {
                mostrarMensaje('Por favor, ingrese el nombre, la hora de inicio y la hora de fin del turno.', 'danger', 'mensaje-turno');
                return;
            }

             if (horaFin <= horaInicio) {
                mostrarMensaje('La hora de fin debe ser posterior a la hora de inicio.', 'danger', 'mensaje-turno');
                return;
            }

            const nuevoTurno = { nombre, horaInicio, horaFin };
            const turnos = JSON.parse(localStorage.getItem('turnos')) || [];
            turnos.push(nuevoTurno);
            localStorage.setItem('turnos', JSON.stringify(turnos));
            cargarTurnos();
            document.getElementById('nombre-turno').value = '';
            document.getElementById('hora-inicio-turno').value = '';
            document.getElementById('hora-fin-turno').value = '';
            mostrarMensaje('Turno agregado correctamente.', 'success', 'mensaje-turno');
        });

        // --- Funciones de Administración de Operarios ---
        function cargarOperarios() {
            const listaOperarios = document.getElementById('lista-operarios');
            listaOperarios.innerHTML = '';
            const operarios = JSON.parse(localStorage.getItem('operarios')) || [];
            operarios.forEach(operario => {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.textContent = operario.nombre;
                listaOperarios.appendChild(li);
            });

            // Llena el select de operarios en el formulario de registro
            const operarioSelect = document.getElementById('operario');
            operarioSelect.innerHTML = '<option value="">Seleccione un operario</option>';
            operarios.forEach(operario => {
                const option = document.createElement('option');
                option.value = operario.nombre;
                option.textContent = operario.nombre;
                operarioSelect.appendChild(option);
            });
        }

        document.getElementById('form-agregar-operario').addEventListener('submit', (event) => {
            event.preventDefault();
            const nombre = document.getElementById('nombre-operario').value.trim();

            if (!nombre) {
                mostrarMensaje('Por favor, ingrese el nombre del operario.', 'danger', 'mensaje-operario');
                return;
            }

            const nuevoOperario = { nombre };
            const operarios = JSON.parse(localStorage.getItem('operarios')) || [];
            operarios.push(nuevoOperario);
            localStorage.setItem('operarios', JSON.stringify(operarios));
            cargarOperarios();
            document.getElementById('nombre-operario').value = '';
            mostrarMensaje('Operario agregado correctamente.', 'success', 'mensaje-operario');
        });

        // --- Funciones de Administración de Campos de Máquina ---
        function cargarCamposMaquina() {
            const maquinaSelect = document.getElementById('maquina-campo');
             // Limpiar el select y agregar la opción por defecto
            maquinaSelect.innerHTML = '<option value="">Seleccione una máquina</option>';

            const maquinas = JSON.parse(localStorage.getItem('maquinas')) || [];
            maquinas.forEach(maquina => {
                const option = document.createElement('option');
                option.value = maquina.nombre;
                option.textContent = maquina.nombre;
                maquinaSelect.appendChild(option);
            });
        }

        document.getElementById('tipo-campo').addEventListener('change', (event) => {
            const opcionesCampoGroup = document.getElementById('opciones-campo-group');
            if (event.target.value === 'lista') {
                opcionesCampoGroup.style.display = 'block';
            } else {
                opcionesCampoGroup.style.display = 'none';
            }
        });

        document.getElementById('form-agregar-campo-maquina').addEventListener('submit', (event) => {
            event.preventDefault();
            const maquina = document.getElementById('maquina-campo').value;
            const nombreCampo = document.getElementById('nombre-campo').value.trim();
            const tipoCampo = document.getElementById('tipo-campo').value;
            const opcionesCampo = document.getElementById('opciones-campo').value.trim();

            if (!maquina || !nombreCampo || !tipoCampo) {
                mostrarMensaje('Por favor, complete todos los campos.', 'danger', 'mensaje-campo-maquina');
                return;
            }

            if (tipoCampo === 'lista' && !opcionesCampo) {
                mostrarMensaje('Por favor, ingrese las opciones para el campo de lista.', 'danger', 'mensaje-campo-maquina');
                return;
            }

            const nuevoCampo = {
                nombre: nombreCampo,
                tipo: tipoCampo,
                opciones: tipoCampo === 'lista' ? opcionesCampo.split(',').map(opcion => opcion.trim()) : null
            };

            let camposMaquina = JSON.parse(localStorage.getItem('camposMaquina')) || {};
            if (!camposMaquina[maquina]) {
                camposMaquina[maquina] = [];
            }
            camposMaquina[maquina].push(nuevoCampo);
            localStorage.setItem('camposMaquina', JSON.stringify(camposMaquina));

            document.getElementById('maquina-campo').value = '';
            document.getElementById('nombre-campo').value = '';
            document.getElementById('tipo-campo').value = '';
            document.getElementById('opciones-campo').value = '';
            document.getElementById('opciones-campo-group').style.display = 'none';
            mostrarMensaje('Campo agregado correctamente.', 'success', 'mensaje-campo-maquina');
            actualizarCamposPorMaquina();
            actualizarFormularioRegistro(); // Actualiza el formulario de registro con los nuevos campos
        });

        function actualizarCamposPorMaquina() {
            const camposPorMaquinaDiv = document.getElementById('campos-por-maquina');
            camposPorMaquinaDiv.innerHTML = ''; // Limpiar el contenido

            const camposMaquinaData = JSON.parse(localStorage.getItem('camposMaquina')) || {};

            for (const maquina in camposMaquinaData) {
                const campos = camposMaquinaData[maquina];
                const maquinaDiv = document.createElement('div');
                maquinaDiv.className = 'mb-4 p-4 border rounded-md bg-gray-50';

                const tituloMaquina = document.createElement('h5');
                tituloMaquina.className = 'font-semibold mb-2 text-gray-700';
                tituloMaquina.textContent = `Máquina: ${maquina}`;
                maquinaDiv.appendChild(tituloMaquina);

                const listaCampos = document.createElement('ul');
                listaCampos.className = 'list-disc list-inside space-y-1';
                campos.forEach(campo => {
                    const itemCampo = document.createElement('li');
                    itemCampo.textContent = `${campo.nombre} (${campo.tipo})`;
                    listaCampos.appendChild(itemCampo);
                });
                maquinaDiv.appendChild(listaCampos);
                camposPorMaquinaDiv.appendChild(maquinaDiv);
            }
        }

        // --- Funciones de Registro de Producción ---
        function actualizarFormularioRegistro() {
            const maquinaSelect = document.getElementById('maquina');
            const camposDinamicosDiv = document.getElementById('campos-dinamicos');
            camposDinamicosDiv.innerHTML = ''; // Limpiar campos dinámicos

            const maquinaSeleccionada = maquinaSelect.value;
            const camposMaquinaData = JSON.parse(localStorage.getItem('camposMaquina')) || {};

            if (camposMaquinaData[maquinaSeleccionada]) {
                const campos = camposMaquinaData[maquinaSeleccionada];
                campos.forEach(campo => {
                    const formGroup = document.createElement('div');
                    formGroup.className = 'form-group';

                    const label = document.createElement('label');
                    label.className = 'form-label';
                    label.textContent = campo.nombre + ':';
                    label.setAttribute('for', `campo-${campo.nombre}`);
                    formGroup.appendChild(label);

                    let input;
                    switch (campo.tipo) {
                        case 'texto':
                            input = document.createElement('input');
                            input.type = 'text';
                            input.id = `campo-${campo.nombre}`;
                            input.name = `campo-${campo.nombre}`;
                            input.className = 'form-control';
                            input.maxLength = "50";
                            break;
                        case 'numero':
                            input = document.createElement('input');
                            input.type = 'number';
                            input.id = `campo-${campo.nombre}`;
                            input.name = `campo-${campo.nombre}`;
                            input.className = 'form-control';
                            break;
                        case 'lista':
                            input = document.createElement('select');
                            input.id = `campo-${campo.nombre}`;
                            input.name = `campo-${campo.nombre}`;
                            input.className = 'form-select';
                            const defaultOption = document.createElement('option');
                            defaultOption.value = "";
                            defaultOption.textContent = `Seleccione ${campo.nombre}`;
                            input.appendChild(defaultOption);
                            campo.opciones.forEach(opcion => {
                                const option = document.createElement('option');
                                option.value = opcion;
                                option.textContent = opcion;
                                input.appendChild(option);
                            });
                            break;
                    }
                    input.required = true;
                    formGroup.appendChild(input);
                    camposDinamicosDiv.appendChild(formGroup);
                });
            }
        }

        document.getElementById('maquina').addEventListener('change', actualizarFormularioRegistro);

        document.getElementById('form-registro-produccion').addEventListener('submit', (event) => {
            event.preventDefault();

            const fecha = document.getElementById('fecha').value;
            const hora = document.getElementById('hora').value;
            const turno = document.getElementById('turno').value;
            const operario = document.getElementById('operario').value;
            const maquina = document.getElementById('maquina').value;

            // Validación de campos comunes
             if (!fecha || !hora || !turno || !operario || !maquina) {
                mostrarMensaje('Por favor, complete todos los campos requeridos.', 'danger', 'mensaje-registro');
                return;
            }

            // Validación de campos dinámicos
            const camposMaquinaData = JSON.parse(localStorage.getItem('camposMaquina')) || {};
            const camposDinamicos = camposMaquinaData[maquina] || [];
            const registro = {
                fecha,
                hora,
                turno,
                operario,
                maquina
            };

            let camposValidos = true;
            camposDinamicos.forEach(campo => {
                const valorCampo = document.getElementById(`campo-${campo.nombre}`).value;
                if (!valorCampo) {
                    camposValidos = false;
                }
                registro[`campo-${campo.nombre}`] = valorCampo;
            });

            if (!camposValidos) {
                mostrarMensaje('Por favor, complete todos los campos de la máquina.', 'danger', 'mensaje-registro');
                return;
            }

            // Almacenar el registro
            let registros = JSON.parse(localStorage.getItem('registros')) || [];
            registros.push(registro);
            localStorage.setItem('registros', JSON.stringify(registros));

            mostrarMensaje('Registro de producción guardado correctamente.', 'success', 'mensaje-registro');
            document.getElementById('form-registro-produccion').reset();
            actualizarFormularioRegistro(); // Limpia los campos dinámicos
        });

        // --- Funciones de Reportes de Producción ---
        function generarGrafico(datos, titulo) {
            const canvas = document.getElementById('grafico-produccion');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas antes de dibujar un nuevo gráfico

            const labels = datos.map(registro => `${registro.fecha} ${registro.hora}`);
            const cantidades = datos.map(registro => {
                let cantidad = 0;
                 for (const key in registro) {
                    if (key.startsWith('campo-')) {
                        cantidad += Number(registro[key]) || 0;
                    }
                 }
                 return cantidad;
            });

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: titulo,
                        data: cantidades,
                        backgroundColor: '#3b82f6', // Color de las barras
                        borderColor: '#2563eb',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: titulo,
                            font: {
                                size: 16
                            }
                        },
                        legend: {
                            position: 'bottom'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return value;  // convert it to string
                                }
                            }
                        }
                    }
                }
            });
        }

        function generarTabla(datos, camposDinamicos) {
          const tabla = document.querySelector('#reporte-tabla table tbody');
          tabla.innerHTML = ''; // Limpia la tabla

          // Agrega las columnas dinámicas al encabezado de la tabla
          const encabezado = document.querySelector('#reporte-tabla table thead tr');
          // Limpiamos las columnas dinámicas para no duplicarlas
          while (encabezado.cells.length > 5) {
            encabezado.deleteCell(-1);
          }
          camposDinamicos.forEach(campo => {
            const th = document.createElement('th');
            th.textContent = campo.nombre;
            encabezado.appendChild(th);
          });

          datos.forEach(registro => {
            const fila = tabla.insertRow();
            const fechaCell = fila.insertCell();
            fechaCell.textContent = registro.fecha;
            const horaCell = fila.insertCell();
            horaCell.textContent = registro.hora;
            const turnoCell = fila.insertCell();
            turnoCell.textContent = registro.turno;
            const operarioCell = fila.insertCell();
            operarioCell.textContent = registro.operario;
            const maquinaCell = fila.insertCell();
            maquinaCell.textContent = registro.maquina;

            camposDinamicos.forEach(campo => {
              const valorCell = fila.insertCell();
              valorCell.textContent = registro[`campo-${campo.nombre}`] || '';
            });
          });
        }

        document.getElementById('generar-reporte').addEventListener('click', () => {
            const maquina = document.getElementById('maquina-reporte').value;
            const fechaInicio = document.getElementById('fecha-inicio-reporte').value;
            const fechaFin = document.getElementById('fecha-fin-reporte').value;

            if (!maquina || !fechaInicio || !fechaFin) {
                mostrarMensaje('Por favor, seleccione la máquina y las fechas de inicio y fin.', 'danger', 'mensaje-registro');
                return;
            }

            const registros = JSON.parse(localStorage.getItem('registros')) || [];
            const datosFiltrados = registros.filter(registro => {
                return registro.maquina === maquina &&
                       registro.fecha >= fechaInicio &&
                       registro.fecha <= fechaFin;
            });

             if (datosFiltrados.length === 0) {
                mostrarMensaje('No se encontraron registros para los criterios seleccionados.', 'danger', 'mensaje-registro');
                document.getElementById('reporte-grafico').style.display = 'none';
                document.getElementById('reporte-tabla').style.display = 'none';
                return;
            }

            const camposMaquinaData = JSON.parse(localStorage.getItem('camposMaquina')) || {};
            const camposDinamicos = camposMaquinaData[maquina] || [];

            const tituloReporte = `Producción de la Máquina ${maquina} entre ${fechaInicio} y ${fechaFin}`;
            generarGrafico(datosFiltrados, tituloReporte);
            generarTabla(datosFiltrados, camposDinamicos);

            document.getElementById('reporte-grafico').style.display = 'block';
            document.getElementById('reporte-tabla').style.display = 'block';
        });

        // --- Inicialización ---
        document.addEventListener('DOMContentLoaded', () => {
            cargarMaquinas();
            cargarTurnos();
            cargarOperarios();
            cargarCamposMaquina();
            actualizarFormularioRegistro(); // Asegúrate de que el formulario de registro se actualice al cargar la página
            mostrarSeccion('registro-produccion'); // Muestra la sección de registro por defecto
        });
