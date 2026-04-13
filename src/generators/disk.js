import {R_Disk, Arms_Count, Spiral_Tightness, Arm_R0, Arm_Sigma_angle, Arm_Sigma_r, Fraction_Arms, Bar_Angle} from '../config.js';
import {randomDiskRadius, randn, getDiskHalfThickness} from '../utils.js';

export function generateDiskPoint() {
    const isArm = Math.random() < Fraction_Arms;
    let radius, angle, r, g, b;

    if (isArm) {
        const armIndex = Math.floor(Math.random() * Arms_Count);
        const baseAngle = Bar_Angle + (armIndex / Arms_Count) * 2 * Math.PI;
        const r0 = Arm_R0;
        const maxR = R_Disk;
        const scale = 12000;
        const rMin = r0 * 0.5;

        let rArm;
        do {
            rArm = -scale * Math.log(1 - Math.random() * (1 - Math.exp(-maxR / scale)));
            if (rArm > maxR) continue;

            let prob;
            if (rArm < rMin) prob = 0;
            else if (rArm < r0) prob = (rArm - rMin) / (r0 - rMin);
            else prob = 1.0;
            prob *= (maxR - rArm) / maxR;

            if (Math.random() < prob) break;
        } while (true);

        rArm *= (1 + Arm_Sigma_r * randn());
        rArm = Math.min(maxR, Math.max(0.1, rArm));
        radius = rArm;

        let spiralAngle;
        if (rArm < r0) {
            const t = rArm / r0;
            spiralAngle = Spiral_Tightness * Math.log(Math.max(rArm, 1)) * t;
        } else {
            spiralAngle = Spiral_Tightness * Math.log(rArm / r0);
        }
        angle = baseAngle + spiralAngle + Arm_Sigma_angle * randn();

        r = 0.65 + 0.2 * Math.random();
        g = 0.75 + 0.2 * Math.random();
        b = 1.0;
    } else {
        radius = randomDiskRadius(R_Disk);
        angle = 2 * Math.PI * Math.random();
        r = 1.0;
        g = 0.95;
        b = 0.8 + 0.15 * Math.random();
    }

    const halfThickness = getDiskHalfThickness(radius);
    const z = (Math.random() - 0.5) * 2 * halfThickness;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);

    return { x, y, z, r, g, b };
}