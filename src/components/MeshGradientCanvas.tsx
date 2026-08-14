"use client";

/**
 * MeshGradientCanvas — Exact Pixfort AI Agency WebGL2 mesh-gradient.
 *
 * Fragment shader extracted verbatim from:
 *   wp-content/plugins/pixfort-core/dist/front/shader-vendors.a1d3a3332da59f0386e6.js
 *   (module 9198, variable `r`)
 *
 * Parameters from agency Elementor config:
 *   speed=1, color_count=4, distortion=0.6, swirl=0.25,
 *   grain_mixer=0.05, grain_overlay=0.05
 *   color1=#FFDA8D  color2=#EF8CF8  color3=#A7C6FF  color4=#7783F5
 */

import { useEffect, useRef } from "react";

// ── Exact 4 colors from agency Elementor settings ──
const COLOR1 = [0xff / 255, 0xda / 255, 0x8d / 255, 1.0]; // #FFDA8D amber
const COLOR2 = [0xef / 255, 0x8c / 255, 0xf8 / 255, 1.0]; // #EF8CF8 pink
const COLOR3 = [0xa7 / 255, 0xc6 / 255, 0xff / 255, 1.0]; // #A7C6FF sky blue
const COLOR4 = [0x77 / 255, 0x83 / 255, 0xf5 / 255, 1.0]; // #7783F5 periwinkle

const SPEED = 1.0;
const DISTORTION = 0.6;
const SWIRL = 0.25;
const GRAIN_MIXER = 0.05;
const GRAIN_OVERLAY = 0.05;
const COLOR_COUNT = 4;
const MAX_COLORS = 10; // must match shader constant `o`

// ── Vertex shader (positions a full-screen quad, passes v_objectUV) ──
const VERT_SRC = `#version 300 es
precision mediump float;
layout(location = 0) in vec4 a_position;
out vec2 v_objectUV;
void main() {
  gl_Position = a_position;
  // map clip-space [-1,1] to UV [-0.5, 0.5] (shader adds 0.5 itself)
  v_objectUV = a_position.xy * 0.5;
}
`;

// ── Fragment shader — verbatim Pixfort GLSL (module 9198) ──
const FRAG_SRC = `#version 300 es
precision mediump float;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

uniform float u_time;
uniform vec4  u_colors[${MAX_COLORS}];
uniform float u_colorsCount;
uniform float u_distortion;
uniform float u_swirl;
uniform float u_grainMixer;
uniform float u_grainOverlay;

in  vec2 v_objectUV;
out vec4 fragColor;

// ── helpers from module 1198 ──
vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

float hash21(vec2 p) {
  p = fract(p * vec2(0.3183099, 0.3678794)) + 0.1;
  p += dot(p, p + 19.19);
  return fract(p.x * p.y);
}

// ── noise ──
float valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float noise(vec2 n, vec2 seedOffset) {
  return valueNoise(n + seedOffset);
}

// ── blob positions (same formula as Pixfort) ──
vec2 getPosition(int i, float t) {
  float a = float(i) * 0.37;
  float b = 0.6 + fract(float(i) / 3.0) * 0.9;
  float c = 0.8 + fract(float(i + 1) / 4.0);
  float x = sin(t * b + a);
  float y = cos(t * c + a * 1.5);
  return 0.5 + 0.5 * vec2(x, y);
}

void main() {
  vec2 uv = v_objectUV;
  uv += 0.5;               // shift to [0,1]
  vec2 grainUV = uv * 1000.0;

  float grain = noise(grainUV, vec2(0.0));
  float mixerGrain = 0.4 * u_grainMixer * (grain - 0.5);

  const float firstFrameOffset = 41.5;
  float t = 0.5 * (u_time + firstFrameOffset);

  // ── UV distortion ──
  float radius = smoothstep(0.0, 1.0, length(uv - 0.5));
  float center = 1.0 - radius;
  for (float i = 1.0; i <= 2.0; i++) {
    uv.x += u_distortion * center / i
              * sin(t + i * 0.4 * smoothstep(0.0, 1.0, uv.y))
              * cos(0.2 * t + i * 2.4 * smoothstep(0.0, 1.0, uv.y));
    uv.y += u_distortion * center / i
              * cos(t + i * 2.0 * smoothstep(0.0, 1.0, uv.x));
  }

  // ── swirl ──
  vec2 uvRotated = uv - vec2(0.5);
  float angle = 3.0 * u_swirl * radius;
  uvRotated = rotate(uvRotated, -angle);
  uvRotated += vec2(0.5);

  // ── inverse-distance weighting (IDW) colour mixing ──
  vec3 color = vec3(0.0);
  float opacity = 0.0;
  float totalWeight = 0.0;

  for (int i = 0; i < ${MAX_COLORS}; i++) {
    if (i >= int(u_colorsCount)) break;
    vec2  pos           = getPosition(i, t) + mixerGrain;
    vec3  colorFraction = u_colors[i].rgb * u_colors[i].a;
    float opacityFraction = u_colors[i].a;
    float dist   = length(uvRotated - pos);
    dist         = pow(dist, 3.5);
    float weight = 1.0 / (dist + 1e-3);
    color       += colorFraction * weight;
    opacity     += opacityFraction * weight;
    totalWeight += weight;
  }

  color   /= max(1e-4, totalWeight);
  opacity /= max(1e-4, totalWeight);

  // ── grain overlay ──
  float grainOverlay = valueNoise(rotate(grainUV, 1.0) + vec2(3.0));
  grainOverlay = mix(grainOverlay, valueNoise(rotate(grainUV, 2.0) + vec2(-1.0)), 0.5);
  grainOverlay = pow(grainOverlay, 1.3);
  float grainOverlayV = grainOverlay * 2.0 - 1.0;
  vec3  grainOverlayColor = vec3(step(0.0, grainOverlayV));
  float grainOverlayStrength = u_grainOverlay * abs(grainOverlayV);
  grainOverlayStrength = pow(grainOverlayStrength, 0.8);
  color = mix(color, grainOverlayColor, 0.35 * grainOverlayStrength);
  opacity += 0.5 * grainOverlayStrength;
  opacity = clamp(opacity, 0.0, 1.0);

  fragColor = vec4(color, opacity);
}
`;

function compileShader(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader | null {
    const s = gl.createShader(type);
    if (!s) return null;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
    }
    return s;
}

function createProgram(gl: WebGL2RenderingContext, vert: string, frag: string): WebGLProgram | null {
    const vs = compileShader(gl, gl.VERTEX_SHADER, vert);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, frag);
    if (!vs || !fs) return null;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error("Program link error:", gl.getProgramInfoLog(prog));
        return null;
    }
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return prog;
}

export default function MeshGradientCanvas() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Request WebGL2
        const gl = canvas.getContext("webgl2", { antialias: false, alpha: true });
        if (!gl) {
            console.warn("WebGL2 not supported, mesh gradient disabled.");
            return;
        }

        const prog = createProgram(gl, VERT_SRC, FRAG_SRC);
        if (!prog) return;

        // Full-screen quad
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1, 1, -1, -1, 1,
            -1, 1, 1, -1, 1, 1,
        ]), gl.STATIC_DRAW);
        const posLoc = gl.getAttribLocation(prog, "a_position");
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        // Uniform locations
        gl.useProgram(prog);
        const uTime = gl.getUniformLocation(prog, "u_time");
        const uColors = gl.getUniformLocation(prog, "u_colors");
        const uColorsCount = gl.getUniformLocation(prog, "u_colorsCount");
        const uDistortion = gl.getUniformLocation(prog, "u_distortion");
        const uSwirl = gl.getUniformLocation(prog, "u_swirl");
        const uGrainMixer = gl.getUniformLocation(prog, "u_grainMixer");
        const uGrainOverlay = gl.getUniformLocation(prog, "u_grainOverlay");

        // Upload static uniforms
        // Flatten the 4 colors into a Float32Array of length MAX_COLORS*4 (pad with zeros)
        const colorsFlat = new Float32Array(MAX_COLORS * 4);
        const palette = [COLOR1, COLOR2, COLOR3, COLOR4];
        palette.forEach((c, i) => {
            colorsFlat[i * 4 + 0] = c[0];
            colorsFlat[i * 4 + 1] = c[1];
            colorsFlat[i * 4 + 2] = c[2];
            colorsFlat[i * 4 + 3] = c[3];
        });
        gl.uniform4fv(uColors, colorsFlat);
        gl.uniform1f(uColorsCount, COLOR_COUNT);
        gl.uniform1f(uDistortion, DISTORTION);
        gl.uniform1f(uSwirl, SWIRL);
        gl.uniform1f(uGrainMixer, GRAIN_MIXER);
        gl.uniform1f(uGrainOverlay, GRAIN_OVERLAY);

        // Resize canvas to parent size
        const resize = () => {
            const p = canvas.parentElement;
            if (p) {
                const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
                canvas.width = Math.round(p.clientWidth * dpr);
                canvas.height = Math.round(p.clientHeight * dpr);
                gl.viewport(0, 0, canvas.width, canvas.height);
            }
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(canvas.parentElement!);

        // RAF loop — t in seconds-ish, matches Pixfort's `currentFrame += dt * speed`
        let rafId: number;
        let lastTime: number | null = null;
        let currentFrame = 1200; // skip to frame 1200ms like Pixfort (avoids flash of wrong colors)

        const draw = (now: number) => {
            if (lastTime === null) lastTime = now;
            const dt = now - lastTime;
            lastTime = now;
            currentFrame += dt * SPEED;

            gl.useProgram(prog);
            gl.uniform1f(uTime, currentFrame * 0.001);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            rafId = requestAnimationFrame(draw);
        };
        rafId = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(rafId);
            ro.disconnect();
            gl.deleteProgram(prog);
            gl.deleteBuffer(buf);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="absolute inset-0 w-full h-full"
            style={{ zIndex: 0, display: "block" }}
        />
    );
}
