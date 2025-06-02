import React from 'react';
import { StyleSheet, View, ScrollView, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useProductStore } from '@/store/product-store';
import ProductHeader from '@/components/ProductHeader';
import TraceStatsCard from '@/components/TraceStatsCard';
import TraceTimeline from '@/components/TraceTimeline';
import Colors from '@/constants/colors';

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { currentProduct, isLoading } = useProductStore();

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!currentProduct || currentProduct.id !== id) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Product not found</Text>
            </View>
        );
    }

    // Prepare timeline data
    let traceData = currentProduct.traceHistory || [];
    if (currentProduct.manufactureDate) {
        traceData = [
            {
                id: currentProduct.id,
                action: "Initial Manufacturing",
                actor: currentProduct.manufacturer,
                actorType: "manufacturer",
                location: currentProduct.paysOrigine,
                timestamp: currentProduct.manufactureDate,
                temperature: currentProduct.conditionsActuelles?.temperature,
                humidity: currentProduct.conditionsActuelles?.humidite,
                verified: true,
                notes: `Active substance: ${currentProduct.substanceActive}`,
                blockchainRef: currentProduct.rawMaterialsHash || "N/A"
            },
            ...traceData // Append original trace history
        ];
    }

    return (
        <>
            <Stack.Screen
                options={{
                    title: currentProduct.name,
                    headerTintColor: Colors.primary,
                }}
            />
            <ScrollView style={styles.container}>
                <ProductHeader product={currentProduct} />

                {/* Statistics Section */}
                <TraceStatsCard />

                {/* Complete Timeline with Raw Materials */}
                <View style={styles.timelineHeader}>
                    <Text style={styles.timelineTitle}>Complete History</Text>
                </View>
                <TraceTimeline
                    tracePoints={traceData}
                    rawMaterials={currentProduct.rawMaterials || []}
                />
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
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
    },
    errorText: {
        fontSize: 18,
        color: Colors.error,
    },
    timelineHeader: {
        padding: 16,
        paddingBottom: 8,
    },
    timelineTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.primary,
    },
});