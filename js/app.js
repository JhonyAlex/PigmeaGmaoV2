// Importar StorageService y otras dependencias necesarias
import { StorageService } from './models/storage.js';
import { initRouter } from './router.js';

/**
 * Punto de entrada principal de la aplicación
 */
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar el servicio de almacenamiento
    const storageService = new StorageService();
    
    // Hacer disponible el servicio de almacenamiento para otros módulos si es necesario
    window.storageService = storageService;
    
    // Inicializar el enrutador
    initRouter();
    
    // Configurar otros componentes de la aplicación
    setupEventListeners();
});

// Función para configurar los event listeners
function setupEventListeners() {
    // Configurar eventos para los botones de exportar e importar
    const exportBtn = document.getElementById('export-data-btn');
    const importBtn = document.getElementById('import-btn');
    const importFile = document.getElementById('import-file');
    
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            ExportUtils.exportToFile();
        });
    }
    
    if (importBtn && importFile) {
        importBtn.addEventListener('click', () => {
            importFile.click();
        });
        
        importFile.addEventListener('change', (e) => {
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
    }
}