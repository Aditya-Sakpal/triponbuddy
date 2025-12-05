import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type SortOption = "date-newest" | "date-oldest";
type TripTypeOption = "all" | "domestic" | "international";

interface TripControlsProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  tripType: TripTypeOption;
  onTripTypeChange: (value: TripTypeOption) => void;
}

export const TripControls = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  tripType,
  onTripTypeChange,
}: TripControlsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Sort by</label>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-newest">Date (Newest First)</SelectItem>
            <SelectItem value="date-oldest">Date (Oldest First)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Type</label>
        <Select value={tripType} onValueChange={onTripTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Trip type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Trips</SelectItem>
            <SelectItem value="domestic">Domestic</SelectItem>
            <SelectItem value="international">International</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search trips by name or destination..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
    </div>
  );
};
