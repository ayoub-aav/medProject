import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const QRCodeGenerator = () => {
    const [medicamentId, setMedicamentId] = useState('');

    const handleInputChange = (e) => {
        setMedicamentId(e.target.value);
    };

    return (
        <div>
            <h3>Generate a QR Code for a Medicament ID</h3>
            <input
                type="text"
                value={medicamentId}
                onChange={handleInputChange}
                placeholder="Enter Medicament ID (e.g., MED12345)"
            />
            <br />
            {medicamentId && <QRCodeSVG value={medicamentId} />}
        </div>
    );
};

export default QRCodeGenerator;