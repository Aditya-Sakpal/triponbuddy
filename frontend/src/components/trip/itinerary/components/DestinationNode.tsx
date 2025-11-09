import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MapPin, Info } from "lucide-react";
import { Handle, Position } from "@xyflow/react";

export interface DestinationNodeData {
  label: string;
  location: string;
  isStart: boolean;
  isSelected: boolean;
  day?: number;
  time?: string;
  order?: number;
}

export function DestinationNode({ data }: { data: DestinationNodeData }) {
  const isStart = data.isStart;
  const isSelected = data.isSelected;

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 transition-all cursor-pointer shadow-lg ${
        isStart
          ? "bg-red-50 border-red-500"
          : isSelected
          ? "bg-blue-50 border-blue-500"
          : "bg-white border-gray-300 hover:border-gray-400"
      }`}
      style={{ minWidth: "180px", maxWidth: "200px" }}
    >
      {/* Handles for all directions to support floating edges */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ opacity: 0 }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        style={{ opacity: 0 }}
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{ opacity: 0 }}
      />
      <Handle
        type="target"
        position={Position.Right}
        style={{ opacity: 0 }}
      />
      
      {/* Source handles for outgoing edges */}
      <Handle
        type="source"
        position={Position.Top}
        style={{ opacity: 0 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ opacity: 0 }}
      />
      <Handle
        type="source"
        position={Position.Left}
        style={{ opacity: 0 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ opacity: 0 }}
      />
      
      <div className="flex items-start gap-2">
        <MapPin
          className={`flex-shrink-0 ${
            isStart ? "h-6 w-6 text-red-600" : "h-5 w-5 text-gray-500"
          }`}
        />
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center gap-1">
            <p
              className={`font-semibold text-sm ${
                isStart ? "text-red-900" : "text-gray-900"
              }`}
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "120px"
              }}
            >
              {isStart ? "Starting Point" : data.location}
            </p>
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 flex-shrink-0 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-xs">{data.location}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      {isSelected && !isStart && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow">
          {data.order}
        </div>
      )}
    </div>
  );
}
