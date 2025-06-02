import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Search, AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface EmptyStateProps {
    type: 'search' | 'error';
    message?: string;
}

export default function EmptyState({ type, message }: EmptyStateProps) {
    return (
        <View style={styles.container}>
            <View style={[
                styles.iconContainer,
                { backgroundColor: type === 'search' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)' }
            ]}>
                {type === 'search' ? (
                    <Search size={32} color={Colors.primary} />
                ) : (
                    <AlertCircle size={32} color={Colors.error} />
                )}
            </View>

            <Text style={styles.title}>
                {type === 'search' ? 'Search for a Product' : 'Product Not Found'}
            </Text>

            <Text style={styles.message}>
                {message || (type === 'search'
                    ? 'Enter a product code to trace its journey from manufacturer to pharmacy.'
                    : 'We couldn\'t find a product with that code. Please check and try again.'
                )}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        maxWidth: 300,
    },
});