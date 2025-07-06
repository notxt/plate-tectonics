// Grid mesh generation for terrain

export type GridMesh = {
    vertices: Float32Array;  // Vertex positions (x, y, z)
    normals: Float32Array;   // Vertex normals (nx, ny, nz) 
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
    
    // Calculate normals
    const normals = calculateNormals(vertices, indices, vertexCount);
    
    return {
        vertices,
        normals,
        indices,
        width,
        height
    };
};

/**
 * Calculate vertex normals from triangle data
 */
const calculateNormals = (vertices: Float32Array, indices: Uint16Array, vertexCount: number): Float32Array => {
    const normals = new Float32Array(vertexCount * 3);
    
    // Initialize all normals to zero
    normals.fill(0);
    
    // For each triangle, calculate face normal and add to vertex normals
    for (let i = 0; i < indices.length; i += 3) {
        const i0 = indices[i + 0]!;
        const i1 = indices[i + 1]!;
        const i2 = indices[i + 2]!;
        
        // Get vertex positions
        const v0 = [vertices[i0 * 3]!, vertices[i0 * 3 + 1]!, vertices[i0 * 3 + 2]!];
        const v1 = [vertices[i1 * 3]!, vertices[i1 * 3 + 1]!, vertices[i1 * 3 + 2]!];
        const v2 = [vertices[i2 * 3]!, vertices[i2 * 3 + 1]!, vertices[i2 * 3 + 2]!];
        
        // Calculate triangle edges
        const edge1 = [v1[0]! - v0[0]!, v1[1]! - v0[1]!, v1[2]! - v0[2]!];
        const edge2 = [v2[0]! - v0[0]!, v2[1]! - v0[1]!, v2[2]! - v0[2]!];
        
        // Calculate face normal using cross product
        const normal = [
            edge1[1]! * edge2[2]! - edge1[2]! * edge2[1]!,
            edge1[2]! * edge2[0]! - edge1[0]! * edge2[2]!,
            edge1[0]! * edge2[1]! - edge1[1]! * edge2[0]!
        ];
        
        // Add face normal to each vertex of the triangle
        for (const vertexIndex of [i0, i1, i2]) {
            normals[vertexIndex * 3 + 0]! += normal[0]!;
            normals[vertexIndex * 3 + 1]! += normal[1]!;
            normals[vertexIndex * 3 + 2]! += normal[2]!;
        }
    }
    
    // Normalize all vertex normals
    for (let i = 0; i < vertexCount; i++) {
        const x = normals[i * 3 + 0]!;
        const y = normals[i * 3 + 1]!;
        const z = normals[i * 3 + 2]!;
        const length = Math.sqrt(x * x + y * y + z * z);
        
        if (length > 0) {
            normals[i * 3 + 0] = x / length;
            normals[i * 3 + 1] = y / length;
            normals[i * 3 + 2] = z / length;
        }
    }
    
    return normals;
};