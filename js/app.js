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
    console.log("Actualizando referencias globales a Entidad con:", newEntityName);
    
    // Actualizar modal de entidad
    const entityModalTitle = document.getElementById('entityModalTitle');
    if (entityModalTitle) {
        if (entityModalTitle.textContent === "Entidad Principal") {
            entityModalTitle.textContent = newEntityName + " Principal";
        }
    }
    
    // Actualizar texto en el título del modal de asignación de campos
    const assignModalTitle = document.querySelector('#assignFieldsModal .modal-title');
    if (assignModalTitle) {
        // Mantener el texto "Asignar Campos a " pero no modificar el span
        const titleText = assignModalTitle.textContent;
        if (titleText.startsWith("Asignar Campos a")) {
            const spanElement = assignModalTitle.querySelector('span');
            if (spanElement) {
                const spanContent = spanElement.textContent;
                assignModalTitle.textContent = "Asignar Campos a ";
                assignModalTitle.appendChild(spanElement);
            }
        }
    }
}