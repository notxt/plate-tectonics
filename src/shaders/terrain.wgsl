struct Uniforms {
    view_proj_matrix: mat4x4<f32>,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

struct VertexInput {
    @location(0) position: vec3<f32>,
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
    
    // Color based on height (elevation)
    // Higher terrain = more red/white, lower = more blue/green
    let height_normalized = (input.position.y + 1.0) / 2.0;  // Normalize height to 0-1
    output.color = vec3<f32>(
        height_normalized,              // Red increases with height
        0.3 + height_normalized * 0.4,  // Green: moderate level
        1.0 - height_normalized         // Blue decreases with height
    );
    
    return output;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
    return vec4<f32>(input.color, 1.0);
}