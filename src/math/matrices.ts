// Matrix utilities for 3D transformations

/**
 * Creates a perspective projection matrix
 * @param fovY - Field of view in radians
 * @param aspect - Aspect ratio (width/height)
 * @param near - Near clipping plane
 * @param far - Far clipping plane
 */
export const createPerspectiveMatrix = (fovY: number, aspect: number, near: number, far: number): Float32Array => {
    const f = 1.0 / Math.tan(fovY / 2);
    const nf = 1 / (near - far);
    
    return new Float32Array([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) * nf, -1,
        0, 0, 2 * far * near * nf, 0
    ]);
};

/**
 * Creates a view matrix for looking at a target
 * @param eye - Camera position
 * @param target - Point to look at
 * @param up - Up vector
 */
export const createLookAtMatrix = (
    eye: [number, number, number],
    target: [number, number, number], 
    up: [number, number, number]
): Float32Array => {
    // Calculate camera coordinate system
    const zAxis = normalize(subtract(eye, target));  // Forward (points away from target)
    const xAxis = normalize(cross(up, zAxis));       // Right
    const yAxis = cross(zAxis, xAxis);               // Up
    
    return new Float32Array([
        xAxis[0], yAxis[0], zAxis[0], 0,
        xAxis[1], yAxis[1], zAxis[1], 0,
        xAxis[2], yAxis[2], zAxis[2], 0,
        -dot(xAxis, eye), -dot(yAxis, eye), -dot(zAxis, eye), 1
    ]);
};

// Vector math utilities
const subtract = (a: [number, number, number], b: [number, number, number]): [number, number, number] => [
    a[0] - b[0],
    a[1] - b[1], 
    a[2] - b[2]
];

const cross = (a: [number, number, number], b: [number, number, number]): [number, number, number] => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
];

const dot = (a: [number, number, number], b: [number, number, number]): number => 
    a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

const normalize = (v: [number, number, number]): [number, number, number] => {
    const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    return [v[0] / length, v[1] / length, v[2] / length];
};