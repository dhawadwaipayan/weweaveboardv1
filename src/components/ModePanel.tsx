import React, { useState, useRef, useEffect } from 'react';
import { SketchSubBar } from './SketchSubBar';
import { RenderSubBar } from './RenderSubBar';
import type { CanvasHandle } from './Canvas';
import { callOpenAIGptImage } from '@/lib/openaiSketch';
import Konva from 'konva';

export interface ModePanelProps {
  canvasRef: React.RefObject<CanvasHandle>;
  onSketchModeActivated?: () => void;
  onBoundingBoxCreated?: () => void;
  showSketchSubBar?: boolean;
  closeSketchBar?: () => void;
  selectedMode?: string;
  setSelectedMode?: (mode: string) => void;
}

export const ModePanel: React.FC<ModePanelProps> = ({ canvasRef, onSketchModeActivated, onBoundingBoxCreated, showSketchSubBar, closeSketchBar, selectedMode, setSelectedMode }) => {
  const [showRenderSubBar, setShowRenderSubBar] = useState(false);
  const [aiStatus, setAiStatus] = useState<'idle' | 'generating' | 'error' | 'success'>('idle');
  const [aiError, setAiError] = useState<string | null>(null);
  const [lastInputImage, setLastInputImage] = useState<string | null>(null);
  const modes = [{
    id: 'sketch',
    icon: 'https://cdn.builder.io/api/v1/image/assets/49361a2b7ce44657a799a73862a168f7/ee2941b19a658fe2d209f852cf910c39252d3c4f?placeholderIfAbsent=true',
    label: 'Sketch'
  }, {
    id: 'render',
    icon: 'https://cdn.builder.io/api/v1/image/assets/49361a2b7ce44657a799a73862a168f7/837a94f315ae3d40b566e53a84400dac739a1e1a?placeholderIfAbsent=true',
    label: 'Render'
  }, {
    id: 'colorway',
    icon: 'https://cdn.builder.io/api/v1/image/assets/49361a2b7ce44657a799a73862a168f7/455b40b53a04278357300eaa66c8577afba94ea1?placeholderIfAbsent=true',
    label: 'Colorway'
  }, {
    id: 'sides',
    icon: 'https://cdn.builder.io/api/v1/image/assets/49361a2b7ce44657a799a73862a168f7/6eb8891421d30b1132ff78da0afd8482ce50b611?placeholderIfAbsent=true',
    label: 'Sides'
  }];

  const handleModeSelect = (modeId: string) => {
    if (setSelectedMode) setSelectedMode(modeId);
    if (modeId === 'sketch') {
      setShowRenderSubBar(false);
      if (onSketchModeActivated) onSketchModeActivated();
    } else if (modeId === 'render') {
      setShowRenderSubBar(true);
      if (closeSketchBar) closeSketchBar();
    } else {
      if (closeSketchBar) closeSketchBar();
      setShowRenderSubBar(false);
    }
    console.log(`Selected mode: ${modeId}`);
  };

  const handleSketchCancel = () => {
    if (closeSketchBar) closeSketchBar();
    if (setSelectedMode) setSelectedMode(''); // Reset to non-clicked state
    if (canvasRef.current) {
      const stage = canvasRef.current.getKonvaStage();
      removeBoundingBoxesByName(stage, 'sketch-bounding-box');
    }
    boundingBoxRef.current = null;
    setSketchBoundingBox(null);
  };

  // Bounding box state for Sketch mode
  const [sketchBoundingBox, setSketchBoundingBox] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
  const boundingBoxRef = useRef<Konva.Rect | null>(null);
  const boundingBoxDrawing = useRef(false);
  const boundingBoxStart = useRef<{ x: number, y: number } | null>(null);

  // Utility: Remove all bounding boxes by name
  const removeBoundingBoxesByName = (stage: Konva.Stage | null, name: string) => {
    if (!stage) return;
    const layers = stage.getLayers();
    layers.forEach(layer => {
      const toRemove = layer.getChildren().filter(obj => obj.name() === name);
      toRemove.forEach(obj => obj.destroy());
    });
  };

  // Add bounding box by user drag when entering Sketch mode
  useEffect(() => {
    if (!showSketchSubBar || !canvasRef.current) return;
    const stage = canvasRef.current.getKonvaStage();
    if (!stage) return;
    
    // Remove any existing bounding box (robust)
    removeBoundingBoxesByName(stage, 'sketch-bounding-box');
    boundingBoxRef.current = null;
    setSketchBoundingBox(null);
    
    // LOCK BOARD: Disable all object interaction and selection
    const layers = stage.getLayers();
    layers.forEach(layer => {
      layer.getChildren().forEach(obj => {
        obj.draggable(false);
      });
    });
    stage.draggable(false);
    stage.draw();
    
    // Set crosshair cursor
    stage.container().style.cursor = 'crosshair';
    
    // Mouse event handlers
    const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (boundingBoxDrawing.current) return;
      boundingBoxDrawing.current = true;
      const pos = stage.getPointerPosition();
      if (!pos) return;
      
      boundingBoxStart.current = { x: pos.x, y: pos.y };
      
      // Remove any existing bounding box before creating new
      removeBoundingBoxesByName(stage, 'sketch-bounding-box');
      
      // Create a temp rect
      const rect = new Konva.Rect({
        x: pos.x,
        y: pos.y,
        width: 1,
        height: 1,
        fill: 'rgba(0,0,0,0.0)',
        stroke: '#E1FF00',
        strokeWidth: 2,
        draggable: false,
        selectable: false,
        name: 'sketch-bounding-box',
      });
      
      const layer = stage.findOne('Layer') as Konva.Layer;
      if (layer) {
        layer.add(rect);
        boundingBoxRef.current = rect;
      }
    };

    const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!boundingBoxDrawing.current || !boundingBoxRef.current || !boundingBoxStart.current) return;
      const pos = stage.getPointerPosition();
      if (!pos) return;
      
      const startX = boundingBoxStart.current.x;
      const startY = boundingBoxStart.current.y;
      const x = Math.min(startX, pos.x);
      const y = Math.min(startY, pos.y);
      const width = Math.abs(pos.x - startX);
      const height = Math.abs(pos.y - startY);
      
      boundingBoxRef.current.setAttrs({ x, y, width, height });
      stage.draw();
    };

    const handleMouseUp = () => {
      if (!boundingBoxDrawing.current || !boundingBoxRef.current) return;
      boundingBoxDrawing.current = false;
      boundingBoxStart.current = null;
      
      // Finalize the bounding box
      boundingBoxRef.current.setAttrs({
        draggable: true,
        selectable: true,
      });
      
      setSketchBoundingBox({
        x: boundingBoxRef.current.x(),
        y: boundingBoxRef.current.y(),
        width: boundingBoxRef.current.width(),
        height: boundingBoxRef.current.height(),
      });
      
      // UNLOCK BOARD: Restore all object interaction and selection
      const layers = stage.getLayers();
      layers.forEach(layer => {
        layer.getChildren().forEach(obj => {
          obj.draggable(true);
        });
      });
      stage.draggable(true);
      stage.draw();
      
      // Listen for changes
      boundingBoxRef.current.on('transform', () => {
        setSketchBoundingBox({
          x: boundingBoxRef.current!.x(),
          y: boundingBoxRef.current!.y(),
          width: boundingBoxRef.current!.width() * boundingBoxRef.current!.scaleX(),
          height: boundingBoxRef.current!.height() * boundingBoxRef.current!.scaleY(),
        });
      });
      
      boundingBoxRef.current.on('dragmove', () => {
        setSketchBoundingBox({
          x: boundingBoxRef.current!.x(),
          y: boundingBoxRef.current!.y(),
          width: boundingBoxRef.current!.width() * boundingBoxRef.current!.scaleX(),
          height: boundingBoxRef.current!.height() * boundingBoxRef.current!.scaleY(),
        });
      });
      
      // Remove listeners after creation
      stage.off('mousedown', handleMouseDown);
      stage.off('mousemove', handleMouseMove);
      stage.off('mouseup', handleMouseUp);
      stage.container().style.cursor = 'default';
      
      if (onBoundingBoxCreated) onBoundingBoxCreated();
    };

    stage.on('mousedown', handleMouseDown);
    stage.on('mousemove', handleMouseMove);
    stage.on('mouseup', handleMouseUp);
    
    // Listen for image add/remove/clear and remove bounding box
    const handleObjectAdded = () => {
      removeBoundingBoxesByName(stage, 'sketch-bounding-box');
      boundingBoxRef.current = null;
      setSketchBoundingBox(null);
    };
    
    const handleObjectRemoved = () => {
      removeBoundingBoxesByName(stage, 'sketch-bounding-box');
      boundingBoxRef.current = null;
      setSketchBoundingBox(null);
    };
    
    stage.on('add', handleObjectAdded);
    stage.on('remove', handleObjectRemoved);
    
    return () => {
      stage.off('mousedown', handleMouseDown);
      stage.off('mousemove', handleMouseMove);
      stage.off('mouseup', handleMouseUp);
      stage.off('add', handleObjectAdded);
      stage.off('remove', handleObjectRemoved);
      stage.container().style.cursor = 'default';
      removeBoundingBoxesByName(stage, 'sketch-bounding-box');
      boundingBoxRef.current = null;
      setSketchBoundingBox(null);
    };
  }, [showSketchSubBar, canvasRef]);

  const handleSketchGenerate = async (details: string) => {
    setAiStatus('generating');
    setAiError(null);
    if (!canvasRef.current) {
      console.error('No canvas ref available');
      return;
    }
    const stage = canvasRef.current.getKonvaStage();
    if (!stage) {
      console.error('No Konva stage instance');
      return;
    }
    if (!sketchBoundingBox) {
      alert('No bounding box defined for export.');
      setAiStatus('idle');
      return;
    }
    
    // Export the bounding box area as PNG using Konva.js
    let base64Sketch = null;
    try {
      const { x, y, width, height } = sketchBoundingBox;
      
      // Create a temporary stage for cropping
      const tempStage = new Konva.Stage({
        container: document.createElement('div'),
        width: width,
        height: height,
      });
      
      // Clone the main stage content
      const mainLayer = stage.findOne('Layer') as Konva.Layer;
      if (mainLayer) {
        const clonedLayer = mainLayer.clone();
        clonedLayer.position({ x: -x, y: -y });
        tempStage.add(clonedLayer);
      }
      
      // Export the cropped area
      base64Sketch = tempStage.toDataURL({
        x: 0,
        y: 0,
        width: width,
        height: height,
        pixelRatio: 1,
      });
      
      setLastInputImage(base64Sketch);
      
      // Auto-download the image for debugging
      if (base64Sketch) {
        const link = document.createElement('a');
        link.href = base64Sketch;
        link.download = 'openai-input.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      // Clean up temporary stage
      tempStage.destroy();
    } catch (err) {
      setAiStatus('idle');
      alert('[Sketch AI] Bounding box export failed: ' + (err instanceof Error ? err.message : String(err)));
      console.error('[Sketch AI] Bounding box export error:', err);
      return;
    }
    
    if (!base64Sketch) {
      alert('Failed to export bounding box area for AI generation.');
      setAiStatus('idle');
      return;
    }
    
    // Prepare input for OpenAI
    const promptText = `Generate an Image by redoing the flat sketch in the same style. The generated flat sketch should have only black lines. Consider if any annotations are given on the image to update those changes on the newly generated flat sketch. ${details}`.trim();
    
    try {
      const result = await callOpenAIGptImage({
        base64Sketch,
        promptText
      });
      console.log('[Sketch AI] OpenAI API full response:', result);
      
      // Extract base64 image from OpenAI response
      let base64 = null;
      if (result && Array.isArray(result.output)) {
        const imageOutput = result.output.find(
          (item) => item.type === 'image_generation_call' && item.result
        );
        if (imageOutput) {
          base64 = imageOutput.result;
        }
      }
      
      if (!base64) {
        setAiStatus('error');
        setAiError('No image returned from OpenAI.');
        setTimeout(() => setAiStatus('idle'), 4000);
        alert('No image returned from OpenAI.');
        return;
      }
      
      const imageUrl = `data:image/png;base64,${base64}`;
      
      // Place the generated image to the right of the bounding box
      let x = sketchBoundingBox.x + sketchBoundingBox.width + 40; // 40px gap
      let y = sketchBoundingBox.y;
      
      const img = new window.Image();
      img.onload = () => {
        const konvaImage = new Konva.Image({
          x: x,
          y: y,
          image: img,
          scaleX: 0.5,
          scaleY: 0.5,
          draggable: true,
          selectable: true,
        });
        
        const layer = stage.findOne('Layer') as Konva.Layer;
        if (layer) {
          layer.add(konvaImage);
          stage.draw();
        }
      };
      img.src = imageUrl;
      
      setAiStatus('success');
      setTimeout(() => setAiStatus('idle'), 2000);
    } catch (err) {
      setAiStatus('error');
      setAiError(err instanceof Error ? err.message : String(err));
      setTimeout(() => setAiStatus('idle'), 4000);
      alert('[Sketch AI] Error: ' + (err instanceof Error ? err.message : String(err)));
      console.error('[Sketch AI] Error:', err);
    }
    
    if (onBoundingBoxCreated) onBoundingBoxCreated();
  };

  const handleRenderCancel = () => {
    setShowRenderSubBar(false);
    if (setSelectedMode) setSelectedMode(''); // Reset to non-clicked state
    if (canvasRef.current) {
      const stage = canvasRef.current.getKonvaStage();
      removeBoundingBoxesByName(stage, 'render-bounding-box');
    }
    boundingBoxRef.current = null;
    setRenderBoundingBox(null);
  };

  const handleRenderGenerate = async (details: string) => {
    setAiStatus('generating');
    setAiError(null);
    if (!canvasRef.current) {
      console.error('No canvas ref available');
      return;
    }
    const stage = canvasRef.current.getKonvaStage();
    if (!stage) {
      console.error('No Konva stage instance');
      return;
    }
    if (!renderBoundingBox) {
      alert('No bounding box defined for export.');
      setAiStatus('idle');
      return;
    }
    
    // Export the bounding box area as PNG using Konva.js
    let base64Sketch = null;
    try {
      const { x, y, width, height } = renderBoundingBox;
      
      // Create a temporary stage for cropping
      const tempStage = new Konva.Stage({
        container: document.createElement('div'),
        width: width,
        height: height,
      });
      
      // Clone the main stage content
      const mainLayer = stage.findOne('Layer') as Konva.Layer;
      if (mainLayer) {
        const clonedLayer = mainLayer.clone();
        clonedLayer.position({ x: -x, y: -y });
        tempStage.add(clonedLayer);
      }
      
      // Export the cropped area
      base64Sketch = tempStage.toDataURL({
        x: 0,
        y: 0,
        width: width,
        height: height,
        pixelRatio: 1,
      });
      
      setLastInputImage(base64Sketch);
      
      if (base64Sketch) {
        const link = document.createElement('a');
        link.href = base64Sketch;
        link.download = 'openai-input.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      // Clean up temporary stage
      tempStage.destroy();
    } catch (err) {
      setAiStatus('idle');
      alert('[Render AI] Bounding box export failed: ' + (err instanceof Error ? err.message : String(err)));
      console.error('[Render AI] Bounding box export error:', err);
      return;
    }
    
    if (!base64Sketch) {
      alert('Failed to export bounding box area for AI generation.');
      setAiStatus('idle');
      return;
    }
    
    // Use attached material if present, else use a pure white PNG
    let base64Material = renderMaterial;
    if (!base64Material) {
      // Create a 1024x1024 white PNG as fallback
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, 1024, 1024);
        base64Material = canvas.toDataURL('image/png');
      }
    }
    
    // Prompt for render
    const promptText = `Generate an image by using the attached material to turn the sketch into a realistic representation with a transparent background. All the topstitches and buttons will be of the same colour. In case any prompt is given on the image or as an additional input, include those changes as well. ${details}`.trim();
    
    try {
      const result = await callOpenAIGptImage({
        base64Sketch,
        base64Material,
        promptText,
        endpoint: '/api/render-ai'
      });
      console.log('[Render AI] OpenAI API full response:', result);
      
      let base64 = null;
      if (result && Array.isArray(result.output)) {
        const imageOutput = result.output.find(
          (item) => item.type === 'image_generation_call' && item.result
        );
        if (imageOutput) {
          base64 = imageOutput.result;
        }
      }
      
      if (!base64) {
        setAiStatus('error');
        setAiError('No image returned from OpenAI.');
        setTimeout(() => setAiStatus('idle'), 4000);
        alert('No image returned from OpenAI.');
        return;
      }
      
      const imageUrl = `data:image/png;base64,${base64}`;
      let x = renderBoundingBox.x + renderBoundingBox.width + 40;
      let y = renderBoundingBox.y;
      
      const img = new window.Image();
      img.onload = () => {
        const konvaImage = new Konva.Image({
          x: x,
          y: y,
          image: img,
          scaleX: 0.5,
          scaleY: 0.5,
          draggable: true,
          selectable: true,
        });
        
        const layer = stage.findOne('Layer') as Konva.Layer;
        if (layer) {
          layer.add(konvaImage);
          stage.draw();
        }
      };
      img.src = imageUrl;
      
      setAiStatus('success');
      setTimeout(() => setAiStatus('idle'), 2000);
    } catch (err) {
      setAiStatus('error');
      setAiError(err instanceof Error ? err.message : String(err));
      setTimeout(() => setAiStatus('idle'), 4000);
      alert('[Render AI] Error: ' + (err instanceof Error ? err.message : String(err)));
      console.error('[Render AI] Error:', err);
    }
    
    if (onBoundingBoxCreated) onBoundingBoxCreated();
  };

  const handleRenderMaterial = (base64: string | null) => {
    setRenderMaterial(base64);
  };

  const handleAddMaterial = () => {
    console.log('Add material clicked');
    // Add your add material logic here
  };

  // State for renderBoundingBox and renderMaterial
  const [renderBoundingBox, setRenderBoundingBox] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
  const [renderMaterial, setRenderMaterial] = useState<string | null>(null); // base64

  // Bounding box logic for Render mode (copy of Sketch, but for Render)
  useEffect(() => {
    if (!showRenderSubBar || !canvasRef.current) return;
    const stage = canvasRef.current.getKonvaStage();
    if (!stage) return;
    
    // Remove any existing bounding box (robust)
    removeBoundingBoxesByName(stage, 'render-bounding-box');
    boundingBoxRef.current = null;
    setRenderBoundingBox(null);
    
    // LOCK BOARD: Disable all object interaction and selection
    const layers = stage.getLayers();
    layers.forEach(layer => {
      layer.getChildren().forEach(obj => {
        obj.draggable(false);
      });
    });
    stage.draggable(false);
    stage.draw();
    stage.container().style.cursor = 'crosshair';
    
    const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (boundingBoxDrawing.current) return;
      boundingBoxDrawing.current = true;
      const pos = stage.getPointerPosition();
      if (!pos) return;
      
      boundingBoxStart.current = { x: pos.x, y: pos.y };
      
      // Remove any existing bounding box before creating new
      removeBoundingBoxesByName(stage, 'render-bounding-box');
      
      // Create a temp rect
      const rect = new Konva.Rect({
        x: pos.x,
        y: pos.y,
        width: 1,
        height: 1,
        fill: 'rgba(0,0,0,0.0)',
        stroke: '#E1FF00',
        strokeWidth: 2,
        draggable: false,
        selectable: false,
        name: 'render-bounding-box',
      });
      
      const layer = stage.findOne('Layer') as Konva.Layer;
      if (layer) {
        layer.add(rect);
        boundingBoxRef.current = rect;
      }
    };
    
    const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!boundingBoxDrawing.current || !boundingBoxRef.current || !boundingBoxStart.current) return;
      const pos = stage.getPointerPosition();
      if (!pos) return;
      
      const startX = boundingBoxStart.current.x;
      const startY = boundingBoxStart.current.y;
      const x = Math.min(startX, pos.x);
      const y = Math.min(startY, pos.y);
      const width = Math.abs(pos.x - startX);
      const height = Math.abs(pos.y - startY);
      
      boundingBoxRef.current.setAttrs({ x, y, width, height });
      stage.draw();
    };
    
    const handleMouseUp = () => {
      if (!boundingBoxDrawing.current || !boundingBoxRef.current) return;
      boundingBoxDrawing.current = false;
      boundingBoxStart.current = null;
      
      boundingBoxRef.current.setAttrs({
        draggable: true,
        selectable: true,
      });
      
      setRenderBoundingBox({
        x: boundingBoxRef.current.x(),
        y: boundingBoxRef.current.y(),
        width: boundingBoxRef.current.width(),
        height: boundingBoxRef.current.height(),
      });
      
      const layers = stage.getLayers();
      layers.forEach(layer => {
        layer.getChildren().forEach(obj => {
          obj.draggable(true);
        });
      });
      stage.draggable(true);
      stage.draw();
      
      boundingBoxRef.current.on('transform', () => {
        setRenderBoundingBox({
          x: boundingBoxRef.current!.x(),
          y: boundingBoxRef.current!.y(),
          width: boundingBoxRef.current!.width() * boundingBoxRef.current!.scaleX(),
          height: boundingBoxRef.current!.height() * boundingBoxRef.current!.scaleY(),
        });
      });
      
      boundingBoxRef.current.on('dragmove', () => {
        setRenderBoundingBox({
          x: boundingBoxRef.current!.x(),
          y: boundingBoxRef.current!.y(),
          width: boundingBoxRef.current!.width() * boundingBoxRef.current!.scaleX(),
          height: boundingBoxRef.current!.height() * boundingBoxRef.current!.scaleY(),
        });
      });
      
      stage.off('mousedown', handleMouseDown);
      stage.off('mousemove', handleMouseMove);
      stage.off('mouseup', handleMouseUp);
      stage.container().style.cursor = 'default';
      
      if (onBoundingBoxCreated) onBoundingBoxCreated();
    };
    
    stage.on('mousedown', handleMouseDown);
    stage.on('mousemove', handleMouseMove);
    stage.on('mouseup', handleMouseUp);
    
    // Listen for image add/remove/clear and remove bounding box
    const handleObjectAdded = () => {
      removeBoundingBoxesByName(stage, 'render-bounding-box');
      boundingBoxRef.current = null;
      setRenderBoundingBox(null);
    };
    
    const handleObjectRemoved = () => {
      removeBoundingBoxesByName(stage, 'render-bounding-box');
      boundingBoxRef.current = null;
      setRenderBoundingBox(null);
    };
    
    stage.on('add', handleObjectAdded);
    stage.on('remove', handleObjectRemoved);
    
    return () => {
      stage.off('mousedown', handleMouseDown);
      stage.off('mousemove', handleMouseMove);
      stage.off('mouseup', handleMouseUp);
      stage.off('add', handleObjectAdded);
      stage.off('remove', handleObjectRemoved);
      stage.container().style.cursor = 'default';
      removeBoundingBoxesByName(stage, 'render-bounding-box');
      boundingBoxRef.current = null;
      setRenderBoundingBox(null);
    };
  }, [showRenderSubBar, canvasRef]);

  return (
    <div className="flex flex-col items-center">
      {/* AI Status Indicator */}
      <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 10000 }}>
        {aiStatus !== 'idle' && (
          <div className={`px-4 py-2 rounded shadow-lg text-sm font-medium transition-all duration-300 ${aiStatus === 'generating' ? 'bg-blue-800 text-white' : aiStatus === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
            {aiStatus === 'generating' && 'Generating with AI...'}
            {aiStatus === 'success' && 'AI image generated!'}
            {aiStatus === 'error' && (aiError || 'AI error')}
          </div>
        )}
      </div>
      {showSketchSubBar && (
        <SketchSubBar 
          onCancel={handleSketchCancel}
          onGenerate={handleSketchGenerate}
        />
      )}
      {showRenderSubBar && (
        <RenderSubBar 
          onCancel={handleRenderCancel}
          onGenerate={handleRenderGenerate}
          onAddMaterial={handleAddMaterial}
          onMaterialChange={handleRenderMaterial}
          canGenerate={!!renderBoundingBox}
        />
      )}
      <div className="flex gap-2 mt-4">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => handleModeSelect(mode.id)}
            className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200 ${
              selectedMode === mode.id
                ? 'bg-[#E1FF00] text-black shadow-lg'
                : 'bg-[#2A2A2A] text-white hover:bg-[#3A3A3A]'
            }`}
          >
            <img src={mode.icon} alt={mode.label} className="w-6 h-6 mb-2" />
            <span className="text-xs font-medium">{mode.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};