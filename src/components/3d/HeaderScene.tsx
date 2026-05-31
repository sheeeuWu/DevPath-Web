"use client";

import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Html } from '@react-three/drei';
import { useRef, useEffect, Suspense, Component, ReactNode } from 'react';
import { useTheme } from 'next-themes';
import * as THREE from 'three';

function Model({ color }: { color: string }) {
    const { scene } = useGLTF('/devpath3d.glb');
    const modelRef = useRef<THREE.Group>(null);

    // Mouse tracking for rotation
    const mouse = useRef({ x: 0 });

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            // Normalize x to -1 to 1
            mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useFrame((state, delta) => {
        if (modelRef.current) {
            // Target rotation based on mouse x (range: -60 to +60 degrees approx)
            const targetRotation = mouse.current.x * (Math.PI / 3);

            // Smooth interpolation
            modelRef.current.rotation.y += (targetRotation - modelRef.current.rotation.y) * delta * 5;
        }
    });

    useEffect(() => {
        // First pass: find the largest mesh (background circle)
        let maxVolume = 0;
        let largestMeshId = '';

        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();

                // Smooth the geometry
                mesh.geometry.computeVertexNormals();

                const box = mesh.geometry.boundingBox!;
                const size = new THREE.Vector3();
                box.getSize(size);
                const diagonal = size.length();

                if (diagonal > maxVolume) {
                    maxVolume = diagonal;
                    largestMeshId = mesh.uuid;
                }
            }
        });

        // Collect created materials so we can dispose on cleanup
        const createdMaterials: THREE.MeshStandardMaterial[] = [];

        // Second pass: apply materials
        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                const isBackground = mesh.uuid === largestMeshId;

                const frontColor = isBackground ? '#0B1120' : '#FFFFFF';
                const sideColor = isBackground ? color : '#FFFFFF';

                // Dispose old material before replacing to free GPU memory
                if (mesh.material) {
                    const old = mesh.material as THREE.Material;
                    old.dispose();
                }

                const material = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(sideColor),
                    roughness: 0.2,
                    metalness: 1.0,
                    emissive: new THREE.Color(sideColor),
                    emissiveIntensity: 0.2,
                    transparent: true,
                    opacity: 0.9
                });

                material.onBeforeCompile = (shader) => {
                    shader.uniforms.colorFront = { value: new THREE.Color(frontColor) };
                    shader.uniforms.colorSide = { value: new THREE.Color(sideColor) };

                    shader.vertexShader = `
                        varying vec3 vObjectNormal;
                        ${shader.vertexShader}
                    `.replace(
                        '#include <begin_vertex>',
                        `
                        #include <begin_vertex>
                        vObjectNormal = normal;
                        `
                    );

                    shader.fragmentShader = `
                        uniform vec3 colorFront;
                        uniform vec3 colorSide;
                        varying vec3 vObjectNormal;
                        ${shader.fragmentShader}
                    `.replace(
                        '#include <color_fragment>',
                        `
                        #include <color_fragment>
                        float isFront = step(0.8, abs(vObjectNormal.z));
                        diffuseColor.rgb = mix(colorSide, colorFront, isFront);
                        `
                    );
                };

                mesh.material = material;
                createdMaterials.push(material);
            }
        });

        // Cleanup: dispose all materials we created when color/scene changes or on unmount
        return () => {
            createdMaterials.forEach((mat) => mat.dispose());
        };
    }, [scene, color]);

    return (
        <group ref={modelRef} position={[0, 1.2, 0]}>
            {/* Uniform scale to avoid distortion */}
            <primitive object={scene} scale={0.012} />
        </group>
    );
}




function FallbackGeometry({ color }: { color: string }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const mouse = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            // Normalize mouse position to range [-1, 1]
            mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useFrame((state, delta) => {
        if (meshRef.current) {
            // Slow idle rotation
            meshRef.current.rotation.y += delta * 0.4;
            meshRef.current.rotation.x += delta * 0.15;

            // Dynamically rotate based on mouse cursor coordinates with smooth damping
            const targetRotationY = mouse.current.x * (Math.PI / 4);
            const targetRotationX = mouse.current.y * (Math.PI / 4);
            meshRef.current.rotation.y += (targetRotationY - meshRef.current.rotation.y) * delta * 4;
            meshRef.current.rotation.x += (targetRotationX - meshRef.current.rotation.x) * delta * 4;
        }
    });

    // Dispose geometry and material on unmount to free WebGL resources
    useEffect(() => {
        const mesh = meshRef.current;
        return () => {
            if (mesh) {
                mesh.geometry.dispose();
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach((m) => m.dispose());
                } else {
                    mesh.material.dispose();
                }
            }
        };
    }, []);

    return (
        <mesh ref={meshRef} position={[0, 0.4, 0]}>
            {/* Elegant futuristic floating metallic Torus Knot */}
            <torusKnotGeometry args={[0.7, 0.22, 120, 16]} />
            <meshStandardMaterial
                color={color}
                roughness={0.15}
                metalness={0.9}
                emissive={new THREE.Color(color)}
                emissiveIntensity={0.25}
            />
        </mesh>
    );
}

class ModelErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
    constructor(props: { children: ReactNode; fallback: ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_: Error) {
        return { hasError: true };
    }

    handleRetry = () => {
        useGLTF.clear('/devpath3d.glb');
        this.setState({ hasError: false });
    };

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }

        return this.props.children;
    }
}

export default function HeaderScene() {
    const { theme, systemTheme } = useTheme();
    const currentTheme = theme === 'system' ? systemTheme : theme;

    // Gold/Orange color from the logo
    const brandColor = '#FFB800';

    return (
        <div className="absolute inset-0 w-full h-full pointer-events-none">
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }} gl={{ alpha: true, antialias: true }}>
                <Suspense fallback={null}>
                    <ambientLight intensity={0.8} />
                    <directionalLight position={[5, 5, 5]} intensity={1.5} />
                    {/* Render the stunning interactive procedural 3D Torus Knot directly.
                        Since devpath3d.glb does not exist in static assets, loading it is bypassed
                        to completely eliminate 404 network fetch errors and optimize load speed. */}
                    <FallbackGeometry color={brandColor} />
                    <Environment preset="city" />
                </Suspense>
            </Canvas>
        </div>
    );
}

// useGLTF.preload('/devpath3d.glb');
