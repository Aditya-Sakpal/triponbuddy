import { Car, Train, Bus, Ship, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LocalTransportation } from "@/constants";

interface LocalTransportationPanelProps {
  localTransportation: LocalTransportation[];
  hideBookingButtons?: boolean;
}

const bookingServices = [
  { name: "Uber", url: "https://www.uber.com", icon: Car },
  { name: "Ola Cabs", url: "https://www.olacabs.com", icon: Car },
  { name: "Rapido", url: "https://www.rapido.bike", icon: Bus },
  { name: "redBus", url: "https://www.redbus.in", icon: Bus },
  { name: "IRCTC", url: "https://www.irctc.co.in", icon: Train },
  { name: "Yatra", url: "https://www.yatra.com", icon: Ship },
];

export const LocalTransportationPanel = ({ localTransportation, hideBookingButtons = false }: LocalTransportationPanelProps) => {
  if (localTransportation.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <CardTitle className="text-xl">Booking/Info</CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
          {localTransportation.map((transport, index) => (
            <div key={index} className="mb-3 last:mb-0">
              <p className="text-sm leading-relaxed text-gray-800">
                <span className="font-semibold">{transport.type.charAt(0).toUpperCase() + transport.type.slice(1)}:</span> {transport.description}
              </p>
              {transport.booking_info && (
                <p className="text-sm text-gray-700 mt-1 ml-4">{transport.booking_info}</p>
              )}
            </div>
          ))}
        </div>

        {!hideBookingButtons && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {bookingServices.map((service) => {
              const Icon = service.icon;
              return (
                <Button
                  key={service.name}
                  size="sm"
                  className="flex items-center gap-2 hover:bg-blue-700 transition-all"
                  onClick={() => window.open(service.url, '_blank')}
                >
                  <Icon className="w-4 h-4 text-white" />
                  <span className="text-sm font-medium">{service.name}</span>
                </Button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};