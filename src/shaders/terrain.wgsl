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
    
    // Scale down the grid to fit in view
    // Our grid is 10x10 units, so scale by 0.2 to fit in clip space
    output.clip_position = vec4<f32>(
        input.position.x * 0.2,
        input.position.z * 0.2,  // Use Z for Y in screen space
        0.5,                     // Middle depth
        1.0
    );
    
    // Brighter colors for debugging
    // Create a gradient across the grid
    output.color = vec3<f32>(
        (input.position.x + 5.0) / 10.0,  // Red: 0 to 1 across X
        0.5,                               // Green: constant
        (input.position.z + 5.0) / 10.0   // Blue: 0 to 1 across Z
    );
    
    return output;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
    return vec4<f32>(input.color, 1.0);
}