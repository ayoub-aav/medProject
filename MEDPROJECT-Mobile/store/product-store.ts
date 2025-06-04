import { create } from 'zustand';
import { ethers } from 'ethers';
import { abi} from '../blockchain/Medecin.json';
import Medecin from '../blockchain/Medecin.json'
const address = Medecin.networks[5777].address;


interface ProductState {
    searchQuery: string;
    currentProduct: any | null;
    traceHistory: any[]; // Si tu veux l'ajouter plus tard
    isLoading: boolean;
    error: string | null;
    setSearchQuery: (query: string) => void;
    searchProduct: (code: string) => Promise<void>;
    clearProduct: () => void;
}

export const useProductStore = create<ProductState>((set) => ({
    searchQuery: '',
    currentProduct: null,
    traceHistory: [],
    isLoading: false,
    error: null,

    setSearchQuery: (query) => set({ searchQuery: query }),

    searchProduct: async (code: string) => {
        set({ isLoading: true, error: null, currentProduct: null });

        try {
            const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545', {
                name: 'ganache',
                chainId: 1337,
            });

            const contract = new ethers.Contract(address, abi, provider);

            const exists = await contract.medicamentExists(code);
            if (!exists) throw new Error('Médicament non trouvé');

            const result = await contract.getProductInfo(code);

            const product = {
                id: result[0],
                code: result[0],
                name: result[1],
                manufacturer: result[2],
                manufactureDate: result[3],
                expiryDate: result[4],
                batchNumber: result[5],
                substanceActive: result[6],
                forme: result[7],
                paysOrigine: result[8],
                amm: result[9],
                conditionsConservation: {
                    temperatureMax: result[10].temperatureMax,
                    temperatureMin: result[10].temperatureMin,
                    humiditeMax: result[10].humiditeMax,
                    humiditeMin: result[10].humiditeMin,
                },
                conditionsActuelles: {
                    temperature: result[11].temperature,
                    humidite: result[11].humidite,
                    positionX: result[11].positionX,
                    positionY: result[11].positionY,
                    timestamp: new Date(Number(result[11].timestamp) * 1000).toISOString(),
                },
                rawMaterials: [] as any[],
                rawMaterialsHash: '',
            };

            let rawMaterials = [];
            try {
                rawMaterials = await contract.getRawMaterials(code);
            } catch (err) {
                console.warn("Erreur lors du chargement des matières premières:", err);
            }

            product["rawMaterials"] = rawMaterials;
            product["rawMaterialsHash"] = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(rawMaterials)));

            set({ currentProduct: product, isLoading: false });
        } catch (err: any) {
            set({ error: err.message || "Erreur inconnue", isLoading: false });
        }
    },

    clearProduct: () =>
        set({
            currentProduct: null,
            traceHistory: [],
            error: null,
        }),
}));
