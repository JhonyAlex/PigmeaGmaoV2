// js/app.js
(function() {
    // --- Inicialización ---
    function init() {
        console.log('App Initializing...');
        setupNavigation();
        setupImportExport();

        // Renderizar sección inicial (Registro por defecto)
        UI.renderRegisterSection();
        UI.showSection('register'); // Mostrar sección de registro

        // Inicializar módulos de secciones (para que sus listeners estén listos)
        Admin.init();
        Register.init();
        Reports.init();

        // Renderizar secciones admin y reportes en segundo plano (para que estén listas al navegar)
        // Se renderizarán completamente al mostrarse si es necesario
        UI.renderAdminSection();
        UI.renderReportsSection();

        // Mostrar sección inicial correcta (puede ser otra si se guarda el estado)
        // Por defecto, empezamos en 'register'
        navigateTo('register');


        console.log('App Ready.');
    }

    // --- Navegación SPA ---
    function setupNavigation() {
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const sectionId = link.dataset.section;
                navigateTo(sectionId);
            });
        });
    }

    function navigateTo(sectionId) {
         console.log('Navigating to:', sectionId);
         // Asegurar que la sección está renderizada/actualizada antes de mostrarla
         switch(sectionId) {
             case 'admin':
                 // Renderizar siempre por si hay cambios
                 UI.renderAdminSection();
                 break;
             case 'register':
                 // Renderizar siempre por si settings cambiaron
                 UI.renderRegisterSection();
                 // Restaurar estado si es necesario (ej. entidad seleccionada)
                 // Esto ya lo maneja el propio módulo Register con refreshIfNeeded si es necesario
                 break;
              case 'reports':
                  // Renderizar siempre para actualizar filtros y estructura
                  UI.renderReportsSection();
                   // Aplicar filtros guardados si los hay
                  Reports.refreshIfNeeded();
                  break;
         }
        UI.showSection(sectionId);
    }


    // --- Import/Export ---
    function setupImportExport() {
        const exportButton = document.getElementById('export-button');
        const importFileElement = document.getElementById('import-file');

        exportButton.addEventListener('click', handleExport);
        importFileElement.addEventListener('change', handleImport);
    }

    function handleExport() {
        try {
            const allData = Storage.getAllData();
            const jsonData = JSON.stringify(allData, null, 2); // Pretty print JSON
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const timestamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
            a.href = url;
            a.download = `generic-logger-backup-${timestamp}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            console.log('Data exported successfully.');
        } catch (e) {
            console.error('Error exporting data:', e);
            alert('Error al exportar los datos.');
        }
    }

    function handleImport(event) {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const jsonData = e.target.result;
            // Preguntar al usuario (simple confirm por ahora)
            if (confirm('¿Importar datos? Esto SOBRESCRIBIRÁ todos los datos existentes.')) {
                const success = Storage.importAllData(jsonData, true); // true = overwrite
                if (success) {
                    alert('Datos importados con éxito. La aplicación se recargará para aplicar los cambios.');
                    // Forzar recarga o re-inicialización completa
                    location.reload(); // La forma más simple de asegurar que todo se refresca
                    // Alternativamente, llamar a init() de nuevo y navegar a la sección por defecto,
                    // pero reload es más robusto tras un import completo.
                } else {
                    // El error ya se mostró en Storage.importAllData
                    // Resetear el input de archivo para permitir reintentar con el mismo archivo
                     event.target.value = null;
                }
            } else {
                // Resetear el input de archivo si el usuario cancela
                 event.target.value = null;
            }
        };
        reader.onerror = (e) => {
             console.error('Error reading file:', e);
             alert('Error al leer el archivo.');
             event.target.value = null;
        };
        reader.readAsText(file);
    }

    // --- Iniciar la aplicación cuando el DOM esté listo ---
    document.addEventListener('DOMContentLoaded', init);

})(); // IIFE para encapsular