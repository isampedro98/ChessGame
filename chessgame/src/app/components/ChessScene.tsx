import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { PieceType } from '@/domain/chess';

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

interface ChessSceneProps {
	initialPieces: Array<{
		id: string;
		type: PieceType;
		team: 'WHITE' | 'BLACK';
		position: { row: number; column: number };
	}>;
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

export default function ChessScene({ initialPieces }: ChessSceneProps) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
	const sceneRef = useRef<THREE.Scene | null>(null);
	const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
	const piecesRef = useRef<Map<string, THREE.Object3D>>(new Map());
	const controlsRef = useRef<OrbitControls | null>(null);
	const materialsRef = useRef<Map<'WHITE' | 'BLACK', THREE.Material> | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const renderer = createRenderer(canvas);
		const { scene, camera } = createSceneAndCamera(canvas);
		applyStudioEnvironment(renderer, scene);
		const { ambient, hemi, dirLight, warmLight } = createLights();
		scene.add(ambient, hemi, dirLight, warmLight, warmLight.target);

		scene.add(createTable(), createBoard());

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
		};
	}, []);

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
