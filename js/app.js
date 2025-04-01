/**
 * Punto de entrada principal de la aplicación
 */
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar almacenamiento
    StorageService.initializeStorage();

    // Aplicar configuración personalizada
    const config = StorageService.getConfig();

    // Actualizar navbar-brand
    if (config.navbarTitle) {
        document.querySelector('.navbar-brand').textContent = config.navbarTitle;
    }

    // Actualizar referencias a "Entidad" en la página inicial
    if (config.entityName) {
        updateGlobalEntityReferences(config.entityName);
    }

    // Inicializar enrutador
    Router.init();

    // Configurar exportación de datos
    document.getElementById('export-data-btn').addEventListener('click', () => {
        ExportUtils.exportToFile();
    });

    // Configurar importación de datos
    document.getElementById('import-btn').addEventListener('click', () => {
        document.getElementById('import-file').click();
    });

    document.getElementById('import-file').addEventListener('change', (e) => {
        if (e.target.files.length === 0) return;

        const file = e.target.files[0];

        // Confirmar importación
        const confirmModal = UIUtils.initModal('confirmModal');
        const confirmMessage = document.getElementById('confirm-message');
        const confirmActionBtn = document.getElementById('confirmActionBtn');

        confirmMessage.textContent = `¿Está seguro de importar los datos desde "${file.name}"? Esta acción sobrescribirá todos los datos existentes.`;

        // Eliminar listeners anteriores
        const newConfirmBtn = confirmActionBtn.cloneNode(true);
        confirmActionBtn.parentNode.replaceChild(newConfirmBtn, confirmActionBtn);

        // Agregar nuevo listener
        newConfirmBtn.addEventListener('click', () => {
            ExportUtils.importFromFile(file)
                .then(message => {
                    bootstrap.Modal.getInstance(document.getElementById('confirmModal')).hide();
                    UIUtils.showAlert('Datos importados correctamente. La página se recargará.', 'success');

                    // Recargar la página después de 2 segundos
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                })
                .catch(error => {
                    bootstrap.Modal.getInstance(document.getElementById('confirmModal')).hide();
                    UIUtils.showAlert('Error al importar datos: ' + error.message, 'danger');
                });
        });

        confirmModal.show();

        // Resetear input file
        e.target.value = '';
    });
});

/**
 * Actualiza todas las referencias a "Entidad" en la página inicial
 /** @param {string} newEntityName El nuevo nombre para "Entidad"
 */
function updateGlobalEntityReferences(newEntityName) {
    // Actualizar títulos de modales
    const entityModalTitle = document.getElementById('entityModalTitle');
    if (entityModalTitle && entityModalTitle.textContent.includes("Entidad")) {
        entityModalTitle.textContent = entityModalTitle.textContent.replace("Entidad", newEntityName);
    }
    
    // Actualizar texto en el título del modal de asignación de campos
    const assignModalTitle = document.querySelector('#assignFieldsModal .modal-title');
    if (assignModalTitle) {
        const titleText = assignModalTitle.textContent;
        if (titleText.includes("Asignar Campos a")) {
            // Obtener solo la parte "Asignar Campos a" sin afectar al span
            const parts = titleText.split(/\s+/);
            if (parts.length >= 3) {
                assignModalTitle.firstChild.textContent = "Asignar Campos a ";
            }
        }
    }
    
    // Otros elementos estáticos que puedan contener la palabra "Entidad"
    document.querySelectorAll('button, h5, p, label, div').forEach(el => {
        if (el.childNodes && el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
            // Nodo de texto directo
            if (el.textContent.includes("Entidad")) {
                el.textContent = el.textContent.replace(/Entidad/g, newEntityName);
            } else if (el.textContent.includes("entidad")) {
                el.textContent = el.textContent.replace(/entidad/g, newEntityName.toLowerCase());
            }
        }
    });
}