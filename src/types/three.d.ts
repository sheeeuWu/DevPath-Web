import 'react';

declare module 'three' {
	export type Group = any;
	export type Scene = any;
	export type Object3D = any;
	export type Mesh = any;
	export type PerspectiveCamera = any;
	export type Vector3 = any;
	export type MeshStandardMaterial = any;
	export type Material = any;
	export type MeshStandardMaterialParameters = any;
	export const Group: any;
	export const Vector3: any;
	export const MeshStandardMaterial: any;
	export const TorusKnotGeometry: any;
	export const Color: any;
	export const Mesh: any;
	export const Material: any;
	const THREE: any;
	export default THREE;
}

declare module 'three/examples/jsm/loaders/GLTFLoader' {
	const GLTFLoader: any;
	export default GLTFLoader;
}

declare module 'three/examples/jsm/controls/OrbitControls' {
	const OrbitControls: any;
	export default OrbitControls;
}

declare namespace JSX {
	interface IntrinsicElements {
		ambientLight: any;
		directionalLight: any;
		group: any;
		mesh: any;
		primitive: any;
	}
}

declare module 'react' {
	namespace JSX {
		interface IntrinsicElements {
			ambientLight: any;
			directionalLight: any;
			group: any;
			mesh: any;
			primitive: any;
		}
	}
declare global {
  namespace JSX {
    interface IntrinsicElements {
      torusKnotGeometry: any;
      meshStandardMaterial: any;
      ambientLight: any;
      pointLight: any;
      mesh: any;
      group: any;
      primitive: any;
    }
  }
}
