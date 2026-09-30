import type * as THREE from 'three';
import type { LogoKey } from './logos';

/** Pose atual de cada logo das seções (para a explosão começar exatamente do mesmo ângulo). */
export const pivots = new Map<LogoKey, THREE.Object3D>();
