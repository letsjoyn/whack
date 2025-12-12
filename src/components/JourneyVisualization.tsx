import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plane,
  Train,
  Bus,
  Car,
  MapPin,
  Clock,
  DollarSign,
  Navigation,
  Footprints,
  Coffee,
  Utensils,
  Bed,
  ArrowRight,
  CheckCircle,
  Info,
  ExternalLink,
  Smartphone,
  CreditCard,
  X,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

interface TransportOption {
  id: string;
  type: 'walk' | 'bus' | 'metro' | 'train' | 'flight' | 'car' | 'taxi' | 'rapido' | 'auto';
  from: string;
  to: string;
  duration: string;
  cost?: string;
  distance?: string;
  provider: string;
  description: string;
  nextOptions?: TransportOption[];
  bookingUrl?: string;
}

interface JourneyStep {
  id: string;
  title: string;
  location: string;
  options: TransportOption[];
}

interface JourneyVisualizationProps {
  aiResponse: string;
  journeyType: 'outbound' | 'return';
  userName?: string;
  onSummaryUpdate?: (summary: { duration: string; cost: number; modes: number }) => void;
}

const JourneyVisualization: React.FC<JourneyVisualizationProps> = ({
  aiResponse,
  journeyType,
  userName = 'Traveler',
  onSummaryUpdate,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<TransportOption[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Parse AI response and create intelligent decision tree
  const createJourneyTree = (): JourneyStep[] => {
    const steps: JourneyStep[] = [];
    const lines = aiResponse.split('\n').filter(line => line.trim());

    const currentLocation = 'Home';
    const stepCounter = 1;

    // Parse AI response to extract journey segments
    const segments = [];
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (
        trimmedLine.includes('Walk') ||
        trimmedLine.includes('Metro') ||
        trimmedLine.includes('Bus') ||
        trimmedLine.includes('Train') ||
        trimmedLine.includes('Flight') ||
        trimmedLine.includes('Taxi') ||
        trimmedLine.includes('Auto') ||
        trimmedLine.includes('Cab')
      ) {
        segments.push(trimmedLine);
      }
    }

    // Create decision tree based on parsed segments
    if (segments.length > 0) {
      // Step 1: From Home - Always start with local transport options
      const homeOptions: TransportOption[] = [];

      // Check if AI mentions walking
      if (segments.some(s => s.toLowerCase().includes('walk'))) {
        homeOptions.push({
          id: 'walk-local',
          type: 'walk',
          from: 'Home',
          to: 'Nearest Transit',
          duration: '10-15 min',
          distance: '1 km',
          cost: 'Free',
          provider: 'Walking',
          description: 'Walk to nearest transit point',
          bookingUrl: undefined,
        });
      }

      // Always add local transport options
      homeOptions.push(
        {
          id: 'rapido-transit',
          type: 'rapido',
          from: 'Home',
          to: 'Transit Point',
          duration: '5-8 min',
          distance: '1-2 km',
          cost: '₹30-60',
          provider: 'Rapido',
          description: 'Bike ride to transit',
          bookingUrl: 'https://rapido.bike',
        },
        {
          id: 'auto-transit',
          type: 'auto',
          from: 'Home',
          to: 'Transit Point',
          duration: '8-12 min',
          distance: '1-2 km',
          cost: '₹50-100',
          provider: 'Auto Rickshaw',
          description: 'Auto to transit point',
          bookingUrl: undefined,
        }
      );

      // Add direct options based on distance (inferred from AI response)
      const hasLongDistance = segments.some(
        s =>
          s.toLowerCase().includes('flight') ||
          s.toLowerCase().includes('train') ||
          s.toLowerCase().includes('airport')
      );

      if (hasLongDistance) {
        homeOptions.push({
          id: 'cab-direct',
          type: 'taxi',
          from: 'Home',
          to: 'Airport/Station',
          duration: '30-60 min',
          distance: '15-30 km',
          cost: '₹400-800',
          provider: 'Uber/Ola',
          description: 'Direct cab to airport/station',
          bookingUrl: 'https://uber.com',
        });
      } else {
        homeOptions.push({
          id: 'cab-destination',
          type: 'taxi',
          from: 'Home',
          to: 'Final Destination',
          duration: '45-90 min',
          distance: '20-50 km',
          cost: '₹600-1500',
          provider: 'Uber/Ola',
          description: 'Direct cab to destination',
          bookingUrl: 'https://uber.com',
        });
      }

      steps.push({
        id: 'step-1',
        title: 'From Your Home',
        location: 'Starting Point',
        options: homeOptions,
      });

      // Step 2: From Transit Point (if not direct)
      if (hasLongDistance) {
        const transitOptions: TransportOption[] = [];

        if (segments.some(s => s.toLowerCase().includes('metro'))) {
          transitOptions.push({
            id: 'metro-main',
            type: 'metro',
            from: 'Metro Station',
            to: 'Airport/Main Station',
            duration: '20-40 min',
            distance: '10-25 km',
            cost: '₹40-80',
            provider: 'Metro Rail',
            description: 'Metro to airport/main station',
            bookingUrl: 'https://paytm.com/metro-card-recharge',
          });
        }

        if (segments.some(s => s.toLowerCase().includes('bus'))) {
          transitOptions.push({
            id: 'bus-main',
            type: 'bus',
            from: 'Bus Stop',
            to: 'Airport/Station',
            duration: '30-60 min',
            distance: '15-30 km',
            cost: '₹30-60',
            provider: 'City Bus',
            description: 'Bus to airport/station',
            bookingUrl: 'https://redbus.in',
          });
        }

        transitOptions.push({
          id: 'cab-main',
          type: 'taxi',
          from: 'Transit Point',
          to: 'Airport/Station',
          duration: '25-45 min',
          distance: '15-25 km',
          cost: '₹300-600',
          provider: 'Uber/Ola',
          description: 'Cab to airport/station',
          bookingUrl: 'https://uber.com',
        });

        steps.push({
          id: 'step-2',
          title: 'From Transit Point',
          location: 'Metro/Bus Station',
          options: transitOptions,
        });

        // Step 3: Long Distance Transport
        const longDistanceOptions: TransportOption[] = [];

        if (segments.some(s => s.toLowerCase().includes('flight'))) {
          longDistanceOptions.push({
            id: 'flight-dest',
            type: 'flight',
            from: 'Origin Airport',
            to: 'Destination Airport',
            duration: '1-3 hours',
            distance: '500-2000 km',
            cost: '₹3000-8000',
            provider: 'Airlines',
            description: 'Flight to destination',
            bookingUrl: 'https://makemytrip.com',
          });
        }

        if (segments.some(s => s.toLowerCase().includes('train'))) {
          longDistanceOptions.push({
            id: 'train-dest',
            type: 'train',
            from: 'Origin Station',
            to: 'Destination Station',
            duration: '4-15 hours',
            distance: '200-1500 km',
            cost: '₹500-2000',
            provider: 'Indian Railways',
            description: 'Train to destination',
            bookingUrl: 'https://irctc.co.in',
          });
        }

        if (longDistanceOptions.length > 0) {
          steps.push({
            id: 'step-3',
            title: 'Long Distance Travel',
            location: 'Airport/Railway Station',
            options: longDistanceOptions,
          });
        }

        // Step 4: At Destination
        steps.push({
          id: 'step-4',
          title: 'At Your Destination',
          location: 'Destination Airport/Station',
          options: [
            {
              id: 'walk-final',
              type: 'walk',
              from: 'Airport/Station',
              to: 'Final Destination',
              duration: '5-15 min',
              distance: '0.5-1 km',
              cost: 'Free',
              provider: 'Walking',
              description: 'Walk to final destination',
              bookingUrl: undefined,
            },
            {
              id: 'taxi-final',
              type: 'taxi',
              from: 'Airport/Station',
              to: 'Final Destination',
              duration: '15-30 min',
              distance: '5-20 km',
              cost: '₹200-500',
              provider: 'Local Taxi/Uber',
              description: 'Cab to final destination',
              bookingUrl: 'https://uber.com',
            },
            {
              id: 'bus-final',
              type: 'bus',
              from: 'Airport/Station',
              to: 'City Center',
              duration: '20-45 min',
              distance: '10-25 km',
              cost: '₹30-80',
              provider: 'Local Bus',
              description: 'Local bus to city',
              bookingUrl: undefined,
            },
          ],
        });
      } else {
        // Short distance journey - no flights/trains needed
        steps.push({
          id: 'step-2',
          title: 'Local Transport Options',
          location: 'Within City',
          options: [
            {
              id: 'metro-dest',
              type: 'metro',
              from: 'Metro Station',
              to: 'Destination Station',
              duration: '20-45 min',
              distance: '10-30 km',
              cost: '₹40-80',
              provider: 'Metro Rail',
              description: 'Metro to destination area',
              bookingUrl: 'https://paytm.com/metro-card-recharge',
            },
            {
              id: 'bus-dest',
              type: 'bus',
              from: 'Bus Stop',
              to: 'Destination',
              duration: '30-60 min',
              distance: '15-40 km',
              cost: '₹25-60',
              provider: 'City Bus',
              description: 'Bus to destination',
              bookingUrl: 'https://redbus.in',
            },
            {
              id: 'cab-dest',
              type: 'taxi',
              from: 'Current Location',
              to: 'Final Destination',
              duration: '25-50 min',
              distance: '15-40 km',
              cost: '₹300-800',
              provider: 'Uber/Ola',
              description: 'Direct cab to destination',
              bookingUrl: 'https://uber.com',
            },
          ],
        });
      }
    }

    return steps;
  };

  const getStepIcon = (type: TransportOption['type']) => {
    const iconProps = { className: 'h-4 w-4' };

    switch (type) {
      case 'walk':
        return <Footprints {...iconProps} />;
      case 'bus':
        return <Bus {...iconProps} />;
      case 'metro':
        return <Train {...iconProps} />;
      case 'train':
        return <Train {...iconProps} />;
      case 'flight':
        return <Plane {...iconProps} />;
      case 'car':
        return <Car {...iconProps} />;
      case 'taxi':
        return <Car {...iconProps} />;
      case 'rapido':
        return <Car {...iconProps} />;
      case 'auto':
        return <Car {...iconProps} />;
      default:
        return <Navigation {...iconProps} />;
    }
  };

  const getStepColor = (type: TransportOption['type']) => {
    switch (type) {
      case 'walk':
        return 'bg-success/10 text-success border-success/20';
      case 'bus':
        return 'bg-info/10 text-info border-info/20';
      case 'metro':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'train':
        return 'bg-primary/15 text-primary border-primary/25';
      case 'flight':
        return 'bg-info/15 text-info border-info/25';
      case 'car':
      case 'taxi':
      case 'rapido':
      case 'auto':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-secondary text-secondary-foreground border-border';
    }
  };

  const journeySteps = createJourneyTree();
  const currentStep = journeySteps[currentStepIndex];

  const handleOptionSelect = (option: TransportOption) => {
    // Check if this step already has a selection
    const existingSelectionIndex = selectedOptions.findIndex(
      selected =>
        journeySteps.findIndex(step => step.options.some(opt => opt.id === selected.id)) ===
        currentStepIndex
    );

    let newSelectedOptions;
    if (existingSelectionIndex !== -1) {
      // Replace existing selection for this step
      newSelectedOptions = [...selectedOptions];
      newSelectedOptions[currentStepIndex] = option;
    } else {
      // Add new selection
      newSelectedOptions = [...selectedOptions];
      newSelectedOptions[currentStepIndex] = option;
    }

    setSelectedOptions(newSelectedOptions);

    // Move to next step if available
    if (currentStepIndex < journeySteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleReset = () => {
    setSelectedOptions([]);
    setCurrentStepIndex(0);
  };

  const getTotalCost = () => {
    return selectedOptions.reduce((total, option) => {
      const cost = option.cost?.replace(/[₹$€£,]/g, '') || '0';
      return total + (cost === 'Free' ? 0 : parseInt(cost));
    }, 0);
  };

  const getTotalDuration = () => {
    let totalMinutes = 0;
    selectedOptions.forEach(option => {
      const duration = option.duration;
      if (duration.includes('hour')) {
        const hours = parseInt(duration.match(/(\d+)h/)?.[1] || '0');
        const minutes = parseInt(duration.match(/(\d+)min/)?.[1] || '0');
        totalMinutes += hours * 60 + minutes;
      } else if (duration.includes('min')) {
        totalMinutes += parseInt(duration.match(/(\d+)/)?.[1] || '0');
      }
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
  };

  // Update parent component with summary data
  useEffect(() => {
    if (onSummaryUpdate) {
      onSummaryUpdate({
        duration: getTotalDuration(),
        cost: getTotalCost(),
        modes: selectedOptions.length,
      });
    }
  }, [selectedOptions, onSummaryUpdate]);

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 px-2">
      {/* Progress Header */}
      <Card className="bg-gradient-accent text-primary-foreground border-2 shadow-lg">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="font-bold text-2xl md:text-3xl mb-2">
                {journeyType === 'outbound' ? '🚀 Plan Your Journey' : '🏠 Plan Return Journey'}
              </h3>
              <p className="text-primary-foreground/90 text-sm md:text-base">
                Choose your preferred transport at each step to complete your door-to-door itinerary
              </p>
            </div>
            <div className="flex flex-col items-center lg:items-end gap-3">
              <div className="bg-primary-foreground/20 backdrop-blur-sm px-8 py-4 rounded-2xl border-2 border-primary-foreground/30 shadow-lg">
                <p className="text-xs text-primary-foreground/80 uppercase tracking-widest mb-1 text-center font-semibold">
                  Progress
                </p>
                <p className="text-4xl md:text-5xl font-bold text-center tabular-nums">
                  {currentStepIndex + 1}
                  <span className="text-2xl text-primary-foreground/70 mx-2">/</span>
                  {journeySteps.length}
                </p>
              </div>
              <div className="flex gap-2">
                {journeySteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-3 w-16 rounded-full transition-all duration-300 ${index < currentStepIndex
                        ? 'bg-primary-foreground shadow-lg'
                        : index === currentStepIndex
                          ? 'bg-primary-foreground animate-pulse shadow-lg scale-110'
                          : 'bg-primary-foreground/30'
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left: Current Step Options */}
        <div className="xl:col-span-3">
          {currentStep && (
            <Card className="shadow-md">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 rounded-full bg-primary/10">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      {currentStep.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-2 ml-14">
                      Choose how you want to travel from {currentStep.location}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentStep.options.map(option => {
                  const isSelected = selectedOptions[currentStepIndex]?.id === option.id;
                  return (
                    <Card
                      key={option.id}
                      className={`cursor-pointer transition-all hover:shadow-lg border-2 interactive-hover ${isSelected
                          ? 'border-primary bg-primary/5 shadow-lg scale-[1.02]'
                          : 'hover:border-primary/50 hover:scale-[1.01]'
                        }`}
                      onClick={() => handleOptionSelect(option)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div
                              className={`p-3 rounded-xl ${getStepColor(option.type)} flex-shrink-0`}
                            >
                              {getStepIcon(option.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-base">{option.description}</h4>
                                {isSelected && (
                                  <Badge variant="default" className="text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Selected
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground font-medium mb-1">
                                {option.provider}
                              </p>
                              <p className="text-xs text-muted-foreground/70">
                                {option.from} → {option.to}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="flex flex-col gap-2 items-end">
                              <Badge variant="outline" className="text-xs font-medium">
                                <Clock className="h-3 w-3 mr-1" />
                                {option.duration}
                              </Badge>
                              <Badge variant="secondary" className="text-sm font-bold">
                                {option.cost}
                              </Badge>
                              {option.distance && (
                                <p className="text-xs text-muted-foreground">{option.distance}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Journey Complete */}
          {currentStepIndex >= journeySteps.length && (
            <Card className="bg-success/10 border-success/20 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="bg-success/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-12 w-12 text-success" />
                </div>
                <h3 className="text-2xl font-bold text-success mb-2">Journey Planned!</h3>
                <p className="text-sm text-success/80 mb-6">
                  Your complete door-to-door journey is ready to book
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={handleReset} variant="outline" size="lg">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Plan Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Selected Journey Summary */}
        <div className="xl:col-span-2">
          <div className="sticky top-4 space-y-4">
            <Card className="shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Navigation className="h-5 w-5 text-primary" />
                  </div>
                  Your Journey
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Track your selected transport options
                </p>
              </CardHeader>
              <CardContent className="space-y-3 pb-4">
                {/* Selected Options */}
                <div className="space-y-3">
                  {journeySteps.map((step, stepIndex) => {
                    const selectedOption = selectedOptions[stepIndex];
                    const isBooked = selectedOption !== undefined;
                    const isCurrent = stepIndex === currentStepIndex;
                    const isPast = stepIndex < currentStepIndex;

                    return (
                      <div
                        key={step.id}
                        className={`border-2 rounded-xl p-3 transition-all ${isBooked
                            ? 'bg-primary/5 border-primary/40 shadow-sm'
                            : isCurrent
                              ? 'bg-muted/50 border-muted-foreground/40 animate-pulse'
                              : 'bg-background border-border opacity-60'
                          }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-base shadow-sm ${isBooked
                                ? 'bg-primary text-primary-foreground'
                                : isCurrent
                                  ? 'bg-muted-foreground text-background'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                          >
                            {stepIndex + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {step.title}
                              </p>
                              {isBooked && (
                                <Badge variant="default" className="text-xs shadow-sm">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Booked
                                </Badge>
                              )}
                              {isCurrent && !isBooked && (
                                <Badge variant="outline" className="text-xs animate-pulse">
                                  Current Step
                                </Badge>
                              )}
                            </div>
                            {isBooked ? (
                              <div className="flex items-start gap-3 mt-2">
                                <div
                                  className={`p-2 rounded-lg ${getStepColor(selectedOption.type)} flex-shrink-0`}
                                >
                                  {getStepIcon(selectedOption.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold mb-1">
                                    {selectedOption.description}
                                  </p>
                                  <p className="text-xs text-muted-foreground mb-1 font-medium">
                                    {selectedOption.provider}
                                  </p>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline" className="text-xs">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {selectedOption.duration}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs font-bold">
                                      {selectedOption.cost}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground mt-1 italic">
                                {isCurrent
                                  ? '⏳ Waiting for your selection...'
                                  : '⏸️ Pending selection'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {selectedOptions.length === 0 && journeySteps.length > 0 && (
                    <div className="text-center py-6">
                      <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                        <Navigation className="h-7 w-7 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Start building your journey by selecting transport options
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>



            {/* Confirm & Book Journey Button - Only show when all steps are selected */}
            {selectedOptions.length === journeySteps.length && journeySteps.length > 0 && (
              <Card className="shadow-lg border-2 border-primary">
                <CardContent className="p-4">
                  <Button className="w-full h-12 text-base font-semibold" size="lg">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Confirm & Book Journey
                    <span className="ml-2.5 text-sm opacity-90">
                      ₹{getTotalCost().toLocaleString()}
                    </span>
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    All {journeySteps.length} steps selected • Ready to book
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JourneyVisualization;
