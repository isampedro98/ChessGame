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
} from '@/chess-scene';

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

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const renderer = createRenderer(canvas);
		const { scene, camera } = createSceneAndCamera(canvas);
		const { ambient, hemi, dirLight, warmLight } = createLights();
		scene.add(ambient, hemi, dirLight, warmLight, warmLight.target);

		scene.add(createTable(), createBoard());

		const materials = new Map<'WHITE' | 'BLACK', THREE.Material>([
			['WHITE', createPieceMaterial('WHITE')],
			['BLACK', createPieceMaterial('BLACK')],
		]);

		const piecesMap = piecesRef.current;
		initialPieces.forEach((p) => {
			const material = materials.get(p.team)!;
			const make = factoryByType[p.type] ?? createPawn;
			const obj = make(material);
			positionPiece(obj, p.position.row, p.position.column);
			obj.name = p.id;
			scene.add(obj);
			piecesMap.set(p.id, obj);
		});

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
			rendererRef.current.render(sceneRef.current, cameraRef.current);
			raf = requestAnimationFrame(animate);
		};
		animate();

		return () => {
			window.removeEventListener('resize', onResize);
			cancelAnimationFrame(raf);
			piecesMap.clear();
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
