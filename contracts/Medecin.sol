// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

contract Medecin {
    // Structures de données
    struct Conservation {
        int8 temperatureMax;
        int8 temperatureMin;
        uint8 humiditeMax;
        uint8 humiditeMin;
    }

    struct MatierePremiere {
        string nom;
        string origine;
        string fournisseur;
        string degrePurete;
        string quantiteParUnite;
        string certificatAnalyse;
        string dateReception;
        string transport;
    }


    struct ProductInfo {
        string id;
        string name;
        string manufacturer;
        string manufactureDate;
        string expiryDate;
        string batchNumber;
        string substanceActive;
        string forme;
        string paysOrigine;
        string amm;
        Conservation conditionsConservation;
        EnvironmentalData latestConditions;
        bool sold;
    }

    // only modify things related to removing ConditionsActuelles struct
    struct EnvironmentalData {
        int8 tempMax;
        int8 tempMin;
        int8 tempAvg;
        uint8 humidMax;
        uint8 humidMin;
        uint8 humidAvg;
        string x;
        string y;
        uint256 timestamp;
    }

    struct LotDetails {
        string nomMedicament;
        string substanceActive;
        string forme;
        string dateFabrication;
        string datePeremption;
        string nomFabricant;
        string paysOrigine;
        string amm;
    }

    struct LotMedicament {
        uint256 lotId;
        string nomMedicament;
        string substanceActive;
        string forme;
        string dateFabrication;
        string datePeremption;
        string nomFabricant;
        string paysOrigine;
        string amm;
        Conservation conditionsConservation;
        MatierePremiere[] matieresPremieresLot;
        uint256 timestamp;
    }

    struct UniteMedicament {
        string medicamentId;
        uint256 lotId;
        EnvironmentalData[] environmentalHistory;
        bool sold;
        uint256 timestampCreation;
    }

    struct Box {
        string boxId;
        string[] medicamentIds;
    }

    // Storage
    mapping(uint256 => LotMedicament) public lots;
    mapping(string => string[]) public boxToMedicaments; // Maps boxId to array of medicamentIds
    mapping(string => UniteMedicament) public medicaments; // Maps medicamentId to its data
    mapping(string => string) public boxToIot; // Maps boxId to its assigned iotId
    string[] public allBoxIds; // List of all boxIds for IoT lookups
    uint256 public nextLotId = 1;

    // Events
    event LotCree(uint256 indexed lotId, string nomMedicament, uint256 timestamp);
    event BoxAssembled(string indexed boxId, uint256 lotId, uint256 medicamentCount);
    event MedicamentCreated(string indexed medicamentId, uint256 lotId);
    event EnvironmentalDataRecorded(string indexed iotId, string medicamentId, uint256 timestamp);
    event BoxAssignedToIoT(string indexed iotId, string indexed boxId, uint256 timestamp);

    // Fonction d'ajout d'un lot avec structs regroupés
    function creerLotMedicament(
        LotDetails memory _lotDetails,
        Conservation memory _conservation,
        MatierePremiere[] memory _matieresPremieresLot
    ) public returns (uint256) {
        uint256 lotId = nextLotId++;
        
        LotMedicament storage lot = lots[lotId];
        lot.lotId = lotId;
        lot.nomMedicament = _lotDetails.nomMedicament;
        lot.substanceActive = _lotDetails.substanceActive;
        lot.forme = _lotDetails.forme;
        lot.dateFabrication = _lotDetails.dateFabrication;
        lot.datePeremption = _lotDetails.datePeremption;
        lot.nomFabricant = _lotDetails.nomFabricant;
        lot.paysOrigine = _lotDetails.paysOrigine;
        lot.amm = _lotDetails.amm;
        lot.conditionsConservation = _conservation;
        lot.timestamp = block.timestamp;

        for (uint i = 0; i < _matieresPremieresLot.length; i++) {
            lot.matieresPremieresLot.push(_matieresPremieresLot[i]);
        }

        emit LotCree(lotId, _lotDetails.nomMedicament, block.timestamp);
        return lotId;
    }

    // Create multiple medicine units with same initial EnvironmentalData
    function createMedicamentUnits(
        string[] memory _medicamentIds,
        uint256 _lotId,
        EnvironmentalData memory _envData
    ) public {
        for (uint i = 0; i < _medicamentIds.length; i++) {
            UniteMedicament storage med = medicaments[_medicamentIds[i]];
            med.medicamentId = _medicamentIds[i];
            med.lotId = _lotId;
            med.sold = false;
            med.timestampCreation = block.timestamp;
            med.environmentalHistory.push(_envData);
            emit MedicamentCreated(_medicamentIds[i], _lotId);
        }
    }

    function createAndAssignMedicaments(
        Box[] memory _boxes,
        uint256 _lotId,
        EnvironmentalData memory _envData
    ) public {
        for (uint b = 0; b < _boxes.length; b++) {
            Box memory currentBox = _boxes[b];
            string[] memory medIds = currentBox.medicamentIds;
            // 1. Create units
            for (uint i = 0; i < medIds.length; i++) {
                UniteMedicament storage med = medicaments[medIds[i]];
                med.medicamentId = medIds[i];
                med.lotId = _lotId;
                med.sold = false;
                med.timestampCreation = block.timestamp;
                med.environmentalHistory.push(_envData);
                emit MedicamentCreated(medIds[i], _lotId);
            }
            // 2. Box them
            for (uint i = 0; i < medIds.length; i++) {
                boxToMedicaments[currentBox.boxId].push(medIds[i]);
            }
            emit BoxAssembled(currentBox.boxId, _lotId, medIds.length);
        }
    }

    //zineb IOT

    // Assign or reassign a box to an IoT device
    function assignBoxToIoT(string memory _iotId, string memory _boxId) public {
        require(boxToMedicaments[_boxId].length > 0, "Box non trouvee");
        boxToIot[_boxId] = _iotId;
        allBoxIds.push(_boxId);
        emit BoxAssignedToIoT(_iotId, _boxId, block.timestamp);
    }


    function recordEnvironmentalData(
        string memory _iotId,
        EnvironmentalData memory data
    ) public returns (bool) {
        bool dataRecorded = false;
        bool hasBox = false;
        for (uint i = 0; i < allBoxIds.length; i++) {
            if (keccak256(abi.encodePacked(boxToIot[allBoxIds[i]])) 
                == keccak256(abi.encodePacked(_iotId))) {
                hasBox = true;
                string[] memory meds = boxToMedicaments[allBoxIds[i]];
                for (uint j = 0; j < meds.length; j++) {
                    // Check if medicament exists and is not sold
                    if (medicamentExists(meds[j]) && !medicaments[meds[j]].sold) {
                        EnvironmentalData memory newData = EnvironmentalData({
                            tempMax: data.tempMax,
                            tempMin: data.tempMin,
                            tempAvg: data.tempAvg,
                            humidMax: data.humidMax,
                            humidMin: data.humidMin,
                            humidAvg: data.humidAvg,
                            x: data.x,
                            y: data.y,
                            timestamp: block.timestamp
                        });
                        medicaments[meds[j]].environmentalHistory.push(newData);
                        emit EnvironmentalDataRecorded(_iotId, meds[j], block.timestamp);
                        dataRecorded = true;
                    }
                }
            }
        }
        if (!hasBox) return false;
        return dataRecorded;
    }


    // ask the contract “Which boxes does this IoT device currently manage”
    function getBoxesForIoT(string memory _iotId) public view returns (string[] memory) {
        uint total = allBoxIds.length;
        string[] memory temp = new string[](total);
        uint count = 0;
        for (uint i = 0; i < total; i++) {
            if (keccak256(abi.encodePacked(boxToIot[allBoxIds[i]])) 
                == keccak256(abi.encodePacked(_iotId))) {
                temp[count++] = allBoxIds[i];
            }
        }
        string[] memory result = new string[](count);
        for (uint i = 0; i < count; i++) {
            result[i] = temp[i];
        }
        return result;
    }

    //Amina
    // Get environmental history for a medicament
    function getEnvironmentalHistory(string memory _medicamentId)
        public view returns (EnvironmentalData[] memory)
    {
        require(medicamentExists(_medicamentId), "Medicament non trouve");
        return medicaments[_medicamentId].environmentalHistory;
    }

    

    function getProductInfo(string memory _medicamentId) public view returns (ProductInfo memory) {
        UniteMedicament memory unit = medicaments[_medicamentId];
        require(bytes(unit.medicamentId).length > 0, "Medicament non trouve");
        LotMedicament memory lot = lots[unit.lotId];
        EnvironmentalData memory latest;
        if (unit.environmentalHistory.length > 0) {
            latest = unit.environmentalHistory[unit.environmentalHistory.length - 1];
        }
        return ProductInfo(
            unit.medicamentId,
            lot.nomMedicament,
            lot.nomFabricant,
            lot.dateFabrication,
            lot.datePeremption,
            string(abi.encodePacked("LOT-", uintToString(unit.lotId))),
            lot.substanceActive,
            lot.forme,
            lot.paysOrigine,
            lot.amm,
            lot.conditionsConservation,
            latest,
            unit.sold
        );
    }

    function getRawMaterials(string memory _medicamentId)
        public view returns (MatierePremiere[] memory)
    {
        UniteMedicament memory unit = medicaments[_medicamentId];
        require(bytes(unit.medicamentId).length > 0, "Medicament non trouve");
        return lots[unit.lotId].matieresPremieresLot;
    }

    // Helper to check if a medicament exists
function medicamentExists(string memory _medicamentId) public view returns (bool) {
    return bytes(medicaments[_medicamentId].medicamentId).length > 0;
}

function uintToString(uint _value) internal pure returns (string memory) {
        if (_value == 0) {
            return "0";
        }
        uint temp = _value;
        uint digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (_value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + _value % 10));
            _value /= 10;
        }
        return string(buffer);
    }

    function markMedicamentAsSold(string memory _medicamentId) public {
        require(medicamentExists(_medicamentId), "Medicament does not exist");
        UniteMedicament storage med = medicaments[_medicamentId];
        require(!med.sold, "Medicament already sold");
        
        // Mark as sold
        med.sold = true;
        
        // Remove from all boxes
        for (uint i = 0; i < allBoxIds.length; i++) {
            string storage boxId = allBoxIds[i];
            string[] storage medIds = boxToMedicaments[boxId];
            
            // Find and remove the medicament ID
            for (uint j = 0; j < medIds.length; j++) {
                if (keccak256(abi.encodePacked(medIds[j])) == keccak256(abi.encodePacked(_medicamentId))) {
                    // Swap and pop to remove element
                    if (j < medIds.length - 1) {
                        medIds[j] = medIds[medIds.length - 1];
                    }
                    medIds.pop();
                    break; // Exit inner loop after removal
                }
            }
        }
    }
}