import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Package, Thermometer, Droplet, CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { getEnvironmentalData } from '@/utils/contract';

interface ManufacturingPhaseProps {
    product: {
        id: string;
        manufacturer: string;
        manufactureDate: string;
        paysOrigine: string;
        substanceActive: string;
        conditionsConservation: {
            temperatureMin: number;
            temperatureMax: number;
            humiditeMin: number;
            humiditeMax: number;
        };
        rawMaterials?: Array<{
            nom: string;
            origine: string;
            fournisseur: string;
            degrePurete: string;
        }>;
    };
    style?: object;
}

export default function ManufacturingPhase({ product, style }: ManufacturingPhaseProps) {
    const [envData, setEnvData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEnvData = async () => {
            try {
                const data = await getEnvironmentalData(product.id);
                if (data.length > 0) {
                    setEnvData(data[0]); // Prend le premier enregistrement
                }
            } catch (error) {
                console.error("Error fetching environmental data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEnvData();
    }, [product.id]);

    return (
        <View style={[styles.container, style]}>
            <Text style={styles.title}>Manufacturing Details</Text>

            <View style={styles.card}>
                {/* Basic Information */}
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Manufacturer:</Text>
                    <Text style={styles.value}>{product.manufacturer}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>Date:</Text>
                    <Text style={styles.value}>
                        {new Date(product.manufactureDate).toLocaleDateString('en-US')}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>Origin:</Text>
                    <Text style={styles.value}>{product.paysOrigine}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>Active substance:</Text>
                    <Text style={styles.value}>{product.substanceActive}</Text>
                </View>

                {/* Conditions */}
                {loading ? (
                    <Text style={styles.loadingText}>Loading environmental data...</Text>
                ) : envData ? (
                    <View style={styles.conditions}>
                        <View style={styles.conditionItem}>
                            <Thermometer size={16} color={Colors.warning} />
                            <Text style={styles.conditionText}>
                                Temperature: {envData.tempAvg}°C
                                <Text style={styles.rangeText}>
                                    (Range: {product.conditionsConservation.temperatureMin}°C - {product.conditionsConservation.temperatureMax}°C)
                                </Text>
                            </Text>
                        </View>
                        <View style={styles.conditionItem}>
                            <Droplet size={16} color={Colors.info} />
                            <Text style={styles.conditionText}>
                                Humidity: {envData.humidAvg}%
                                <Text style={styles.rangeText}>
                                    (Range: {product.conditionsConservation.humiditeMin}% - {product.conditionsConservation.humiditeMax}%)
                                </Text>
                            </Text>
                        </View>
                        <View style={styles.conditionItem}>
                            <Text style={styles.conditionText}>
                                Location: {envData.x}, {envData.y}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <Text style={styles.noDataText}>No environmental data available</Text>
                )}

                {/* Raw Materials */}
                {product.rawMaterials && product.rawMaterials.length > 0 && (
                    <>
                        <Text style={styles.subtitle}>Raw Materials</Text>
                        {product.rawMaterials.map((mat, index) => (
                            <View key={index} style={styles.materialCard}>
                                <Text style={styles.materialName}>{mat.nom}</Text>
                                <Text>Origin: {mat.origine}</Text>
                                <Text>Supplier: {mat.fournisseur}</Text>
                                <Text>Purity: {mat.degrePurete}</Text>
                            </View>
                        ))}
                    </>
                )}

                {/* Blockchain Verification */}
                <View style={styles.verification}>
                    <CheckCircle size={16} color={Colors.success} />
                    <Text style={styles.verificationText}>Recorded on blockchain</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 12,
        paddingHorizontal: 16,
    },
    card: {
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    label: {
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    value: {
        color: Colors.text,
    },
    conditions: {
        marginVertical: 12,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: Colors.border,
    },
    conditionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 8,
    },
    conditionText: {
        color: Colors.text,
    },
    rangeText: {
        color: Colors.textSecondary,
        fontSize: 12,
        marginLeft: 4,
    },
    loadingText: {
        color: Colors.textSecondary,
        fontStyle: 'italic',
        marginVertical: 8,
    },
    noDataText: {
        color: Colors.textSecondary,
        fontStyle: 'italic',
        marginVertical: 8,
    },
    subtitle: {
        fontWeight: '600',
        marginTop: 8,
        marginBottom: 4,
        color: Colors.text,
    },
    materialCard: {
        backgroundColor: Colors.background,
        padding: 8,
        borderRadius: 8,
        marginBottom: 8,
    },
    materialName: {
        fontWeight: 'bold',
    },
    verification: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 8,
    },
    verificationText: {
        color: Colors.success,
        fontSize: 14,
    },
});