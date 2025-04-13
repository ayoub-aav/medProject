import React, { useState } from 'react';
import QrScanner from 'react-qr-scanner';
import axios from 'axios';

// Mock Medicament Data
const mockMedicamentData = {
    "medicament1": {
        name: "Aspirin",
        description: "Pain reliever",
        dosage: "500mg",
    },
    "medicament2": {
        name: "Ibuprofen",
        description: "Anti-inflammatory",
        dosage: "300mg",
    },
    "medicament3": {
        name: "Paracetamol",
        description: "Fever reducer",
        dosage: "500mg",
    }
};

const QRScanner = () => {
    const [medicamentId, setMedicamentId] = useState('');
    const [iotData, setIotData] = useState(null);
    const [medicamentData, setMedicamentData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleScan = async (data) => {
        if (data) {
            setMedicamentId(data);
            // Fetch mock medicament data based on scanned QR code
            const fetchedData = mockMedicamentData[data] || null;
            setMedicamentData(fetchedData);

            // Reset IoT data when a new scan happens
            setIotData(null);
        }
    };

    const handleError = (err) => {
        console.error(err);
        setError('Error scanning QR code.');
    };

    const fetchIotData = async () => {
        if (!medicamentId) return; // Prevent fetching data if no medicament ID

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:1880/api/iot/simulate', {
                medicamentId: medicamentId
            });
            setIotData(response.data);
        } catch (error) {
            console.error("Error fetching IoT data", error);
            setError('There was an issue fetching IoT data.');
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
            {/* Display Medicament Data */}
            {medicamentData ? (
                <div>
                    <h3>Medicant Data</h3>
                    <p>Name: {medicamentData.name}</p>
                    <p>Description: {medicamentData.description}</p>
                    <p>Dosage: {medicamentData.dosage}</p>
                </div>
            ) : (
                <p>No product data found. Please scan again.</p>
            )}
            {/* Button to Fetch IoT Data */}
            <button onClick={fetchIotData} disabled={loading || !medicamentId}>
                {loading ? 'Fetching IoT Data...' : 'Fetch IoT Data'}
            </button>
            {/* Display IoT Data once fetched */}
            {iotData && (
                <div>
                    <h3>IoT Data for {medicamentId}</h3>
                    <p>Temperature: {iotData.temperature} °C</p>
                    <p>Humidity: {iotData.humidity} %</p>
                    {iotData.ipfsHash && (
                        <p>
                            IPFS Hash: <a href={`https://ipfs.io/ipfs/${iotData.ipfsHash}`} target="_blank" rel="noopener noreferrer">{iotData.ipfsHash}</a>
                        </p>
                    )}
                </div>
            )}
            {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display any error messages */}
        </div>
    );
};

export default QRScanner;