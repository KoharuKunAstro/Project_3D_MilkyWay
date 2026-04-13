import {R_Buldge, Bar_Angle} from '../config.js'

export function generateBuldgePoint() {
    const barLenght = R_Buldge * 2.5;
    const barWidth = R_Buldge * 0.8;
    const barHeight = R_Buldge * 0.6;

    const theta = 2 * Math.PI * Math.random();
    const phi = Math.acos(2 * Math.random() - 1);
    const rad = Math.cbrt(Math.random());

    let bx = barLenght * rad * Math.sin(phi) * Math.cos(theta);
    let by = barWidth * rad * Math.sin(phi) * Math.sin(theta);
    let bz = barHeight * rad * Math.cos(phi);

    const cosA = Math.cos(Bar_Angle);
    const sinA = Math.sin(Bar_Angle);
    const x = bx * cosA - by * sinA;
    const y = bx * sinA + by * cosA;
    const z = bz;

    let r, g, b;
    if (Math.random() < 0.3) {
        const extra = 1.5 + Math.random() * 1.0;
        return {
            x: x * extra, y: y * extra, z: z * extra,
            r: 0.9, g: 0.7, b: 0.8
        };
    } else {
        return {
            x, y, z,
            r: 1.0,
            g: 0.8 + 0.2 * Math.random(),
            b: 0.4 + 0.2 * Math.random()
        };
    }
}