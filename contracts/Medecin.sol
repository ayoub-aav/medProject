// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract TracabiliteMedicaments {
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
        string amm; // Autorisation mise sur marché
        Conservation conditionsConservation;
        MatierePremiere[] matieresPremieresLot; // Matières premières intégrées directement ici
        uint256 timestamp; // Date de création du lot
    }

    struct UniteMedicament {
        string medicamentId; // ID unique pour chaque unité (du fichier Excel)
        uint256 lotId; // Référence au lot commun
        ConditionsActuelles conditionsActuelles;  // Conditions actuelles
        uint256 timestampCreation;
    }

    // Mappings pour stocker les données
    mapping(uint256 => LotMedicament) public lots;
    mapping(string => UniteMedicament) public unitesMedicament;
    uint256 public nextLotId = 1;

    // Événements pour tracer les mises à jour
    event LotCree(uint256 indexed lotId, string nomMedicament, uint256 timestamp);
    event MatierePremiereAjoutee(uint256 indexed lotId, string nom, string fournisseur);
    event UniteMedicamentCreee(string medicamentId, uint256 lotId, uint256 timestamp);
    event ConditionsMedicamentMisesAJour(string medicamentId, int8 temperature, uint8 humidite, string positionX, string positionY, uint256 timestamp);

    // Créer un nouveau lot de médicaments
    function creerLotMedicament(
        string memory _nomMedicament,
        string memory _substanceActive,
        string memory _forme,
        string memory _dateFabrication,
        string memory _datePeremption,
        string memory _nomFabricant,
        string memory _paysOrigine,
        string memory _amm,
        int8 _temperatureMax,
        int8 _temperatureMin,
        uint8 _humiditeMax,
        uint8 _humiditeMin
    ) public returns (uint256) {
        uint256 lotId = nextLotId;
        nextLotId++;

        Conservation memory conservation = Conservation({
            temperatureMax: _temperatureMax,
            temperatureMin: _temperatureMin,
            humiditeMax: _humiditeMax,
            humiditeMin: _humiditeMin
        });

        // Initialiser la structure LotMedicament avec un tableau vide de matières premières
        MatierePremiere[] memory matieresPremieresVide = new MatierePremiere[](0);
        
        lots[lotId] = LotMedicament({
            lotId: lotId,
            nomMedicament: _nomMedicament,
            substanceActive: _substanceActive,
            forme: _forme,
            dateFabrication: _dateFabrication,
            datePeremption: _datePeremption,
            nomFabricant: _nomFabricant,
            paysOrigine: _paysOrigine,
            amm: _amm,
            conditionsConservation: conservation,
            matieresPremieresLot: matieresPremieresVide,
            timestamp: block.timestamp
        });

        emit LotCree(lotId, _nomMedicament, block.timestamp);
        return lotId;
    }

    // Ajouter une matière première à un lot
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

    // Créer une unité de médicament
    function creerUniteMedicament(
        string memory _medicamentId,
        uint256 _lotId,
        int8 _temperature,
        uint8 _humidite,
        string memory _positionX,
        string memory _positionY
    ) public {
        require(lots[_lotId].lotId == _lotId, "Lot inexistant");
        
        ConditionsActuelles memory conditions = ConditionsActuelles({
            temperature: _temperature,
            humidite: _humidite,
            positionX: _positionX,
            positionY: _positionY,
            timestamp: block.timestamp
        });
        
        unitesMedicament[_medicamentId] = UniteMedicament({
            medicamentId: _medicamentId,
            lotId: _lotId,
            conditionsActuelles: conditions,
            timestampCreation: block.timestamp
        });
        
        emit UniteMedicamentCreee(_medicamentId, _lotId, block.timestamp);
    }

    // Mettre à jour les conditions d'une unité de médicament
    function miseAJourConditions(
        string memory _medicamentId,
        int8 _temperature,
        uint8 _humidite,
        string memory _positionX,
        string memory _positionY
    ) public {
        // Vérifier que l'unité de médicament existe
        require(bytes(unitesMedicament[_medicamentId].medicamentId).length > 0, "Médicament inexistant");
        
        // Mettre à jour les conditions actuelles
        unitesMedicament[_medicamentId].conditionsActuelles = ConditionsActuelles({
            temperature: _temperature,
            humidite: _humidite,
            positionX: _positionX,
            positionY: _positionY,
            timestamp: block.timestamp
        });
        
        emit ConditionsMedicamentMisesAJour(_medicamentId, _temperature, _humidite, _positionX, _positionY, block.timestamp);
    }

    // Fonction pour créer plusieurs unités de médicament à partir d'un fichier Excel
    function creerUnitesMedicamentEnLot(
        string[] memory _medicamentIds, 
        uint256 _lotId,
        int8 _temperature,
        uint8 _humidite,
        string memory _positionX,
        string memory _positionY
    ) public {
        require(lots[_lotId].lotId == _lotId, "Lot inexistant");
        
        for (uint i = 0; i < _medicamentIds.length; i++) {
            creerUniteMedicament(
                _medicamentIds[i],
                _lotId,
                _temperature,
                _humidite,
                _positionX,
                _positionY
            );
        }
    }

    // Fonctions de lecture
    function obtenirDetailsLot(uint256 _lotId) public view returns (LotMedicament memory) {
        return lots[_lotId];
    }

    function obtenirUniteMedicament(string memory _medicamentId) public view returns (UniteMedicament memory) {
        return unitesMedicament[_medicamentId];
    }
}