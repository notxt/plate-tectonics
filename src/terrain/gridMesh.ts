// Grid mesh generation for terrain

export type GridMesh = {
    vertices: Float32Array;  // Vertex positions (x, y, z)
    indices: Uint16Array;    // Triangle indices
    width: number;          // Grid width (number of vertices)
    height: number;         // Grid height (number of vertices)
};

/**
 * Creates a flat grid mesh in the XZ plane
 * @param width - Number of vertices along X axis
 * @param height - Number of vertices along Z axis
 * @param spacing - Distance between vertices
 */
export const createGridMesh = (width: number, height: number, spacing: number = 1): GridMesh => {
    // Calculate total number of vertices
    const vertexCount = width * height;
    
    // Each vertex has 3 components (x, y, z)
    const vertices = new Float32Array(vertexCount * 3);
    
    // Generate vertex positions
    let vertexIndex = 0;
    for (let z = 0; z < height; z++) {
        for (let x = 0; x < width; x++) {
            // Calculate world position
            const worldX = (x - width / 2) * spacing;
            const worldY = 0; // Flat for now
            const worldZ = (z - height / 2) * spacing;
            
            // Store in array
            vertices[vertexIndex++] = worldX;
            vertices[vertexIndex++] = worldY;
            vertices[vertexIndex++] = worldZ;
        }
    }
    
    // Calculate indices for triangles
    // Each grid square needs 2 triangles (6 indices)
    const squareCount = (width - 1) * (height - 1);
    const indices = new Uint16Array(squareCount * 6);
    
    let indexOffset = 0;
    for (let z = 0; z < height - 1; z++) {
        for (let x = 0; x < width - 1; x++) {
            // Calculate vertex indices for this square
            const topLeft = z * width + x;
            const topRight = topLeft + 1;
            const bottomLeft = (z + 1) * width + x;
            const bottomRight = bottomLeft + 1;
            
            // First triangle (top-left, bottom-left, top-right)
            indices[indexOffset++] = topLeft;
            indices[indexOffset++] = bottomLeft;
            indices[indexOffset++] = topRight;
            
            // Second triangle (top-right, bottom-left, bottom-right)
            indices[indexOffset++] = topRight;
            indices[indexOffset++] = bottomLeft;
            indices[indexOffset++] = bottomRight;
        }
    }
    
    return {
        vertices,
        indices,
        width,
        height
    };
};