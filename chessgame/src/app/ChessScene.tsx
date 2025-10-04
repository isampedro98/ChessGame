import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { PieceType } from '@/domain/chess';

interface ChessSceneProps {
	initialPieces: Array<{
		id: string;
		type: PieceType;
		team: 'WHITE' | 'BLACK';
		position: { row: number; column: number };
	}>;
}

const TAMANIO_CASILLA = 1;
const ALTURA_PIEZA = 0.8;

const crearMaterialCasilla = () => {
	const colorClaro = new THREE.Color('#d7dde8');
	const colorOscuro = new THREE.Color('#3a4253');
	return { colorClaro, colorOscuro };
};

const crearTablero = () => {
	const grupo = new THREE.Group();
	const geometria = new THREE.BoxGeometry(
		TAMANIO_CASILLA,
		0.05,
		TAMANIO_CASILLA,
	);
	const { colorClaro, colorOscuro } = crearMaterialCasilla();

	for (let fila = 0; fila < 8; fila += 1) {
		for (let columna = 0; columna < 8; columna += 1) {
			const esOscura = (fila + columna) % 2 === 1;
			const material = new THREE.MeshStandardMaterial({
				color: esOscura ? colorOscuro : colorClaro,
				roughness: 0.4,
				metalness: 0.1,
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

	const borde = new THREE.Mesh(
		new THREE.BoxGeometry(8.6, 0.2, 8.6),
		new THREE.MeshStandardMaterial({
			color: '#2a303d',
			roughness: 0.6,
			metalness: 0.05,
		}),
	);
	borde.position.y = -0.1;
	grupo.add(borde);

	return grupo;
};

const crearMesa = () => {
	const tableroBase = new THREE.Mesh(
		new THREE.BoxGeometry(10, 0.25, 10),
		new THREE.MeshStandardMaterial({
			color: '#8b5a2b',
			roughness: 0.7,
			metalness: 0.05,
			emissive: '#2e1d0f',
			emissiveIntensity: 0.08,
		}),
	);
	tableroBase.position.y = -0.25;

	const tableroBisel = new THREE.Mesh(
		new THREE.BoxGeometry(10.4, 0.05, 10.4),
		new THREE.MeshStandardMaterial({
			color: '#a4723f',
			roughness: 0.5,
			metalness: 0.08,
		}),
	);
	tableroBisel.position.y = -0.35;

	const mesa = new THREE.Group();
	mesa.add(tableroBase, tableroBisel);
	return mesa;
};

const crearLathe = (perfil: Array<[number, number]>) =>
	new THREE.LatheGeometry(
		perfil.map(([radio, altura]) => new THREE.Vector2(radio, altura)),
		48,
	);

const geometriaPeon = crearLathe([
	[0, 0],
	[0.35, 0],
	[0.45, 0.05],
	[0.38, 0.2],
	[0.28, 0.35],
	[0.3, 0.45],
	[0.2, 0.6],
	[0.15, 0.7],
	[0, ALTURA_PIEZA],
]);

const geometriaAlfil = crearLathe([
	[0, 0],
	[0.4, 0],
	[0.45, 0.08],
	[0.32, 0.25],
	[0.26, 0.5],
	[0.2, 0.65],
	[0.16, 0.8],
	[0.1, 0.95],
	[0, 1.1],
]);

const geometriaReina = crearLathe([
	[0, 0],
	[0.42, 0],
	[0.46, 0.1],
	[0.35, 0.3],
	[0.32, 0.6],
	[0.28, 0.85],
	[0.22, 0.95],
	[0.16, 1.05],
	[0, 1.2],
]);

const geometriaRey = crearLathe([
	[0, 0],
	[0.44, 0],
	[0.48, 0.1],
	[0.36, 0.35],
	[0.32, 0.7],
	[0.26, 0.95],
	[0.18, 1.1],
	[0, 1.25],
]);

const cuerpoTorre = new THREE.CylinderGeometry(0.28, 0.32, 0.6, 24);
const baseTorre = new THREE.CylinderGeometry(0.4, 0.4, 0.15, 32);
const coronaTorre = new THREE.CylinderGeometry(0.36, 0.36, 0.08, 16);
const almenaTorre = new THREE.BoxGeometry(0.12, 0.2, 0.18);

const baseCaballoInferior = new THREE.CylinderGeometry(0.35, 0.4, 0.18, 32);
const baseCaballoSuperior = new THREE.CylinderGeometry(0.28, 0.32, 0.18, 32);
const cuerpoCaballo = new THREE.BoxGeometry(0.35, 0.45, 0.2);
const cabezaCaballo = new THREE.BoxGeometry(0.25, 0.3, 0.15);
const hocicoCaballo = new THREE.BoxGeometry(0.2, 0.15, 0.1);
const orejaCaballo = new THREE.ConeGeometry(0.05, 0.1, 8);

const esferaCorona = new THREE.SphereGeometry(0.07, 16, 16);
const esferaRegia = new THREE.SphereGeometry(0.1, 16, 16);
const cruzVertical = new THREE.BoxGeometry(0.08, 0.3, 0.08);
const cruzHorizontal = new THREE.BoxGeometry(0.26, 0.08, 0.08);

const crearMaterialPieza = (equipo: 'WHITE' | 'BLACK') =>
	new THREE.MeshStandardMaterial({
		color: equipo === 'WHITE' ? '#f8f8f8' : '#2f3542',
		metalness: 0.3,
		roughness: 0.4,
	});

const crearMalla = (
	geometria: THREE.BufferGeometry,
	material: THREE.Material,
) => {
	const mesh = new THREE.Mesh(geometria, material);
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	return mesh;
};

const crearTorre = (material: THREE.Material) => {
	const grupo = new THREE.Group();
	const base = crearMalla(baseTorre, material);
	base.position.y = 0.075;
	grupo.add(base);

	const cuerpo = crearMalla(cuerpoTorre, material);
	cuerpo.position.y = 0.35;
	grupo.add(cuerpo);

	const corona = crearMalla(coronaTorre, material);
	corona.position.y = 0.7;
	grupo.add(corona);

	const paso = (Math.PI * 2) / 4;
	for (let i = 0; i < 4; i += 1) {
		const almena = crearMalla(almenaTorre, material);
		almena.position.set(
			Math.cos(paso * i) * 0.23,
			0.8,
			Math.sin(paso * i) * 0.23,
		);
		grupo.add(almena);
	}

	return grupo;
};

const crearCaballo = (material: THREE.Material) => {
	const grupo = new THREE.Group();
	const base = crearMalla(baseCaballoInferior, material);
	base.position.y = 0.09;
	grupo.add(base);

	const pedestal = crearMalla(baseCaballoSuperior, material);
	pedestal.position.y = 0.27;
	grupo.add(pedestal);

	const cuerpo = crearMalla(cuerpoCaballo, material);
	cuerpo.position.set(0, 0.55, 0);
	cuerpo.rotation.y = Math.PI / 5;
	grupo.add(cuerpo);

	const cabeza = crearMalla(cabezaCaballo, material);
	cabeza.position.set(0.05, 0.83, 0.05);
	cabeza.rotation.y = Math.PI / 4;
	grupo.add(cabeza);

	const hocico = crearMalla(hocicoCaballo, material);
	hocico.position.set(0.16, 0.83, 0.1);
	hocico.rotation.y = Math.PI / 6;
	grupo.add(hocico);

	const oreja1 = crearMalla(orejaCaballo, material);
	oreja1.position.set(0.02, 1.02, 0.05);
	grupo.add(oreja1);

	const oreja2 = crearMalla(orejaCaballo, material);
	oreja2.position.set(-0.08, 1.02, 0.02);
	grupo.add(oreja2);

	return grupo;
};

const crearAlfil = (material: THREE.Material) => {
	const cuerpo = crearMalla(geometriaAlfil, material);
	const esfera = crearMalla(esferaRegia, material);
	esfera.position.y = 1.05;

	const inclinacion = crearMalla(
		new THREE.CylinderGeometry(0.04, 0.04, 0.2, 16),
		material,
	);
	inclinacion.rotation.z = Math.PI / 4;
	inclinacion.position.set(0, 0.92, 0.14);

	const grupo = new THREE.Group();
	grupo.add(cuerpo, esfera, inclinacion);
	return grupo;
};

const crearReina = (material: THREE.Material) => {
	const cuerpo = crearMalla(geometriaReina, material);
	const corona = crearMalla(
		new THREE.TorusGeometry(0.18, 0.035, 12, 24),
		material,
	);
	corona.rotation.x = Math.PI / 2;
	corona.position.y = 1.05;

	const grupo = new THREE.Group();
	grupo.add(cuerpo, corona);

	const perlas = 6;
	for (let i = 0; i < perlas; i += 1) {
		const perla = crearMalla(esferaCorona, material);
		const angulo = (i / perlas) * Math.PI * 2;
		perla.position.set(Math.cos(angulo) * 0.22, 1.12, Math.sin(angulo) * 0.22);
		grupo.add(perla);
	}

	return grupo;
};

const crearRey = (material: THREE.Material) => {
	const cuerpo = crearMalla(geometriaRey, material);
	const aro = crearMalla(new THREE.TorusGeometry(0.16, 0.03, 12, 24), material);
	aro.rotation.x = Math.PI / 2;
	aro.position.y = 1.05;

	const cruzV = crearMalla(cruzVertical, material);
	cruzV.position.y = 1.25;

	const cruzH = crearMalla(cruzHorizontal, material);
	cruzH.position.y = 1.25;

	const esfera = crearMalla(esferaCorona, material);
	esfera.position.y = 1.15;

	const grupo = new THREE.Group();
	grupo.add(cuerpo, aro, cruzV, cruzH, esfera);
	return grupo;
};

const crearPeon = (material: THREE.Material) =>
	crearMalla(geometriaPeon, material);

const factoryPorTipo: Record<
	PieceType,
	(material: THREE.Material) => THREE.Object3D
> = {
	[PieceType.Pawn]: crearPeon,
	[PieceType.Rook]: crearTorre,
	[PieceType.Knight]: crearCaballo,
	[PieceType.Bishop]: crearAlfil,
	[PieceType.Queen]: crearReina,
	[PieceType.King]: crearRey,
};

const posicionarPieza = (
	objeto: THREE.Object3D,
	fila: number,
	columna: number,
) => {
	objeto.position.set(
		(columna - 3.5) * TAMANIO_CASILLA,
		ALTURA_PIEZA / 2,
		(fila - 3.5) * TAMANIO_CASILLA,
	);
};

const crearPiezasIniciales = (piezas: ChessSceneProps['initialPieces']) => {
	const materiales = new Map<'WHITE' | 'BLACK', THREE.Material>([
		['WHITE', crearMaterialPieza('WHITE')],
		['BLACK', crearMaterialPieza('BLACK')],
	]);

	return piezas.map((piece) => {
		const material = materiales.get(piece.team)!;
		const creador = factoryPorTipo[piece.type] ?? crearPeon;
		const objeto = creador(material);
		posicionarPieza(objeto, piece.position.row, piece.position.column);
		objeto.name = piece.id;
		return objeto;
	});
};

export function ChessScene({ initialPieces }: ChessSceneProps) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const escenaRef = useRef<THREE.Scene | null>(null);
	const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
	const piezasRef = useRef<Map<string, THREE.Object3D>>(new Map());

	useEffect(() => {
		if (!canvasRef.current) {
			return;
		}

		const piezasMap = piezasRef.current;

		const renderer = new THREE.WebGLRenderer({
			canvas: canvasRef.current,
			antialias: true,
		});
		renderer.setSize(
			canvasRef.current.clientWidth,
			canvasRef.current.clientHeight,
		);
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		const scene = new THREE.Scene();
		scene.background = new THREE.Color('#161923');

		const camera = new THREE.PerspectiveCamera(
			42,
			canvasRef.current.clientWidth / canvasRef.current.clientHeight,
			0.1,
			100,
		);
		camera.position.set(6, 9, 9);
		camera.lookAt(0, 0, 0);

		const ambient = new THREE.AmbientLight('#dfe7ff', 0.4);
		const hemi = new THREE.HemisphereLight('#f4f7ff', '#1a1f2b', 0.55);

		const dirLight = new THREE.DirectionalLight('#ffffff', 0.85);
		dirLight.position.set(6, 12, 6);
		dirLight.castShadow = true;
		dirLight.shadow.mapSize.set(2048, 2048);
		dirLight.shadow.camera.near = 1;
		dirLight.shadow.camera.far = 30;

		const warmLight = new THREE.SpotLight(
			'#f9d8a2',
			0.5,
			20,
			Math.PI / 6,
			0.4,
			1,
		);
		warmLight.position.set(-7, 8, -5);
		warmLight.target.position.set(0, 0, 0);
		warmLight.castShadow = true;

		scene.add(ambient, hemi, dirLight, warmLight, warmLight.target);

		const mesa = crearMesa();
		mesa.traverse((objeto) => {
			if (objeto instanceof THREE.Mesh) {
				objeto.receiveShadow = true;
			}
		});
		scene.add(mesa);

		const tablero = crearTablero();
		tablero.traverse((objeto) => {
			if (objeto instanceof THREE.Mesh) {
				objeto.castShadow = true;
				objeto.receiveShadow = true;
			}
		});
		scene.add(tablero);

		const piezas = crearPiezasIniciales(initialPieces);
		piezas.forEach((piece) => {
			piece.castShadow = true;
			piece.receiveShadow = true;
			scene.add(piece);
			piezasMap.set(piece.name, piece);
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
	}, [initialPieces]);

	return (
		<canvas
			ref={canvasRef}
			className="h-full w-full"
		/>
	);
}
