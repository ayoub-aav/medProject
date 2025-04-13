// DistributorQRScanner.jsx
import React, { useState } from 'react';
import QrScanner from 'react-qr-scanner';
// Import your connection utility if needed
// import getEthereumContract from '../utils/web3Connection'; // Optional if you connect to blockchain

const DistributorQRScanner = ({ setMedicamentId }) => {
    const [medicamentData, setMedicamentData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleScan = (data) => {
        if (data) {
            const scannedId = data; // Set scanned ID
            setMedicamentId(scannedId); // Also set in the parent component
            fetchDataFromBlockchain(scannedId); // Call function to fetch data
        }
    };

    const handleError = (err) => {
        console.error(err);
        setError('Error scanning QR code.');
    };

    const fetchDataFromBlockchain = async (id) => {
        setLoading(true);
        setError('');
        try {
            // Simulated data, replace this with real blockchain call
            const simulatedData = {
                name: "Paracetamol",
                temperature: "20",
                humidity: "50",
                description: "Pain reliever",
                dosage: "500mg",
                expirationDate: "2025-01-01",
            };

            // Uncomment and use this line to fetch data from blockchain if required
            // const contract = await getEthereumContract(); // Fetch contract instance
            // const uniteMedicament = await contract.obtenirUniteMedicament(id); // Get real medicament details
            
            setMedicamentData(simulatedData);
        } catch (error) {
            console.error('Error fetching data from blockchain:', error);
            setError('Could not retrieve medicament data from blockchain.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Scan the Medicament QR Code</h2>
            <QrScanner
                delay={300}
                onError={handleError}
                onScan={handleScan}
                style={{ width: '100%' }}
            />
            {loading ? (
                <p>Loading data...</p>
            ) : (
                medicamentData && (
                    <div>
                        <h3>Medicament Data</h3>
                        <p>Name: {medicamentData.name}</p>
                        <p>Temperature: {medicamentData.temperature} °C</p>
                        <p>Humidity: {medicamentData.humidity} %</p>
                        <p>Description: {medicamentData.description}</p>
                        <p>Dosage: {medicamentData.dosage}</p>
                        <p>Expiration Date: {medicamentData.expirationDate}</p>
                    </div>
                )
            )}
            {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display any error messages */}
        </div>
    );
};

export default DistributorQRScanner;