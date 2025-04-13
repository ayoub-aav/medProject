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

    // Parameter structs for function inputs
    struct LotCreationParams {
        string nomMedicament;
        string substanceActive;
        string forme;
        string dateFabrication;
        string datePeremption;
        string nomFabricant;
        string paysOrigine;
        string amm;
        MatierePremiere[] matieresPremieresLot;
    }

    struct ConservationParams {
        int8 temperatureMax;
        int8 temperatureMin;
        uint8 humiditeMax;
        uint8 humiditeMin;
    }

    struct UniteCreationParams {
        string medicamentId;
        uint256 lotId;
        int8 temperature;
        uint8 humidite;
        string positionX;
        string positionY;
    }

    // Storage
    mapping(uint256 => LotMedicament) public lots;
    mapping(string => UniteMedicament) public unitesMedicament;
    uint256 public nextLotId = 1;

    // Events
    event LotCree(uint256 indexed lotId, string nomMedicament, uint256 timestamp);
    event MatierePremiereAjoutee(uint256 indexed lotId, string nom, string fournisseur);
    event UniteMedicamentCreee(string medicamentId, uint256 lotId, uint256 timestamp);
    event ConditionsMedicamentMisesAJour(string medicamentId, int8 temperature, uint8 humidite, string positionX, string positionY, uint256 timestamp);
    event AlerteConditionsNonConformes(
        string medicamentId, 
        uint256 lotId, 
        int8 temperatureActuelle, 
        uint8 humiditeActuelle, 
        int8 temperatureMinRequise, 
        int8 temperatureMaxRequise, 
        uint8 humiditeMinRequise, 
        uint8 humiditeMaxRequise
    );

    // Main Functions
    function creerLotMedicament(
        LotCreationParams memory _params,
        ConservationParams memory _conservation
    ) public returns (uint256) {
        uint256 lotId = nextLotId++;
        
        Conservation memory conservation = Conservation({
            temperatureMax: _conservation.temperatureMax,
            temperatureMin: _conservation.temperatureMin,
            humiditeMax: _conservation.humiditeMax,
            humiditeMin: _conservation.humiditeMin
        });

        LotMedicament storage lot = lots[lotId];
        lot.lotId = lotId;
        lot.nomMedicament = _params.nomMedicament;
        lot.substanceActive = _params.substanceActive;
        lot.forme = _params.forme;
        lot.dateFabrication = _params.dateFabrication;
        lot.datePeremption = _params.datePeremption;
        lot.nomFabricant = _params.nomFabricant;
        lot.paysOrigine = _params.paysOrigine;
        lot.amm = _params.amm;
        lot.conditionsConservation = conservation;
        lot.timestamp = block.timestamp;

        for (uint i = 0; i < _params.matieresPremieresLot.length; i++) {
            lot.matieresPremieresLot.push(_params.matieresPremieresLot[i]);
        }

        emit LotCree(lotId, _params.nomMedicament, block.timestamp);
        return lotId;
    }

    function ajouterMatierePremiere(
        uint256 _lotId,
        string memory _nom,
        string memory _origine,
        string memory _fournisseur,
        string memory _degrePurete,
        string memory _quantiteParUnite,
        string memory _certificatAnalyse,
        string memory _dateReception,
        string memory _transport
    ) public {
        require(lots[_lotId].lotId == _lotId, "Lot inexistant");
        
        MatierePremiere memory matiere = MatierePremiere({
            nom: _nom,
            origine: _origine,
            fournisseur: _fournisseur,
            degrePurete: _degrePurete,
            quantiteParUnite: _quantiteParUnite,
            certificatAnalyse: _certificatAnalyse,
            dateReception: _dateReception,
            transport: _transport
        });
        
        lots[_lotId].matieresPremieresLot.push(matiere);
        emit MatierePremiereAjoutee(_lotId, _nom, _fournisseur);
    }

    function creerUniteMedicament(
        UniteCreationParams memory _params
    ) public {
        require(lots[_params.lotId].lotId == _params.lotId, "Lot inexistant");
        
        bool conditionsConformes = _verifierConditionsConformite(
            _params.lotId, 
            _params.temperature, 
            _params.humidite
        );
        
        if (!conditionsConformes) {
            Conservation memory conditions = lots[_params.lotId].conditionsConservation;
            emit AlerteConditionsNonConformes(
                _params.medicamentId,
                _params.lotId,
                _params.temperature,
                _params.humidite,
                conditions.temperatureMin,
                conditions.temperatureMax,
                conditions.humiditeMin,
                conditions.humiditeMax
            );
            revert("Conditions de conservation non conformes");
        }
        
        unitesMedicament[_params.medicamentId] = UniteMedicament({
            medicamentId: _params.medicamentId,
            lotId: _params.lotId,
            conditionsActuelles: ConditionsActuelles({
                temperature: _params.temperature,
                humidite: _params.humidite,
                positionX: _params.positionX,
                positionY: _params.positionY,
                timestamp: block.timestamp
            }),
            timestampCreation: block.timestamp
        });
        
        emit UniteMedicamentCreee(_params.medicamentId, _params.lotId, block.timestamp);
    }

    // View Functions
    function obtenirDetailsLot(uint256 _lotId) public view returns (LotMedicament memory) {
        return lots[_lotId];
    }

    function obtenirUniteMedicament(string memory _medicamentId) public view returns (UniteMedicament memory) {
        return unitesMedicament[_medicamentId];
    }

    function verifierConditionsConformes(string memory _medicamentId) public view returns (bool) {
        require(bytes(unitesMedicament[_medicamentId].medicamentId).length > 0, "Medicament inexistant");
        uint256 lotId = unitesMedicament[_medicamentId].lotId;
        int8 temperature = unitesMedicament[_medicamentId].conditionsActuelles.temperature;
        uint8 humidite = unitesMedicament[_medicamentId].conditionsActuelles.humidite;
        return _verifierConditionsConformite(lotId, temperature, humidite);
    }

    // Internal Functions
    function _verifierConditionsConformite(
        uint256 _lotId, 
        int8 _temperature, 
        uint8 _humidite
    ) internal view returns (bool) {
        Conservation memory conditions = lots[_lotId].conditionsConservation;
        bool temperatureConforme = (_temperature >= conditions.temperatureMin && 
                                  _temperature <= conditions.temperatureMax);
        bool humiditeConforme = (_humidite >= conditions.humiditeMin && 
                               _humidite <= conditions.humiditeMax);
        return temperatureConforme && humiditeConforme;
    }
}