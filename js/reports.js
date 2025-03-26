// js/reports.js
const Reports = (() => {
    const reportsSection = document.getElementById('reports-section');
    let currentFilters = { entityId: '', startDate: '', endDate: '' }; // Estado de los filtros

    function initReports() {
         reportsSection.addEventListener('click', handleReportsClick);
    }

    function handleReportsClick(event) {
        if (event.target.id === 'apply-report-filters') {
             applyFiltersAndRender();
        }
    }

    function applyFiltersAndRender() {
        const entityFilter = reportsSection.querySelector('#report-entity-filter')?.value || '';
        const startDateFilter = reportsSection.querySelector('#report-date-start')?.value || '';
        const endDateFilter = reportsSection.querySelector('#report-date-end')?.value || '';

        // Guardar filtros actuales
        currentFilters = { entityId: entityFilter, startDate: startDateFilter, endDate: endDateFilter };

        let filteredRegistrations = Storage.getRegistrations(); // Ya vienen ordenados por fecha desc

        // Aplicar filtro de entidad
        if (entityFilter) {
            filteredRegistrations = filteredRegistrations.filter(reg => reg.entityId === entityFilter);
        }

        // Aplicar filtro de fecha inicio
        if (startDateFilter) {
            const start = new Date(startDateFilter);
            start.setHours(0, 0, 0, 0); // Comparar desde el inicio del día
            filteredRegistrations = filteredRegistrations.filter(reg => new Date(reg.timestamp) >= start);
        }

        // Aplicar filtro de fecha fin
         if (endDateFilter) {
            const end = new Date(endDateFilter);
            end.setHours(23, 59, 59, 999); // Comparar hasta el final del día
            filteredRegistrations = filteredRegistrations.filter(reg => new Date(reg.timestamp) <= end);
        }

        // Renderizar tabla y gráficos con los datos filtrados
        UI.renderReportTable(filteredRegistrations);
        UI.renderComparisonCharts(filteredRegistrations);
    }

     // Función para refrescar la sección si es necesario (ej. tras cambios en admin o registro)
    function refreshIfNeeded() {
        if (!reportsSection.classList.contains('d-none')) {
            // Re-renderizar la estructura base de reportes (actualiza filtros de entidad)
             UI.renderReportsSection();
             // Restaurar los valores de los filtros
             const entityFilterInput = reportsSection.querySelector('#report-entity-filter');
             const startDateInput = reportsSection.querySelector('#report-date-start');
             const endDateInput = reportsSection.querySelector('#report-date-end');
             if(entityFilterInput) entityFilterInput.value = currentFilters.entityId;
             if(startDateInput) startDateInput.value = currentFilters.startDate;
             if(endDateInput) endDateInput.value = currentFilters.endDate;

            // Volver a aplicar filtros y renderizar datos si había filtros activos
             if (currentFilters.entityId || currentFilters.startDate || currentFilters.endDate) {
                 applyFiltersAndRender();
             } else {
                 // Si no había filtros, solo mostrar la estructura vacía/mensajes iniciales
                 UI.renderReportTable([]);
                 UI.renderComparisonCharts([]);
             }
        }
    }


    return {
        init: initReports,
        refreshIfNeeded
    };
})();