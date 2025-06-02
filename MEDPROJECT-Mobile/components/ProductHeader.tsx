import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Calendar, Package } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Product } from '@/types/product';

interface ProductHeaderProps {
    product: Product;
}

export default function ProductHeader({ product }: ProductHeaderProps) {
    // Tu peux directement renvoyer la valeur de la date sous forme de nombre
    const displayTimestamp = (timestamp: number) => {
        return timestamp; // Pas besoin de convertir ou de formater, juste afficher le nombre
    };

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: product.imageUrl || 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }}
                    style={styles.image}
                    contentFit="cover"
                    transition={300}
                />
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.name}>{product.name}</Text>
                <Text style={styles.manufacturer}>{product.manufacturer}</Text>

                <View style={styles.codeContainer}>
                    <Text style={styles.codeLabel}>Product Code:</Text>
                    <Text style={styles.code}>{product.code}</Text>
                </View>

                <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                        <Calendar size={16} color={Colors.textSecondary} />
                        <View style={styles.detailTextContainer}>
                            <Text style={styles.detailLabel}>Manufactured:</Text>
                            {/* Affiche le timestamp Unix tel quel */}
                            <Text style={styles.detailValue}>{displayTimestamp(product.manufactureDate)}</Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <Calendar size={16} color={Colors.textSecondary} />
                        <View style={styles.detailTextContainer}>
                            <Text style={styles.detailLabel}>Expires:</Text>
                            {/* Affiche le timestamp Unix tel quel */}
                            <Text style={styles.detailValue}>{displayTimestamp(product.expiryDate)}</Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <Package size={16} color={Colors.textSecondary} />
                        <View style={styles.detailTextContainer}>
                            <Text style={styles.detailLabel}>Batch Number:</Text>
                            <Text style={styles.detailValue}>{product.batchNumber}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <Text style={styles.description}>Product's form: {product.forme}</Text>
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
    imageContainer: {
        height: 180,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: Colors.border,
        marginBottom: 16,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    infoContainer: {
        marginBottom: 16,
    },
    name: {
        fontSize: 22,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    manufacturer: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginBottom: 12,
    },
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 16,
    },
    codeLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.text,
        marginRight: 8,
    },
    code: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.primary,
    },
    detailsContainer: {
        backgroundColor: Colors.background,
        borderRadius: 8,
        padding: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailTextContainer: {
        flexDirection: 'row',
        marginLeft: 8,
        flex: 1,
    },
    detailLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginRight: 4,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.text,
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        color: Colors.text,
        fontWeight: '600',

    },
});