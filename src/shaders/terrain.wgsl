struct Uniforms {
    view_proj_matrix: mat4x4<f32>,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

struct VertexInput {
    @location(0) position: vec3<f32>,
    @location(1) normal: vec3<f32>,
}

struct VertexOutput {
    @builtin(position) clip_position: vec4<f32>,
    @location(0) color: vec3<f32>,
}

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    
    // Transform position using view-projection matrix
    output.clip_position = uniforms.view_proj_matrix * vec4<f32>(input.position, 1.0);
    
    // Simple directional lighting
    let light_direction = normalize(vec3<f32>(0.5, 1.0, 0.3));  // Light from above-right
    let diffuse = max(dot(input.normal, light_direction), 0.0);
    
    // Base color based on height (elevation)
    let height_normalized = (input.position.y + 1.0) / 2.0;
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