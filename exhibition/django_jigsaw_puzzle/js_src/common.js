export function dist(a, b) {
    if (!a[0] || !a[1] || !b[0] || !b[1]) {
	return 0;
    }
    const dx = a[0]-b[0];
    const dy = a[1]-b[1];
    return Math.sqrt(dx*dx + dy*dy);
}

export function getCSRFToken() {
    const csrfInput = document.querySelector('input[name="csrfmiddlewaretoken"]');

    if (csrfInput) {
        return csrfInput.value;
    } else {
        return null;
    }
}

export function SRGBtoLinear(srgbColor) {
    const rgb = [srgbColor[0], srgbColor[1], srgbColor[2]];
    const linearRGB = [];
    for (const c of rgb) {
	if (c < 0.04045) {
	    linearRGB.push(c / 12.92);
	} else {
	    linearRGB.push(Math.pow((c + 0.055) / 1.055, 2.4));
	}
    }
    return linearRGB;
}

export function linearToSRGB(linearColor) {
    const rgb = [linearColor[0], linearColor[1], linearColor[2]];
    const SRGB = [];
    for (const c of rgb) {
	if (c < .0031308) {
	    SRGB.push(c * 12.92);
	} else {
	    SRGB.push(1.055 * Math.pow(c, 1.0/2.4) - 0.055);
	}
    }
    return SRGB;
}
