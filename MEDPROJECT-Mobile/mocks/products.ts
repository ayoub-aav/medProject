import { Product } from '@/types/product';

export const mockProducts: Product[] = [
    {
        id: 'MED12345',
        code: 'MED12345',
        name: 'Amoxicilline',
        manufacturer: 'PharmaCorp France',
        manufactureDate: '2023-06-15T00:00:00Z',
        expiryDate: '2025-06-15T00:00:00Z',
        batchNumber: 'LOT-A12345',
        description: 'Antibiotique à large spectre',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        substanceActive: 'Amoxicilline trihydratée',
        forme: 'Comprimé',
        paysOrigine: 'France',
        amm: 'EU/1/23/456/789',
        conditionsConservation: {
            temperatureMax: 25,
            temperatureMin: 15,
            humiditeMax: 60,
            humiditeMin: 35
        },
        conditionsActuelles: {
            temperature: 21.5,
            humidite: 45,
            positionX: "A12",
            positionY: "B34",
            timestamp: '2023-11-20T08:30:00Z'
        },
        rawMaterials: [
            {
                nom: "Amoxicilline base",
                origine: "Italie",
                fournisseur: "API-Supply",
                degrePurete: "99.8%",
                quantiteParUnite: "500mg",
                certificatAnalyse: "QWD789456123",
                dateReception: "2023-05-10",
                transport: "Contrôlé 15-25°C"
            }
        ],
        rawMaterialsHash: "QWD789456123",
        traceHistory: [
            {
                id: 't1',
                timestamp: '2023-06-15T08:30:00Z',
                location: 'Usine PharmaCorp, Lyon, France',
                temperature: 21.5,
                humidity: 45,
                action: 'Fabrication terminée',
                actor: 'PharmaCorp France',
                actorType: 'manufacturer',
                verified: true,
                blockchainRef: '0x8f7d8b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a',
                notes: 'Contrôle qualité validé'
            },
            {
                id: 't2',
                timestamp: '2023-06-20T10:15:00Z',
                location: 'Entrepôt central, Paris, France',
                temperature: 20.8,
                humidity: 42,
                action: 'Réception en stock',
                actor: 'PharmaDistrib',
                actorType: 'distributor',
                verified: true,
                blockchainRef: '0x7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d'
            },
            {
                id: 't3',
                timestamp: '2023-06-25T14:20:00Z',
                location: 'Pharmacie Centrale, Marseille, France',
                temperature: 22.0,
                humidity: 43,
                action: 'Livraison effectuée',
                actor: 'Pharmacie Centrale',
                actorType: 'pharmacy',
                verified: true,
                blockchainRef: '0x6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e'
            }
        ]
    },
    {
        id: 'MED67890',
        code: 'MED67890',
        name: 'Paracétamol',
        manufacturer: 'MediPharm',
        manufactureDate: '2023-07-10T00:00:00Z',
        expiryDate: '2026-07-10T00:00:00Z',
        batchNumber: 'LOT-P67890',
        description: 'Antalgique et antipyrétique',
        imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        substanceActive: 'Paracétamol',
        forme: 'Gélule',
        paysOrigine: 'France',
        amm: 'EU/1/23/123/456',
        conditionsConservation: {
            temperatureMax: 30,
            temperatureMin: 15,
            humiditeMax: 70,
            humiditeMin: 30
        },
        conditionsActuelles: {
            temperature: 22.5,
            humidite: 40,
            positionX: "C05",
            positionY: "D12",
            timestamp: '2023-11-20T10:45:00Z'
        },
        rawMaterials: [
            {
                nom: "Paracétamol USP",
                origine: "Allemagne",
                fournisseur: "ChemicalEU",
                degrePurete: "99.9%",
                quantiteParUnite: "1000mg",
                certificatAnalyse: "PLM123456789",
                dateReception: "2023-06-15",
                transport: "Standard"
            }
        ],
        rawMaterialsHash: "PLM123456789",
        traceHistory: [
            {
                id: 't1',
                timestamp: '2023-07-10T07:45:00Z',
                location: 'Site MediPharm, Toulouse, France',
                temperature: 22.0,
                humidity: 40,
                action: 'Production validée',
                actor: 'MediPharm',
                actorType: 'manufacturer',
                verified: true,
                blockchainRef: '0x5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d',
                notes: 'Lot conforme aux spécifications'
            },
            {
                id: 't2',
                timestamp: '2023-07-18T13:20:00Z',
                location: 'Plateforme logistique, Lille, France',
                temperature: 21.0,
                humidity: 38,
                action: 'Expédition préparée',
                actor: 'PharmaLog',
                actorType: 'distributor',
                verified: true,
                blockchainRef: '0x4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c'
            }
        ]
    },
    {
        id: 'VAC54321',
        code: 'VAC54321',
        name: 'Vaccin COVID-19',
        manufacturer: 'BioVax France',
        manufactureDate: '2023-08-05T00:00:00Z',
        expiryDate: '2024-02-05T00:00:00Z',
        batchNumber: 'LOT-VA54321',
        description: 'Vaccin contre la COVID-19',
        imageUrl: 'https://images.unsplash.com/photo-1605289982774-9a6fef564df8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        substanceActive: 'ARNm',
        forme: 'Solution injectable',
        paysOrigine: 'France',
        amm: 'EU/1/20/1525',
        conditionsConservation: {
            temperatureMax: 8,
            temperatureMin: 2,
            humiditeMax: 60,
            humiditeMin: 20
        },
        conditionsActuelles: {
            temperature: 4.2,
            humidite: 35,
            positionX: "F07",
            positionY: "G03",
            timestamp: '2023-11-20T09:15:00Z'
        },
        rawMaterials: [
            {
                nom: "ARNm modifié",
                origine: "Suisse",
                fournisseur: "GeneTech",
                degrePurete: "99.95%",
                quantiteParUnite: "0.3ml",
                certificatAnalyse: "ARN456789123",
                dateReception: "2023-07-20",
                transport: "Chaîne ultra-froide"
            }
        ],
        rawMaterialsHash: "ARN456789123",
        traceHistory: [
            {
                id: 't1',
                timestamp: '2023-08-05T06:15:00Z',
                location: 'Centre BioVax, Strasbourg, France',
                temperature: 4.0,
                humidity: 35,
                action: 'Conditionnement final',
                actor: 'BioVax France',
                actorType: 'manufacturer',
                verified: true,
                blockchainRef: '0x3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b',
                notes: 'Contrôle stérilité OK'
            },
            {
                id: 't2',
                timestamp: '2023-08-10T09:40:00Z',
                location: 'Entrepôt frigorifique, Paris, France',
                temperature: 3.8,
                humidity: 34,
                action: 'Stockage central',
                actor: 'VaccineLog',
                actorType: 'distributor',
                verified: true,
                blockchainRef: '0x2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a'
            },
            {
                id: 't3',
                timestamp: '2023-08-15T11:30:00Z',
                location: 'CHU de Lyon, France',
                temperature: 4.2,
                humidity: 36,
                action: 'Livraison au centre de vaccination',
                actor: 'CHU Lyon',
                actorType: 'pharmacy',
                verified: true,
                blockchainRef: '0x1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2b'
            }
        ]
    }
];

export const findProductByCode = (code: string): Product | undefined => {
    return mockProducts.find(product =>
        product.code.toLowerCase() === code.toLowerCase()
    );
};