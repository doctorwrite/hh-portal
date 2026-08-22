// ================================================================
// BIQUAD MATH — математика фильтров
// ================================================================

export default class BiquadMath {
static peaking(fc, gain, Q, sampleRate) {
const A = Math.pow(10, gain / 40);
const w0 = 2 * Math.PI * fc / sampleRate;
const alpha = Math.sin(w0) / (2 * Q);
return {
b0: 1 + alpha * A, b1: -2 * Math.cos(w0), b2: 1 - alpha * A,
a0: 1 + alpha / A, a1: -2 * Math.cos(w0), a2: 1 - alpha / A
};
}
static lowshelf(fc, gain, Q, sampleRate) {
    const A = Math.pow(10, gain / 40);
    const w0 = 2 * Math.PI * fc / sampleRate;
    // ===== ИСПРАВЛЕНИЕ: Q влияет на крутизну перехода =====
    const S = Q || 1;
    const alpha = Math.sin(w0) / 2 * Math.sqrt(Math.max(0, (A + 1/A) * (1/S - 1) + 2));
    return {
        b0: A * ((A + 1) - (A - 1) * Math.cos(w0) + 2 * Math.sqrt(A) * alpha),
        b1: 2 * A * ((A - 1) - (A + 1) * Math.cos(w0)),
        b2: A * ((A + 1) - (A - 1) * Math.cos(w0) - 2 * Math.sqrt(A) * alpha),
        a0: (A + 1) + (A - 1) * Math.cos(w0) + 2 * Math.sqrt(A) * alpha,
        a1: -2 * ((A - 1) + (A + 1) * Math.cos(w0)),
        a2: (A + 1) + (A - 1) * Math.cos(w0) - 2 * Math.sqrt(A) * alpha
    };
}

static highshelf(fc, gain, Q, sampleRate) {
    const A = Math.pow(10, gain / 40);
    const w0 = 2 * Math.PI * fc / sampleRate;
    // ===== ИСПРАВЛЕНИЕ: Q влияет на крутизну перехода =====
    const S = Q || 1;
    const alpha = Math.sin(w0) / 2 * Math.sqrt(Math.max(0, (A + 1/A) * (1/S - 1) + 2));
    return {
        b0: A * ((A + 1) + (A - 1) * Math.cos(w0) + 2 * Math.sqrt(A) * alpha),
        b1: -2 * A * ((A - 1) + (A + 1) * Math.cos(w0)),
        b2: A * ((A + 1) + (A - 1) * Math.cos(w0) - 2 * Math.sqrt(A) * alpha),
        a0: (A + 1) - (A - 1) * Math.cos(w0) + 2 * Math.sqrt(A) * alpha,
        a1: 2 * ((A - 1) - (A + 1) * Math.cos(w0)),
        a2: (A + 1) - (A - 1) * Math.cos(w0) - 2 * Math.sqrt(A) * alpha
    };
}
static highpass(fc, Q, sampleRate) {
const w0 = 2 * Math.PI * fc / sampleRate;
const alpha = Math.sin(w0) / (2 * Q);
return {
b0: (1 + Math.cos(w0)) / 2, b1: -(1 + Math.cos(w0)), b2: (1 + Math.cos(w0)) / 2,
a0: 1 + alpha, a1: -2 * Math.cos(w0), a2: 1 - alpha
};
}
static lowpass(fc, Q, sampleRate) {
const w0 = 2 * Math.PI * fc / sampleRate;
const alpha = Math.sin(w0) / (2 * Q);
return {
b0: (1 - Math.cos(w0)) / 2, b1: 1 - Math.cos(w0), b2: (1 - Math.cos(w0)) / 2,
a0: 1 + alpha, a1: -2 * Math.cos(w0), a2: 1 - alpha
};
}
static notch(fc, Q, sampleRate) {
const w0 = 2 * Math.PI * fc / sampleRate;
const alpha = Math.sin(w0) / (2 * Q);
return { b0: 1, b1: -2 * Math.cos(w0), b2: 1, a0: 1 + alpha, a1: -2 * Math.cos(w0), a2: 1 - alpha };
}
static bandpass(fc, Q, sampleRate) {
const w0 = 2 * Math.PI * fc / sampleRate;
const alpha = Math.sin(w0) / (2 * Q);
return { b0: alpha, b1: 0, b2: -alpha, a0: 1 + alpha, a1: -2 * Math.cos(w0), a2: 1 - alpha };
}
static magnitudeAt(c, f, sampleRate) {
const w = 2 * Math.PI * f / sampleRate;
const phi = Math.pow(Math.sin(w / 2), 2) * 4;
const num = Math.pow(c.b0 + c.b1 + c.b2, 2) - phi * (c.b0 * c.b1 + 4 * c.b0 * c.b2 + c.b1 * c.b2) + phi * phi * c.b0 * c.b2;
const den = Math.pow(c.a0 + c.a1 + c.a2, 2) - phi * (c.a0 * c.a1 + 4 * c.a0 * c.a2 + c.a1 * c.a2) + phi * phi * c.a0 * c.a2;
if (!isFinite(num) || !isFinite(den) || den === 0) return -100;
return 10 * Math.log10(Math.max(1e-10, num / den));
}
static getCoeffs(type, fc, gain, Q, sampleRate) {
switch(type) {
case 'bell': return this.peaking(fc, gain, Q, sampleRate);
case 'lowshelf': return this.lowshelf(fc, gain, Q, sampleRate);
case 'highshelf': return this.highshelf(fc, gain, Q, sampleRate);
case 'lowcut': return this.highpass(fc, Q, sampleRate);
case 'highcut': return this.lowpass(fc, Q, sampleRate);
case 'notch': return this.notch(fc, Q, sampleRate);
case 'bandpass': return this.bandpass(fc, Q, sampleRate);
default: return this.peaking(fc, gain, Q, sampleRate);
}
}
static isGainlessType(type) {
return type === 'lowcut' || type === 'highcut' || type === 'notch' || type === 'bandpass';
}
static isQIgnoredType(type) {
return type === 'lowshelf' || type === 'highshelf';
}
}
