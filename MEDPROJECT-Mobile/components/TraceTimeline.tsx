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

interface RawMaterial {
    nom: string;
    origine: string;
    fournisseur: string;
    degrePurete: string;
}


interface TraceTimelineProps {
    tracePoints: TracePoint[];
}

interface ExpandableCardProps {
    data: EnvironmentalData;
    title: string;
    Icon: React.FC<any>;
    actor: string;
    location: string;
    timestamp: string;
    showMinMax?: boolean;
}

const ExpandableCard = ({
    data,
    title,
    Icon,
    actor,
    location,
    timestamp,
    showMinMax = true,
}: ExpandableCardProps) => {
    const [expanded, setExpanded] = useState(false);
    const [address, setAddress] = useState('');
    const animatedHeight = new Animated.Value(0);

    useEffect(() => {
        // Fetch address from coordinates
        const fetchAddress = async () => {
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${data.y}&lon=${data.x}`
                );
                const result = await response.json();
                if (result.display_name) {
                    // Extract city and street from the full address
                    const addressParts = result.display_name.split(',');
                    const street = addressParts[0];
                    const city = addressParts[1]?.trim() || '';
                    setAddress(`${street}, ${city}`);
                }
            } catch (error) {
                console.error('Error fetching address:', error);
                setAddress(`${data.x}, ${data.y}`);
            }
        };

        fetchAddress();
    }, [data.x, data.y]);

    const toggleExpand = () => {
        setExpanded(!expanded);
        Animated.timing(animatedHeight, {
            toValue: expanded ? 0 : 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
    };

    const formatDate = (ts: string | number) => {
        const d = typeof ts === 'number' ? new Date(ts * 1000) : new Date(ts);
        return d.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
        });
    };

    const contentHeight = animatedHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 300], // Adjust this value based on your content height
    });

    return (
        <View style={[styles.card, styles.manufacturerCard]}>
            <TouchableOpacity
                style={styles.cardHeader}
                onPress={toggleExpand}
                activeOpacity={0.7}
            >
                <View style={styles.headerContent}>
                    <Icon size={20} color="white" />
                    <Text style={styles.cardTitle}>{title}</Text>
                </View>
                <View style={styles.headerRight}>
                    <Text style={styles.dateText}>{formatDate(timestamp)}</Text>
                    <Animated.View
                        style={{
                            transform: [
                                {
                                    rotate: animatedHeight.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0deg', '180deg'],
                                    }),
                                },
                            ],
                        }}
                    >
                        <ChevronDown size={20} color="white" />
                    </Animated.View>
                </View>
            </TouchableOpacity>
            <Animated.View style={{ height: contentHeight, overflow: 'hidden' }}>
                <View style={styles.cardContent}>
                    <View style={styles.section}>
                        <View style={styles.environmentRow}>
                            <Thermometer size={16} />
                            <Text style={styles.environmentText}>
                                Avg Temp: {data.tempAvg}°C
                            </Text>
                        </View>
                        {showMinMax && (
                            <>
                                <View style={styles.environmentRow}>
                                    <Thermometer size={16} />
                                    <Text style={styles.environmentText}>
                                        Max Temp: {data.tempMax}°C
                                    </Text>
                                </View>
                                <View style={styles.environmentRow}>
                                    <Thermometer size={16} />
                                    <Text style={styles.environmentText}>
                                        Min Temp: {data.tempMin}°C
                                    </Text>
                                </View>
                            </>
                        )}
                        <View style={styles.environmentRow}>
                            <Droplet size={16} />
                            <Text style={styles.environmentText}>
                                Avg Humidity: {data.humidAvg}%
                            </Text>
                        </View>
                        {showMinMax && (
                            <>
                                <View style={styles.environmentRow}>
                                    <Droplet size={16} />
                                    <Text style={styles.environmentText}>
                                        Max Humidity: {data.humidMax}%
                                    </Text>
                                </View>
                                <View style={styles.environmentRow}>
                                    <Droplet size={16} />
                                    <Text style={styles.environmentText}>
                                        Min Humidity: {data.humidMin}%
                                    </Text>
                                </View>
                            </>
                        )}
                        <View style={styles.environmentRow}>
                            <MapPin size={16} />
                            <Text style={styles.environmentText}>
                                Location: {address}
                            </Text>
                        </View>
                        <View style={styles.environmentRow}>
                            <Calendar size={16} />
                            <Text style={styles.environmentText}>
                                Time: {new Date(data.timestamp * 1000).toLocaleTimeString()}
                            </Text>
                        </View>
                    </View>
                </View>
            </Animated.View>
        </View>
    );
};

const TraceTimeline = ({ tracePoints = [] }: TraceTimelineProps) => {
    const [envData, setEnvData] = useState<EnvironmentalData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (tracePoints.length > 0) {
                    const data = await getEnvironmentalData(tracePoints[0].id);
                    setEnvData(data || []);
                    console.log(envData);
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

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
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

    // Split out manufacturer, distributors, and pharmacy based on location changes
    const manufacturer = tracePoints[0];
    let pharmacyStartIndex = tracePoints.length - 1;
    
    // Find the start of the pharmacy section by checking location changes
    for (let i = tracePoints.length - 1; i > 0; i--) {
        if (tracePoints[i].location !== tracePoints[i - 1].location) {
            pharmacyStartIndex = i;
            break;
        }
    }
    
    const pharmacy = tracePoints[pharmacyStartIndex];
    const distributors = tracePoints.slice(1, pharmacyStartIndex);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
        >
            {/* Manufacturer */}
            {envData[0] && (
                <ExpandableCard
                    data={envData[0]}
                    title="Manufacturing"
                    Icon={Package}
                    actor={manufacturer.actor}
                    location={manufacturer.location}
                    timestamp={manufacturer.timestamp}
                    showMinMax={false}
                />
            )}

            {/* Distributors */}
            {distributors.map((pt, idx) =>
                envData[idx + 1] ? (
                    <ExpandableCard
                        key={pt.id}
                        data={envData[idx + 1]}
                        title={`Distribution Checkpoint ${idx + 1}`}
                        Icon={Truck}
                        actor={pt.actor}
                        location={pt.location}
                        timestamp={pt.timestamp}
                        showMinMax={true}
                    />
                ) : null
            )}

            {/* Pharmacy */}
            {pharmacy && envData[envData.length - 1] && (
                <ExpandableCard
                    data={envData[envData.length - 1]}
                    title="Pharmacy"
                    Icon={Building2}
                    actor={pharmacy.actor}
                    location={pharmacy.location}
                    timestamp={pharmacy.timestamp}
                    showMinMax={true}
                />
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
        gap: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: Colors.white,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    manufacturerCard: {
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: Colors.primary,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.white,
    },
    cardContent: {
        padding: 16,
        gap: 12,
    },
    infoLabel: {
        fontSize: 14,
        color: Colors.text,
        marginBottom: 4,
    },
    section: {
        marginTop: 8,
        gap: 6,
    },
    environmentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    environmentText: {
        fontSize: 13,
        color: Colors.text,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dateText: {
        fontSize: 14,
        color: Colors.white,
    },
});

export default TraceTimeline;
