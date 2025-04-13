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
    // Nouvel événement pour les alertes de conditions non conformes
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
        MatierePremiere[] memory matieresPremieresLot,
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

        // Create the LotMedicament in storage
        LotMedicament storage lot = lots[lotId];
        lot.lotId = lotId;
        lot.nomMedicament = _nomMedicament;
        lot.substanceActive = _substanceActive;
        lot.forme = _forme;
        lot.dateFabrication = _dateFabrication;
        lot.datePeremption = _datePeremption;
        lot.nomFabricant = _nomFabricant;
        lot.paysOrigine = _paysOrigine;
        lot.amm = _amm;
        lot.conditionsConservation = conservation;
        lot.timestamp = block.timestamp;

        // Copy the matieresPremieresLot array from memory to storage
        for (uint i = 0; i < matieresPremieresLot.length; i++) {
            lot.matieresPremieresLot.push(matieresPremieresLot[i]);
        }

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

    // Fonction interne pour vérifier la conformité des conditions
    function _verifierConditionsConformite(
        uint256 _lotId, 
        int8 _temperature, 
        uint8 _humidite
    ) internal view returns (bool) {
        Conservation memory conditions = lots[_lotId].conditionsConservation;
        
        // Vérifier si la température est dans la plage acceptable
        bool temperatureConforme = (_temperature >= conditions.temperatureMin && 
                                  _temperature <= conditions.temperatureMax);
                                  
        // Vérifier si l'humidité est dans la plage acceptable
        bool humiditeConforme = (_humidite >= conditions.humiditeMin && 
                               _humidite <= conditions.humiditeMax);
                               
        // Les conditions sont conformes si les deux sont conformes
        return temperatureConforme && humiditeConforme;
    }

    // Créer une unité de médicament avec vérification des conditions
    function creerUniteMedicament(
        string memory _medicamentId,
        uint256 _lotId,
        int8 _temperature,
        uint8 _humidite,
        string memory _positionX,
        string memory _positionY
    ) public {
        require(lots[_lotId].lotId == _lotId, "Lot inexistant");
        
        // Vérifier la conformité des conditions
        bool conditionsConformes = _verifierConditionsConformite(_lotId, _temperature, _humidite);
        
        // Si les conditions ne sont pas conformes, émettre une alerte et annuler l'opération
        if (!conditionsConformes) {
            Conservation memory conditions = lots[_lotId].conditionsConservation;
            emit AlerteConditionsNonConformes(
                _medicamentId,
                _lotId,
                _temperature,
                _humidite,
                conditions.temperatureMin,
                conditions.temperatureMax,
                conditions.humiditeMin,
                conditions.humiditeMax
            );
            revert("Conditions de conservation non conformes");
        }
        
        // Si les conditions sont conformes, créer l'unité de médicament
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
        
        // Récupérer le lotId associé à cette unité
        uint256 lotId = unitesMedicament[_medicamentId].lotId;
        
        // Vérifier la conformité des conditions
        bool conditionsConformes = _verifierConditionsConformite(lotId, _temperature, _humidite);
        
        // Si les conditions ne sont pas conformes, émettre une alerte mais mettre quand même à jour
        // pour tracer les conditions problématiques
        if (!conditionsConformes) {
            Conservation memory conditions = lots[lotId].conditionsConservation;
            emit AlerteConditionsNonConformes(
                _medicamentId,
                lotId,
                _temperature,
                _humidite,
                conditions.temperatureMin,
                conditions.temperatureMax,
                conditions.humiditeMin,
                conditions.humiditeMax
            );
        }
        
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
        
        // Vérifier d'abord si les conditions sont conformes
        bool conditionsConformes = _verifierConditionsConformite(_lotId, _temperature, _humidite);
        
        // Si les conditions ne sont pas conformes, émettre une alerte et annuler l'opération
        if (!conditionsConformes) {
            Conservation memory conditions = lots[_lotId].conditionsConservation;
            emit AlerteConditionsNonConformes(
                "lot_multiple",
                _lotId,
                _temperature,
                _humidite,
                conditions.temperatureMin,
                conditions.temperatureMax,
                conditions.humiditeMin,
                conditions.humiditeMax
            );
            revert("Conditions de conservation non conformes pour la création en lot");
        }
        
        // Si les conditions sont conformes, créer toutes les unités
        for (uint i = 0; i < _medicamentIds.length; i++) {
            ConditionsActuelles memory conditions = ConditionsActuelles({
                temperature: _temperature,
                humidite: _humidite,
                positionX: _positionX,
                positionY: _positionY,
                timestamp: block.timestamp
            });
            
            unitesMedicament[_medicamentIds[i]] = UniteMedicament({
                medicamentId: _medicamentIds[i],
                lotId: _lotId,
                conditionsActuelles: conditions,
                timestampCreation: block.timestamp
            });
            
            emit UniteMedicamentCreee(_medicamentIds[i], _lotId, block.timestamp);
        }
    }

    // Fonctions de lecture
    function obtenirDetailsLot(uint256 _lotId) public view returns (LotMedicament memory) {
        return lots[_lotId];
    }

    function obtenirUniteMedicament(string memory _medicamentId) public view returns (UniteMedicament memory) {
        return unitesMedicament[_medicamentId];
    }
    
    // Nouvelle fonction pour vérifier si les conditions actuelles sont conformes
    function verifierConditionsConformes(string memory _medicamentId) public view returns (bool) {
        require(bytes(unitesMedicament[_medicamentId].medicamentId).length > 0, "Médicament inexistant");
        
        uint256 lotId = unitesMedicament[_medicamentId].lotId;
        int8 temperature = unitesMedicament[_medicamentId].conditionsActuelles.temperature;
        uint8 humidite = unitesMedicament[_medicamentId].conditionsActuelles.humidite;
        
        return _verifierConditionsConformite(lotId, temperature, humidite);
    }
}