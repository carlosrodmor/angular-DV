# Mi App Angular de Cócteles

Este proyecto fue generado con [Angular CLI](https://github.com/angular/angular-cli) versión 19.1.2.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (v18.18.0 o superior)
- [npm](https://www.npmjs.com/) (viene con Node.js)

## Instalación

Sigue estos pasos para instalar y configurar el proyecto:

1. Clona el repositorio:

   ```bash
   git clone <url-del-repositorio>
   cd mi-app-angular
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

## Ejecución

### Servidor de desarrollo

Para iniciar el servidor de desarrollo:

```bash
npm start
```

O alternativamente:

```bash
ng serve
```

Una vez que el servidor esté en ejecución, abre tu navegador y navega a `http://localhost:4200/`. La aplicación se recargará automáticamente cada vez que modifiques alguno de los archivos fuente.

### Construcción para producción

Para crear una versión de producción:

```bash
npm run build
```

O:

```bash
ng build
```

Esto compilará el proyecto y almacenará los archivos en el directorio `dist/`. Por defecto, la compilación de producción optimiza tu aplicación para un mejor rendimiento.

### Servidor SSR (Server-Side Rendering)

Para ejecutar la aplicación con renderizado del lado del servidor:

```bash
npm run serve:ssr:mi-app-angular
```

## Estructura del Proyecto

```
src/
├── app/
│   ├── components/    # Componentes reutilizables
│   ├── home/          # Componente principal de la página de inicio
│   ├── cocktail-detail/ # Componente de detalle de cócteles
│   ├── services/      # Servicios para la gestión de datos
│   ├── models/        # Interfaces y modelos de datos
│   ├── shared/        # Componentes, pipes y directivas compartidas
│   └── utils/         # Utilidades y funciones auxiliares
├── assets/            # Imágenes, fuentes y otros recursos estáticos
└── ...
```

## Recursos y Herramientas Utilizadas

### Dependencias Principales

- **Angular**: Framework principal (v19.1.0)
- **Bootstrap**: Framework CSS para el diseño (v5.3.5)
- **RxJS**: Biblioteca para programación reactiva

### Dependencias de Desarrollo

- **Angular CLI**: Herramienta de línea de comandos para Angular
- **TypeScript**: Superset tipado de JavaScript


## Implementación en Producción

Para implementar la aplicación en producción:

1. Construye la aplicación con `npm run build`
2. Los archivos generados en la carpeta `dist/` están listos para ser desplegados en cualquier servidor web estático
3. Para despliegues con SSR, utiliza `npm run serve:ssr:mi-app-angular` o configura tu propio servidor Node.js

