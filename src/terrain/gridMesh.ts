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
 * @param wireframe - If true, creates line indices instead of triangle indices
 */
export const createGridMesh = (width: number, height: number, spacing: number = 1, wireframe: boolean = false): GridMesh => {
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
            const worldZ = (z - height / 2) * spacing;
            
            // Generate height using simple sine waves for terrain-like appearance
            const heightY = Math.sin(worldX * 0.3) * 0.5 + 
                           Math.sin(worldZ * 0.2) * 0.3 + 
                           Math.sin((worldX + worldZ) * 0.1) * 0.2;
            
            // Store in array
            vertices[vertexIndex++] = worldX;
            vertices[vertexIndex++] = heightY;
            vertices[vertexIndex++] = worldZ;
        }
    }
    
    let indices: Uint16Array;
    
    if (wireframe) {
        // Create line indices for wireframe
        // Each square needs 4 lines (horizontal and vertical grid lines)
        const horizontalLines = width * (height - 1);  // Horizontal lines
        const verticalLines = (width - 1) * height;    // Vertical lines
        const lineCount = horizontalLines + verticalLines;
        indices = new Uint16Array(lineCount * 2);       // 2 indices per line
        
        let indexOffset = 0;
        
        // Add horizontal lines
        for (let z = 0; z < height - 1; z++) {
            for (let x = 0; x < width; x++) {
                const current = z * width + x;
                const below = (z + 1) * width + x;
                indices[indexOffset++] = current;
                indices[indexOffset++] = below;
            }
        }
        
        // Add vertical lines
        for (let z = 0; z < height; z++) {
            for (let x = 0; x < width - 1; x++) {
                const current = z * width + x;
                const right = z * width + (x + 1);
                indices[indexOffset++] = current;
                indices[indexOffset++] = right;
            }
        }
    } else {
        // Calculate indices for triangles
        // Each grid square needs 2 triangles (6 indices)
        const squareCount = (width - 1) * (height - 1);
        indices = new Uint16Array(squareCount * 6);
        
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
    }
    
    return {
        vertices,
        indices,
        width,
        height
    };
};