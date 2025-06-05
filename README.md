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

PharmaChain's modular architecture separates presentation, business logic, middleware, and storage layers for maintainability and scalability. Key components include:

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

The AI module enhances PharmaChain's security and reliability through advanced machine learning capabilities.

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

### Prerequisites Installation
1. **Node.js and npm**
   - Download and install Node.js (v14.x or higher) from [nodejs.org](https://nodejs.org)
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```

2. **Truffle Suite**
   - Install Truffle globally:
     ```bash
     npm install -g truffle
     ```
   - Verify installation:
     ```bash
     truffle version
     ```

3. **MetaMask**
   - Install MetaMask browser extension from [metamask.io](https://metamask.io)
   - Create a new wallet or import existing one
   - Add a test network (e.g., Sepolia) for development

4. **Ganache**
   - Download and install Ganache from [trufflesuite.com/ganache](https://trufflesuite.com/ganache)
   - Create a new workspace
   - Note down the RPC URL (usually `http://127.0.0.1:7545`)

5. **Node-RED**
   - Install Node-RED globally:
     ```bash
     npm install -g node-red
     ```
   - Verify installation:
     ```bash
     node-red --version
     ```

6. **Expo CLI**
   - Install Expo CLI globally:
     ```bash
     npm install -g expo-cli
     ```
   - Verify installation:
     ```bash
     expo --version
     ```

### Project Setup

1. **Clone and Organize**
   ```bash
   # Create a parent directory
   mkdir pharmachain
   cd pharmachain

   # Clone both repositories
   git clone <MEDPROJECT-Web-repo-url>
   git clone <MEDPROJECT-Mobile-repo-url>
   ```

2. **Environment Configuration**
   - Create `.env` files in both projects:
     ```bash
     # MEDPROJECT-Web/.env
     REACT_APP_CONTRACT_ADDRESS=<your-contract-address>
     REACT_APP_NETWORK_ID=<your-network-id>
     REACT_APP_RPC_URL=<your-rpc-url>
     ```

### Web Platform Setup

1. **Install Dependencies**
   ```bash
   cd MEDPROJECT-Web
   npm install
   npm install lucide-react @material-tailwind/react web3
   ```

2. **Smart Contract Deployment**
   ```bash
   # Configure truffle-config.js with your network settings
   # Example configuration:
   module.exports = {
     networks: {
       development: {
         host: "127.0.0.1",
         port: 7545,
         network_id: "*"
       }
     }
   }

   # Deploy contracts
   truffle migrate --reset
   ```

3. **Export Contract ABI**
   ```bash
   # Run the export script
   node scripts/exportABI.js
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

### Mobile App Setup

1. **Install Dependencies**
   ```bash
   cd MEDPROJECT-Mobile
   npm install
   npm install @expo/vector-icons @react-native-async-storage/async-storage @react-navigation/native expo-blur expo-constants expo-font expo-haptics expo-image expo-image-picker expo-linear-gradient expo-linking expo-location expo-splash-screen expo-status-bar expo-symbols expo-system-ui expo-web-browser lucide-react-native nativewind zustand --legacy-peer-deps
   ```

2. **Configure Environment**
   - Create `app.config.js`:
     ```javascript
     export default {
       expo: {
         name: "PharmaChain",
         slug: "pharmachain",
         version: "1.0.0",
         orientation: "portrait",
         // Add other configuration as needed
       }
     };
     ```

3. **Start Mobile App**
   ```bash
   npx expo start
   ```

### IoT Integration Setup

1. **Start Node-RED**
   ```bash
   node-red
   ```

2. **Configure IoT Flow**
   - Open Node-RED in browser (http://localhost:1880)
   - Import the provided flow configuration
   - Configure the following nodes:
     - IoT Sensor Simulator
     - Ethereum Connection
     - IPFS Upload
     - Data Processing

3. **Test IoT Integration**
   - Verify sensor data generation
   - Check blockchain transactions
   - Monitor IPFS uploads

### Verification Steps

1. **Web Platform**
   - Open http://localhost:5173
   - Connect MetaMask
   - Verify contract interaction
   - Test batch creation

2. **Mobile App**
   - Install Expo Go on your device
   - Scan QR code from terminal
   - Test product verification
   - Check environmental data

3. **IoT Integration**
   - Monitor Node-RED dashboard
   - Verify data flow
   - Check blockchain records
   - Validate IPFS storage

### Troubleshooting

1. **Common Issues**
   - MetaMask Connection: Ensure correct network and account
   - Contract Deployment: Check Ganache connection
   - Mobile App: Clear cache and restart Expo
   - IoT Data: Verify Node-RED flow configuration

2. **Support**
   - Check console logs for errors
   - Verify network connectivity
   - Ensure all services are running
   - Check environment variables

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
- **Supervisor**: Prof. Mohamed Hanine