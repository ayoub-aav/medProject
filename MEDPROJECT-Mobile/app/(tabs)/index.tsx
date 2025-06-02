import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Search, ArrowRight, Package, Truck, Building2 } from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function HomeScreen() {
    const router = useRouter();

    const handleSearchPress = () => {
        router.push('/search');
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.header}>
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }}
                    style={styles.headerImage}
                    contentFit="cover"
                />
                <View style={styles.headerOverlay}>
                    <Text style={styles.headerTitle}>ChainTrace</Text>
                    <Text style={styles.headerSubtitle}>
                        Verify the authenticity and journey of pharmaceutical products
                    </Text>
                </View>
            </View>

            <TouchableOpacity style={styles.searchCard} onPress={handleSearchPress}>
                <View style={styles.searchIconContainer}>
                    <Search size={24} color={Colors.primary} />
                </View>
                <View style={styles.searchTextContainer}>
                    <Text style={styles.searchTitle}>Search Products</Text>
                    <Text style={styles.searchDescription}>
                        Enter a product code to trace its journey
                    </Text>
                </View>
                <ArrowRight size={20} color={Colors.primary} />
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>How It Works</Text>

            <View style={styles.stepsContainer}>
                <View style={styles.stepCard}>
                    <View style={[styles.stepIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                        <Package size={24} color={Colors.primary} />
                    </View>
                    <Text style={styles.stepTitle}>Manufacturing</Text>
                    <Text style={styles.stepDescription}>
                        Products are registered on the blockchain at the point of manufacture
                    </Text>
                </View>

                <View style={styles.stepCard}>
                    <View style={[styles.stepIconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                        <Truck size={24} color={Colors.warning} />
                    </View>
                    <Text style={styles.stepTitle}>Distribution</Text>
                    <Text style={styles.stepDescription}>
                        Each transfer is recorded with location and condition data
                    </Text>
                </View>

                <View style={styles.stepCard}>
                    <View style={[styles.stepIconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                        <Building2 size={24} color={Colors.success} />
                    </View>
                    <Text style={styles.stepTitle}>Pharmacy</Text>
                    <Text style={styles.stepDescription}>
                        Final verification ensures products are authentic and properly handled
                    </Text>
                </View>
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Why Use ChainTrace?</Text>
                <Text style={styles.infoText}>
                    ChainTrace leverages blockchain technology to provide immutable records of pharmaceutical products throughout the supply chain. This ensures authenticity, prevents counterfeiting, and guarantees proper handling of sensitive medications.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    contentContainer: {
        paddingBottom: 24,
    },
    header: {
        height: 200,
        position: 'relative',
    },
    headerImage: {
        width: '100%',
        height: '100%',
    },
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#FFFFFF',
        textAlign: 'center',
        maxWidth: 300,
    },
    searchCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        margin: 16,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    searchIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchTextContainer: {
        flex: 1,
        marginLeft: 16,
    },
    searchTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    searchDescription: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
        marginHorizontal: 16,
        marginTop: 24,
        marginBottom: 16,
    },
    stepsContainer: {
        paddingHorizontal: 16,
    },
    stepCard: {
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    stepIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
    },
    stepDescription: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    infoCard: {
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 16,
        margin: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
});