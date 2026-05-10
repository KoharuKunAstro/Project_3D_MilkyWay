import * as THREE from 'three';

export function createGlowSphereMaterial(color, intensity = 1.0, falloff = 2.5) {
    const col = new THREE.Color(color);
    return new THREE.ShaderMaterial({
        uniforms: {
            uColor: { value: col },
            uIntensity: { value: intensity },
            uFalloff: { value: falloff }
        },
        vertexShader: /* glsl */ `
            varying vec3 vNormal;
            varying vec3 vViewDir;
            void main() {
                vec4 worldPos = modelMatrix * vec4(position, 1.0);
                vNormal = normalize(mat3(modelMatrix) * normal);
                vViewDir = normalize(cameraPosition - worldPos.xyz);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: /* glsl */ `
            uniform vec3 uColor;
            uniform float uIntensity;
            uniform float uFalloff;
            varying vec3 vNormal;
            varying vec3 vViewDir;
            void main() {
                float NdotV = abs(dot(vNormal, vViewDir));
                float alpha = pow(NdotV, uFalloff) * uIntensity;
                alpha = clamp(alpha, 0.0, 1.0);
                gl_FragColor = vec4(uColor, alpha);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: true,
        toneMapped: false
    });
}