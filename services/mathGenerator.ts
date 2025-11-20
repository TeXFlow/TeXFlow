
import { PracticeProblem } from '../types';

export enum GeneratorType {
    ALGEBRA = 'Algebra',
    CALCULUS_DIFF = 'Differentiation',
    CALCULUS_INT = 'Integration',
    LIMITS = 'Limits',
    MATRICES = 'Linear Algebra',
    COMPLEX = 'Complex Numbers',
    TRIGONOMETRY = 'Trigonometry',
    SETS = 'Set Theory',
    LOGIC = 'Logic',
    GREEK = 'Greek Alphabet'
}

// --- Seeded RNG for Daily Challenges ---
let currentSeed: number | null = null;

export const setGeneratorSeed = (seed: number | null) => {
    currentSeed = seed;
};

// Linear Congruential Generator for deterministic "randomness"
const seededRandom = () => {
    if (currentSeed === null) return Math.random();
    const a = 1664525;
    const c = 1013904223;
    const m = 4294967296;
    currentSeed = (a * currentSeed + c) % m;
    return currentSeed / m;
};

// --- Helpers ---
const rInt = (min: number, max: number) => Math.floor(seededRandom() * (max - min + 1)) + min;
const rItem = <T>(arr: T[]): T => arr[Math.floor(seededRandom() * arr.length)];

const rCoeff = (allowZero = false) => {
    const n = rInt(-9, 9);
    if (!allowZero && n === 0) return 1;
    return n;
};

const fmtCoeff = (n: number, isFirst: boolean = false, variable: string = 'x') => {
    if (n === 0) return '';
    if (n === 1) return isFirst ? variable : `+ ${variable}`;
    if (n === -1) return isFirst ? `-${variable}` : `- ${variable}`;
    if (n > 0) return isFirst ? `${n}${variable}` : `+ ${n}${variable}`;
    return isFirst ? `${n}${variable}` : `- ${Math.abs(n)}${variable}`;
};

// --- Generators ---

const generateQuadratic = (): string => {
    const a = rCoeff();
    const b = rCoeff(true);
    const c = rInt(-20, 20);
    
    let eq = '';
    if (a === 1) eq += 'x^2';
    else if (a === -1) eq += '-x^2';
    else eq += `${a}x^2`;
    
    eq += ` ${fmtCoeff(b, false, 'x')}`;
    
    if (c > 0) eq += ` + ${c}`;
    else if (c < 0) eq += ` - ${Math.abs(c)}`;
    
    return `${eq} = 0`;
};

const generatePolynomial = (): string => {
    const degree = rInt(3, 5);
    let poly = '';
    for (let i = degree; i >= 0; i--) {
        const coef = rInt(-9, 9);
        if (coef === 0) continue;
        
        if (i === degree) {
            if (Math.abs(coef) === 1) poly += coef === 1 ? '' : '-';
            else poly += coef;
        } else {
            if (coef > 0) poly += ' + ' + (coef === 1 && i > 0 ? '' : coef);
            else poly += ' - ' + (Math.abs(coef) === 1 && i > 0 ? '' : Math.abs(coef));
        }

        if (i > 1) poly += `x^${i}`;
        else if (i === 1) poly += 'x';
    }
    return `P(x) = ${poly || '0'}`;
};

const generateSystem = (): string => {
    const a1 = rInt(1, 5), b1 = rInt(1, 5), c1 = rInt(1, 20);
    const a2 = rInt(1, 5), b2 = rInt(1, 5), c2 = rInt(1, 20);
    return `\\begin{cases} ${a1}x + ${b1}y = ${c1} \\\\ ${a2}x - ${b2}y = ${c2} \\end{cases}`;
}

const generateDefiniteIntegral = (): string => {
    const a = rInt(0, 2);
    const b = rInt(3, 9);
    const p = rInt(2, 5);
    const type = rInt(0, 3);
    
    if (type === 0) return `\\int_{${a}}^{${b}} x^${p} \\, dx`;
    if (type === 1) return `\\int_{${a}}^{${b}} e^{${rInt(2,4)}x} \\, dx`;
    if (type === 2) return `\\int_{0}^{\\pi} \\sin(${rInt(2,5)}x) \\, dx`;
    return `\\int_{1}^{e} \\frac{1}{x} \\, dx`;
};

const generateDerivative = (): string => {
    const funcs = ['\\sin', '\\cos', '\\ln', '\\exp', '\\tan'];
    const inner = rInt(0, 1) === 0 ? 'x' : `${rInt(2,5)}x`;
    const f = rItem(funcs);
    const p = rInt(2, 5);
    
    const structure = rInt(0, 3);
    if (structure === 0) return `\\frac{d}{dx} \\left( x^${p} ${f}(${inner}) \\right)`; 
    if (structure === 1) return `\\frac{d}{dx} \\frac{x^${p}}{${f}(x)}`; 
    if (structure === 2) return `\\frac{d}{dx} ${f}(x^${p} + 1)`; 
    return `\\frac{d}{dx} \\left( ${rInt(2,9)}x^${p} + ${rInt(1,9)} \\right)`;
};

const generateLimit = (): string => {
    const type = rInt(0, 3);
    if (type === 0) return `\\lim_{x \\to \\infty} \\frac{${rInt(2,5)}x^2 + ${rInt(1,9)}}{${rInt(2,5)}x^2 - ${rInt(1,9)}}`;
    if (type === 1) return `\\lim_{x \\to 0} \\frac{\\sin(${rInt(2,5)}x)}{x}`;
    if (type === 2) return `\\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}`;
    return `\\lim_{x \\to ${rInt(1,5)}} \\frac{x^2 - ${rInt(1,5)**2}}{x - ${rInt(1,5)}}`;
};

const generateMatrix = (): string => {
    const rows = rInt(2, 3);
    const cols = rInt(2, 3);
    let content = '';
    for(let i=0; i<rows; i++) {
        const rowVals = Array.from({length: cols}, () => rInt(-5, 5));
        content += rowVals.join(' & ') + (i < rows-1 ? ' \\\\ ' : '');
    }
    
    const variants = ['pmatrix', 'bmatrix', 'vmatrix'];
    const env = rItem(variants);
    
    if (env === 'vmatrix') return `\\det(A) = \\begin{vmatrix} ${content} \\end{vmatrix}`;
    return `\\mathbf{M} = \\begin{${env}} ${content} \\end{${env}}`;
};

const generateVector = (): string => {
    const dim = rInt(2, 4);
    const vals = Array.from({length: dim}, () => rInt(-9, 9));
    return `\\vec{v} = \\begin{pmatrix} ${vals.join(' \\\\ ')} \\end{pmatrix}`;
};

const generateComplex = (): string => {
    const type = rInt(0, 3);
    if (type === 0) return `z = ${rInt(-5,5)} ${fmtCoeff(rCoeff(), false, 'i')}`;
    if (type === 1) return `|z| = \\sqrt{${rInt(2,9)}^2 + ${rInt(2,9)}^2}`;
    if (type === 2) return `z = ${rInt(2,5)} e^{i \\frac{\\pi}{${rItem(['2','3','4','6'])}}}`;
    return `e^{i\\pi} + 1 = 0`;
};

const generateTrig = (): string => {
    const funcs = ['\\sin', '\\cos', '\\tan', '\\sec', '\\csc', '\\cot'];
    const nums = ['', '2', '3', '4', '6'];
    const denoms = ['3', '4', '6'];
    
    const func = rItem(funcs);
    const num = rItem(nums);
    const den = rItem(denoms);
    
    const angle = num ? `\\frac{${num}\\pi}{${den}}` : `\\frac{\\pi}{${den}}`;
    
    if (seededRandom() > 0.7) return `\\sin^2 \\theta + \\cos^2 \\theta = 1`;
    return `${func} \\left( ${angle} \\right)`;
};

const generateSet = (): string => {
    const sets = ['A', 'B', 'C', '\\mathbb{R}', '\\mathbb{Z}', '\\mathbb{N}', '\\emptyset'];
    const ops = ['\\cup', '\\cap', '\\setminus', '\\times', '\\subseteq', '\\in'];
    
    const s1 = rItem(sets);
    const s2 = rItem(sets);
    const op = rItem(ops);
    
    if (seededRandom() > 0.7) return `A \\cap (B \\cup C)`;
    return `${s1} ${op} ${s2}`;
};

const generateLogic = (): string => {
    const vars = ['P', 'Q', 'R'];
    const ops = ['\\land', '\\lor', '\\implies', '\\iff', '\\oplus'];
    const neg = seededRandom() > 0.7 ? '\\neg ' : '';
    
    return `${neg}${rItem(vars)} ${rItem(ops)} ${rItem(vars)}`;
};

const generateGreek = (): string => {
    const greek = [
        '\\alpha', '\\beta', '\\gamma', '\\delta', '\\epsilon', '\\zeta', 
        '\\eta', '\\theta', '\\iota', '\\kappa', '\\lambda', '\\mu', 
        '\\nu', '\\xi', '\\pi', '\\rho', '\\sigma', '\\tau', 
        '\\phi', '\\chi', '\\psi', '\\omega', '\\Gamma', '\\Delta', 
        '\\Theta', '\\Lambda', '\\Xi', '\\Pi', '\\Sigma', '\\Phi', '\\Psi', '\\Omega'
    ];
    // Return a sequence of 3 random greek letters
    return `${rItem(greek)} ${rItem(greek)} ${rItem(greek)}`;
}


export const generateProceduralProblem = (type: GeneratorType): PracticeProblem => {
    let latex = '';
    let description = '';
    
    switch (type) {
        case GeneratorType.ALGEBRA:
            if (seededRandom() > 0.4) {
                latex = generateQuadratic();
                description = 'Random Quadratic';
            } else if (seededRandom() > 0.5) {
                latex = generatePolynomial();
                description = 'Random Polynomial';
            } else {
                latex = generateSystem();
                description = 'System of Equations';
            }
            break;
        case GeneratorType.CALCULUS_INT:
            latex = generateDefiniteIntegral();
            description = 'Definite Integral';
            break;
        case GeneratorType.CALCULUS_DIFF:
            latex = generateDerivative();
            description = 'Find the Derivative';
            break;
        case GeneratorType.LIMITS:
            latex = generateLimit();
            description = 'Evaluate the Limit';
            break;
        case GeneratorType.MATRICES:
            if (seededRandom() > 0.6) {
                latex = generateVector();
                description = 'Vector';
            } else {
                latex = generateMatrix();
                description = 'Matrix / Determinant';
            }
            break;
        case GeneratorType.COMPLEX:
            latex = generateComplex();
            description = 'Complex Number Form';
            break;
        case GeneratorType.TRIGONOMETRY:
            latex = generateTrig();
            description = 'Trigonometric Value';
            break;
        case GeneratorType.SETS:
            latex = generateSet();
            description = 'Set Operation';
            break;
        case GeneratorType.LOGIC:
            latex = generateLogic();
            description = 'Logic Expression';
            break;
        case GeneratorType.GREEK:
            latex = generateGreek();
            description = 'Type these characters';
            break;
        default:
            latex = 'x = 1';
            description = 'Simple Equation';
    }

    return {
        id: `proc-${Date.now()}`,
        latex,
        category: 'Procedural',
        difficulty: 'Medium',
        description
    };
};
