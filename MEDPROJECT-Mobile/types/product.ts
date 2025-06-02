export interface Product {
    imageUrl: string;
    description: any;
    id: string;
    code: string;
    name: string;
    manufacturer: string;
    manufactureDate: number;
    expiryDate: number;
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
    conditionsActuelles: {
        temperature: number;
        humidite: number;
        positionX: number;
        positionY: number;
        timestamp: string;
    };
    rawMaterials: any[];
    rawMaterialsHash: string;
    traceHistory?: any[]; // si utilisé dans TraceTimeline
}
