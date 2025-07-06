struct Uniforms {
    view_proj_matrix: mat4x4<f32>,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

//============================================================================
// PERLIN NOISE IMPLEMENTATION
//============================================================================

// Step 1: Hash function - generates pseudo-random gradients from grid coordinates
// This replaces a lookup table and ensures consistent gradients for each grid point
fn hash2(p: vec2<f32>) -> vec2<f32> {
    // Magic numbers chosen to create good distribution
    let k = vec2<f32>(0.3183099, 0.3678794);
    let x = dot(p, k) + k.y;
    return -1.0 + 2.0 * fract(16.0 * k * fract(x * x));
}

// Step 2: Smoothstep function - creates the S-curve that eliminates grid artifacts
// Formula: 3t² - 2t³ (has zero derivative at t=0 and t=1)
fn smoothstep_custom(t: f32) -> f32 {
    return t * t * (3.0 - 2.0 * t);
}

// Step 3: Linear interpolation - blends two values smoothly
fn lerp(a: f32, b: f32, t: f32) -> f32 {
    return a + t * (b - a);
}

// Step 4: The main Perlin noise function - this is where the magic happens!
fn perlin_noise(p: vec2<f32>) -> f32 {
    // Find which grid cell we're in
    let i = floor(p);          // Grid cell coordinates (integers)
    let f = fract(p);          // Local position within cell (0 to 1)
    
    // Get gradients for all 4 corners of the grid cell
    let g00 = hash2(i + vec2<f32>(0.0, 0.0));  // Bottom-left corner
    let g10 = hash2(i + vec2<f32>(1.0, 0.0));  // Bottom-right corner  
    let g01 = hash2(i + vec2<f32>(0.0, 1.0));  // Top-left corner
    let g11 = hash2(i + vec2<f32>(1.0, 1.0));  // Top-right corner
    
    // Calculate displacement vectors from each corner to our sample point
    let d00 = f - vec2<f32>(0.0, 0.0);         // Vector to bottom-left
    let d10 = f - vec2<f32>(1.0, 0.0);         // Vector to bottom-right
    let d01 = f - vec2<f32>(0.0, 1.0);         // Vector to top-left  
    let d11 = f - vec2<f32>(1.0, 1.0);         // Vector to top-right
    
    // Compute dot products (how much gradient agrees with displacement)
    let n00 = dot(g00, d00);  // Bottom-left influence
    let n10 = dot(g10, d10);  // Bottom-right influence
    let n01 = dot(g01, d01);  // Top-left influence
    let n11 = dot(g11, d11);  // Top-right influence
    
    // Apply smoothstep to local coordinates (eliminates grid artifacts)
    let u = smoothstep_custom(f.x);  // Smooth X interpolation parameter
    let v = smoothstep_custom(f.y);  // Smooth Y interpolation parameter
    
    // Interpolate horizontally (blend left and right sides)
    let bottom = lerp(n00, n10, u);  // Interpolate bottom edge
    let top = lerp(n01, n11, u);     // Interpolate top edge
    
    // Interpolate vertically (final result)
    return lerp(bottom, top, v);
}

struct VertexInput {
    @location(0) position: vec3<f32>,
    @location(1) normal: vec3<f32>,
}

struct VertexOutput {
    @builtin(position) clip_position: vec4<f32>,
    @location(0) color: vec3<f32>,
}

// Step 5: Fractal noise function - layers multiple octaves for realistic terrain
fn fractal_noise(pos: vec2<f32>, octaves: i32) -> f32 {
    var value = 0.0;          // Accumulated noise value
    var amplitude = 1.0;      // Current octave amplitude
    var frequency = 1.0;      // Current octave frequency
    var max_value = 0.0;      // Track maximum possible value for normalization
    
    // Parameters for fractal generation
    let lacunarity = 2.0;     // How much frequency increases each octave
    let persistence = 0.5;    // How much amplitude decreases each octave
    
    // Layer multiple octaves of noise
    for (var i = 0; i < octaves; i++) {
        // Add this octave's contribution
        value += perlin_noise(pos * frequency) * amplitude;
        
        // Track maximum possible value (for normalization)
        max_value += amplitude;
        
        // Prepare for next octave
        amplitude *= persistence;  // Reduce amplitude (less influence)
        frequency *= lacunarity;   // Increase frequency (more detail)
    }
    
    // Normalize to keep values in reasonable range
    return value / max_value;
}

// Step 6: Calculate terrain height using fractal noise
fn get_terrain_height(pos: vec2<f32>) -> f32 {
    // Terrain parameters - adjust these to change terrain character
    let noise_scale = 1.0;  // Larger = more zoomed out terrain features  
    let height_scale = 1.5; // Larger = more dramatic height differences
    let octave_count = 5;   // Number of detail layers (more = more detail, max ~6)
    
    // Sample fractal noise and scale it
    let noise_value = fractal_noise(pos * noise_scale, octave_count);
    return noise_value * height_scale;
}

// Step 6: Calculate surface normal by sampling neighboring heights
fn calculate_terrain_normal(pos: vec2<f32>) -> vec3<f32> {
    let offset = 0.1;  // Distance to sample neighbors
    
    // Sample heights at neighboring points (finite difference method)
    let height_center = get_terrain_height(pos);
    let height_right = get_terrain_height(pos + vec2<f32>(offset, 0.0));
    let height_up = get_terrain_height(pos + vec2<f32>(0.0, offset));
    
    // Calculate gradients (how steep the terrain is)
    let dx = height_right - height_center;  // Change in X direction
    let dz = height_up - height_center;     // Change in Z direction
    
    // Create tangent vectors
    let tangent_x = vec3<f32>(offset, dx, 0.0);     // Vector along X axis
    let tangent_z = vec3<f32>(0.0, dz, offset);     // Vector along Z axis
    
    // Cross product gives us the surface normal
    let normal = cross(tangent_x, tangent_z);
    return normalize(normal);
}

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    
    // Calculate terrain height at this vertex position
    let terrain_height = get_terrain_height(vec2<f32>(input.position.x, input.position.z));
    
    // Create new position with calculated height
    let world_position = vec3<f32>(
        input.position.x,
        terrain_height,      // Replace flat Y=0 with calculated height
        input.position.z
    );
    
    // Calculate surface normal from terrain
    let terrain_normal = calculate_terrain_normal(vec2<f32>(input.position.x, input.position.z));
    
    // Transform position using view-projection matrix
    output.clip_position = uniforms.view_proj_matrix * vec4<f32>(world_position, 1.0);
    
    // Simple directional lighting using calculated normal
    let light_direction = normalize(vec3<f32>(0.5, 1.0, 0.3));  // Light from above-right
    let diffuse = max(dot(terrain_normal, light_direction), 0.0);
    
    // Base color based on height (elevation)
    let height_normalized = (terrain_height + 1.0) / 2.0;
    let base_color = vec3<f32>(
        height_normalized,              // Red increases with height
        0.3 + height_normalized * 0.4,  // Green: moderate level
        1.0 - height_normalized         // Blue decreases with height
    );
    
    // Apply lighting
    let ambient = 0.3;  // Ambient light
    output.color = base_color * (ambient + diffuse * 0.7);
    
    return output;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
    return vec4<f32>(input.color, 1.0);
}