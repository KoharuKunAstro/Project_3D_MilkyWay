import {R_Halo} from '../config.js'

export function generateHaloPoint() {
    const rad = R_Halo * Math.cbrt(Math.random());
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = 2 * Math.PI * Math.random();

    return {
        x: rad * Math.sin(phi) * Math.cos(theta),
        y: rad * Math.sin(phi) * Math.sin(theta),
        z: rad * Math.cos(phi),
        r: 0.9,
        g: 0.4 + 0.2 * Math.random(),
        b: 0.2 + 0.1 * Math.random()
    };
}