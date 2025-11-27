import { useState } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { LocationAutocomplete } from "@/components/shared/location-autocomplete";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MapPin, GripVertical, X, Plus, Info } from "lucide-react";

interface DestinationItem {
  id: string;
  location: string;
}

interface SortableDestinationProps {
  destination: DestinationItem;
  index: number;
  onRemove: () => void;
  canRemove: boolean;
}

const SortableDestination = ({ destination, index, onRemove, canRemove }: SortableDestinationProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: destination.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-card border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
            <p className="text-sm font-medium truncate">{destination.location}</p>
          </div>
          {index === 0 && (
            <p className="text-xs text-muted-foreground mt-1">Starting destination</p>
          )}
        </div>
        {canRemove && (
          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

interface DestinationListProps {
  destinations: string[];
  onChange: (destinations: string[]) => void;
  isInternational: boolean;
  className?: string;
  onPendingDestinationChange?: (destination: string) => void;
}

export const DestinationList = ({ destinations, onChange, isInternational, className = "", onPendingDestinationChange }: DestinationListProps) => {
  const [newDestination, setNewDestination] = useState("");
  
  // Notify parent of pending destination changes
  const handleNewDestinationChange = (value: string) => {
    setNewDestination(value);
    onPendingDestinationChange?.(value);
  };
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Convert destinations to items with IDs
  const destinationItems: DestinationItem[] = destinations.map((dest, index) => ({
    id: `dest-${index}-${dest}`,
    location: dest,
  }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = destinationItems.findIndex((item) => item.id === active.id);
      const newIndex = destinationItems.findIndex((item) => item.id === over.id);
      const reordered = arrayMove(destinationItems, oldIndex, newIndex);
      onChange(reordered.map(item => item.location));
    }
  };

  const handleAddDestination = () => {
    if (newDestination.trim()) {
      onChange([...destinations, newDestination.trim()]);
      setNewDestination("");
    }
  };

  const handleRemoveDestination = (index: number) => {
    const updated = destinations.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className={className}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">
              Destinations <span className="text-destructive">*</span>
            </label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Add places you want to visit. Drag to reorder your route.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          {destinations.length > 1 && (
            <span className="text-xs text-muted-foreground">
              {destinations.length} destinations • Drag to reorder
            </span>
          )}
        </div>

        {/* Existing destinations with drag-and-drop */}
        {destinationItems.length > 0 && (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={destinationItems.map((d) => d.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg border border-dashed">
                {destinationItems.map((dest, index) => (
                  <SortableDestination
                    key={dest.id}
                    destination={dest}
                    index={index}
                    onRemove={() => handleRemoveDestination(index)}
                    canRemove={true}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Add new destination */}
        <div className="flex gap-2">
          <div className="flex-1">
            <LocationAutocomplete
              value={newDestination}
              onChange={handleNewDestinationChange}
              placeholder={destinations.length === 0 ? "Enter your first destination" : "Add another destination"}
              icon={<MapPin className="w-4 h-4 text-primary" />}
              isInternational={isInternational}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleAddDestination}
            disabled={!newDestination.trim()}
            className="flex-shrink-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {destinations.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Your trip will follow this route in order. The last destination is your final stop.
          </p>
        )}
      </div>
    </div>
  );
};
