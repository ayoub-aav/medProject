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

    struct ConditionsActuelles {
        int8 temperature;
        uint8 humidite;
        string positionX;
        string positionY;
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
        ConditionsActuelles conditionsActuelles;
        uint256 timestampCreation;
    }

    // Storage
    mapping(uint256 => LotMedicament) public lots;
    mapping(string => string[]) public boxToMedicaments; // Maps boxId to array of medicamentIds
    mapping(string => UniteMedicament) public medicaments; // Maps medicamentId to its data
    uint256 public nextLotId = 1;

    // Events
    event LotCree(uint256 indexed lotId, string nomMedicament, uint256 timestamp);
    event BoxAssembled(string indexed boxId, uint256 lotId, uint256 medicamentCount);
    event MedicamentCreated(string indexed medicamentId, uint256 lotId);

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

    // Create multiple medicine units with same parameters (except IDs)
    function createMedicamentUnits(
        string[] memory _medicamentIds,
        uint256 _lotId,
        ConditionsActuelles memory _conditions
    ) public {
        for (uint i = 0; i < _medicamentIds.length; i++) {
            medicaments[_medicamentIds[i]] = UniteMedicament({
                medicamentId: _medicamentIds[i],
                lotId: _lotId,
                conditionsActuelles: _conditions,
                timestampCreation: block.timestamp
            });
            
            emit MedicamentCreated(_medicamentIds[i], _lotId);
        }
    }

    // Assign multiple existing medicines to a box
    function assignMedicamentsToBox(
        string memory _boxId,
        string[] memory _medicamentIds
    ) public {
        for (uint i = 0; i < _medicamentIds.length; i++) {
            require(bytes(medicaments[_medicamentIds[i]].medicamentId).length > 0, "Medicament does not exist");
            boxToMedicaments[_boxId].push(_medicamentIds[i]);
        }
        
        emit BoxAssembled(_boxId, medicaments[_medicamentIds[0]].lotId, _medicamentIds.length);
    }

    // Get all medicine IDs in a box
    function getMedicamentsInBox(string memory _boxId) public view returns (string[] memory) {
        return boxToMedicaments[_boxId];
    }

    // Get medicine details
    function getMedicamentDetails(string memory _medicamentId) public view returns (
        UniteMedicament memory,
        LotMedicament memory
    ) {
        UniteMedicament memory unit = medicaments[_medicamentId];
        LotMedicament memory lot = lots[unit.lotId];
        return (unit, lot);
    }
}