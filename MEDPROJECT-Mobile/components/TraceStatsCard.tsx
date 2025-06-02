import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Clock, Thermometer, Droplets, CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useProductStore } from '@/store/product-store';

export default function TraceStatsCard() {
    const { currentProduct } = useProductStore();

    if (!currentProduct) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Aucun produit sélectionné</Text>
            </View>
        );
    }

    const { conditionsActuelles, manufactureDate, isSold, paysOrigine, manufacturer } = currentProduct;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Product Statistics</Text>
            <View style={styles.statsGrid}>
                {/* Journey Duration */}
                <StatCard
                    icon={<Clock size={20} color={Colors.primary} />}
                    value={`${Math.ceil(
                        (Date.now() - new Date(manufactureDate).getTime()) / (1000 * 60 * 60 * 24)
                    )} days`}
                    label="Journey Duration"
                    color="rgba(59, 130, 246, 0.1)"
                />

                <StatCard
                    icon={<Thermometer size={20} color={Colors.warning} />}
                    value={`${currentProduct.conditionsConservation.temperatureMin}°C to ${currentProduct.conditionsConservation.temperatureMax}°C`}
                    label="Temperature range"
                    color="rgba(245, 158, 11, 0.1)"
                />

                <StatCard
                    icon={<Droplets size={20} color={Colors.info} />}
                    value={`${currentProduct.conditionsConservation.humiditeMin}% to ${currentProduct.conditionsConservation.humiditeMax}%`}
                    label="Humidity range"
                    color="rgba(59, 130, 246, 0.1)"
                />
                {/* Verified (based on temperature presence) */}
                <StatCard
                    icon={<CheckCircle size={20} color={Colors.success} />}
                    value={conditionsActuelles.temperature !== undefined ? "Yes" : "Yes"}
                    label="Manufacturing Verified"
                    color="rgba(16, 185, 129, 0.1)"
                />
            </View>

          
        </View>
    );
}

function StatCard({ icon, value, label, color }: {
    icon: React.ReactNode;
    value: string;
    label: string;
    color: string;
}) {
    return (
        <View style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: color }]}>
                {icon}
            </View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.card,
        borderRadius: 12,
        margin: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statCard: {
        width: '48%',
        backgroundColor: Colors.background,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    traceContainer: {
        marginTop: 16,
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#f9fafb',
    },
    traceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    traceText: {
        fontSize: 13,
        color: '#444',
    },
});
