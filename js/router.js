/**
 * Enrutador para la aplicación SPA
 */

// Importar las funciones nombradas en lugar de defaults
import { renderAdminView } from './views/admin.js';
import { renderRegisterView } from './views/register.js';
import { renderReportsView } from './views/reports.js';

export function initRouter() {
    // Configuración del enrutador
    const routes = {
        'admin': renderAdminView,
        'register': renderRegisterView,
        'reports': renderReportsView,
        // Ruta por defecto
        'default': renderRegisterView
    };

    // Función para cambiar de vista
    function navigateTo(route) {
        const renderFunction = routes[route] || routes['default'];
        renderFunction();
    }

    // Asignar eventos a los enlaces de navegación
    document.querySelectorAll('[data-route]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const route = e.target.getAttribute('data-route');
            navigateTo(route);
        });
    });

    // Cargar la vista por defecto
    navigateTo('default');
}