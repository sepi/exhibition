export function dist(a, b) {
    if (!a[0] || !a[1] || !b[0] || !b[1]) {
	return 0;
    }
    const dx = a[0]-b[0];
    const dy = a[1]-b[1];
    return Math.sqrt(dx*dx + dy*dy);
}
