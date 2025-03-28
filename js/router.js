/**
 * Enrutador para la aplicación SPA
 */

// Importar las vistas aquí
import RegisterView from './views/register.js';
import ReportsView from './views/reports.js';
import Admin from './views/admin.js';

const Router = {
    /**
     * Ruta actual
     */
    currentRoute: 'register',
    
    /**
     * Rutas disponibles y sus controladores
     */
    routes: {
        'register': RegisterView,
        'reports': ReportsView,
        'admin': Admin
    },
    
    /**
     * Inicializa el enrutador
     */
    init() {
        // Cargar ruta desde URL hash (si existe)
        const hash = window.location.hash.slice(1);
        if (hash && this.routes[hash]) {
            this.currentRoute = hash;
        }
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Cargar vista inicial
        this.navigateTo(this.currentRoute);
    },
    
    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        // Listener para clicks en navegación
        document.querySelectorAll('[data-route]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const route = e.target.getAttribute('data-route');
                this.navigateTo(route);
            });
        });
        
        // Listener para cambios en el hash de la URL
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.slice(1);
            if (hash && this.routes[hash]) {
                this.navigateTo(hash);
            }
        });
    },
    
    /**
     * Navega a una ruta específica
     * @param {string} route Nombre de la ruta
     */
    navigateTo(route) {
        // Verificar si la ruta existe
        if (!this.routes[route]) {
            console.error('Ruta no encontrada:', route);
            route = 'register'; // Ruta por defecto
        }
        
        // Actualizar ruta actual
        this.currentRoute = route;
        
        // Actualizar URL hash (sin disparar evento)
        window.history.pushState(null, null, `#${route}`);
        
        // Actualizar estado de navegación
        this.updateNavState();
        
        // Inicializar la vista correspondiente
        this.routes[route].init();
    },
    
    /**
     * Actualiza el estado visual de la navegación
     */
    updateNavState() {
        // Eliminar clase active de todos los enlaces
        document.querySelectorAll('[data-route]').forEach(link => {
            link.classList.remove('active');
        });
        
        // Agregar clase active al enlace actual
        const activeLink = document.querySelector(`[data-route="${this.currentRoute}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
};

export default Router;