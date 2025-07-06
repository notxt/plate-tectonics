import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

const takeScreenshot = async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Navigate to the local server
    await page.goto('http://localhost:8080');
    
    // Wait for WebGPU to initialize
    await page.waitForTimeout(1000);
    
    // Take screenshot
    const screenshot = await page.screenshot({ fullPage: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `debug/screenshot-${timestamp}.png`;
    
    await writeFile(filename, screenshot);
    console.log(`Screenshot saved as ${filename}`);
    
    await browser.close();
};

takeScreenshot().catch(console.error);