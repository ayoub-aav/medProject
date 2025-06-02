import { ethers } from "ethers";
import Medecin from "../blockchain/Medecin.json";

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
const contract = new ethers.Contract(Medecin.address, Medecin.abi, provider);

export interface EnvironmentalData {
    tempMax: number;
    tempMin: number;
    tempAvg: number;
    humidMax: number;
    humidMin: number;
    humidAvg: number;
    x: string;
    y: string;
    timestamp: number;
}

export interface ProductInfo {
    id: string;
    name: string;
    manufacturer: string;
    manufactureDate: string;
    expiryDate: string;
    batchNumber: string;
    substanceActive: string;
    forme: string;
    paysOrigine: string;
    amm: string;
    conditionsConservation: {
        temperatureMax: number;
        temperatureMin: number;
        humiditeMax: number;
        humiditeMin: number;
    };
    isSold: boolean;
}

// Fonction indépendante pour les données environnementales
export async function getEnvironmentalData(medicamentId: string): Promise<EnvironmentalData[]> {
    try {
        const rawHistory = await contract.getEnvironmentalHistory(medicamentId);

        if (!rawHistory || rawHistory.length === 0) {
            console.warn("Aucune donnée environnementale trouvée");
            return [];
        }

        // Conversion robuste avec vérification
        const processedData = rawHistory.map((entry: any) => {
            const convertToNumber = (value: any, fieldName: string): number => {
                const num = Number(value);
                if (isNaN(num)) {
                    console.warn(`Invalid ${fieldName} value:`, value);
                    return 0;
                }
                return num;
            };

            return {
                tempMax: convertToNumber(entry.tempMax, 'tempMax'),
                tempMin: convertToNumber(entry.tempMin, 'tempMin'),
                tempAvg: convertToNumber(entry.tempAvg, 'tempAvg'),
                humidMax: convertToNumber(entry.humidMax, 'humidMax'),
                humidMin: convertToNumber(entry.humidMin, 'humidMin'),
                humidAvg: convertToNumber(entry.humidAvg, 'humidAvg'),
                x: convertToNumber(entry.x, 'x'),
                y: convertToNumber(entry.y, 'y'),
                timestamp: convertToNumber(entry.timestamp, 'timestamp')
            };
        });

        console.log("Processed environmental data:", processedData);
        return processedData;
    } catch (error) {
        console.error("Erreur getEnvironmentalData:", error);
        return [];
    }
}
// Fonction indépendante pour les infos produit
export async function getProductInfo(medicamentId: string): Promise<ProductInfo> {
    try {
        const data = await contract.getProductInfo(medicamentId);

        return {
            id: data.id,
            name: data.name,
            manufacturer: data.manufacturer,
            manufactureDate: data.manufactureDate,
            expiryDate: data.expiryDate,
            batchNumber: data.batchNumber,
            substanceActive: data.substanceActive,
            forme: data.forme,
            paysOrigine: data.paysOrigine,
            amm: data.amm,
            conditionsConservation: {
                temperatureMax: Number(data.conditionsConservation.temperatureMax),
                temperatureMin: Number(data.conditionsConservation.temperatureMin),
                humiditeMax: Number(data.conditionsConservation.humiditeMax),
                humiditeMin: Number(data.conditionsConservation.humiditeMin),
            },
            isSold: data.sold
        };
    } catch (error) {
        console.error("Erreur getProductInfo:", error);
        throw error;
    }
}