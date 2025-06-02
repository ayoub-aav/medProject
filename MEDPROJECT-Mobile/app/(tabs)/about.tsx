import React from 'react';
import { StyleSheet, Text, View, ScrollView, Linking } from 'react-native';
import { Shield, Lock, Database, RefreshCw, Info } from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function AboutScreen() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Database size={32} color={Colors.primary} />
                </View>
                <Text style={styles.title}>About ChainTrace</Text>
                <Text style={styles.subtitle}>
                    Blockchain-powered supply chain verification for pharmaceutical products
                </Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Our Mission</Text>
                <Text style={styles.cardText}>
                    ChainTrace is dedicated to ensuring the safety and authenticity of pharmaceutical products by providing complete transparency throughout the supply chain. Our blockchain-based solution creates an immutable record of each product's journey from manufacturer to pharmacy.
                </Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Key Features</Text>

                <View style={styles.featureItem}>
                    <View style={[styles.featureIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                        <Shield size={20} color={Colors.primary} />
                    </View>
                    <View style={styles.featureContent}>
                        <Text style={styles.featureTitle}>Authenticity Verification</Text>
                        <Text style={styles.featureText}>
                            Verify that products are genuine and have followed the proper supply chain path
                        </Text>
                    </View>
                </View>

                <View style={styles.featureItem}>
                    <View style={[styles.featureIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                        <RefreshCw size={20} color={Colors.success} />
                    </View>
                    <View style={styles.featureContent}>
                        <Text style={styles.featureTitle}>Complete Traceability</Text>
                        <Text style={styles.featureText}>
                            Track products from manufacturing through distribution to pharmacy
                        </Text>
                    </View>
                </View>

                <View style={styles.featureItem}>
                    <View style={[styles.featureIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                        <Lock size={20} color={Colors.warning} />
                    </View>
                    <View style={styles.featureContent}>
                        <Text style={styles.featureTitle}>Immutable Records</Text>
                        <Text style={styles.featureText}>
                            Blockchain technology ensures records cannot be altered or falsified
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>How to Use ChainTrace</Text>
                <Text style={styles.cardText}>
                    1. Find the product code on your medication packaging{'\n'}
                    2. Enter the code in the search field{'\n'}
                    3. View the complete supply chain journey{'\n'}
                    4. Verify authenticity and proper handling
                </Text>
                <Text style={styles.cardText}>
                    For demonstration purposes, try searching for these sample codes:{'\n'}
                    • MED12345 - Amoxicillin{'\n'}
                    • MED67890 - Lisinopril{'\n'}
                    • VAC54321 - Influenza Vaccine
                </Text>
            </View>

            <View style={styles.infoCard}>
                <Info size={20} color={Colors.textSecondary} style={styles.infoIcon} />
                <Text style={styles.infoText}>
                    This is a demonstration application. In a production environment, ChainTrace would connect to actual blockchain networks to verify pharmaceutical supply chains.
                </Text>
            </View>

            <Text style={styles.footerText}>
                © 2023 ChainTrace • Version 1.0.0
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    contentContainer: {
        padding: 16,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        maxWidth: 300,
    },
    card: {
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 12,
    },
    cardText: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
        marginBottom: 8,
    },
    featureItem: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    featureIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureContent: {
        flex: 1,
        marginLeft: 12,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.text,
        marginBottom: 4,
    },
    featureText: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    infoIcon: {
        marginRight: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    footerText: {
        fontSize: 12,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
});