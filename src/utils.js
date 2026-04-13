import {R_Disk} from './config.js';

//Генерация радиуса диска (межрукавного)
export function randomDiskRadius() {
    const scale = 12000;
    const maxR = R_Disk;
    let r;
    do {
        r = -scale * Math.log(1 - Math.random());
        if (r > maxR) continue;
        const acceptProb = (maxR - r) / maxR;
        if (Math.random() < acceptProb) break;
    } while (true);
    return r;
}

//Гауссов разброс 
export function randn() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

//Генерация толщины диска
export function getDiskHalfThickness(radius) {
    const points = [
        { r: 0, h: 1500 },
        { r: 26000, h: 500 },
        { r: 50000, h: 150 }
    ];
    if (radius <= points[0].r) return points[0].h;
    if (radius >= points[2].r) return points[2].h;
    for (let i = 0; i < 2; i++) {
        if (radius >= points[i].r && radius <= points[i + 1].r) {
            const t = (radius - points[i].r) / (points[i + 1].r - points[i].r);
            return points[i].h * (1 - t) + points[i + 1].h * t;
        }
    }
    return points[2].h;
}
