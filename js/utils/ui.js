/**
 * Utilidades para la interfaz de usuario
 */
const UIUtils = {
    /**
     * Muestra un mensaje de alerta temporal
     * @param {string} message Mensaje a mostrar
     * @param {string} type Tipo de alerta ('success', 'danger', 'warning', 'info')
     * @param {HTMLElement} container Elemento donde mostrar la alerta
     */
    showAlert(message, type = 'info', container = document.body) {
        const alertId = 'alert-' + Date.now();
        const alertHTML = `
            <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        
        // Insertar al inicio del contenedor
        container.insertAdjacentHTML('afterbegin', alertHTML);
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            const alertElement = document.getElementById(alertId);
            if (alertElement) {
                const bsAlert = new bootstrap.Alert(alertElement);
                bsAlert.close();
            }
        }, 5000);
    },
    
    /**
     * Formatea una fecha ISO a una representación legible
     * @param {string} isoDate Fecha en formato ISO
     * @returns {string} Fecha formateada
     */
    formatDate(isoDate) {
        const date = new Date(isoDate);
        return date.toLocaleString();
    },
    
    /**
     * Inicializa un modal de Bootstrap
     * @param {string} modalId ID del modal
     * @returns {bootstrap.Modal} Instancia del modal
     */
    initModal(modalId) {
        const modalElement = document.getElementById(modalId);
        return new bootstrap.Modal(modalElement);
    },
    
    /**
     * Genera inputs dinámicos para un campo personalizado
     * @param {Object} field Definición del campo
     * @param {string} value Valor inicial (opcional)
     * @returns {string} HTML del campo
     */
    generateFieldInput(field, value = '') {
        const required = field.required ? 'required' : '';
        const requiredClass = field.required ? 'required-field' : '';
        let inputHTML = '';
        
        switch (field.type) {
            case 'text':
                inputHTML = `
                    <div class="mb-3 dynamic-field">
                        <label for="${field.id}" class="form-label ${requiredClass}">${field.name}</label>
                        <input type="text" class="form-control" id="${field.id}" name="${field.id}" value="${value}" ${required}>
                    </div>
                `;
                break;
                
            case 'number':
                inputHTML = `
                    <div class="mb-3 dynamic-field">
                        <label for="${field.id}" class="form-label ${requiredClass}">${field.name}</label>
                        <input type="number" class="form-control" id="${field.id}" name="${field.id}" value="${value}" step="any" ${required}>
                    </div>
                `;
                break;
                
            case 'select':
                const options = field.options.map(option => 
                    `<option value="${option}" ${option === value ? 'selected' : ''}>${option}</option>`
                ).join('');
                
                // Crear un campo select con capacidad de búsqueda
                inputHTML = `
                    <div class="mb-3 dynamic-field">
                        <label for="${field.id}" class="form-label ${requiredClass}">${field.name}</label>
                        <div class="select-with-search">
                            <select class="form-select searchable-select" id="${field.id}" name="${field.id}" ${required}>
                                <option value="" ${value ? '' : 'selected'}>-- Seleccione --</option>
                                ${options}
                            </select>
                            <div class="select-search-box d-none">
                                <div class="input-group">
                                    <span class="input-group-text"><i class="bi bi-search"></i></span>
                                    <input type="text" class="form-control select-search-input" placeholder="Buscar...">
                                </div>
                                <div class="select-search-options"></div>
                            </div>
                        </div>
                    </div>
                `;
                
                // Al insertar el HTML, debemos vincular los eventos de búsqueda
                setTimeout(() => {
                    this.setupSearchableSelect(`#${field.id}`);
                }, 0);
                break;
        }
        
        return inputHTML;
    },
    
    /**
     * Configura un select para que tenga función de búsqueda
     * @param {string} selector Selector del elemento select
     */
    setupSearchableSelect(selector) {
        const select = document.querySelector(selector);
        if (!select || !select.classList.contains('searchable-select')) return;
        
        const selectContainer = select.closest('.select-with-search');
        if (!selectContainer) return;
        
        const searchBox = selectContainer.querySelector('.select-search-box');
        const searchInput = selectContainer.querySelector('.select-search-input');
        const optionsContainer = selectContainer.querySelector('.select-search-options');
        
        if (!searchBox || !searchInput || !optionsContainer) return;
        
        // Estilos dinámicos para el cuadro de búsqueda
        if (!document.querySelector('style#searchable-select-styles')) {
            const styles = document.createElement('style');
            styles.id = 'searchable-select-styles';
            styles.textContent = `
                .select-with-search {
                    position: relative;
                }
                .select-search-box {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    z-index: 1000;
                    background: white;
                    border: 1px solid #ced4da;
                    border-radius: 0.25rem;
                    margin-top: 2px;
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
                    max-height: 300px;
                    overflow-y: auto;
                }
                .select-search-options {
                    max-height: 250px;
                    overflow-y: auto;
                }
                .select-search-option {
                    padding: 0.5rem 1rem;
                    cursor: pointer;
                }
                .select-search-option:hover {
                    background-color: #f8f9fa;
                }
                .select-search-option.active {
                    background-color: #e9ecef;
                }
            `;
            document.head.appendChild(styles);
        }
        
        // CORRECCIÓN DEL ERROR: Usamos un listener explícito en lugar de función anónima
        // para poder removerlo si es necesario
        const showSearchBox = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Mostrar cuadro de búsqueda
            searchBox.classList.remove('d-none');
            
            // Cargar todas las opciones
            updateOptions('');
            
            // Enfocar en el campo de búsqueda
            setTimeout(() => searchInput.focus(), 10);
        };
        
        // Al hacer clic en el select, mostrar el cuadro de búsqueda
        select.removeEventListener('click', showSearchBox); // Eliminar si existe
        select.addEventListener('click', showSearchBox);
        
        // Función para actualizar las opciones mostradas
        function updateOptions(searchText) {
            // CORRECCIÓN DEL ERROR: Validar que el select todavía existe en el DOM
            if (!select || !document.body.contains(select)) return;
            
            const options = Array.from(select.options).slice(1); // Ignorar el primer "Seleccione"
            const filtered = searchText ? 
                options.filter(opt => opt.text.toLowerCase().includes(searchText.toLowerCase())) : 
                options;
            
            optionsContainer.innerHTML = '';
            
            filtered.forEach(option => {
                const div = document.createElement('div');
                div.className = 'select-search-option';
                div.dataset.value = option.value;
                div.textContent = option.text;
                
                // CORRECCIÓN DEL ERROR: Manejar click sincrónico sin devolver promesa
                div.addEventListener('click', () => {
                    select.value = option.value;
                    searchBox.classList.add('d-none');
                    
                    // Disparar evento change para que funcionen validaciones u otros listeners
                    select.dispatchEvent(new Event('change', { bubbles: true }));
                });
                
                optionsContainer.appendChild(div);
            });
            
            if (filtered.length === 0) {
                const div = document.createElement('div');
                div.className = 'select-search-option text-muted';
                div.textContent = 'No se encontraron opciones';
                optionsContainer.appendChild(div);
            }
        }
        
        // Búsqueda en tiempo real
        const handleInput = function() {
            updateOptions(this.value);
        };
        searchInput.removeEventListener('input', handleInput);
        searchInput.addEventListener('input', handleInput);
        
        // CORRECCIÓN DEL ERROR: Usar un listener con nombre para poder eliminarlo
        const handleOutsideClick = function(e) {
            if (!selectContainer.contains(e.target)) {
                searchBox.classList.add('d-none');
            }
        };
        
        // Eliminar listeners antiguos para evitar duplicados
        document.removeEventListener('click', handleOutsideClick);
        document.addEventListener('click', handleOutsideClick);
        
        // Prevenir que el clic en el cuadro de búsqueda cierre el dropdown
        const stopPropagation = function(e) {
            e.stopPropagation();
        };
        searchBox.removeEventListener('click', stopPropagation);
        searchBox.addEventListener('click', stopPropagation);
        
        // CORRECCIÓN DEL ERROR: Limpiar listeners si el componente se destruye
        return () => {
            select.removeEventListener('click', showSearchBox);
            searchInput.removeEventListener('input', handleInput);
            document.removeEventListener('click', handleOutsideClick);
            searchBox.removeEventListener('click', stopPropagation);
        };
    },
    
    getEntityName(lowercase = false, plural = false) {
        const config = StorageService.getConfig();
        let entityName = config.entityName || 'Entidad';
        
        if (plural) {
            entityName += 's';
        }
        
        return lowercase ? entityName.toLowerCase() : entityName;
    },

    /**
 * Obtiene el nombre personalizado para "Entidad" desde la configuración
 * @param {boolean} lowercase Si es true, devuelve en minúscula
 * @returns {string} El nombre personalizado para "Entidad"
 */
    getEntityName(lowercase = false) {
        const config = StorageService.getConfig();
        const entityName = config.entityName || 'Entidad';
        return lowercase ? entityName.toLowerCase() : entityName;
    },
    
    /**
     * Agrega efecto de animación a un elemento recién creado
     * @param {HTMLElement} element Elemento a animar
     */
    highlightNewElement(element) {
        element.classList.add('highlight-new');
        setTimeout(() => {
            element.classList.remove('highlight-new');
        }, 2000);
    }
};