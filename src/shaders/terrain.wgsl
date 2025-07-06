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
    
    // Scale down the grid to fit in view and use actual 3D positions
    output.clip_position = vec4<f32>(
        input.position.x * 0.2,
        input.position.y * 0.2,  // Use the height values!
        input.position.z * 0.2,  // Use Z for depth
        1.0
    );
    
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