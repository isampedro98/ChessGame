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

interface ChessSceneProps {
	initialPieces: Array<{
		id: string;
		type: PieceType;
		team: 'WHITE' | 'BLACK';
		position: { row: number; column: number };
	}>;
  currentTurn: Team;
  onPickSquare?: (row: number, column: number) => void;
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

export default function ChessScene({ initialPieces, currentTurn, onPickSquare }: ChessSceneProps) {
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

		const onClick = (ev: MouseEvent) => {
			if (!cameraRef.current || !rendererRef.current || !onPickSquare) return;
			const rect = canvas.getBoundingClientRect();
			const x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
			const y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
			mouseRef.current!.set(x, y);
			raycaster.setFromCamera(mouseRef.current!, cameraRef.current);
			const hits = raycaster.intersectObjects(boardSquaresRef.current, false);
			if (hits.length > 0) {
				const hit = hits[0].object;
				const { x: px, z: pz } = hit.position;
				const col = Math.round(px / SQUARE_SIZE + 3.5);
				const row = Math.round(pz / SQUARE_SIZE + 3.5);
				onPickSquare(row, col);
			}
		};
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
			canvas.removeEventListener('click', onClick);
		};
	}, []);

  // Orientar la cámara según el turno
  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    if (currentTurn === Team.White) {
      camera.position.set(6, 9, 9);
    } else {
      camera.position.set(-6, 9, -9);
    }
    controls.target.set(0, 0.3, 0);
    controls.update();
  }, [currentTurn]);

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
