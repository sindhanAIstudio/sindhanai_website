"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, MagnifyingGlassPlus, MagnifyingGlassMinus, ArrowsClockwise, Check, Image as ImageIcon } from "@phosphor-icons/react";

interface ImageCropperModalProps {
    isOpen: boolean;
    imageSrc: string | null;
    onClose: () => void;
    onCropComplete: (croppedFile: File, croppedDataUrl: string) => void;
}

export default function ImageCropperModal({
    isOpen,
    imageSrc,
    onClose,
    onCropComplete,
}: ImageCropperModalProps) {
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Reset crop controls when a new image is loaded
    useEffect(() => {
        if (!imageSrc || !isOpen) return;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageSrc;
        img.onload = () => {
            setImageObj(img);
            setZoom(1);
            setRotation(0);
            setOffset({ x: 0, y: 0 });
        };
    }, [imageSrc, isOpen]);

    // Render interactive crop canvas
    const drawCanvas = useCallback(() => {
        if (!canvasRef.current || !imageObj) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const size = canvas.width; // e.g. 400px
        ctx.clearRect(0, 0, size, size);

        ctx.save();

        // Move to center of canvas
        ctx.translate(size / 2 + offset.x, size / 2 + offset.y);

        // Apply rotation & scale
        ctx.rotate((rotation * Math.PI) / 180);

        // Calculate aspect fill scale ratio
        const minDim = Math.min(imageObj.width, imageObj.height);
        const baseScale = size / minDim;
        const finalScale = baseScale * zoom;

        const drawWidth = imageObj.width * finalScale;
        const drawHeight = imageObj.height * finalScale;

        // Draw image centered
        ctx.drawImage(
            imageObj,
            -drawWidth / 2,
            -drawHeight / 2,
            drawWidth,
            drawHeight
        );

        ctx.restore();
    }, [imageObj, zoom, rotation, offset]);

    useEffect(() => {
        if (isOpen && imageObj) {
            drawCanvas();
        }
    }, [isOpen, imageObj, drawCanvas]);

    // Handle mouse drag / pan
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDragging) return;
        setOffset({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    // Handle touch drag / pan
    const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
        if (e.touches.length === 1) {
            setIsDragging(true);
            setDragStart({
                x: e.touches[0].clientX - offset.x,
                y: e.touches[0].clientY - offset.y,
            });
        }
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDragging || e.touches.length !== 1) return;
        setOffset({
            x: e.touches[0].clientX - dragStart.x,
            y: e.touches[0].clientY - dragStart.y,
        });
    };

    const handleTouchEnd = () => setIsDragging(false);

    // Export cropped image
    const handleApplyCrop = () => {
        if (!canvasRef.current || !imageObj) return;

        const canvas = canvasRef.current;
        canvas.toBlob((blob) => {
            if (!blob) return;

            const croppedFile = new File([blob], "profile_cropped_1x1.png", {
                type: "image/png",
                lastModified: Date.now(),
            });

            const dataUrl = canvas.toDataURL("image/png");
            onCropComplete(croppedFile, dataUrl);
            onClose();
        }, "image/png", 0.95);
    };

    if (!isOpen || !imageSrc) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                            <ImageIcon className="w-4 h-4" weight="bold" />
                        </div>
                        <div>
                            <h3 className="text-sm font-extrabold text-slate-900">Crop Profile Picture (1:1 Ratio)</h3>
                            <p className="text-[11px] font-medium text-slate-500">Drag to position, slider to zoom</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Canvas Cropper Area */}
                <div className="p-6 flex flex-col items-center bg-slate-900/5 justify-center relative select-none">
                    <div className="relative w-[320px] h-[320px] rounded-2xl overflow-hidden shadow-inner border-2 border-indigo-500 bg-slate-950 flex items-center justify-center">
                        <canvas
                            ref={canvasRef}
                            width={400}
                            height={400}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                            className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
                        />

                        {/* 1:1 Viewport Overlay Grid */}
                        <div className="absolute inset-0 pointer-events-none border-2 border-white/60 rounded-2xl shadow-[0_0_0_9999px_rgba(15,23,42,0.4)]">
                            <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                                {[...Array(9)].map((_, i) => (
                                    <div key={i} className="border border-white/20" />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Hint text */}
                    <span className="text-[11px] font-semibold text-slate-500 mt-3">
                        Square 1:1 Aspect Ratio Preview
                    </span>
                </div>

                {/* Control Tools */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 space-y-4">
                    {/* Zoom Slider */}
                    <div className="flex items-center gap-3">
                        <MagnifyingGlassMinus className="w-4 h-4 text-slate-500" />
                        <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.05"
                            value={zoom}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <MagnifyingGlassPlus className="w-4 h-4 text-slate-500" />
                        <span className="text-xs font-bold text-slate-700 w-9 text-right">{zoom.toFixed(1)}x</span>
                    </div>

                    {/* Rotate button & Actions */}
                    <div className="flex items-center justify-between pt-1">
                        <button
                            type="button"
                            onClick={() => setRotation((prev) => (prev + 90) % 360)}
                            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 hover:bg-slate-100 transition-colors shadow-2xs"
                        >
                            <ArrowsClockwise className="w-4 h-4" /> Rotate
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleApplyCrop}
                                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold inline-flex items-center gap-1.5 transition-colors shadow-sm"
                            >
                                <Check className="w-4 h-4" weight="bold" /> Apply 1:1 Crop
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
