# ChessGame

Aplicación Next.js en construcción para experimentar con un motor de ajedrez escrito en TypeScript y una escena 3D con Three.js.

## Requisitos

- Node.js 20+
- npm 10+

Instala dependencias una sola vez:

```bash
npm install
```

## Correr el modo desarrollo

```bash
npm run dev
```

Luego abre [http://localhost:3000](http://localhost:3000). La página muestra el tablero generado por el dominio y un placeholder para la futura escena Three.js.

## Otros scripts útiles

```bash
npm run lint   # Ejecuta ESLint con la configuración del proyecto
```

## Estado actual

- Dominio de ajedrez modelado con clases puras (`src/domain/chess`).
- Página principal (`src/app/page.tsx`) que renderiza el tablero desde el modelo y reserva espacio para el canvas WebGL.
- Pendiente integrar la vista 3D, reglas especiales (enroque, en passant, coronación) y capa de interacción.
