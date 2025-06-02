import React from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Search, X } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    onSubmit: () => void;
    onClear: () => void;
    placeholder?: string;
    isLoading?: boolean;
}

export default function SearchBar({
    value,
    onChangeText,
    onSubmit,
    onClear,
    placeholder = 'Search...',
    isLoading = false
}: SearchBarProps) {
    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={Colors.textSecondary}
                    returnKeyType="search"
                    onSubmitEditing={onSubmit}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                {value.length > 0 && (
                    <TouchableOpacity onPress={onClear} style={styles.clearButton}>
                        <X size={18} color={Colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>
            <TouchableOpacity
                style={[styles.searchButton, !value.length && styles.searchButtonDisabled]}
                onPress={onSubmit}
                disabled={!value.length || isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Search size={20} color="#fff" />
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginVertical: 12,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 50,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    searchIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: Colors.text,
    },
    clearButton: {
        padding: 6,
    },
    searchButton: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    searchButtonDisabled: {
        backgroundColor: Colors.inactive,
    },
});