// src/components/TraceTimeline.tsx

import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import {
    Package,
    Truck,
    Building2,
    Thermometer,
    Droplet,
    MapPin,
    Calendar,
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

    // Split out manufacturer, distributors, and pharmacy
    const manufacturer = tracePoints[0];
    const distributors = tracePoints.slice(1, -1);
    const pharmacy = tracePoints[tracePoints.length - 1];

    const formatDate = (ts: string | number) => {
        const d =
            typeof ts === 'number' ? new Date(ts * 1000) : new Date(ts);
        return d.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderEnvironmentalCard = (
        data: EnvironmentalData,
        title: string,
        Icon: React.FC<any>,
        actor: string,
        location: string,
        timestamp: string
    ) => (
        <View style={[styles.card, styles.manufacturerCard]}>
            <View style={styles.cardHeader}>
                <Icon size={20} color="white" />
                <Text style={styles.cardTitle}>{title}</Text>
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.infoLabel}>Actor: {actor}</Text>
                <Text style={styles.infoLabel}>Location: {location}</Text>
                <Text style={styles.infoLabel}>Date: {formatDate(timestamp)}</Text>
                <View style={styles.section}>
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
                    <View style={styles.environmentRow}>
                        <Thermometer size={16} />
                        <Text style={styles.environmentText}>
                            Avg Temp: {data.tempAvg}°C
                        </Text>
                    </View>
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
                    <View style={styles.environmentRow}>
                        <Droplet size={16} />
                        <Text style={styles.environmentText}>
                            Avg Humidity: {data.humidAvg}%
                        </Text>
                    </View>
                    <View style={styles.environmentRow}>
                        <MapPin size={16} />
                        <Text style={styles.environmentText}>
                            Coords: ({data.x}, {data.y})
                        </Text>
                    </View>
                    <View style={styles.environmentRow}>
                        <Calendar size={16} />
                        <Text style={styles.environmentText}>
                            Timestamp: {formatDate(data.timestamp)}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
        >
            {/* Manufacturer */}
            {envData.length > 0 && envData.map((data, index) => 
                renderEnvironmentalCard(
                    data,
                    `Manufacturing Record ${index + 1}`,
                    Package,
                    manufacturer.actor,
                    manufacturer.location,
                    manufacturer.timestamp
                )
            )}

            {/* Distributors */}
            {distributors.map((pt, idx) =>
                envData.length > idx + 1 && envData.map((data, index) => 
                    renderEnvironmentalCard(
                        data,
                        `Distribution Checkpoint ${idx + 1} Record ${index + 1}`,
                        Truck,
                        pt.actor,
                        pt.location,
                        pt.timestamp
                    )
                )
            )}

            {/* Pharmacy */}
            {pharmacy && envData.length > 0 && envData.map((data, index) =>
                renderEnvironmentalCard(
                    data,
                    `Pharmacy Record ${index + 1}`,
                    Building2,
                    pharmacy.actor,
                    pharmacy.location,
                    pharmacy.timestamp
                )
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
        padding: 12,
        gap: 8,
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
});

export default TraceTimeline;
