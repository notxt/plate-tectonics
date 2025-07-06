# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a plate tectonics simulation project for world building purposes, using WebGPU for rendering and computation. The project is currently in its initial stage with no implementation yet.

## Project Goals

- Simulate plate tectonics for world-building applications
- Learn and practice WebGPU technology
- Create visualizations of geological processes

## Current Status

**Phase 2 Complete**: 3D Terrain Foundation with Lighting
- ✅ WebGPU initialization and rendering pipeline
- ✅ Grid mesh generation with vertex and index buffers  
- ✅ GPU-based Perlin noise terrain generation
- ✅ Real-time normal calculation and directional lighting
- ✅ Isometric 3D camera with proper view matrices
- ✅ Height-based terrain coloring with smooth gradients

**Currently Working On**: Phase 3 - Procedural Terrain Generation
- 🔄 Multiple octaves for realistic terrain detail
- ⏳ Advanced noise parameters and controls
- ⏳ Erosion simulation and geological processes

## Project Structure

- `src/` - TypeScript source files
- `dist/` - Compiled JavaScript output (gitignored)
- `bin/` - Development scripts
- `log/` - Process logs (gitignored)
- `debug/` - Debug files and screenshots (gitignored)
- `server.js` - Simple Node.js static file server with WebGPU headers
- `index.html` - Main entry point

## Tech Stack

- **TypeScript** with strictest settings
- **WebGPU** for rendering and compute
- **Node.js** for development server
- **Playwright** for browser testing/screenshots
- No runtime dependencies, only devDependencies

## Development Principles

- **Functional Programming**: Use pure functions, immutability, and functional composition
- **TypeScript Strict Mode**: Enable all strict compiler options in tsconfig.json
- **Zero Dependencies**: Use only web standards and built-in browser APIs
- **No Frameworks**: Direct WebGPU API usage, no Three.js or other abstractions
- **Minimal Code**: Keep code concise and readable, avoid over-engineering
- **Simplicity First**: Choose simple, clear solutions over complex abstractions
- **Type Aliases over Interfaces**: Use `type` instead of `interface` for type definitions

## Preferred Development Style

This project benefits from a **step-by-step, educational approach** that treats development like writing a textbook:

### Communication Style
- **Explain the "why"** before the "how" - cover mathematical concepts and theory first
- **Break complex topics into digestible steps** - implement piece by piece with frequent pauses
- **Use teaching language** - "Let me show you...", "Notice how...", "The key insight is..."
- **Provide context** - explain how each piece fits into the bigger picture
- **Ask for confirmation** - "Are you ready for the next step?", "Does this make sense?"

### Implementation Approach
- **Theory first, then code** - explain mathematical foundations before implementation
- **Build incrementally** - add one function at a time with full explanations
- **Show intermediate results** - take screenshots to see progress at each stage
- **Use detailed comments** - explain not just what, but why each piece works
- **Pause frequently** - allow time to understand each concept before moving on

### Code Documentation
- **Comment the math** - explain formulas and their significance
- **Label algorithm steps** - "Step 1:", "Step 2:" etc. in comments
- **Explain complex functions** - break down what each parameter does
- **Connect to theory** - reference the mathematical concepts in code comments

This educational style helps build deep understanding of complex topics like graphics programming, WebGPU, and mathematical simulations.

## Development Notes

Since this project involves WebGPU:
- Ensure browser compatibility checks are in place
- WebGPU shader files (`.wgsl` - WebGPU Shading Language) will need special handling in the build process
- Use native WebGPU API directly without framework abstractions

## Development Commands

All commands are in the `bin/` directory:
- `./bin/start` - Start all development processes (TypeScript watch + server)
- `./bin/stop` - Stop all background processes
- `./bin/build` - Build TypeScript files once
- `./bin/dev` - Start TypeScript watch mode (runs in background)
- `./bin/serve` - Start the development server (runs in background)
- `./bin/logs [server|tsc]` - Tail logs for specific process
- `./bin/screenshot` - Take a screenshot of the running application

Logs are written to:
- `log/server.log` - Server output
- `log/tsc.log` - TypeScript compiler output