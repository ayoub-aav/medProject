import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Search, Info, MessageCircle } from 'lucide-react-native'; // J'ajoute l'icône MessageCircle
import Colors from '@/constants/colors';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.inactive,
                tabBarStyle: {
                    backgroundColor: Colors.card,
                    borderTopColor: Colors.border,
                },
                headerStyle: {
                    backgroundColor: Colors.card,
                },
                headerTitleStyle: {
                    color: Colors.text,
                    fontWeight: '600',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'ChainTrace',
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color }) => <Home size={22} color={color} />,
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    title: 'Search Products',
                    tabBarLabel: 'Search',
                    tabBarIcon: ({ color }) => <Search size={22} color={color} />,
                }}
            />
            
            <Tabs.Screen
                name="about"
                options={{
                    title: 'About',
                    tabBarLabel: 'About',
                    tabBarIcon: ({ color }) => <Info size={22} color={color} />,
                }}
            />
        </Tabs>
    );
}