// Main entry point for the geology simulator

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

const main = async (): Promise<void> => {
    try {
        updateInfo('Initializing WebGPU...');
        
        const { device, context } = await initWebGPU();
        
        updateInfo('WebGPU initialized successfully');
        
        const canvas = document.getElementById('canvas') as HTMLCanvasElement;
        
        // Handle canvas resizing
        resizeCanvas(canvas);
        window.addEventListener('resize', () => resizeCanvas(canvas));
        
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