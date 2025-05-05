import React, { useState, useEffect } from 'react';
import { Button, Card, Typography, Alert, Input } from "@material-tailwind/react";
import { Thermometer, Droplet, MapPin, Clock } from 'lucide-react';
import { initWeb3 as initializeMedecinWeb3 } from '../utils/web3Connection_medecin';

function MedicationHistory() {
  const [medecinContract, setMedecinContract] = useState(null);
  const [medId, setMedId] = useState('');
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [retrievalError, setRetrievalError] = useState("");

  // Initialize contract
  useEffect(() => {
    const loadWeb3 = async () => {
      try {
        const { contractInstance } = await initializeMedecinWeb3();
        setMedecinContract(contractInstance);
      } catch (error) {
        setRetrievalError("Failed to connect to blockchain");
      }
    };
    loadWeb3();
  }, []);

  const handleSearch = async () => {
    if (!medId || !medecinContract) return;
    
    setIsLoading(true);
    setRetrievalError("");
    setHistory([]);
    
    try {
      const data = await medecinContract.methods.getEnvironmentalHistory(medId).call();
      setHistory(data);
    } catch (error) {
      setRetrievalError("Failed to fetch history: " + error.message);
    }
    setIsLoading(false);
  };

  // Utility function to convert BigInt numbers safely
  const convertChainValue = (value) => {
    try {
      return typeof value === 'bigint' ? Number(value) : value;
    } catch {
      return value;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 rounded-xl shadow-sm mb-8">
          <Typography variant="h4" className="mb-6 text-center">
            Medication Environmental History
          </Typography>

          <div className="flex gap-4 mb-8">
            <Input
              label="Medication ID"
              value={medId}
              onChange={(e) => setMedId(e.target.value)}
              className="flex-grow"
            />
            <Button 
              onClick={handleSearch}
              disabled={!medId || isLoading}
            >
              {isLoading ? "Loading..." : "Search"}
            </Button>
          </div>

          {retrievalError && <Alert color="red" className="mb-4">{retrievalError}</Alert>}

          {history.length > 0 ? (
            <div className="space-y-4">
              {history.map((record, index) => {
                // Convert all numeric values from BigInt
                const convertedRecord = {
                  timestamp: convertChainValue(record.timestamp),
                  tempAvg: convertChainValue(record.tempAvg),
                  tempMin: convertChainValue(record.tempMin),
                  tempMax: convertChainValue(record.tempMax),
                  humidAvg: convertChainValue(record.humidAvg),
                  humidMin: convertChainValue(record.humidMin),
                  humidMax: convertChainValue(record.humidMax),
                  x: record.x,
                  y: record.y
                };

                return (
                  <Card key={index} className="p-4" shadow={false}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        <div>
                          <Typography variant="small" className="font-semibold">
                            Timestamp
                          </Typography>
                          <Typography>
                            {new Date(convertedRecord.timestamp * 1000).toLocaleString()}
                          </Typography>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Thermometer className="h-5 w-5" />
                        <div>
                          <Typography variant="small" className="font-semibold">
                            Temperature
                          </Typography>
                          <Typography>
                            {convertedRecord.tempAvg}°C (Min: {convertedRecord.tempMin}°C, Max: {convertedRecord.tempMax}°C)
                          </Typography>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Droplet className="h-5 w-5" />
                        <div>
                          <Typography variant="small" className="font-semibold">
                            Humidity
                          </Typography>
                          <Typography>
                            {convertedRecord.humidAvg}% (Min: {convertedRecord.humidMin}%, Max: {convertedRecord.humidMax}%)
                          </Typography>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        <div>
                          <Typography variant="small" className="font-semibold">
                            Location
                          </Typography>
                          <Typography>
                            {convertedRecord.x}, {convertedRecord.y}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Typography className="text-center text-gray-600">
              {medId ? "No history found" : "Enter a medication ID to search"}
            </Typography>
          )}
        </Card>
      </div>
    </div>
  );
}

export default MedicationHistory;