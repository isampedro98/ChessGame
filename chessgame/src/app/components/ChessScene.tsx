'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { PieceType, Team } from '@/domain/chess';

import {
	createRenderer,
	createSceneAndCamera,
	createLights,
	createTable,
	createBoard,
	createPawn,
	createRook,
	createKnight,
	createBishop,
	createQueen,
	createKing,
	createPieceMaterial,
	positionPiece,
	applyStudioEnvironment,
} from '@/chess-scene';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SQUARE_SIZE } from '@/chess-scene';
import { updateMarkers } from '@/chess-scene/markers';
import { deriveBoardCoordsFromObject } from '@/chess-scene/picking';

interface ChessSceneProps {
	initialPieces: Array<{
		id: string;
		type: PieceType;
		team: 'WHITE' | 'BLACK';
		position: { row: number; column: number };
	}>;
  currentTurn: Team;
  onPickSquare?: (row: number, column: number, originKey?: string) => void;
  selectedSquareKey?: string | null;
  availableDestinations?: Set<string>;
}

const factoryByType: Record<PieceType, (m: THREE.Material) => THREE.Object3D> =
	{
		[PieceType.Pawn]: createPawn,
		[PieceType.Rook]: createRook,
		[PieceType.Knight]: createKnight,
		[PieceType.Bishop]: createBishop,
		[PieceType.Queen]: createQueen,
		[PieceType.King]: createKing,
	};

export default function ChessScene({ initialPieces, currentTurn, onPickSquare, selectedSquareKey = null, availableDestinations = new Set() }: ChessSceneProps) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
	const sceneRef = useRef<THREE.Scene | null>(null);
	const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
	const piecesRef = useRef<Map<string, THREE.Object3D>>(new Map());
	const controlsRef = useRef<OrbitControls | null>(null);
	const materialsRef = useRef<Map<'WHITE' | 'BLACK', THREE.Material> | null>(null);
	const boardSquaresRef = useRef<THREE.Object3D[]>([]);
	const raycasterRef = useRef<THREE.Raycaster | null>(null);
	const mouseRef = useRef<THREE.Vector2 | null>(null);
  const markersRootRef = useRef<THREE.Group | null>(null);
  const isOrbitingRef = useRef(false);
  const lastPointerDownRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  // Keep latest props/state snapshots to avoid stale closures inside handlers
  const onPickSquareRef = useRef<((row: number, column: number, originKey?: string) => void) | null>(null);
  const allowedKeysRef = useRef<Set<string>>(new Set());
  const selectedKeyRef = useRef<string | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const renderer = createRenderer(canvas);
		const { scene, camera } = createSceneAndCamera(canvas);
		applyStudioEnvironment(renderer, scene);
		const { ambient, hemi, dirLight, warmLight } = createLights();
		scene.add(ambient, hemi, dirLight, warmLight, warmLight.target);

		scene.add(createTable());
		const board = createBoard();
		scene.add(board);
		boardSquaresRef.current = board.children.slice();

		materialsRef.current = new Map<'WHITE' | 'BLACK', THREE.Material>([
			['WHITE', createPieceMaterial('WHITE')],
			['BLACK', createPieceMaterial('BLACK')],
		]);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.target.set(0, 0.3, 0);
    controls.update();
    controls.addEventListener('start', () => (isOrbitingRef.current = true));
    controls.addEventListener('end', () => (isOrbitingRef.current = false));
    controlsRef.current = controls;

		rendererRef.current = renderer;
		sceneRef.current = scene;
		cameraRef.current = camera;

		const onResize = () => {
			if (!canvas || !rendererRef.current || !cameraRef.current) return;
			const { clientWidth, clientHeight } = canvas;
			rendererRef.current.setSize(clientWidth, clientHeight);
			cameraRef.current.aspect = clientWidth / clientHeight;
			cameraRef.current.updateProjectionMatrix();
		};

		window.addEventListener('resize', onResize);

    const raycaster = new THREE.Raycaster();
    raycasterRef.current = raycaster;
    mouseRef.current = new THREE.Vector2();

    // Root for selection/destination markers
    const markersRoot = new THREE.Group();
    markersRoot.name = 'markers-root';
    scene.add(markersRoot);
    markersRootRef.current = markersRoot;

    const onPointerDown = (ev: PointerEvent) => {
      lastPointerDownRef.current = { x: ev.clientX, y: ev.clientY };
    };

    const onClick = (ev: MouseEvent) => {
      if (!cameraRef.current || !rendererRef.current) return;
      // Ignore if drag distance is significant (orbiting/pan)
      const dx = ev.clientX - lastPointerDownRef.current.x;
      const dy = ev.clientY - lastPointerDownRef.current.y;
      if (Math.hypot(dx, dy) > 6) return;
      const rect = canvas.getBoundingClientRect();
      const x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      mouseRef.current!.set(x, y);
      raycaster.setFromCamera(mouseRef.current!, cameraRef.current);
      const pieceObjects = Array.from(piecesRef.current.values());
      const markerObjects = markersRootRef.current ? markersRootRef.current.children : [];
      const targets = [
        ...boardSquaresRef.current,
        ...pieceObjects,
        ...markerObjects,
      ];
      const hits = raycaster.intersectObjects(targets, true);
      if (hits.length > 0) {
        const hit = hits[0].object as THREE.Object3D;
        const { row, col } = deriveBoardCoordsFromObject(hit);
        const fn = onPickSquareRef.current;
        if (fn) fn(row, col, selectedKeyRef.current ?? undefined);
      }
    };
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('click', onClick);

		let raf = 0;
		const animate = () => {
			if (!rendererRef.current || !sceneRef.current || !cameraRef.current)
				return;
			controlsRef.current?.update();
			rendererRef.current.render(sceneRef.current, cameraRef.current);
			raf = requestAnimationFrame(animate);
		};
		animate();

		return () => {
			window.removeEventListener('resize', onResize);
			cancelAnimationFrame(raf);
			piecesRef.current.clear();
			controls.dispose();
			renderer.dispose();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('click', onClick);
		};
	}, []);

  // Orientar la camara segun el turno
  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    // Vista correcta: Blancas miran desde z negativo; Negras desde z positivo
    if (currentTurn === Team.White) {
      camera.position.set(6, 9, -9);
    } else {
      camera.position.set(-6, 9, 9);
    }
    controls.target.set(0, 0.3, 0);
    controls.update();
  }, [currentTurn]);

  // Sync changing props into refs for handlers
  useEffect(() => { onPickSquareRef.current = onPickSquare ?? null; }, [onPickSquare]);
  useEffect(() => { allowedKeysRef.current = availableDestinations ?? new Set(); }, [availableDestinations]);
  useEffect(() => { selectedKeyRef.current = selectedSquareKey ?? null; }, [selectedSquareKey]);




	// Marcadores de seleccion y destinos permitidos
	useEffect(() => {
		const scene = sceneRef.current;
		if (!scene) return;
		let root = markersRootRef.current;
		if (!root) {
			root = new THREE.Group();
			root.name = 'markers-root';
			scene.add(root);
			markersRootRef.current = root;
		}
		updateMarkers(root, selectedSquareKey, availableDestinations);
	}, [selectedSquareKey, availableDestinations]);

	useEffect(() => {
		const scene = sceneRef.current;
		const materials = materialsRef.current;
		if (!scene || !materials) return;

		const piecesMap = piecesRef.current;
		const remaining = new Set(piecesMap.keys());

		initialPieces.forEach((p) => {
			const material = materials.get(p.team)!;
			let obj = piecesMap.get(p.id);
			if (!obj) {
				const make = factoryByType[p.type] ?? createPawn;
				obj = make(material);
				obj.name = p.id;
				scene.add(obj);
				piecesMap.set(p.id, obj);
			}
			positionPiece(obj, p.position.row, p.position.column);
			remaining.delete(p.id);
		});

		remaining.forEach((id) => {
			const obj = piecesMap.get(id);
			if (obj) scene.remove(obj);
			piecesMap.delete(id);
		});
	}, [initialPieces]);

	return (
		<canvas
			ref={canvasRef}
			className="h-full w-full"
		/>
	);
}



















