// Load shader files from the server

export const loadShader = async (path: string): Promise<string> => {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Failed to load shader: ${path}`);
    }
    return response.text();
};