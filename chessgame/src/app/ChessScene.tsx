import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ChessSceneProps {
  piezasIniciales: Array<{
    id: string;
    tipo: string;
    equipo: 'BLANCO' | 'NEGRO';
    posicion: { fila: number; columna: number };
  }>;
}

const TAMANIO_CASILLA = 1;
const ALTURA_PIEZA = 0.8;

const crearMaterialCasilla = () => {
  const colorClaro = new THREE.Color('#a7b0c2');
  const colorOscuro = new THREE.Color('#3a4253');
  return { colorClaro, colorOscuro };
};

const crearTablero = () => {
  const grupo = new THREE.Group();
  const geometria = new THREE.BoxGeometry(TAMANIO_CASILLA, 0.05, TAMANIO_CASILLA);
  const { colorClaro, colorOscuro } = crearMaterialCasilla();

  for (let fila = 0; fila < 8; fila += 1) {
    for (let columna = 0; columna < 8; columna += 1) {
      const esOscura = (fila + columna) % 2 === 1;
      const material = new THREE.MeshStandardMaterial({
        color: esOscura ? colorOscuro : colorClaro,
      });
      const casilla = new THREE.Mesh(geometria, material);
      casilla.position.set(
        (columna - 3.5) * TAMANIO_CASILLA,
        0,
        (fila - 3.5) * TAMANIO_CASILLA,
      );
      grupo.add(casilla);
    }
  }

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(8.5, 0.2, 8.5),
    new THREE.MeshStandardMaterial({ color: '#1f2533' }),
  );
  base.position.y = -0.1;
  grupo.add(base);

  return grupo;
};

const crearPerfilRevolucion = () => {
  const puntos: THREE.Vector2[] = [];
  puntos.push(new THREE.Vector2(0, 0));
  puntos.push(new THREE.Vector2(0.3, 0));
  puntos.push(new THREE.Vector2(0.4, 0.05));
  puntos.push(new THREE.Vector2(0.35, 0.2));
  puntos.push(new THREE.Vector2(0.25, 0.35));
  puntos.push(new THREE.Vector2(0.3, 0.5));
  puntos.push(new THREE.Vector2(0.2, 0.6));
  puntos.push(new THREE.Vector2(0.15, 0.7));
  puntos.push(new THREE.Vector2(0, ALTURA_PIEZA));
  return puntos;
};

const crearGeometriaPieza = () => {
  const puntos = crearPerfilRevolucion();
  return new THREE.LatheGeometry(puntos, 32);
};

const crearMaterialPieza = (equipo: 'BLANCO' | 'NEGRO') =>
  new THREE.MeshStandardMaterial({
    color: equipo === 'BLANCO' ? '#f8f8f8' : '#2f3542',
    metalness: 0.3,
    roughness: 0.6,
  });

const posicionarPieza = (
  mesh: THREE.Mesh,
  fila: number,
  columna: number,
) => {
  mesh.position.set(
    (columna - 3.5) * TAMANIO_CASILLA,
    ALTURA_PIEZA / 2,
    (fila - 3.5) * TAMANIO_CASILLA,
  );
};

const crearPiezasIniciales = (
  piezas: ChessSceneProps['piezasIniciales'],
) => {
  const geometria = crearGeometriaPieza();
  return piezas.map((pieza) => {
    const material = crearMaterialPieza(pieza.equipo);
    const mesh = new THREE.Mesh(geometria, material);
    posicionarPieza(mesh, pieza.posicion.fila, pieza.posicion.columna);
    mesh.name = pieza.id;
    return mesh;
  });
};

export function ChessScene({ piezasIniciales }: ChessSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const escenaRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const piezasRef = useRef<Map<string, THREE.Mesh>>(new Map());

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const piezasMap = piezasRef.current;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#101321');

    const camera = new THREE.PerspectiveCamera(
      35,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      100,
    );
    camera.position.set(6, 8, 8);
    camera.lookAt(0, 0, 0);

    const ambient = new THREE.AmbientLight('#d9e1ff', 0.6);
    const dirLight = new THREE.DirectionalLight('#ffffff', 0.8);
    dirLight.position.set(5, 10, 7);

    scene.add(ambient, dirLight);

    const tablero = crearTablero();
    scene.add(tablero);

    const piezas = crearPiezasIniciales(piezasIniciales);
    piezas.forEach((pieza) => {
      scene.add(pieza);
      piezasRef.current.set(pieza.name, pieza);
    });

    rendererRef.current = renderer;
    escenaRef.current = scene;

    const onResize = () => {
      if (!canvasRef.current || !rendererRef.current || !escenaRef.current) {
        return;
      }
      const { clientWidth, clientHeight } = canvasRef.current;
      rendererRef.current.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', onResize);

    const animate = () => {
      if (!rendererRef.current || !escenaRef.current) {
        return;
      }
      rendererRef.current.render(escenaRef.current, camera);
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', onResize);
      piezasMap.clear();
      renderer.dispose();
    };
  }, [piezasIniciales]);

  return <canvas ref={canvasRef} className="h-full w-full" />;
}






