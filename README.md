# PharmaChain

## Overview
**PharmaChain** is a full-stack platform that enhances pharmaceutical supply chain traceability using **Blockchain**, **IoT**, and **Artificial Intelligence**. It ensures secure, transparent tracking of pharmaceutical products from manufacturing to distribution to pharmacies, addressing critical issues such as:

- Counterfeiting
- Environmental non-compliance
- Lack of transparency

The system integrates:
- **Blockchain (Ethereum):** Immutable data recording and smart contract automation.
- **IoT (Node-RED):** Real-time environmental monitoring (temperature, humidity, etc.).
- **AI:** Anomaly detection and certificate validation with 96% accuracy.
- **Web and Mobile Interfaces:** For manufacturers, distributors, pharmacies, and final users.

PharmaChain creates digital twins for each pharmaceutical product, enabling lifecycle tracking with cryptographic proof of authenticity, compliant with regulations like Good Manufacturing Practice (GMP) and Good Distribution Practice (GDP).

## Features
- **Traceability:** Tracks drugs from manufacturing to dispensing with blockchain-based immutability.
- **Environmental Monitoring:** IoT sensors collect real-time temperature, humidity, and location data.
- **Fraud Detection:** AI validates certificates and detects anomalies.
- **User Interfaces:**
  - Web platform for manufacturers, distributors, and pharmacies.
  - Mobile app for final users to verify product authenticity and history.
- **Decentralized Storage:** IPFS for secure, distributed data storage.
- **Scalability & Security:** Modular architecture ensures performance and data integrity.

## Architecture
![Architecture Diagram](https://github.com/user-attachments/assets/a2fb4e47-ae31-4c26-b673-3ce215c94efb)

PharmaChain’s modular architecture separates presentation, business logic, middleware, and storage layers for maintainability and scalability. Key components include:

### Frontend
- **Web Platform:** Built with **React.js**, **Vite**, and **Material Tailwind**. Integrates **MetaMask** via **Web3.js** for secure blockchain transactions.
- **Mobile App:** Developed using **React Native**, **Zustand** for state management, and **Expo** for cross-platform compatibility.

### Backend
- **Blockchain:** Ethereum with **Solidity smart contracts** for recording supply chain events.
- **IPFS:** Decentralized storage for documents and sensor data using Content Identifiers (CIDs).
- **IoT Integration:** **Node-RED** simulates and manages IoT sensor data (temperature, humidity, location).
- **Middleware:** Includes event listeners for real-time blockchain updates, synchronization services, and an IPFS gateway.
- **AI Module:** Machine learning models for real-time anomaly detection and certificate validation.
- **Authentication:** Role-based access control via Ethereum addresses, managed through MetaMask.

## Storage in Blockchain and IPFS

![architect](https://github.com/user-attachments/assets/9dac4126-aa66-4fc8-b15a-55a07111409a)

PharmaChain leverages **Ethereum** and **IPFS** to ensure secure, scalable, and decentralized data storage.

### Ethereum Blockchain

- Stores critical supply chain events (e.g., batch creation, ownership transfers, environmental updates) as immutable records  
- Uses **Solidity** smart contracts to automate processes like batch registration, IoT sensor association, and sale recording  
- Stores metadata such as transaction hashes and **IPFS Content Identifiers (CIDs)** to ensure traceability and tamper-proof records  
- Each pharmaceutical product or box is linked to a unique blockchain address, creating a **digital twin** for lifecycle tracking  

### IPFS (InterPlanetary File System)

- Handles large data payloads such as environmental sensor data (temperature, humidity, location) and certificates, stored **off-chain** to reduce blockchain costs  
- Data is pinned to IPFS nodes, generating unique **CIDs** referenced in the Ethereum blockchain for verification  
- Ensures decentralized, fault-tolerant storage, accessible via an **IPFS gateway** integrated into the middleware  
- **Node-RED** flows upload IoT data to IPFS every minute, with CIDs anchored to the blockchain for data integrity  

### Integration

- Smart contracts link blockchain records to IPFS CIDs, enabling efficient retrieval of detailed data (e.g., environmental logs, certificate PDFs)  
- The **middleware** synchronizes blockchain and IPFS data, ensuring real-time updates and consistency across the system  
- **Final Users** can access IPFS-stored data (e.g., product history, environmental conditions) via the mobile app by querying the blockchain for CIDs
  

## AI Module

The AI module enhances PharmaChain’s security and reliability through advanced machine learning capabilities.

### Certificate Validation

- Validates pharmaceutical certificates (e.g., raw material certifications) uploaded by manufacturers via the web interface  
- Uses machine learning models to analyze certificate content, achieving **96% accuracy** in detecting fraudulent or invalid documents  
- Triggers alerts for invalid certificates, displayed on the web interface


### Integration with Blockchain

- AI results (e.g., validation outcomes, anomaly flags) are recorded on the **Ethereum blockchain** via smart contracts for transparency and auditability  
- Certificate metadata and anomaly reports are stored on **IPFS**, with **CIDs** linked to blockchain records for efficient access  

### Implementation

- Built using machine learning frameworks (e.g., **TensorFlow** or **PyTorch**) and deployed as part of the backend services  
- Accessible via the **web platform** for manufacturers (certificate validation) and distributors/pharmacies (anomaly monitoring)  
- **Final Users** view AI-driven insights (e.g., product authenticity, compliance status) through the **mobile app** 
![arch_ai](https://github.com/user-attachments/assets/4eb9b0f4-e7ee-41d9-bee5-0f17631ef255)


## Prerequisites
Ensure the following are installed:
- **Node.js** (v14.x or higher) to use pinata v20.x
- **npm** (v6.x or higher)
- **Truffle Suite**: For smart contract deployment
- **MetaMask**: Browser extension for Ethereum wallet integration
- **Node-RED**: For IoT data simulation
- **Ganache**: For local Ethereum blockchain testing
- **Expo CLI**: For mobile app development
- A running **Ethereum blockchain** (local or testnet) and **IPFS node**

## Installation and Setup
Place both `MEDPROJECT-Web` and `MEDPROJECT-Mobile` directories in the same parent folder.

### Web Platform Setup
1. Navigate to the web project directory:
   ```bash
   cd MEDPROJECT-Web
   ```
2. Install dependencies:
   ```bash
   npm install lucide-react @material-tailwind/react web3
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Deploy smart contracts:
   Ensure Truffle is configured with your Ethereum network (e.g., Ganache or testnet).
   ```bash
   truffle migrate
   ```
5. Export smart contract ABI:
   ```bash
   node scripts/exportABI.js
   ```
   This script copies the ABI to the user project.
6. Access the web interface:
   Open `http://localhost:5173` (or the port specified by Vite) in your browser.

### Mobile App Setup
1. Navigate to the mobile project directory:
   ```bash
   cd MEDPROJECT-Mobile
   ```
2. Install dependencies:
   ```bash
   npm install @expo/vector-icons @react-native-async-storage/async-storage @react-navigation/native expo-blur expo-constants expo-font expo-haptics expo-image expo-image-picker expo-linear-gradient expo-linking expo-location expo-splash-screen expo-status-bar expo-symbols expo-system-ui expo-web-browser lucide-react-native nativewind zustand --legacy-peer-deps
   ```
3. Start the mobile app:
   ```bash
   npx expo start
   ```
4. Access the mobile app:
   Use the Expo Go app on your iOS/Android device or an emulator to scan the QR code generated by Expo.

### IoT Integration with Node-RED
1. Install Node-RED:
   Follow the official [Node-RED installation guide](https://nodered.org/docs/getting-started/).
2. Start Node-RED:
   ```bash
   node-red
   ```
3. Configure IoT data flow:
   - Create a flow to simulate IoT sensor data (temperature, humidity, location) every 1 minute.
   - Connect the flow to the Ethereum blockchain and IPFS for data storage.
<img width="917" alt="IoT flow" src="https://github.com/user-attachments/assets/f8aef8b2-a9a4-4a23-9691-2c0bc6531fa9" />

## Usage
PharmaChain supports four main actors:

### Manufacturer
- **Create Batches**: Enter batch details, raw materials, and certificates via the web interface. Invalid certificates trigger an alert.
- **Enter Environmental Data**: Manually input conditions like temperature and humidity.
- **Confirm Transactions**: Use MetaMask to validate batch creation and unit assignments.

### Distributor
- **Link IoT Sensors**: Associate boxes with IoT devices via the web interface.
- **Monitor Environmental Data**: Node-RED generates data every minute, stored on IPFS and anchored to the blockchain.

### Pharmacy
- **Link IoT Sensors**: Associate boxes with IoT devices.
- **Record Sales**: Mark medications as sold and update blockchain records.
- **Monitor Conditions**: Access real-time environmental data for received batches.

### Final User
- **Verify Authenticity:** Enter the product reference using the mobile app
- **View Details**: Access product history, including manufacturer, batch number, production date, and environmental conditions.

## Project Structure
```
pharmachain/
├── MEDPROJECT-Web/
│   ├── build/                # Compiled contracts (ABI, bytecode)
│   ├── contracts/            # Solidity smart contracts
│   ├── migrations/           # Truffle deployment scripts
│   ├── src/                  # React.js frontend code
│   ├── scripts/              # Utility scripts
│   │   └── exportABI.js      # Script to export smart contract ABI
│   ├── truffle-config.js     # Blockchain network configuration
│   ├── package.json          # Node.js dependencies
│   └── .env                  # Environment variables
├── MEDPROJECT-Mobile/
│   ├── app/                  # Core React Native code
│   ├── blockchain/           # Blockchain interaction logic
│   ├── components/           # Reusable UI components
│   ├── services/             # Business logic
│   ├── store/                # State management (Zustand)
│   ├── utils/                # Helper functions
│   ├── assets/               # Images and static resources
│   ├── package.json          # Mobile app dependencies
│   └── tsconfig.json         # TypeScript configuration
```


## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments
- **Prof. Mohamed Hanine**: For his mentorship and guidance.
- **Prof. Nouhaila Elakrami**: For her valuable insights.

## Contact
- **Team Members**: Amina Miskar, Ayoub Harati, Zineb Elhalla, Aya El Abidi
- **Institution**: National School of Applied Sciences El Jadida (ENSAJ)
- **Supervisor**: Prof. Mohamed Hanine