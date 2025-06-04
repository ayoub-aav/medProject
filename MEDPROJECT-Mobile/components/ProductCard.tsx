import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Calendar, Package, Thermometer, Droplet, MapPin } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '../constants/colors';
import { format } from 'date-fns';
import { ProductInfo, EnvironmentalData, getEnvironmentalData } from '@/utils/contract';

export default function ProductCard({ product }: { product: ProductInfo }) {
    const router = useRouter();
    const [envData, setEnvData] = useState<EnvironmentalData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEnvData = async () => {
            if (product?.id) {
                setLoading(true);
                try {
                    const data = await getEnvironmentalData(product.id);
                    setEnvData(data);
                } catch (error) {
                    console.error("Failed to load environmental data:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchEnvData();
    }, [product?.id]);

    const displayDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MM/dd/yyyy');
        } catch {
            return 'Invalid date';
        }
    };

    const handlePress = () => {
        router.push(`/product/${product.id}`);
    };

    if (!product) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Product not available</Text>
            </View>
        );
    }

    const firstEnvRecord = envData[0];

    return (
        <TouchableOpacity style={styles.container} onPress={handlePress}>
            <Text style={styles.title}>{product.name || 'Unnamed product'}</Text>

            <View style={styles.row}>
                <Package size={16} color={Colors.textSecondary} />
                <Text style={styles.text}>Manufacturer: {product.manufacturer || 'N/A'}</Text>
            </View>

            <View style={styles.row}>
                <Calendar size={16} color={Colors.textSecondary} />
                <Text style={styles.text}>Expiry: {displayDate(product.expiryDate)}</Text>
            </View>

            {/* Conservation Conditions Section */}
            <View style={styles.sectionDivider} />
            <Text style={styles.sectionTitle}>Storage Conditions</Text>

            <View style={styles.row}>
                <Thermometer size={16} color={Colors.textSecondary} />
                <Text style={styles.text}>
                    Temperature range: {product.conditionsConservation.temperatureMin}°C to {product.conditionsConservation.temperatureMax}°C
                </Text>
            </View>

            <View style={styles.row}>
                <Droplet size={16} color={Colors.textSecondary} />
                <Text style={styles.text}>
                    Humidity range: {product.conditionsConservation.humiditeMin}% to {product.conditionsConservation.humiditeMax}%
                </Text>
            </View>

            {/* Environmental Data Section */}
            <View style={styles.sectionDivider} />
            <Text style={styles.sectionTitle}>Initial Environmental Data</Text>

            {loading ? (
                <View style={styles.row}>
                    <Text style={styles.text}>Loading environmental data...</Text>
                </View>
            ) : firstEnvRecord ? (
                <>
                    <View style={styles.row}>
                        <Thermometer size={16} color={Colors.textSecondary} />
                        <Text style={styles.text}>
                            Temperature: {firstEnvRecord.tempAvg}°C
                        </Text>
                    </View>

                    <View style={styles.row}>
                        <Droplet size={16} color={Colors.textSecondary} />
                        <Text style={styles.text}>
                            Humidity: {firstEnvRecord.humidAvg}%
                        </Text>
                    </View>

                    <View style={styles.row}>
                        <MapPin size={16} color={Colors.textSecondary} />
                        <Text style={styles.text}>
                            Origin: {product.paysOrigine}
                        </Text>
                    </View>
                </>
            ) : (
                <View style={styles.row}>
                    <Text style={styles.textHint}>
                        No environmental data available
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.card,
        padding: 16,
        borderRadius: 8,
        margin: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: Colors.text,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.primary,
        marginVertical: 8,
    },
    sectionDivider: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        marginVertical: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    text: {
        marginLeft: 8,
        color: Colors.text,
        fontSize: 14,
    },
    textHint: {
        marginLeft: 8,
        color: Colors.textSecondary,
        fontSize: 14,
        fontStyle: 'italic',
    },
});