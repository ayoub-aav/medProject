import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { useProductStore } from '@/store/product-store';
import SearchBar from '@/components/SearchBar';
import ProductCard from '@/components/ProductCard';
import EmptyState from '@/components/EmptyState';
import Colors from '@/constants/colors';

export default function SearchScreen() {
    const {
        searchQuery,
        setSearchQuery,
        searchProduct,
        currentProduct,
        isLoading,
        error
    } = useProductStore();

    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = () => {
        if (searchQuery.trim()) {
            searchProduct(searchQuery.trim());
            setHasSearched(true);
        }
    };

    const handleClear = () => {
        setSearchQuery('');
    };

    return (
        <View style={styles.container}>
            <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmit={handleSearch}
                onClear={handleClear}
                placeholder="Enter product code (e.g., MED12345)"
                isLoading={isLoading}
            />

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
            >
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                        <Text style={styles.loadingText}>Searching blockchain records...</Text>
                    </View>
                ) : error ? (
                    <EmptyState type="error" message={error} />
                ) : currentProduct ? (
                    <ProductCard product={currentProduct} />
                ) : (
                    <EmptyState
                        type="search"
                        message={
                            hasSearched
                                ? "No products found. Try searching for MED12345, MED67890, or VAC54321."
                                : "Enter a product code to trace its journey from manufacturer to pharmacy."
                        }
                    />
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
});