import {R_Disk, Arms_Count, Spiral_Tightness, Arm_R0, Arm_Sigma_angle, Arm_Sigma_r, Fraction_Arms, Bar_Angle, R_Buldge} from '../config.js';
import {randomDiskRadius, randn, getDiskHalfThickness} from '../utils.js';

export function generateDiskPoint() {
    const isArm = Math.random() < Fraction_Arms;
    let radius, angle, r, g, b;

    if (isArm) {
        const armIndex = Math.floor(Math.random() * Arms_Count); // 0..3
        const maxR = R_Disk;
        const scale = 12000;

        const barLength = R_Buldge * 2.5; // ~8150 пк

        let baseAngle, r0, tightnessFactor = 1.0;
        let isSecondary = false;

        if (armIndex === 0 || armIndex === 1) {
            // ПОБОЧНЫЕ РУКАВА (Лебедя и Стрельца)
            isSecondary = true;
            const offset = (armIndex === 0) ? Math.PI / 4 : 5 * Math.PI / 4; // 45° и 225° от бара
            baseAngle = Bar_Angle + offset;
            r0 = 1500;                     // внутренний стартовый радиус (почти центр)
            tightnessFactor = 2.2;          // сильная закрутка внутри
        } else {
            // ГЛАВНЫЕ РУКАВА (Щита-Центавра и Персея)
            baseAngle = (armIndex === 2) ? Bar_Angle : Bar_Angle + Math.PI;
            r0 = barLength * 0.95;          // старт от концов бара
            tightnessFactor = 1.0;
        }

        let rArm;
        do {
            rArm = -scale * Math.log(1 - Math.random() * (1 - Math.exp(-maxR / scale)));
            if (rArm > maxR) continue;

            let prob;
            if (isSecondary) {
                // Побочные рукава: допустим весь диапазон от r0 до maxR
                // Плотность плавно нарастает от r0 до r_transition, затем стандартно убывает
                const rTrans = 10000; // граница перехода от сильной к обычной спирали
                if (rArm < r0) prob = 0;
                else if (rArm <= rTrans) {
                    // Внутренняя часть: нарастание вероятности
                    const t = (rArm - r0) / (rTrans - r0);
                    prob = t * t; // квадратичный рост
                } else {
                    // Внешняя часть: стандартное убывание к краю диска
                    prob = 1.0;
                    prob *= (maxR - rArm) / (maxR - rTrans);
                }
            } else {
                // Главные рукава: как раньше
                const rMin = r0 * 0.5;
                if (rArm < rMin) prob = 0;
                else if (rArm < r0) prob = (rArm - rMin) / (r0 - rMin);
                else prob = 1.0;
                prob *= (maxR - rArm) / maxR;
            }

            if (Math.random() < prob) break;
        } while (true);

        rArm *= (1 + Arm_Sigma_r * randn());
        rArm = Math.min(maxR, Math.max(0.1, rArm));
        radius = rArm;

        // Спиральный угол
        const tightness = Spiral_Tightness * tightnessFactor;
        let spiralAngle;

        if (isSecondary) {
            const rTrans = 10000;
            if (radius <= rTrans) {
                // Внутренняя область: сильная закрутка от центра
                if (radius < r0) {
                    const t = radius / r0;
                    spiralAngle = tightness * Math.log(Math.max(radius, 1)) * t;
                } else {
                    spiralAngle = tightness * Math.log(radius / r0);
                }
            } else {
                // Внешняя область: обычная спираль, сшитая с внутренней в точке rTrans
                const innerAngleAtTrans = tightness * Math.log(rTrans / r0);
                const outerTightness = Spiral_Tightness; // без фактора
                const outerAngle = outerTightness * Math.log(radius / rTrans);
                spiralAngle = innerAngleAtTrans + outerAngle;
            }
        } else {
            // Главные рукава: стандартная спираль наружу
            if (radius < r0) {
                const t = radius / r0;
                spiralAngle = tightness * Math.log(Math.max(radius, 1)) * t;
            } else {
                spiralAngle = tightness * Math.log(radius / r0);
            }
        }

        angle = baseAngle + spiralAngle + Arm_Sigma_angle * randn();

        // Цвета
        if (isSecondary) {
            r = 1.0;
            g = 0.8 + 0.2 * Math.random();
            b = 0.8 + 0.2 * Math.random();
        } else {
            r = 0.4 + 0.2 * Math.random();
            g = 0.8 + 0.2 * Math.random();
            b = 1.0;
        }
    } else {
        // Межрукавное пространство
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