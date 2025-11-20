
import { PracticeProblem } from './types';

export const DEFAULT_MACROS_SOURCE = `[
    // Physics/Math Symbols
    { "trigger": "hbar", "replacement": "\\\\hbar", "options": "mA", "priority": 10 },
    { "trigger": "deg", "replacement": "^{\\\\circ}", "options": "mA" },

    { "trigger": "binom", "replacement": "\\\\binom{$1}{$2}$0", "options": "mA" },
    { "trigger": "R", "replacement": "\\\\textcolor{red}{\${VISUAL}}$0", "options": "mA", "description": "color red" },
    { "trigger": "Y", "replacement": "\\\\bbox[lightyellow]{\${VISUAL}}$0", "options": "mA", "description": "highlight bg" },
    { "trigger": "C", "replacement": "\\\\textcolor{$1}{\${VISUAL}}$0", "options": "mA", "description": "manual color" },
    
    // Math mode
	{ "trigger": "mk", "replacement": "$$1$$0", "options": "tA" },
	{ "trigger": "dm", "replacement": "$$\\n$1\\n$$$0", "options": "tAw" },
	{ "trigger": "beg", "replacement": "\\\\begin{$1}\\n    $2\\n\\\\end{$1}$0", "options": "mA" },

    // Greek letters
	{ "trigger": "@a", "replacement": "\\\\alpha", "options": "mA" },
	{ "trigger": "@b", "replacement": "\\\\beta", "options": "mA" },
	{ "trigger": "@g", "replacement": "\\\\gamma", "options": "mA" },
	{ "trigger": "@G", "replacement": "\\\\Gamma", "options": "mA" },
	{ "trigger": "@d", "replacement": "\\\\delta", "options": "mA" },
	{ "trigger": "@D", "replacement": "\\\\Delta", "options": "mA" },
	{ "trigger": "@e", "replacement": "\\\\epsilon", "options": "mA" },
	{ "trigger": ":e", "replacement": "\\\\varepsilon", "options": "mA" },
	{ "trigger": "@z", "replacement": "\\\\zeta", "options": "mA" },
	{ "trigger": "@t", "replacement": "\\\\theta", "options": "mA" },
	{ "trigger": "@T", "replacement": "\\\\Theta", "options": "mA" },
	{ "trigger": ":t", "replacement": "\\\\vartheta", "options": "mA" },
	{ "trigger": "@i", "replacement": "\\\\iota", "options": "mA" },
	{ "trigger": "@k", "replacement": "\\\\kappa", "options": "mA" },
	{ "trigger": "@l", "replacement": "\\\\lambda", "options": "mA" },
	{ "trigger": "@L", "replacement": "\\\\Lambda", "options": "mA" },
	{ "trigger": "@s", "replacement": "\\\\sigma", "options": "mA" },
	{ "trigger": "@S", "replacement": "\\\\Sigma", "options": "mA" },
	{ "trigger": "@u", "replacement": "\\\\upsilon", "options": "mA" },
	{ "trigger": "@U", "replacement": "\\\\Upsilon", "options": "mA" },
	{ "trigger": "@o", "replacement": "\\\\omega", "options": "mA" },
	{ "trigger": "@O", "replacement": "\\\\Omega", "options": "mA" },
	{ "trigger": "ome", "replacement": "\\\\omega", "options": "mA" },
	{ "trigger": "Ome", "replacement": "\\\\Omega", "options": "mA" },

    // Text environment
    { "trigger": "text", "replacement": "\\\\text{$1}$0", "options": "mA" },
    { "trigger": "\\"", "replacement": "\\\\text{$1}$0", "options": "mA" },

    // Basic operations
    { "trigger": "sr", "replacement": "^{2}", "options": "mA" },
	{ "trigger": "cb", "replacement": "^{3}", "options": "mA" },
	{ "trigger": "rd", "replacement": "^{$1}$0", "options": "mA" },
	{ "trigger": "_", "replacement": "_{$1}$0", "options": "mA" },
	{ "trigger": "sts", "replacement": "_\\\\text{$1}$0", "options": "mA" },
	{ "trigger": "sq", "replacement": "\\\\sqrt{ $1 }$0", "options": "mA" },
	{ "trigger": "//", "replacement": "\\\\frac{$1}{$2}$0", "options": "mA" },
	{ "trigger": "ee", "replacement": "e^{ $1 }$0", "options": "mA" },
    { "trigger": "invs", "replacement": "^{-1}", "options": "mA" },
    { "trigger": /([A-Za-z])(\\d)/, "replacement": "[[0]]_{[[1]]}", "options": "rmA", "description": "Auto letter subscript", "priority": -1 },

    { "trigger": /(^|[^\\\\])(exp|log|ln)/, "replacement": "[[0]]\\\\[[1]]", "options": "rmA" },
    { "trigger": "conj", "replacement": "^{\\\\ast}", "options": "mA" },
    { "trigger": "Re", "replacement": "\\\\mathrm{Re}", "options": "mA" },
	{ "trigger": "Im", "replacement": "\\\\mathrm{Im}", "options": "mA" },
    { "trigger": "bf", "replacement": "\\\\mathbf{$1}$0", "options": "mA" },
	{ "trigger": "rm", "replacement": "\\\\mathrm{$1}$0", "options": "mA" },

    // Linear algebra
    { "trigger": /(^|[^\\\\])(det)/, "replacement": "[[0]]\\\\[[1]]", "options": "rmA" },
    { "trigger": "trace", "replacement": "\\\\mathrm{Tr}", "options": "mA" },

    // Operations
	{ "trigger": "([a-zA-Z])hat", "replacement": "\\\\hat{[[0]]}", "options": "rmA", "priority": 10 },
    { "trigger": "([a-zA-Z])bar", "replacement": "\\\\overline{[[0]]}", "options": "rmA", "priority": 10 },
	{ "trigger": "([a-zA-Z])dot", "replacement": "\\\\dot{[[0]]}", "options": "rmA", "priority": 10 },
	{ "trigger": "([a-zA-Z])ddot", "replacement": "\\\\ddot{[[0]]}", "options": "rmA", "priority": 10 },
	{ "trigger": "([a-zA-Z])tilde", "replacement": "\\\\tilde{[[0]]}", "options": "rmA", "priority": 10 },
	{ "trigger": "([a-zA-Z])und", "replacement": "\\\\underline{[[0]]}", "options": "rmA", "priority": 10 },
	{ "trigger": "([a-zA-Z])vec", "replacement": "\\\\vec{[[0]]}", "options": "rmA", "priority": 10 },
    { "trigger": "([a-zA-Z]),\\\\.", "replacement": "\\\\mathbf{[[0]]}", "options": "rmA", "priority": 10 },
	{ "trigger": "([a-zA-Z])\\\\.,", "replacement": "\\\\mathbf{[[0]]}", "options": "rmA", "priority": 10 },
	{ "trigger": "\\\\(\${GREEK}),\\\\.", "replacement": "\\\\boldsymbol{\\\\[[0]]}", "options": "rmA", "priority": 10 },
	{ "trigger": "\\\\(\${GREEK})\\\\.,", "replacement": "\\\\boldsymbol{\\\\[[0]]}", "options": "rmA", "priority": 10 },

	{ "trigger": "hat", "replacement": "\\\\hat{$1}$0", "options": "mA" },
    { "trigger": "bar", "replacement": "\\\\overline{$1}$0", "options": "mA" },
	{ "trigger": "dot", "replacement": "\\\\dot{$1}$0", "options": "mA", "priority": -1 },
	{ "trigger": "ddot", "replacement": "\\\\ddot{$1}$0", "options": "mA" },
	{ "trigger": "cdot", "replacement": "\\\\cdot", "options": "mA" },
	{ "trigger": "tilde", "replacement": "\\\\tilde{$1}$0", "options": "mA" },
	{ "trigger": "und", "replacement": "\\\\underline{$1}$0", "options": "mA" },
	{ "trigger": "vec", "replacement": "\\\\vec{$1}$0", "options": "mA" },

    // More auto letter subscript
    { "trigger": /([A-Za-z])_(\\d\\d)/, "replacement": "[[0]]_{[[1]]}", "options": "rmA" },
	{ "trigger": /\\\\hat{([A-Za-z])}(\\d)/, "replacement": "\\\\hat{[[0]]}_{[[1]]}", "options": "rmA" },
	{ "trigger": /\\\\vec{([A-Za-z])}(\\d)/, "replacement": "\\\\vec{[[0]]}_{[[1]]}", "options": "rmA" },
	{ "trigger": /\\\\mathbf{([A-Za-z])}(\\d)/, "replacement": "\\\\mathbf{[[0]]}_{[[1]]}", "options": "rmA" },

    { "trigger": "xnn", "replacement": "x_{n}", "options": "mA" },
	{ "trigger": "\\\\xii", "replacement": "x_{i}", "options": "mA", "priority": 1 },
	{ "trigger": "xjj", "replacement": "x_{j}", "options": "mA" },
	{ "trigger": "xp1", "replacement": "x_{n+1}", "options": "mA" },
	{ "trigger": "ynn", "replacement": "y_{n}", "options": "mA" },
	{ "trigger": "yii", "replacement": "y_{i}", "options": "mA" },
	{ "trigger": "yjj", "replacement": "y_{j}", "options": "mA" },

    // Symbols
    { "trigger": "ooo", "replacement": "\\\\infty", "options": "mA" },
	{ "trigger": "sum", "replacement": "\\\\sum", "options": "mA" },
	{ "trigger": "prod", "replacement": "\\\\prod", "options": "mA" },
	{ "trigger": "\\\\sum", "replacement": "\\\\sum_{\${1:i}=\${2:1}}^{\${3:N}} $0", "options": "m" },
	{ "trigger": "\\\\prod", "replacement": "\\\\prod_{\${1:i}=\${2:1}}^{\${3:N}} $0", "options": "m" },
    { "trigger": "lim", "replacement": "\\\\lim_{ \${1:x} \\\\to \${2:0} } $0", "options": "mA" },
    { "trigger": "+-", "replacement": "\\\\pm", "options": "mA" },
	{ "trigger": "-+", "replacement": "\\\\mp", "options": "mA" },
    { "trigger": "...", "replacement": "\\\\dots", "options": "mA" },
    { "trigger": "nabl", "replacement": "\\\\nabla", "options": "mA" },
	{ "trigger": "del", "replacement": "\\\\nabla", "options": "mA" },
    { "trigger": "xx", "replacement": "\\\\times", "options": "mA" },
    { "trigger": "**", "replacement": "\\\\cdot", "options": "mA" },
    { "trigger": "para", "replacement": "\\\\parallel", "options": "mA" },

	{ "trigger": "===", "replacement": "\\\\equiv", "options": "mA" },
    { "trigger": "!=", "replacement": "\\\\neq", "options": "mA" },
	{ "trigger": ">=", "replacement": "\\\\geq", "options": "mA" },
	{ "trigger": "<=", "replacement": "\\\\leq", "options": "mA" },
	{ "trigger": ">>", "replacement": "\\\\gg", "options": "mA" },
	{ "trigger": "<<", "replacement": "\\\\ll", "options": "mA" },
	{ "trigger": "simm", "replacement": "\\\\sim", "options": "mA" },
	{ "trigger": "sim=", "replacement": "\\\\simeq", "options": "mA" },
    { "trigger": "prop", "replacement": "\\\\propto", "options": "mA" },

    { "trigger": "<->", "replacement": "\\\\leftrightarrow ", "options": "mA" },
	{ "trigger": "->", "replacement": "\\\\to", "options": "mA" },
	{ "trigger": "!>", "replacement": "\\\\mapsto", "options": "mA" },
    { "trigger": "=>", "replacement": "\\\\implies", "options": "mA" },
	{ "trigger": "=<", "replacement": "\\\\impliedby", "options": "mA" },

	{ "trigger": "and", "replacement": "\\\\cap", "options": "mA" },
	{ "trigger": "orr", "replacement": "\\\\cup", "options": "mA" },
	{ "trigger": "inn", "replacement": "\\\\in", "options": "mA" },
	{ "trigger": "notin", "replacement": "\\\\not\\\\in", "options": "mA" },
    { "trigger": "\\\\\\\\\\\\", "replacement": "\\\\setminus", "options": "mA" },
    { "trigger": "sub=", "replacement": "\\\\subseteq", "options": "mA" },
    { "trigger": "sup=", "replacement": "\\\\supseteq", "options": "mA" },
	{ "trigger": "eset", "replacement": "\\\\emptyset", "options": "mA" },
	{ "trigger": "set", "replacement": "\\\\{ $1 \\\\}$0", "options": "mA" },
	{ "trigger": "e\\\\xi sts", "replacement": "\\\\exists", "options": "mA", "priority": 1 },

    { "trigger": "FF", "replacement": "\\\\mathcal{F}", "options": "mA" },
	{ "trigger": "LL", "replacement": "\\\\mathcal{L}", "options": "mA" },
	{ "trigger": "HH", "replacement": "\\\\mathcal{H}", "options": "mA" },
    { "trigger": "EE", "replacement": "\\\\mathbb{E}", "options": "mA" },
    { "trigger": "PP", "replacement": "\\\\mathbb{P}", "options": "mA" },
	{ "trigger": "CC", "replacement": "\\\\mathbb{C}", "options": "mA" },
	{ "trigger": "RR", "replacement": "\\\\mathbb{R}", "options": "mA" },
	{ "trigger": "ZZ", "replacement": "\\\\mathbb{Z}", "options": "mA" },
	{ "trigger": "NN", "replacement": "\\\\mathbb{N}", "options": "mA" },
    { "trigger": "QQ", "replacement": "\\\\mathbb{Q}", "options": "mA" },

	{ "trigger": "([^\\\\\\\\])(\${GREEK})", "replacement": "[[0]]\\\\[[1]]", "options": "rmA" },
	{ "trigger": "([^\\\\\\\\])(\${SYMBOL})", "replacement": "[[0]]\\\\[[1]]", "options": "rmA" },

	{ "trigger": "\\\\(\${GREEK}|\${SYMBOL}|\${MORE_SYMBOLS})([A-Za-z])", "replacement": "\\\\[[0]] [[1]]", "options": "rmA" },
	{ "trigger": "\\\\(\${GREEK}|\${SYMBOL}) sq", "replacement": "\\\\[[0]]^{2}", "options": "rmA" },
	{ "trigger": "\\\\(\${GREEK}|\${SYMBOL}) cb", "replacement": "\\\\[[0]]^{3}", "options": "rmA" },
	{ "trigger": "\\\\(\${GREEK}|\${SYMBOL}) rd", "replacement": "\\\\[[0]]^{$1}$0", "options": "rmA" },
	{ "trigger": "\\\\(\${GREEK}|\${SYMBOL}) hat", "replacement": "\\\\hat{\\\\[[0]]}", "options": "rmA" },
	{ "trigger": "\\\\(\${GREEK}|\${SYMBOL}) dot", "replacement": "\\\\dot{\\\\[[0]]}", "options": "rmA" },
	{ "trigger": "\\\\(\${GREEK}|\${SYMBOL}) bar", "replacement": "\\\\bar{\\\\[[0]]}", "options": "rmA" },
	{ "trigger": "\\\\(\${GREEK}|\${SYMBOL}) vec", "replacement": "\\\\vec{\\\\[[0]]}", "options": "rmA" },
	{ "trigger": "\\\\(\${GREEK}|\${SYMBOL}) tilde", "replacement": "\\\\tilde{\\\\[[0]]}", "options": "rmA" },
	{ "trigger": "\\\\(\${GREEK}|\${SYMBOL}) und", "replacement": "\\\\underline{\\\\[[0]]}", "options": "rmA" },


    // Derivatives and integrals
    { "trigger": "par", "replacement": "\\\\frac{ \\\\partial \${1:y} }{ \\\\partial \${2:x} } $0", "options": "m" },
    { "trigger": /pa([A-Za-z])([A-Za-z])/, "replacement": "\\\\frac{ \\\\partial [[0]] }{ \\\\partial [[1]] } ", "options": "rm" },
    { "trigger": "ddt", "replacement": "\\\\frac{d}{dt} ", "options": "mA" },

    { "trigger": /(^|[^\\\\\\\\])int/, "replacement": "[[0]]\\\\int", "options": "mA", "priority": -1 },
    { "trigger": "\\\\int", "replacement": "\\\\int $1 \\\\, d\${2:x} $0", "options": "m" },
    { "trigger": "dint", "replacement": "\\\\int_{\${1:0}}^{\${2:1}} $3 \\\\, d\${4:x} $0", "options": "mA" },
    { "trigger": "oint", "replacement": "\\\\oint", "options": "mA" },
	{ "trigger": "iint", "replacement": "\\\\iint", "options": "mA" },
    { "trigger": "iiint", "replacement": "\\\\iiint", "options": "mA" },
    { "trigger": "oinf", "replacement": "\\\\int_{0}^{\\\\infty} $1 \\\\, d\${2:x} $0", "options": "mA" },
	{ "trigger": "infi", "replacement": "\\\\int_{-\\\\infty}^{\\\\infty} $1 \\\\, d\${2:x} $0", "options": "mA" },


    // Trigonometry
    { "trigger": /(^|[^\\\\\\\\])(arcsin|sin|arccos|cos|arctan|tan|csc|sec|cot)/, "replacement": "[[0]]\\\\[[1]]", "options": "rmA" },
    { "trigger": /\\\\(arcsin|sin|arccos|cos|arctan|tan|csc|sec|cot)([A-Za-gi-z])/, "replacement": "\\\\[[0]] [[1]]", "options": "rmA" },
    { "trigger": /\\\\(sinh|cosh|tanh|coth)([A-Za-z])/, "replacement": "\\\\[[0]] [[1]]", "options": "rmA" },

    // Visual operations
    { "trigger": "B", "replacement": "\\\\boxed{ \${VISUAL} }", "options": "mA" },
	{ "trigger": "U", "replacement": "\\\\underbrace{ \${VISUAL} }_{ $1 }$0", "options": "mA" },
	{ "trigger": "O", "replacement": "\\\\overbrace{ \${VISUAL} }^{ $1 }$0", "options": "mA" },
	{ "trigger": "L", "replacement": "\\\\underset{ $1 }{ \${VISUAL} }$0", "options": "mA" },
	{ "trigger": "X", "replacement": "\\\\cancel{ \${VISUAL} }", "options": "mA" },
	{ "trigger": "K", "replacement": "\\\\cancelto{ $1 }{ \${VISUAL} }$0", "options": "mA" },
	{ "trigger": "S", "replacement": "\\\\sqrt{ \${VISUAL} }", "options": "mA" },
    { "trigger": "/", "replacement": "\\\\frac{\${VISUAL}}{$1}$0", "options": "mA", "description": "Visual Fraction" },


    // Physics
	{ "trigger": "kbt", "replacement": "k_{B}T", "options": "mA" },
	{ "trigger": "msun", "replacement": "M_{\\\\odot}", "options": "mA" },

    // Quantum mechanics
    { "trigger": "dag", "replacement": "^{\\\\dagger}", "options": "mA" },
	{ "trigger": "o+", "replacement": "\\\\oplus ", "options": "mA" },
	{ "trigger": "otimes", "replacement": "\\\\otimes ", "options": "mA" },
    { "trigger": "bra", "replacement": "\\\\bra{$1} $0", "options": "mA" },
	{ "trigger": "ket", "replacement": "\\\\ket{$1} $0", "options": "mA" },
	{ "trigger": "brk", "replacement": "\\\\braket{ $1 | $2 } $0", "options": "mA" },
    { "trigger": "outer", "replacement": "\\\\ket{\${1:\\\\psi}} \\\\bra{\${1:\\\\psi}} $0", "options": "mA" },

    // Chemistry
	{ "trigger": "pu", "replacement": "\\\\pu{ $1 }$0", "options": "mA" },
	{ "trigger": "cee", "replacement": "\\\\ce{ $1 }$0", "options": "mA" },
	{ "trigger": "he4", "replacement": "{}^{4}_{2}He ", "options": "mA" },
	{ "trigger": "he3", "replacement": "{}^{3}_{2}He ", "options": "mA" },
	{ "trigger": "iso", "replacement": "{}^{\${1:4}}_{\${2:2}}\${3:He}", "options": "mA" },


    // Environments
	{ "trigger": "pmat", "replacement": "\\\\begin{pmatrix}\\n    $1\\n\\\\end{pmatrix}$0", "options": "MA" },
	{ "trigger": "bmat", "replacement": "\\\\begin{bmatrix}\\n    $1\\n\\\\end{bmatrix}$0", "options": "MA" },
	{ "trigger": "Bmat", "replacement": "\\\\begin{Bmatrix}\\n    $1\\n\\\\end{Bmatrix}$0", "options": "MA" },
	{ "trigger": "vmat", "replacement": "\\\\begin{vmatrix}\\n    $1\\n\\\\end{vmatrix}$0", "options": "MA" },
	{ "trigger": "Vmat", "replacement": "\\\\begin{Vmatrix}\\n    $1\\n\\\\end{Vmatrix}$0", "options": "MA" },
	{ "trigger": "matrix", "replacement": "\\\\begin{matrix}\\n    $1\\n\\\\end{matrix}$0", "options": "MA" },
	{ "trigger": "cases", "replacement": "\\\\begin{cases}\\n    $1\\n\\\\end{cases}$0", "options": "mA" },
	{ "trigger": "align", "replacement": "\\\\begin{align}\\n    $1\\n\\\\end{align}$0", "options": "mA" },
	{ "trigger": "array", "replacement": "\\\\begin{array}\\n    $1\\n\\\\end{array}$0", "options": "mA" },


    // Brackets
	{ "trigger": "avg", "replacement": "\\\\langle $1 \\\\rangle $0", "options": "mA" },
    { "trigger": "iprod", "replacement": "\\\\left\\\\langle $1 , $2 \\\\right\\\\rangle $0", "options": "mA" },
    { "trigger": "form", "replacement": "\\\\left\\\\langle $1 \\\\vert $2 \\\\right\\\\rangle $0", "options": "mA" },
	{ "trigger": "norm", "replacement": "\\\\lvert $1 \\\\rvert $0", "options": "mA", "priority": 1 },
	{ "trigger": "Norm", "replacement": "\\\\lVert $1 \\\\rVert $0", "options": "mA", "priority": 1 },
	{ "trigger": "sNorm", "replacement": "\\\\lVert $1 \\\\rVert^2 $0", "options": "mA", "priority": 1 },
	{ "trigger": "ceil", "replacement": "\\\\lceil $1 \\\\rceil $0", "options": "mA" },
	{ "trigger": "floor", "replacement": "\\\\lfloor $1 \\\\rfloor $0", "options": "mA" },
	{ "trigger": "abs", "replacement": "|$1|$0", "options": "mA" },
	{ "trigger": "(", "replacement": "(\${VISUAL})", "options": "mA" },
	{ "trigger": "[", "replacement": "[\${VISUAL}]", "options": "mA" },
	{ "trigger": "{", "replacement": "{\${VISUAL}}", "options": "mA" },
	{ "trigger": "(", "replacement": "($1)$0", "options": "mA" },
	{ "trigger": "{", "replacement": "{$1}$0", "options": "mA" },
	{ "trigger": "[", "replacement": "[$1]$0", "options": "mA" },
	{ "trigger": "lr(", "replacement": "\\\\left( $1 \\\\right) $0", "options": "mA" },
	{ "trigger": "lr{", "replacement": "\\\\left\\\\{ $1 \\\\right\\\\} $0", "options": "mA" },
	{ "trigger": "lr[", "replacement": "\\\\left[ $1 \\\\right] $0", "options": "mA" },
	{ "trigger": "lr|", "replacement": "\\\\left| $1 \\\\right| $0", "options": "mA" },
	{ "trigger": "lra", "replacement": "\\\\left< $1 \\\\right> $0", "options": "mA" },

	{ "trigger": "tayl", "replacement": "\${1:f}(\${2:x} + \${3:h}) = \${1:f}(\${2:x}) + \${1:f}'(\${2:x})\${3:h} + \${1:f}''(\${2:x}) \\\\frac{\${3:h}^{2}}{2!} + \\\\dots$0", "options": "mA", "description": "Taylor expansion" },

	{ "trigger": /iden(\\d)/, "replacement": (match) => {
		const n = parseInt(match[1]);
		let arr = [];
		for (let j = 0; j < n; j++) {
			arr[j] = [];
			for (let i = 0; i < n; i++) {
				arr[j][i] = (i === j) ? 1 : 0;
			}
		}
		let output = arr.map(el => el.join(" & ")).join(" \\\\\\\\ ");
		output = "\\\\begin{pmatrix}\\n" + output + "\\n\\\\end{pmatrix}";
		return output;
	}, "options": "mA", "description": "N x N identity matrix" },

    // Smart Auto-Fractions
    { "trigger": /\\(([^)]+)\\)\\//, "replacement": "\\\\frac{[[0]]}{$1}$0", "options": "mA", "priority": 10 },
    { "trigger": /((\\\\[a-zA-Z]+|[a-zA-Z0-9])(\\^|_|)(\\{[^}]+\\}|[a-zA-Z0-9]?))\\//, "replacement": "\\\\frac{[[0]]}{$1}$0", "options": "mA", "priority": 5 },
    { "trigger": /([a-zA-Z0-9\\\\]+)\\//, "replacement": "\\\\frac{[[0]]}{$1}$0", "options": "mA", "priority": 1 }
]`;

export const CURATED_PROBLEMS: Record<string, PracticeProblem[]> = {
    "Famous Identities": [
        { id: 'fi1', latex: 'e^{i\\pi} + 1 = 0', category: 'Identities', difficulty: 'Easy', description: "Euler's Identity" },
        { id: 'fi2', latex: '\\int_{-\\infty}^{\\infty} e^{-x^2} \\, dx = \\sqrt{\\pi}', category: 'Identities', difficulty: 'Medium', description: 'Gaussian Integral' },
        { id: 'fi3', latex: '\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}', category: 'Identities', difficulty: 'Medium', description: 'Basel Problem' },
        { id: 'fi4', latex: '\\Gamma(z) = \\int_0^\\infty x^{z-1} e^{-x} \\, dx', category: 'Identities', difficulty: 'Medium', description: 'Gamma Function' },
        { id: 'fi5', latex: 'e = \\sum_{n=0}^\\infty \\frac{1}{n!}', category: 'Identities', difficulty: 'Easy', description: "Definition of e" },
        { id: 'fi6', latex: '\\phi = \\frac{1 + \\sqrt{5}}{2}', category: 'Identities', difficulty: 'Easy', description: "Golden Ratio" },
        { id: 'fi7', latex: 'i^2 = -1', category: 'Identities', difficulty: 'Easy', description: "Imaginary Unit" },
        { id: 'fi8', latex: '\\zeta(s) = \\sum_{n=1}^{\\infty} \\frac{1}{n^s}', category: 'Identities', difficulty: 'Medium', description: "Riemann Zeta Function" },
        { id: 'fi9', latex: 'F - E + V = 2', category: 'Identities', difficulty: 'Easy', description: "Euler Characteristic" },
        { id: 'fi10', latex: '\\binom{n}{k} = \\binom{n}{n-k}', category: 'Identities', difficulty: 'Easy', description: "Symmetry of Combinations" },
        { id: 'fi11', latex: '\\sin^2 x + \\cos^2 x = 1', category: 'Identities', difficulty: 'Easy', description: "Pythagorean Identity" },
    ],
    "Calculus": [
        { id: 'c1_1', latex: '\\frac{d}{dx} (uv) = u \\frac{dv}{dx} + v \\frac{du}{dx}', category: 'Calculus', difficulty: 'Easy', description: "Product Rule" },
        { id: 'c1_2', latex: '\\frac{d}{dx} \\left(\\frac{u}{v}\\right) = \\frac{v \\frac{du}{dx} - u \\frac{dv}{dx}}{v^2}', category: 'Calculus', difficulty: 'Medium', description: "Quotient Rule" },
        { id: 'c1_3', latex: '\\frac{d}{dx} f(g(x)) = f\'(g(x)) g\'(x)', category: 'Calculus', difficulty: 'Easy', description: "Chain Rule" },
        { id: 'c1_4', latex: '\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1', category: 'Calculus', difficulty: 'Medium', description: "Standard Limit" },
        { id: 'c1_5', latex: '\\int x^n \\, dx = \\frac{x^{n+1}}{n+1} + C', category: 'Calculus', difficulty: 'Easy', description: "Power Rule Integration" },
        { id: 'c2_1', latex: '\\int u \\, dv = uv - \\int v \\, du', category: 'Calculus', difficulty: 'Medium', description: "Integration by Parts" },
        { id: 'c2_2', latex: '\\nabla \\cdot \\mathbf{F} = \\frac{\\partial F_x}{\\partial x} + \\frac{\\partial F_y}{\\partial y} + \\frac{\\partial F_z}{\\partial z}', category: 'Calculus', difficulty: 'Medium', description: 'Divergence' },
        { id: 'c2_3', latex: '\\nabla \\times \\mathbf{F} = \\left( \\frac{\\partial F_z}{\\partial y} - \\frac{\\partial F_y}{\\partial z} \\right) \\mathbf{i} + \\dots', category: 'Calculus', difficulty: 'Hard', description: 'Curl' },
        { id: 'c2_4', latex: '\\oint_{\\partial S} \\mathbf{F} \\cdot d\\mathbf{r} = \\iint_S (\\nabla \\times \\mathbf{F}) \\cdot d\\mathbf{S}', category: 'Calculus', difficulty: 'Hard', description: "Stokes' Theorem" },
        { id: 'c2_5', latex: '\\sum_{n=0}^{\\infty} ar^n = \\frac{a}{1-r}', category: 'Calculus', difficulty: 'Medium', description: "Geometric Series" },
        { id: 'c2_6', latex: '\\iint_D f(x,y) \\,dx\\,dy = \\iint_{D^*} f(r\\cos\\theta, r\\sin\\theta) r \\,dr\\,d\\theta', category: 'Calculus', difficulty: 'Hard', description: "Polar Coordinates Change" },
        { id: 'c2_7', latex: '\\frac{\\partial^2 u}{\\partial x^2} + \\frac{\\partial^2 u}{\\partial y^2} = 0', category: 'Calculus', difficulty: 'Medium', description: "Laplace Equation" },
        { id: 'c2_8', latex: 'L(f) = \\int_0^\\infty e^{-st} f(t) \\, dt', category: 'Calculus', difficulty: 'Medium', description: "Laplace Transform" },
    ],
    "Linear Algebra": [
        { id: 'la1', latex: '\\det(A - \\lambda I) = 0', category: 'Linear Algebra', difficulty: 'Medium', description: "Characteristic Equation" },
        { id: 'la2', latex: 'A\\mathbf{x} = \\mathbf{b}', category: 'Linear Algebra', difficulty: 'Easy', description: "Linear System" },
        { id: 'la3', latex: '\\langle \\mathbf{u}, \\mathbf{v} \\rangle = \\mathbf{u}^T \\mathbf{v}', category: 'Linear Algebra', difficulty: 'Easy', description: "Inner Product" },
        { id: 'la4', latex: '\\text{Tr}(A) = \\sum_{i=1}^n a_{ii}', category: 'Linear Algebra', difficulty: 'Easy', description: "Trace Definition" },
        { id: 'la5', latex: 'A = U \\Sigma V^T', category: 'Linear Algebra', difficulty: 'Hard', description: "SVD Decomposition" },
        { id: 'la6', latex: 'P^{-1}AP = D', category: 'Linear Algebra', difficulty: 'Medium', description: "Diagonalization" },
        { id: 'la7', latex: '\\text{rank}(A) + \\text{nullity}(A) = n', category: 'Linear Algebra', difficulty: 'Medium', description: "Rank-Nullity Theorem" },
        { id: 'la8', latex: '\\|\\mathbf{v}\\| = \\sqrt{\\langle \\mathbf{v}, \\mathbf{v} \\rangle}', category: 'Linear Algebra', difficulty: 'Easy', description: "Vector Norm" },
        { id: 'la9', latex: '\\mathbf{u} \\times \\mathbf{v} = \\begin{vmatrix} \\mathbf{i} & \\mathbf{j} & \\mathbf{k} \\\\ u_1 & u_2 & u_3 \\\\ v_1 & v_2 & v_3 \\end{vmatrix}', category: 'Linear Algebra', difficulty: 'Hard', description: "Cross Product" },
    ],
    "Physics - Core": [
        { id: 'ph1', latex: 'F = G \\frac{m_1 m_2}{r^2}', category: 'Physics', difficulty: 'Easy', description: "Newton's Law of Gravitation" },
        { id: 'ph2', latex: 'E^2 = (pc)^2 + (mc^2)^2', category: 'Physics', difficulty: 'Medium', description: "Relativistic Energy" },
        { id: 'ph3', latex: 'F = ma', category: 'Physics', difficulty: 'Easy', description: "Newton's Second Law" },
        { id: 'ph4', latex: 'K = \\frac{1}{2}mv^2', category: 'Physics', difficulty: 'Easy', description: "Kinetic Energy" },
        { id: 'ph5', latex: 'pV = N k_B T', category: 'Physics', difficulty: 'Medium', description: "Ideal Gas Law (Physics)" },
        { id: 'ph6', latex: 'T = 2\\pi \\sqrt{\\frac{L}{g}}', category: 'Physics', difficulty: 'Easy', description: "Pendulum Period" },
        { id: 'ph7', latex: '\\lambda = \\frac{h}{p}', category: 'Physics', difficulty: 'Easy', description: "De Broglie Wavelength" },
        { id: 'ph8', latex: 'L = I \\omega', category: 'Physics', difficulty: 'Easy', description: "Angular Momentum" },
    ],
    "Electromagnetism": [
        { id: 'em1', latex: '\\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\epsilon_0}', category: 'Electromagnetism', difficulty: 'Medium', description: "Gauss's Law" },
        { id: 'em2', latex: '\\nabla \\cdot \\mathbf{B} = 0', category: 'Electromagnetism', difficulty: 'Easy', description: "Gauss's Law for Magnetism" },
        { id: 'em3', latex: '\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}', category: 'Electromagnetism', difficulty: 'Medium', description: "Faraday's Law" },
        { id: 'em4', latex: '\\nabla \\times \\mathbf{B} = \\mu_0 \\mathbf{J} + \\mu_0 \\epsilon_0 \\frac{\\partial \\mathbf{E}}{\\partial t}', category: 'Electromagnetism', difficulty: 'Hard', description: "Ampere-Maxwell Law" },
        { id: 'em5', latex: '\\mathbf{F} = q(\\mathbf{E} + \\mathbf{v} \\times \\mathbf{B})', category: 'Electromagnetism', difficulty: 'Medium', description: "Lorentz Force" },
        { id: 'em6', latex: 'V = -\\int \\mathbf{E} \\cdot d\\mathbf{l}', category: 'Electromagnetism', difficulty: 'Medium', description: "Electric Potential" },
    ],
    "Quantum Mechanics": [
        { id: 'qm1', latex: 'i \\hbar \\frac{\\partial}{\\partial t} \\Psi = \\hat{H} \\Psi', category: 'Quantum Mechanics', difficulty: 'Medium', description: "Schrodinger Equation" },
        { id: 'qm2', latex: '\\Delta x \\Delta p \\geq \\frac{\\hbar}{2}', category: 'Quantum Mechanics', difficulty: 'Easy', description: "Heisenberg Uncertainty" },
        { id: 'qm3', latex: '\\hat{H} \\psi_n = E_n \\psi_n', category: 'Quantum Mechanics', difficulty: 'Medium', description: "Time-Independent Schrodinger" },
        { id: 'qm4', latex: '\\langle \\psi | \\phi \\rangle = \\int \\psi^* \\phi \\, dx', category: 'Quantum Mechanics', difficulty: 'Medium', description: "Inner Product" },
        { id: 'qm5', latex: '[\\hat{x}, \\hat{p}] = i\\hbar', category: 'Quantum Mechanics', difficulty: 'Easy', description: "Canonical Commutation" },
        { id: 'qm6', latex: '|\\psi\\rangle = \\sum_n c_n |n\\rangle', category: 'Quantum Mechanics', difficulty: 'Medium', description: "Superposition" },
        { id: 'qm7', latex: '\\rho = \\sum_i p_i |\\psi_i\\rangle \\langle \\psi_i|', category: 'Quantum Mechanics', difficulty: 'Hard', description: "Density Matrix" },
    ],
    "Advanced Physics": [
        { id: 'ap1', latex: 'R_{\\mu \\nu} - \\frac{1}{2}Rg_{\\mu \\nu} + \\Lambda g_{\\mu \\nu} = \\frac{8\\pi G}{c^4} T_{\\mu \\nu}', category: 'Advanced Physics', difficulty: 'Hard', description: "Einstein Field Equations" },
        { id: 'ap2', latex: '\\mathcal{L} = \\bar{\\psi}(i\\gamma^\\mu D_\\mu - m)\\psi - \\frac{1}{4}F_{\\mu\\nu}F^{\\mu\\nu}', category: 'Advanced Physics', difficulty: 'Hard', description: "QED Lagrangian" },
        { id: 'ap3', latex: 'S = \\frac{k_B c^3 A}{4 G \\hbar}', category: 'Advanced Physics', difficulty: 'Medium', description: "Bekenstein-Hawking Entropy" },
        { id: 'ap4', latex: 'Z = \\sum_i e^{-\\beta E_i}', category: 'Advanced Physics', difficulty: 'Medium', description: "Partition Function" },
        { id: 'ap5', latex: '\\frac{d}{dt} \\frac{\\partial L}{\\partial \\dot{q}_i} - \\frac{\\partial L}{\\partial q_i} = 0', category: 'Advanced Physics', difficulty: 'Medium', description: "Euler-Lagrange Equation" },
    ],
    "Logic & Sets": [
        { id: 'ls1', latex: '\\forall x \\in \\mathbb{R}, \\exists y \\in \\mathbb{R} : x < y', category: 'Logic & Sets', difficulty: 'Easy', description: "Quantifiers" },
        { id: 'ls2', latex: 'A \\cup (B \\cap C) = (A \\cup B) \\cap (A \\cup C)', category: 'Logic & Sets', difficulty: 'Medium', description: "Distributive Law" },
        { id: 'ls3', latex: '\\neg(P \\land Q) \\iff (\\neg P) \\lor (\\neg Q)', category: 'Logic & Sets', difficulty: 'Medium', description: "De Morgan's Law" },
        { id: 'ls4', latex: '|\\mathcal{P}(A)| = 2^{|A|}', category: 'Logic & Sets', difficulty: 'Easy', description: "Power Set Cardinality" },
        { id: 'ls5', latex: 'A \\subseteq B \\iff \\forall x (x \\in A \\implies x \\in B)', category: 'Logic & Sets', difficulty: 'Easy', description: "Subset Definition" },
        { id: 'ls6', latex: 'A \\setminus B = \\{x : x \\in A \\land x \\notin B\\}', category: 'Logic & Sets', difficulty: 'Easy', description: "Set Difference" },
        { id: 'ls7', latex: 'A \\times B = \\{(a,b) : a \\in A, b \\in B\\}', category: 'Logic & Sets', difficulty: 'Easy', description: "Cartesian Product" },
    ],
    "Statistics": [
        { id: 'st1', latex: '\\sigma^2 = \\frac{1}{N} \\sum_{i=1}^{N} (x_i - \\mu)^2', category: 'Statistics', difficulty: 'Medium', description: "Population Variance" },
        { id: 'st2', latex: 'P(A|B) = \\frac{P(B|A)P(A)}{P(B)}', category: 'Statistics', difficulty: 'Medium', description: "Bayes' Theorem" },
        { id: 'st3', latex: '\\binom{n}{k} = \\frac{n!}{k!(n-k)!}', category: 'Statistics', difficulty: 'Easy', description: "Binomial Coefficient" },
        { id: 'st4', latex: 'f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-\\frac{1}{2}(\\frac{x-\\mu}{\\sigma})^2}', category: 'Statistics', difficulty: 'Hard', description: "Normal Distribution" },
        { id: 'st5', latex: 'E[X] = \\sum_{x} x P(X=x)', category: 'Statistics', difficulty: 'Easy', description: "Expected Value" },
        { id: 'st6', latex: 'r = \\frac{\\sum(x_i-\\bar{x})(y_i-\\bar{y})}{\\sqrt{\\sum(x_i-\\bar{x})^2 \\sum(y_i-\\bar{y})^2}}', category: 'Statistics', difficulty: 'Hard', description: "Pearson Correlation" },
        { id: 'st7', latex: '\\chi^2 = \\sum \\frac{(O_i - E_i)^2}{E_i}', category: 'Statistics', difficulty: 'Medium', description: "Chi-Square" },
    ],
    "Number Theory": [
        { id: 'nt1', latex: 'a \\equiv b \\pmod{n}', category: 'Number Theory', difficulty: 'Easy', description: "Congruence" },
        { id: 'nt2', latex: '\\phi(n) = n \\prod_{p|n} \\left(1 - \\frac{1}{p}\\right)', category: 'Number Theory', difficulty: 'Medium', description: "Euler's Totient Function" },
        { id: 'nt3', latex: 'a^{\\phi(n)} \\equiv 1 \\pmod{n}', category: 'Number Theory', difficulty: 'Medium', description: "Euler's Theorem" },
        { id: 'nt4', latex: '\\pi(x) \\sim \\frac{x}{\\ln x}', category: 'Number Theory', difficulty: 'Medium', description: "Prime Number Theorem" },
        { id: 'nt5', latex: '\\text{gcd}(a,b) \\cdot \\text{lcm}(a,b) = |ab|', category: 'Number Theory', difficulty: 'Easy', description: "GCD-LCM Relation" },
    ],
    "Complex Analysis": [
        { id: 'ca1', latex: '\\oint_C f(z) \\, dz = 0', category: 'Complex Analysis', difficulty: 'Medium', description: "Cauchy's Integral Theorem" },
        { id: 'ca2', latex: 'f(a) = \\frac{1}{2\\pi i} \\oint_C \\frac{f(z)}{z-a} \\, dz', category: 'Complex Analysis', difficulty: 'Hard', description: "Cauchy's Integral Formula" },
        { id: 'ca3', latex: '\\text{Res}(f, c) = \\lim_{z \\to c} (z-c)f(z)', category: 'Complex Analysis', difficulty: 'Medium', description: "Residue (Simple Pole)" },
        { id: 'ca4', latex: '\\oint_C f(z) \\, dz = 2\\pi i \\sum \\text{Res}(f, a_k)', category: 'Complex Analysis', difficulty: 'Hard', description: "Residue Theorem" },
        { id: 'ca5', latex: 'z = r(\\cos \\theta + i \\sin \\theta)', category: 'Complex Analysis', difficulty: 'Easy', description: "Polar Form" },
    ],
    "Greek Alphabet": [
        { id: 'gr1', latex: '\\alpha \\beta \\gamma \\delta \\epsilon \\zeta \\eta \\theta', category: 'Greek Alphabet', difficulty: 'Easy', description: "Lowercase (1)" },
        { id: 'gr2', latex: '\\iota \\kappa \\lambda \\mu \\nu \\xi \\pi \\rho', category: 'Greek Alphabet', difficulty: 'Easy', description: "Lowercase (2)" },
        { id: 'gr3', latex: '\\sigma \\tau \\upsilon \\phi \\chi \\psi \\omega', category: 'Greek Alphabet', difficulty: 'Easy', description: "Lowercase (3)" },
        { id: 'gr4', latex: '\\Gamma \\Delta \\Theta \\Lambda \\Xi \\Pi \\Sigma \\Phi \\Psi \\Omega', category: 'Greek Alphabet', difficulty: 'Easy', description: "Uppercase" },
    ],
    "Inequalities": [
        { id: 'in1', latex: '|\\langle \\mathbf{u}, \\mathbf{v} \\rangle|^2 \\leq \\langle \\mathbf{u}, \\mathbf{u} \\rangle \\langle \\mathbf{v}, \\mathbf{v} \\rangle', category: 'Inequalities', difficulty: 'Medium', description: 'Cauchy-Schwarz' },
        { id: 'in2', latex: '\\frac{a+b}{2} \\geq \\sqrt{ab}', category: 'Inequalities', difficulty: 'Easy', description: 'AM-GM Inequality' },
        { id: 'in3', latex: '|x + y| \\leq |x| + |y|', category: 'Inequalities', difficulty: 'Easy', description: 'Triangle Inequality' },
        { id: 'in4', latex: '\\left( \\sum_{i=1}^n |x_i|^p \\right)^{1/p} \\leq \\left( \\sum_{i=1}^n |y_i|^p \\right)^{1/p}', category: 'Inequalities', difficulty: 'Hard', description: "Minkowski Inequality" },
        { id: 'in5', latex: 'e^x \\geq 1 + x', category: 'Inequalities', difficulty: 'Easy', description: "Exponential Inequality" },
    ],
    "Chemistry": [
        { id: 'ch1', latex: '\\Delta G = \\Delta H - T\\Delta S', category: 'Chemistry', difficulty: 'Medium', description: "Gibbs Free Energy" },
        { id: 'ch2', latex: 'PV = nRT', category: 'Chemistry', difficulty: 'Easy', description: "Ideal Gas Law" },
        { id: 'ch3', latex: 'pH = -\\log_{10}[H^+]', category: 'Chemistry', difficulty: 'Easy', description: "pH Definition" },
        { id: 'ch4', latex: 'K_{eq} = \\frac{[C]^c [D]^d}{[A]^a [B]^b}', category: 'Chemistry', difficulty: 'Medium', description: "Equilibrium Constant" },
        { id: 'ch5', latex: 'E = E^0 - \\frac{RT}{nF} \\ln Q', category: 'Chemistry', difficulty: 'Medium', description: "Nernst Equation" },
        { id: 'ch6', latex: '\\Delta U = q + w', category: 'Chemistry', difficulty: 'Easy', description: "First Law of Thermodynamics" },
    ]
};

export const SAMPLE_PROBLEMS = CURATED_PROBLEMS["Famous Identities"];
