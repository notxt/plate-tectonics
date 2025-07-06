# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a plate tectonics simulation project for world building purposes, using WebGPU for rendering and computation. The project is currently in its initial stage with no implementation yet.

## Project Goals

- Simulate plate tectonics for world-building applications
- Learn and practice WebGPU technology
- Create visualizations of geological processes

## Current Status

The project has basic WebGPU initialization and rendering setup complete. The TypeScript build system is configured with strict mode. Currently renders a blue background using WebGPU.

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