import React, { useEffect, useRef, useState } from 'react';
import { Network, Brain, BookOpen, CheckCircle, Lightbulb, GitBranch, Maximize2, Minimize2, RotateCcw, Download } from 'lucide-react';
import { ConceptExplanationResponse } from '@/api/noteService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MindMapProps {
  explanation: string | ConceptExplanationResponse;
  title?: string;
  onExportSVG?: (svgString: string) => void;
}

interface MindMapNode {
  id: string;
  label: string;
  type: 'central' | 'concept' | 'tip';
  x: number;
  y: number;
  color: string;
  icon: string;
  description?: string;
}

interface MindMapConnection {
  from: string;
  to: string;
  color: string;
}

export const MindMap: React.FC<MindMapProps> = ({ explanation, title = "Knowledge Map", onExportSVG }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<MindMapNode[]>([]);
  const [connections, setConnections] = useState<MindMapConnection[]>([]);
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Convert explanation to mind map data
  useEffect(() => {
    const generateMindMapData = () => {
      // Use actual container dimensions for positioning
      const containerWidth = dimensions.width;
      const containerHeight = dimensions.height;
      const isMobile = containerWidth < 640;
      
      if (typeof explanation === 'string') {
        // Simple string explanation - create a basic structure
        const centralNode: MindMapNode = {
          id: 'central',
          label: title,
          type: 'central',
          x: containerWidth / 2,
          y: containerHeight / 2,
          color: '#7c3aed',
          icon: 'brain'
        };

        const explanationNode: MindMapNode = {
          id: 'explanation',
          label: 'Explanation',
          type: 'concept',
          x: containerWidth / 2 + (isMobile ? 100 : 200),
          y: containerHeight / 2,
          color: '#3b82f6',
          icon: 'book',
          description: explanation
        };

        setNodes([centralNode, explanationNode]);
        setConnections([{
          from: 'central',
          to: 'explanation',
          color: '#7c3aed'
        }]);
        return;
      }

      // Structured explanation
      const structuredExplanation = explanation as ConceptExplanationResponse;
      const newNodes: MindMapNode[] = [];
      const newConnections: MindMapConnection[] = [];

      // Central node
      const centralNode: MindMapNode = {
        id: 'central',
        label: title,
        type: 'central',
        x: containerWidth / 2,
        y: containerHeight / 2,
        color: '#7c3aed',
        icon: 'brain'
      };
      newNodes.push(centralNode);

      const centerX = containerWidth / 2;
      const centerY = containerHeight / 2;
      // Adjust radius based on screen size
      const baseRadius = Math.min(containerWidth, containerHeight) * (isMobile ? 0.25 : 0.3);
      const radius = Math.max(80, baseRadius); // Minimum radius for mobile

      // Concept nodes
      if (structuredExplanation.explanations && structuredExplanation.explanations.length > 0) {
        structuredExplanation.explanations.forEach((concept, index) => {
          const angle = (2 * Math.PI * index) / structuredExplanation.explanations.length;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);

          const conceptNode: MindMapNode = {
            id: `concept-${index}`,
            label: concept.concept,
            type: 'concept',
            x,
            y,
            color: '#3b82f6',
            icon: 'book',
            description: concept.explanation
          };
          newNodes.push(conceptNode);

          newConnections.push({
            from: 'central',
            to: `concept-${index}`,
            color: '#3b82f6'
          });
        });
      }

      // Study tips nodes
      if (structuredExplanation.studyTips && structuredExplanation.studyTips.length > 0) {
        const tipRadius = radius * (isMobile ? 0.6 : 0.8); // Closer on mobile
        const startAngle = 0; // Start at 0 degrees
        
        structuredExplanation.studyTips.forEach((tip, index) => {
          const angle = startAngle + (2 * Math.PI * index) / structuredExplanation.studyTips.length;
          const x = centerX + tipRadius * Math.cos(angle);
          const y = centerY + tipRadius * Math.sin(angle);

          const tipNode: MindMapNode = {
            id: `tip-${index}`,
            label: `Tip ${index + 1}`,
            type: 'tip',
            x,
            y,
            color: '#f59e0b',
            icon: 'check',
            description: tip
          };
          newNodes.push(tipNode);

          newConnections.push({
            from: 'central',
            to: `tip-${index}`,
            color: '#f59e0b'
          });
        });
      }

      setNodes(newNodes);
      setConnections(newConnections);
    };

    generateMindMapData();
  }, [explanation, title, dimensions]);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      if (isFullscreen) {
        setDimensions({
          width: window.innerWidth - 40,
          height: window.innerHeight - 40
        });
      } else {
        // Make responsive to container size
        const isMobile = window.innerWidth < 640;
        const isTablet = window.innerWidth < 1024;
        
        if (isMobile) {
          setDimensions({ width: window.innerWidth - 32, height: 400 }); // Account for mobile padding
        } else if (isTablet) {
          setDimensions({ width: window.innerWidth - 64, height: 500 }); // Account for tablet padding
        } else {
          setDimensions({ width: 800, height: 600 });
        }
      }
    };

    // Initial sizing
    handleResize();
    
    // Listen for resize events
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFullscreen]);

  const getNodeIcon = (iconType: string) => {
    switch (iconType) {
      case 'brain':
        return <Brain className="h-3 w-3 text-white" />;
      case 'book':
        return <BookOpen className="h-3 w-3 text-white" />;
      case 'lightbulb':
        return <Lightbulb className="h-3 w-3 text-white" />;
      case 'check':
        return <CheckCircle className="h-3 w-3 text-white" />;
      default:
        return <Network className="h-3 w-3 text-white" />;
    }
  };

  const handleNodeClick = (node: MindMapNode) => {
    setSelectedNode(selectedNode?.id === node.id ? null : node);
  };

  const handleMouseDown = (e: React.MouseEvent, node: MindMapNode) => {
    if (node.type === 'central') return; // Don't allow dragging the central node
    
    e.preventDefault();
    e.stopPropagation();
    setDraggedNode(node.id);
    
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left - node.x - panOffset.x,
        y: e.clientY - rect.top - node.y - panOffset.y
      });
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (draggedNode) return; // Don't start panning if dragging a node
    
    setIsPanning(true);
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      setPanStart({
        x: e.clientX - rect.left - panOffset.x,
        y: e.clientY - rect.top - panOffset.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentWidth = dimensions.width;
    const currentHeight = dimensions.height;

    if (draggedNode) {
      // Handle node dragging
      const newX = e.clientX - rect.left - dragOffset.x - panOffset.x;
      const newY = e.clientY - rect.top - dragOffset.y - panOffset.y;
      
      // Constrain to SVG bounds (accounting for pan offset)
      const nodeRadius = 30; // Max node radius
      const constrainedX = Math.max(nodeRadius, Math.min(currentWidth - nodeRadius, newX));
      const constrainedY = Math.max(nodeRadius, Math.min(currentHeight - nodeRadius, newY));
      
      setNodes(prevNodes =>
        prevNodes.map(node =>
          node.id === draggedNode
            ? { ...node, x: constrainedX, y: constrainedY }
            : node
        )
      );
    } else if (isPanning) {
      // Handle canvas panning
      const newPanX = e.clientX - rect.left - panStart.x;
      const newPanY = e.clientY - rect.top - panStart.y;
      
      // Limit panning to reasonable bounds
      const maxPan = 200;
      const constrainedPanX = Math.max(-maxPan, Math.min(maxPan, newPanX));
      const constrainedPanY = Math.max(-maxPan, Math.min(maxPan, newPanY));
      
      setPanOffset({ x: constrainedPanX, y: constrainedPanY });
    }
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
    setDragOffset({ x: 0, y: 0 });
    setIsPanning(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setSelectedNode(null); // Clear selection when toggling fullscreen
    setPanOffset({ x: 0, y: 0 }); // Reset pan when toggling fullscreen
  };

  const resetView = () => {
    setPanOffset({ x: 0, y: 0 });
    setSelectedNode(null);
  };

  // SVG Export functionality for PDF integration
  useEffect(() => {
    if (nodes.length > 0 && onExportSVG) {
      // Delay to ensure rendering is complete
      setTimeout(() => {
        if (svgRef.current) {
          const svgElement = svgRef.current;
          const serializer = new XMLSerializer();
          const svgString = serializer.serializeToString(svgElement);
          
          // Create a clean SVG string with proper styling for PDF
          const cleanSVG = `
            <svg width="${dimensions.width}" height="${dimensions.height}" xmlns="http://www.w3.org/2000/svg">
              <style>
                .node-text { font-family: Arial, sans-serif; font-size: 12px; fill: #374151; }
                .connection-line { stroke-width: 2; }
                .central-node { fill: #7c3aed; }
                .concept-node { fill: #3b82f6; }
                .tip-node { fill: #f59e0b; }
              </style>
              ${svgElement.innerHTML}
            </svg>
          `;
          
          onExportSVG(cleanSVG);
        }
      }, 500);
    }
  }, [nodes, onExportSVG, dimensions]);

  const mindMapContent = (
    <div className="relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
          <h3 className="font-semibold text-sm sm:text-base text-gray-900">Knowledge Mind Map</h3>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {(panOffset.x !== 0 || panOffset.y !== 0) && (
            <Button
              onClick={resetView}
              variant="outline"
              size="sm"
              className="gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Reset View</span>
              <span className="sm:hidden">Reset</span>
            </Button>
          )}
          <Button
            onClick={toggleFullscreen}
            variant="outline"
            size="sm"
            className="gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Exit Fullscreen</span>
                <span className="sm:hidden">Exit</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Fullscreen</span>
                <span className="sm:hidden">Full</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="relative border-2 border-purple-200 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 overflow-hidden">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className={`block w-full ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseDown={handleCanvasMouseDown}
          style={{ maxWidth: '100%', height: 'auto' }}
        >
          {/* Background pattern */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Main content group with pan transform */}
          <g transform={`translate(${panOffset.x}, ${panOffset.y})`}>
            {/* Connections */}
            {connections.map((connection, index) => {
              const fromNode = nodes.find(n => n.id === connection.from);
              const toNode = nodes.find(n => n.id === connection.to);
              if (!fromNode || !toNode) return null;

              return (
                <line
                  key={index}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={connection.color}
                  strokeWidth="2"
                  opacity="0.6"
                  className="animate-pulse"
                />
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const isMobile = dimensions.width < 640;
              const nodeRadius = node.type === 'central' ? (isMobile ? 25 : 30) : (isMobile ? 16 : 20);
              const iconSize = isMobile ? 4 : 6;
              const labelOffset = node.type === 'central' ? (isMobile ? 35 : 45) : (isMobile ? 28 : 35);
              
              return (
                <g key={node.id}>
                  {/* Node background */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={nodeRadius}
                    fill={node.color}
                    className={`transition-all duration-200 ${
                      node.type === 'central' 
                        ? 'cursor-default' 
                        : draggedNode === node.id 
                          ? 'cursor-grabbing' 
                          : 'cursor-grab'
                    } ${
                      selectedNode?.id === node.id ? 'drop-shadow-lg' : 'hover:drop-shadow-md'
                    }`}
                    onClick={() => handleNodeClick(node)}
                    onMouseDown={(e) => handleMouseDown(e, node)}
                    style={{
                      filter: draggedNode === node.id ? 'brightness(1.1)' : undefined
                    }}
                  />
                  
                  {/* Node icon */}
                  <foreignObject
                    x={node.x - iconSize}
                    y={node.y - iconSize}
                    width={iconSize * 2}
                    height={iconSize * 2}
                    className="pointer-events-none"
                  >
                    <div className="flex items-center justify-center w-full h-full">
                      {React.cloneElement(getNodeIcon(node.icon), { 
                        className: `h-${iconSize > 4 ? '3' : '2'} w-${iconSize > 4 ? '3' : '2'} text-white` 
                      })}
                    </div>
                  </foreignObject>

                  {/* Node label */}
                  <text
                    x={node.x}
                    y={node.y + labelOffset}
                    textAnchor="middle"
                    className={`fill-gray-700 font-medium pointer-events-none ${
                      isMobile ? 'text-xs' : 'text-sm'
                    }`}
                  >
                    {isMobile && node.label.length > 15 
                      ? `${node.label.substring(0, 15)}...` 
                      : node.label.length > 20 
                        ? `${node.label.substring(0, 20)}...` 
                        : node.label
                    }
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Node details panel */}
        {selectedNode && selectedNode.description && (
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 max-w-[280px] sm:max-w-xs z-10">
            <Card className="shadow-lg border-2 border-purple-300">
              <CardHeader className="pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
                  {getNodeIcon(selectedNode.icon)}
                  {selectedNode.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 p-3 sm:p-4">
                <p className="text-xs text-gray-600 leading-relaxed">
                  {selectedNode.description}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Instructions */}
        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded max-w-[calc(100%-1rem)] sm:max-w-none">
          <span className="hidden sm:inline">Click nodes to view details • Drag nodes to reposition • Drag canvas to pan</span>
          <span className="sm:hidden">Tap nodes • Drag to move</span>
        </div>
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white p-2 sm:p-4">
        {mindMapContent}
      </div>
    );
  }

  return mindMapContent;
};
