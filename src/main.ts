// Main entry point for the geology simulator

import { loadShader } from './shaderLoader.js';
import { createGridMesh } from './terrain/gridMesh.js';

const initWebGPU = async (): Promise<{
    device: GPUDevice;
    context: GPUCanvasContext;
    format: GPUTextureFormat;
}> => {
    if (!navigator.gpu) {
        throw new Error('WebGPU not supported in this browser');
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        throw new Error('No WebGPU adapter available');
    }

    const device = await adapter.requestDevice();
    
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const context = canvas.getContext('webgpu');
    if (!context) {
        throw new Error('Could not get WebGPU context');
    }

    const format = navigator.gpu.getPreferredCanvasFormat();
    
    context.configure({
        device,
        format,
        alphaMode: 'premultiplied',
    });

    return { device, context, format };
};

const updateInfo = (message: string): void => {
    const info = document.getElementById('info');
    if (info) {
        info.textContent = message;
    }
};

const handleError = (error: Error): void => {
    console.error('WebGPU Error:', error);
    updateInfo(`Error: ${error.message}`);
    const info = document.getElementById('info');
    if (info) {
        info.className = 'error';
    }
};

const resizeCanvas = (canvas: HTMLCanvasElement): void => {
    const width = canvas.clientWidth * devicePixelRatio;
    const height = canvas.clientHeight * devicePixelRatio;
    
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
    }
};

type TerrainBuffers = {
    vertexBuffer: GPUBuffer;
    normalBuffer: GPUBuffer;
    indexBuffer: GPUBuffer;
    indexCount: number;
};

type CameraUniforms = {
    uniformBuffer: GPUBuffer;
    bindGroup: GPUBindGroup;
};

/**
 * Creates GPU buffers for terrain rendering
 * This function takes our CPU-side mesh data and uploads it to the GPU
 */
const createTerrainBuffers = (device: GPUDevice): TerrainBuffers => {
    // Create a 20x20 grid with larger spacing for better visibility
    const mesh = createGridMesh(20, 20, 0.8, false);
    
    // Create vertex buffer
    // Usage flags tell WebGPU how we'll use this buffer
    const vertexBuffer = device.createBuffer({
        label: 'Terrain Vertex Buffer',
        size: mesh.vertices.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    
    // Upload vertex data to GPU
    device.queue.writeBuffer(vertexBuffer, 0, mesh.vertices);
    
    // Create normal buffer
    const normalBuffer = device.createBuffer({
        label: 'Terrain Normal Buffer',
        size: mesh.normals.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    
    // Upload normal data to GPU
    device.queue.writeBuffer(normalBuffer, 0, mesh.normals);
    
    // Create index buffer
    const indexBuffer = device.createBuffer({
        label: 'Terrain Index Buffer',
        size: mesh.indices.byteLength,
        usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    });
    
    // Upload index data to GPU
    device.queue.writeBuffer(indexBuffer, 0, mesh.indices);
    
    return {
        vertexBuffer,
        normalBuffer,
        indexBuffer,
        indexCount: mesh.indices.length,
    };
};

/**
 * Creates camera uniform buffer and bind group
 */
const createCameraUniforms = (device: GPUDevice, pipeline: GPURenderPipeline, canvas: HTMLCanvasElement): CameraUniforms => {
    // Create uniform buffer (4x4 matrix = 16 floats = 64 bytes)
    const uniformBuffer = device.createBuffer({
        label: 'Camera Uniforms',
        size: 64, // 16 floats * 4 bytes each
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    
    // Debug: Let's start with a simple transformation and build up
    console.log('Canvas size:', canvas.width, canvas.height);
    console.log('Creating camera uniforms...');
    
    // Better isometric view with larger terrain
    const scale = 0.2;  // Make terrain even bigger for better visibility
    const cos45 = Math.cos(Math.PI / 4);  // 45 degrees
    const sin45 = Math.sin(Math.PI / 4);
    const cos30 = Math.cos(Math.PI / 6);  // 30 degrees  
    const sin30 = Math.sin(Math.PI / 6);
    
    const viewProjMatrix = new Float32Array([
        scale * cos45,   0,              scale * sin45,    0,     // X rotation around Y
        -scale * sin30 * sin45, scale * cos30,   scale * sin30 * cos45,  0,  // Y tilted down  
        0,               0,              0.001,            0,     // Z (minimal for depth)
        0,               0,              0,                1      // W
    ]);
    
    console.log('Matrix created:', viewProjMatrix);
    
    // Upload to GPU
    device.queue.writeBuffer(uniformBuffer, 0, viewProjMatrix);
    
    // Create bind group
    const bindGroup = device.createBindGroup({
        label: 'Camera Bind Group',
        layout: pipeline.getBindGroupLayout(0),
        entries: [{
            binding: 0,
            resource: { buffer: uniformBuffer },
        }],
    });
    
    return { uniformBuffer, bindGroup };
};


const createRenderPipeline = async (device: GPUDevice, format: GPUTextureFormat): Promise<GPURenderPipeline> => {
    const shaderCode = await loadShader('./src/shaders/terrain.wgsl');
    
    const shaderModule = device.createShaderModule({
        label: 'Terrain shader',
        code: shaderCode,
    });
    
    // Define vertex buffer layouts
    const vertexBufferLayout: GPUVertexBufferLayout = {
        arrayStride: 3 * 4, // 3 floats (x,y,z) × 4 bytes per float
        attributes: [{
            shaderLocation: 0,  // @location(0) position
            offset: 0,
            format: 'float32x3',
        }],
    };
    
    const normalBufferLayout: GPUVertexBufferLayout = {
        arrayStride: 3 * 4, // 3 floats (nx,ny,nz) × 4 bytes per float
        attributes: [{
            shaderLocation: 1,  // @location(1) normal
            offset: 0,
            format: 'float32x3',
        }],
    };
    
    const pipeline = device.createRenderPipeline({
        label: 'Terrain render pipeline',
        layout: 'auto',
        vertex: {
            module: shaderModule,
            entryPoint: 'vs_main',
            buffers: [vertexBufferLayout, normalBufferLayout], // Both vertex and normal buffers
        },
        fragment: {
            module: shaderModule,
            entryPoint: 'fs_main',
            targets: [{
                format,
            }],
        },
        primitive: {
            topology: 'triangle-list',  // Back to solid triangles
            cullMode: 'none',           // Show both sides of triangles
        },
    });
    
    return pipeline;
};

const main = async (): Promise<void> => {
    try {
        updateInfo('Initializing WebGPU...');
        
        const { device, context, format } = await initWebGPU();
        
        updateInfo('WebGPU initialized successfully');
        
        const canvas = document.getElementById('canvas') as HTMLCanvasElement;
        
        // Handle canvas resizing
        resizeCanvas(canvas);
        window.addEventListener('resize', () => resizeCanvas(canvas));
        
        // Create render pipeline
        const pipeline = await createRenderPipeline(device, format);
        
        // Create terrain buffers
        const terrain = createTerrainBuffers(device);
        
        // Create camera uniforms
        const camera = createCameraUniforms(device, pipeline, canvas);
        
        // Simple render loop for now
        const render = (): void => {
            const commandEncoder = device.createCommandEncoder();
            const textureView = context.getCurrentTexture().createView();
            
            const renderPassDescriptor: GPURenderPassDescriptor = {
                colorAttachments: [{
                    view: textureView,
                    clearValue: { r: 0.1, g: 0.1, b: 0.15, a: 1.0 },
                    loadOp: 'clear',
                    storeOp: 'store',
                }],
            };
            
            const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
            passEncoder.setPipeline(pipeline);
            
            // Bind uniform buffer (camera matrices)
            passEncoder.setBindGroup(0, camera.bindGroup);
            
            // Bind vertex and normal buffers
            passEncoder.setVertexBuffer(0, terrain.vertexBuffer);   // @location(0)
            passEncoder.setVertexBuffer(1, terrain.normalBuffer);   // @location(1)
            
            // Bind index buffer
            passEncoder.setIndexBuffer(terrain.indexBuffer, 'uint16');
            
            // Draw indexed geometry
            passEncoder.drawIndexed(terrain.indexCount);
            
            passEncoder.end();
            
            device.queue.submit([commandEncoder.finish()]);
            
            requestAnimationFrame(render);
        };
        
        render();
        
    } catch (error) {
        handleError(error as Error);
    }
};

// Start the application
main();