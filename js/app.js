/**
 * Punto de entrada principal de la aplicación
 */
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar almacenamiento
    StorageService.initializeStorage();
    
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