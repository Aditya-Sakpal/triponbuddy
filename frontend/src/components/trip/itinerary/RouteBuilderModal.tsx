import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  MarkerType,
  NodeTypes,
  EdgeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Route, Loader2, X } from "lucide-react";
import { RouteDestination, RoutePlan } from "@/constants";
import { TripsApiService } from "@/lib/api-services";
import { useToast } from "@/hooks/use-toast";
import { RouteVisualization } from "./RouteVisualization";
import { DestinationNode, FloatingEdge } from "./components";

interface RouteBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  userId: string;
  destinationCity: string;
  startingLocation: string;
  availableDestinations: RouteDestination[];
}

const nodeTypes: NodeTypes = {
  destination: DestinationNode,
};

const edgeTypes: EdgeTypes = {
  floating: FloatingEdge,
};

export const RouteBuilderModal = ({
  isOpen,
  onClose,
  tripId,
  userId,
  destinationCity,
  startingLocation,
  availableDestinations,
}: RouteBuilderModalProps) => {
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRoute, setGeneratedRoute] = useState<RoutePlan | null>(null);
  const { toast } = useToast();

  // Create nodes for React Flow
  const initialNodes: Node[] = useMemo(() => {
    const nodes: Node[] = [];
    
    // Only add start node if we have a starting location
    if (startingLocation) {
      nodes.push({
        id: "start",
        type: "destination",
        position: { x: 400, y: 50 },
        data: {
          label: "Start",
          location: startingLocation,
          isStart: true,
          isSelected: false,
        },
      });
    }

    // Arrange destination nodes in a grid below the start
    const cols = 3;
    const nodeWidth = 220;
    const nodeHeight = 120;
    const startX = 100;
    const startY = 220;

    availableDestinations.forEach((dest, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      nodes.push({
        id: dest.location,
        type: "destination",
        position: {
          x: startX + col * nodeWidth,
          y: startY + row * nodeHeight,
        },
        data: {
          label: dest.activity,
          location: dest.location,
          day: dest.day,
          time: dest.time,
          isStart: false,
          isSelected: false,
          order: 0,
        },
      });
    });

    return nodes;
  }, [startingLocation, availableDestinations]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Re-initialize nodes when modal opens or destinations change
  useEffect(() => {
    if (isOpen) {
      setNodes(initialNodes);
      setEdges([]);
      setSelectedDestinations([]);
      setGeneratedRoute(null);
    }
  }, [isOpen, initialNodes, setNodes, setEdges]);

  // Handle node click to select/deselect destinations
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (node.id === "start") return;

      const isSelected = selectedDestinations.includes(node.id);

      if (isSelected) {
        // Deselect
        const newSelected = selectedDestinations.filter((id) => id !== node.id);
        setSelectedDestinations(newSelected);

        // Remove edges connected to this node
        setEdges((eds) =>
          eds.filter((edge) => edge.source !== node.id && edge.target !== node.id)
        );
      } else {
        // Select and add to sequence
        const newSelected = [...selectedDestinations, node.id];
        setSelectedDestinations(newSelected);

        // Create edge from previous node (or start)
        const sourceId =
          newSelected.length === 1 ? "start" : newSelected[newSelected.length - 2];
        const newEdge: Edge = {
          id: `edge-${sourceId}-${node.id}`,
          source: sourceId,
          target: node.id,
          type: "floating",
          animated: true,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#3b82f6",
          },
          style: { 
            stroke: "#3b82f6", 
            strokeWidth: 3,
          },
        };
        setEdges((eds) => [...eds, newEdge]);
      }
    },
    [selectedDestinations, setEdges]
  );

  // Update node data to reflect selection state
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === "start") return node;

        const selectedIndex = selectedDestinations.indexOf(node.id);
        const isSelected = selectedIndex !== -1;

        return {
          ...node,
          data: {
            ...node.data,
            isSelected,
            order: isSelected ? selectedIndex + 1 : 0,
          },
        };
      })
    );
  }, [selectedDestinations, setNodes]);

  const handleGenerateRoute = async () => {
    if (selectedDestinations.length === 0) {
      toast({
        title: "No destinations selected",
        description: "Please select at least one destination",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);
      const response = await TripsApiService.generateRoute(
        tripId,
        {
          trip_id: tripId,
          user_id: userId,
          from_location: startingLocation,
          to_locations: selectedDestinations,
          destination_city: destinationCity,
        },
        userId
      );

      if (response.success) {
        setGeneratedRoute(response.route_plan);
        toast({
          title: "Route Generated!",
          description: "Your custom route has been created successfully",
        });
      }
    } catch (error) {
      console.error("Error generating route:", error);
      toast({
        title: "Error",
        description: "Failed to generate route. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setSelectedDestinations([]);
    setEdges([]);
    setGeneratedRoute(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Check if destinations are loaded
  const isDataReady = availableDestinations.length > 0 && startingLocation;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-[85vw] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Route className="h-4 w-4 sm:h-5 sm:w-5" />
            Plan Your Route
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Click on destinations to add them to your route in sequence. The connections will
            automatically form between selected destinations.
          </DialogDescription>
        </DialogHeader>

        {!isDataReady ? (
          <div className="py-8 sm:py-12 text-center">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground text-sm sm:text-base">Loading destinations...</p>
          </div>
        ) : !generatedRoute ? (
          <div className="space-y-3 sm:space-y-4">
            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              <Button
                className="w-full py-6 sm:py-3"
                size="lg"
                onClick={handleGenerateRoute}
                disabled={selectedDestinations.length === 0 || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span className="text-sm sm:text-base">Generating Route...</span>
                  </>
                ) : (
                  <>
                    <Route className="mr-2 h-4 w-4" />
                    <span className="text-sm sm:text-base">Generate Route Plan ({selectedDestinations.length} stops)</span>
                  </>
                )}
              </Button>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="flex-1 py-6 sm:py-3"
                  onClick={handleReset}
                  disabled={selectedDestinations.length === 0}
                >
                  <X className="h-4 w-4 mr-1" />
                  <span className="text-sm sm:text-base">Clear</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="flex-1 py-6 sm:py-3"
                  onClick={handleClose}
                >
                  <span className="text-sm sm:text-base">Cancel</span>
                </Button>
              </div>
            </div>

            {/* React Flow Map */}
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50">
              <div className="h-[300px] sm:h-[400px] lg:h-[500px]">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onNodeClick={onNodeClick}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  fitView
                  minZoom={0.5}
                  maxZoom={1.5}
                  defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
                  proOptions={{ hideAttribution: true }}
                >
                  <Background color="#e5e7eb" gap={20} />
                  <Controls />
                  <MiniMap
                    nodeColor={(node) =>
                      node.id === "start"
                        ? "#ef4444"
                        : node.data.isSelected
                        ? "#3b82f6"
                        : "#9ca3af"
                    }
                    maskColor="rgba(255, 255, 255, 0.8)"
                    className="hidden sm:block"
                  />
                </ReactFlow>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <RouteVisualization
              routePlan={generatedRoute}
              selectedDestinations={[startingLocation, ...selectedDestinations]}
            />
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button 
                variant="outline" 
                className="flex-1 w-full text-sm sm:text-base" 
                onClick={handleReset}
              >
                Plan Another Route
              </Button>
              <Button 
                variant="default"
                className="w-full sm:w-auto text-sm sm:text-base"
                onClick={handleClose}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
