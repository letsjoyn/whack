import { motion } from "framer-motion";
import { AlertTriangle, Clock, MapPin, Users, ExternalLink, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EndangeredPlace } from "@/services/EndangeredPlacesService";
import { useNavigate } from "react-router-dom";

interface EndangeredPlacesInlineProps {
  places: EndangeredPlace[];
  destination: string;
  isLoading?: boolean;
  onAddToTrip?: (place: EndangeredPlace) => void;
}

const threatColors = {
  critical: "text-red-600 bg-red-50 border-red-200",
  high: "text-orange-600 bg-orange-50 border-orange-200",
  moderate: "text-yellow-600 bg-yellow-50 border-yellow-200"
};

const EndangeredPlacesInline = ({ places, destination, isLoading, onAddToTrip }: EndangeredPlacesInlineProps) => {
  const navigate = useNavigate();

  const handleViewAllEndangered = () => {
    navigate('/stays');
  };

  const handlePlaceClick = (place: EndangeredPlace) => {
    if (onAddToTrip) {
      onAddToTrip(place);
    } else {
      navigate('/stays', { state: { selectedPlace: place } });
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl">🌍</div>
          <div>
            <h3 className="font-semibold text-lg">Endangered Places Near {destination}</h3>
            <p className="text-sm text-muted-foreground">Loading nearby places that need your witness...</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex gap-4 p-4 border rounded-lg">
                <div className="w-20 h-16 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (places.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl">🌍</div>
          <div>
            <h3 className="font-semibold text-lg">Endangered Places Near {destination}</h3>
            <p className="text-sm text-muted-foreground">Discover places that need urgent attention</p>
          </div>
        </div>
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="font-medium text-gray-900 mb-2">No Endangered Places Found Nearby</h4>
          <p className="text-sm text-gray-600 mb-4">
            We couldn't find any endangered places near {destination}, but there are many others around the world.
          </p>
          <Button onClick={handleViewAllEndangered} variant="outline" size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            Explore All Endangered Places
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🌍</div>
          <div>
            <h3 className="font-semibold text-lg">Endangered Places Near {destination}</h3>
            <p className="text-sm text-muted-foreground">
              {places.length} places that need your witness before they disappear
            </p>
          </div>
        </div>
        <Button onClick={handleViewAllEndangered} variant="outline" size="sm">
          <ExternalLink className="w-4 h-4 mr-2" />
          View All
        </Button>
      </div>

      <div className="space-y-3">
        {places.slice(0, 3).map((place, index) => (
          <motion.div
            key={place.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group border rounded-lg overflow-hidden hover:shadow-md transition-all"
          >
            <div className="flex gap-4 p-4">
              {/* Image */}
              <div className="w-20 h-16 flex-shrink-0 rounded overflow-hidden">
                <img
                  src={place.image}
                  alt={place.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                      {place.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{place.location}</span>
                    </div>
                  </div>
                  
                  {/* Threat Level Badge */}
                  <div className={`px-2 py-0.5 rounded-full border text-xs font-medium ml-2 ${threatColors[place.threatLevel]}`}>
                    {place.threatLevel.toUpperCase()}
                  </div>
                </div>
                
                {/* Stats and Add Button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span className="font-medium text-red-600">
                        {place.yearsRemaining} years left
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{place.witnesses} witnesses</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{place.threats.length} threats</span>
                    </div>
                  </div>
                  
                  {onAddToTrip && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-6 px-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                      onClick={() => handlePlaceClick(place)}
                    >
                      Add to Trip
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {places.length > 3 && (
        <div className="mt-4 text-center">
          <Button onClick={handleViewAllEndangered} variant="outline" size="sm">
            View {places.length - 3} More Endangered Places
          </Button>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-700">
          💡 <strong>Tip:</strong> Consider adding these endangered places as side visits to your journey. 
          Every witness helps preserve these precious locations for future generations.
        </p>
      </div>
    </Card>
  );
};

export default EndangeredPlacesInline;