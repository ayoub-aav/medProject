// src/components/TraceTimeline.tsx

import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    Animated,
} from 'react-native';
import {
    Package,
    Truck,
    Building2,
    Thermometer,
    Droplet,
    MapPin,
    Calendar,
    ChevronDown,
    ChevronUp,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { getEnvironmentalData } from '@/utils/contract';

export interface EnvironmentalData {
    tempMax: number;
    tempMin: number;
    tempAvg: number;
    humidMax: number;
    humidMin: number;
    humidAvg: number;
    x: string;
    y: string;
    timestamp: number;
}

export interface TracePoint {
    id: string;
    action: string;
    actor: string;
    actorType: 'manufacturer' | 'distributor' | 'pharmacy';
    location: string;
    timestamp: string;
}

interface TraceTimelineProps {
    tracePoints: TracePoint[];
}

interface LocationInfo {
    city: string;
    street: string;
    country: string;
}

const TraceTimeline = ({ tracePoints = [] }: TraceTimelineProps) => {
    const [envData, setEnvData] = useState<EnvironmentalData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
    const [locations, setLocations] = useState<Map<string, LocationInfo>>(new Map());

    // Reverse geocoding function
    const reverseGeocode = async (lat: string, lng: string): Promise<LocationInfo> => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
            );
            const data = await response.json();
            
            return {
                city: data.address?.city || data.address?.town || data.address?.village || 'Unknown City',
                street: data.address?.road || data.address?.street || 'Unknown Street',
                country: data.address?.country || 'Unknown Country'
            };
        } catch (error) {
            console.error('Reverse geocoding failed:', error);
            return {
                city: 'Unknown City',
                street: 'Unknown Street',
                country: 'Unknown Country'
            };
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (tracePoints.length > 0) {
                    const data = await getEnvironmentalData(tracePoints[0].id);
                    setEnvData(data || []);
                    
                    // Fetch location names for all coordinates
                    const locationPromises = (data || []).map(async (item) => {
                        const locationInfo = await reverseGeocode(item.x, item.y);
                        return { coords: `${item.x},${item.y}`, info: locationInfo };
                    });
                    
                    const locationResults = await Promise.all(locationPromises);
                    const locationMap = new Map();
                    locationResults.forEach(({ coords, info }) => {
                        locationMap.set(coords, info);
                    });
                    setLocations(locationMap);
                }
            } catch (e: any) {
                console.error('Error loading environmental data:', e);
                setError('Failed to load environmental data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [tracePoints]);

    const toggleCard = (index: number) => {
        const newExpanded = new Set(expandedCards);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedCards(newExpanded);
    };

    const formatDateShort = (ts: string | number) => {
        const d = typeof ts === 'number' ? new Date(ts * 1000) : new Date(ts);
        return d.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
        });
    };

    const formatDateFull = (ts: string | number) => {
        const d = typeof ts === 'number' ? new Date(ts * 1000) : new Date(ts);
        return d.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getLocationString = (x: string, y: string): string => {
        const coords = `${x},${y}`;
        const locationInfo = locations.get(coords);
        if (locationInfo) {
            return `${locationInfo.city}, ${locationInfo.street}`;
        }
        return `${x}, ${y}`;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Loading locations...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    // Split out manufacturer, distributors, and pharmacy
    const manufacturer = tracePoints[0];
    let pharmacyStartIndex = tracePoints.length - 1;
    
    for (let i = tracePoints.length - 1; i > 0; i--) {
        if (tracePoints[i].location !== tracePoints[i - 1].location) {
            pharmacyStartIndex = i;
            break;
        }
    }
    
    const pharmacy = tracePoints[pharmacyStartIndex];
    const distributors = tracePoints.slice(1, pharmacyStartIndex);

    const renderExpandableCard = (
        data: EnvironmentalData,
        title: string,
        Icon: React.FC<any>,
        index: number,
        showMinMax: boolean = true
    ) => {
        const isExpanded = expandedCards.has(index);
        const dateShort = formatDateShort(data.timestamp);
        const locationName = getLocationString(data.x, data.y);

        return (
            <View key={index} style={[styles.card, styles.expandableCard]}>
                <TouchableOpacity 
                    style={styles.cardHeader} 
                    onPress={() => toggleCard(index)}
                    activeOpacity={0.7}
                >
                    <View style={styles.headerLeft}>
                        <Icon size={20} color="white" />
                        <View>
                            <Text style={styles.cardTitle}>{title}</Text>
                            <Text style={styles.cardSubtitle}>{dateShort} • {locationName}</Text>
                        </View>
                    </View>
                    {isExpanded ? (
                        <ChevronUp size={20} color="white" />
                    ) : (
                        <ChevronDown size={20} color="white" />
                    )}
                </TouchableOpacity>

                {isExpanded && (
                    <Animated.View style={styles.cardContent}>
                        <View style={styles.section}>
                            <View style={styles.environmentRow}>
                                <Thermometer size={16} color={Colors.primary} />
                                <Text style={styles.environmentText}>
                                    Avg Temperature: {data.tempAvg}°C
                                </Text>
                            </View>
                            
                            {showMinMax && (
                                <View style={styles.minMaxRow}>
                                    <Text style={styles.minMaxText}>
                                        Min: {data.tempMin}°C • Max: {data.tempMax}°C
                                    </Text>
                                </View>
                            )}

                            <View style={styles.environmentRow}>
                                <Droplet size={16} color={Colors.primary} />
                                <Text style={styles.environmentText}>
                                    Avg Humidity: {data.humidAvg}%
                                </Text>
                            </View>

                            {showMinMax && (
                                <View style={styles.minMaxRow}>
                                    <Text style={styles.minMaxText}>
                                        Min: {data.humidMin}% • Max: {data.humidMax}%
                                    </Text>
                                </View>
                            )}

                            <View style={styles.divider} />

                            <View style={styles.environmentRow}>
                                <MapPin size={16} color={Colors.secondary} />
                                <Text style={styles.environmentText}>
                                    Location: {locationName}
                                </Text>
                            </View>

                            <View style={styles.environmentRow}>
                                <Calendar size={16} color={Colors.secondary} />
                                <Text style={styles.environmentText}>
                                    Full Date: {formatDateFull(data.timestamp)}
                                </Text>
                            </View>

                            <View style={styles.coordsRow}>
                                <Text style={styles.coordsText}>
                                    Coordinates: {data.x}, {data.y}
                                </Text>
                            </View>
                        </View>
                    </Animated.View>
                )}
            </View>
        );
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
        >
            {/* Manufacturer */}
            {envData[0] && renderExpandableCard(
                envData[0],
                'Manufacturing',
                Package,
                0,
                false
            )}

            {/* Distributors */}
            {distributors.map((pt, idx) =>
                envData[idx + 1] ? renderExpandableCard(
                    envData[idx + 1],
                    `Distribution Checkpoint ${idx + 1}`,
                    Truck,
                    idx + 1,
                    true
                ) : null
            )}

            {/* Pharmacy */}
            {pharmacy && envData[envData.length - 1] && renderExpandableCard(
                envData[envData.length - 1],
                'Pharmacy',
                Building2,
                envData.length - 1,
                true
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    contentContainer: {
        padding: 16,
        gap: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 16,
        color: Colors.text,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    errorText: {
        fontSize: 16,
        color: Colors.error,
        textAlign: 'center',
    },
    card: {
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: Colors.white,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    expandableCard: {
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: Colors.primary,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.white,
    },
    cardSubtitle: {
        fontSize: 13,
        color: Colors.white,
        opacity: 0.9,
        marginTop: 2,
    },
    cardContent: {
        padding: 16,
    },
    section: {
        gap: 12,
    },
    environmentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    environmentText: {
        fontSize: 14,
        color: Colors.text,
        flex: 1,
    },
    minMaxRow: {
        marginLeft: 24,
        marginTop: -4,
    },
    minMaxText: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontStyle: 'italic',
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: 8,
    },
    coordsRow: {
        marginTop: 8,
        padding: 8,
        backgroundColor: Colors.lightBackground,
        borderRadius: 6,
    },
    coordsText: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontFamily: 'monospace',
    },
});

export default TraceTimeline;