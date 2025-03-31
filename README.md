# PigmeaProducciónV2

## Descripción

PigmeaGmaoV2 es una aplicación web de Registro de Datos Genérico y Flexible. Permite a los usuarios definir sus propias estructuras de datos, registrar información según esas estructuras y visualizar reportes estadísticos básicos. La interfaz es moderna, responsiva, e intuitiva, con actualizaciones de UI en tiempo real sin recargar la página. Los datos se persisten en `localStorage`.

## Características

- **Administración de Entidades Principales**: Permite crear, ver, editar y eliminar categorías principales de lo que se registrará (ej., "Máquina de Coser", "Impresora 3D").
- **Gestión de Campos Personalizados**: Permite crear, ver, editar y eliminar campos que se usarán en los formularios de registro.
- **Asociación de Campos a Entidades**: Permite asignar/desasignar campos personalizados a cada entidad principal.
- **Área de Registro**: Permite seleccionar una entidad principal y registrar datos dinámicamente según los campos asociados.
- **Visualización de Registros Recientes**: Muestra una lista con los últimos registros guardados.
- **Reportes Comparativos**: Genera gráficos comparativos para campos numéricos compartidos entre diferentes entidades.
- **Exportación/Importación de Datos**: Permite exportar e importar datos en formato JSON.
- **Eliminación de Registros**: Permite eliminar registros específicos.
- **Ordenación de Campos Personalizados**: Permite cambiar el orden de los campos personalizados.
- **Configuración de Ejes en Gráficos**: Permite cambiar el eje X en los gráficos comparativos.

## Tecnologías Utilizadas

- **HTML5**
- **CSS3**
- **JavaScript (ES6+)**
- **Bootstrap 5**

## Instalación y Uso

1. Clona el repositorio:
    ```sh
    git clone https://github.com/JhonyAlex/PigmeaGmaoV2.git
    ```

2. Navega al directorio del proyecto:
    ```sh
    cd PigmeaGmaoV2
    ```

3. Abre el archivo `index.html` en tu navegador web.

## Estructura de Archivos

```
/
├── index.html              # Página principal (SPA)
├── css/
│   └── styles.css          # Estilos personalizados
├── js/
│   ├── app.js              # Inicialización y lógica principal
│   ├── router.js           # Gestión de navegación SPA
│   ├── models/
│   │   ├── storage.js      # Gestión de localStorage
│   │   ├── entity.js       # Modelo para entidades principales
│   │   ├── field.js        # Modelo para campos personalizados
│   │   └── record.js       # Modelo para los registros
│   ├── views/
│   │   ├── admin.js        # Vista de administración
│   │   ├── register.js     # Vista de registro
│   │   └── reports.js      # Vista de reportes
│   └── utils/
│       ├── validation.js   # Validación de formularios
│       ├── ui.js           # Utilidades de interfaz
│       ├── export.js       # Importación/exportación
│       └── charts.js       # Generación de gráficos
└── lib/                    # Librería externa (Chart.js)
    └── chart.min.js
```

## Funcionalidades

### Administración/Configuración

- **Gestión de Entidades Principales**:
  - Crear, ver, editar y eliminar entidades.
- **Gestión de Campos Personalizados**:
  - Crear, ver, editar y eliminar campos.
  - Definir nombre, tipo, opciones (para selección) y obligatoriedad.
- **Asociación de Campos a Entidades**:
  - Asignar/desasignar campos a entidades.
  - Cambiar el orden de los campos personalizados.
- **Configuración General**:
  - Editar título y descripción que se mostrarán en el formulario de registro.

### Área de Registro

- **Formulario Dinámico**:
  - Seleccionar una entidad y mostrar campos dinámicamente.
  - Validar campos obligatorios y numéricos.
  - Guardar registro en `localStorage`.
- **Visualización de Registros Recientes**:
  - Mostrar últimos registros guardados.
  - Eliminar registros específicos.

### Área de Reportes

- **Filtros**:
  - Filtrar datos por entidad y rango de fechas.
- **Visualización Tabular**:
  - Mostrar registros filtrados en una tabla.
- **Reportes Comparativos**:
  - Generar gráficos comparativos para campos numéricos compartidos.
  - Cambiar el eje X y el tipo de gráfico.

## Contribución

Las contribuciones son bienvenidas. Por favor, crea un fork del repositorio y envía un pull request con tus cambios.

## Licencia

Este proyecto está bajo la Licencia MIT.

## Contacto

Si tienes alguna pregunta o sugerencia, no dudes en contactarme a través de [GitHub](https://github.com/JhonyAlex).
