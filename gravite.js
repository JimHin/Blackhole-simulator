//---------------------------------
// Crée le 22/02/2019
// par Jean-Michel Hinicker
// Dernière Date de modification: 28/02/2019

// -------------------------------
// CLASSE VECTEUR
// -------------------------------
class Vecteur {

    constructor(x, y) {
        this.miseAjour(x, y);
    }
    miseAjour(x, y) {
        this.x = x;
        this.y = y;
    }
    ajoute(vec) {
        return new Vecteur(this.x + vec.x, this.y + vec.y);
    }
    ajouteA(vec) {
        this.x += vec.x;
        this.y += vec.y;
        return this;
    }
    soustraire(vec) {
        return new Vecteur(this.x - vec.x, this.y - vec.y);
    }
    soustraireApartirDe(vec) {
        this.x -= vec.x;
        this.y -= vec.y;
        return this;
    }
    multiplier(scalaire) {
        return new Vecteur(this.x * scalaire, this.y * scalaire);
    }
    multiplierPar(scalaire) {
        this.x *= scalaire;
        this.y *= scalaire;
        return this;
    }
    diviser(scalaire) {
        return new Vecteur(this.x / scalaire, this.y / scalaire);
    }
    divisePar(scalaire) {
        this.x /= scalaire;
        this.y /= scalaire;
        return this;
    }
    // La norme du vecteur est la longueur du segment qu'il représente
    norme() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    // Retourne un vecteur de même dimension mais de norme 1
    normaliser() {
        var norme = this.norme();
        return this.diviser(norme);
    }
    // Retourne un vecteur sous forme de chaîne de caractères
    enChaineDeCaractere() {
        return 'Vecteur<' + this.x + ',' + this.y + '>';
    }
}


// -------------------------------
// CLASSE PLANETE
// -------------------------------

class Planete {

    constructor(nom, masse, rayon) {
        this.nom = nom;
        this.masse = masse;
        this.rayon = rayon;
        this.position = new Vecteur(0, 0);
        this.rapidite = new Vecteur(0, 0);
        this.acceleration = new Vecteur(0, 0);
        this.epingle = false;
        this.color = "rgb(255, 255, 255)";
    }
    epingler() {
        this.epingle = true;
    };
    
   
    definirPosition(x, y) {
        this.position.miseAjour(x, y);
    }
    definirRapidite(x, y) {
        this.rapidite.miseAjour(x, y);
    }
    definirAcceleration(x, y) {
        this.acceleration.miseAjour(x, y);
    }
    // `ctx` est le contexte du canvas
    dessine(ctx) {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.position.x, this.position.y, this.rayon, 0, 2 * Math.PI);
        ctx.fill();
    }
}

// -------------------------------
// CLASSE HASHAGE SPATIAL
// -------------------------------

class HachageSpatial {

    constructor(width, height, cellSize) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        this.cellX = Math.ceil(width / cellSize);
        this.cellY = Math.ceil(height / cellSize);
        this.nbCells = this.cellX * this.cellY;
    }
    clear() {
        this.cells = [this.nbCells];
    }
    insert(planete) {
        var x = planete.position.x;
        var y = planete.position.y;
        var rayon = planete.rayon;
        var cellIndexes = [
            this.getIndex(x - rayon, y - rayon),
            this.getIndex(x + rayon, y - rayon),
            this.getIndex(x - rayon, y + rayon),
            this.getIndex(x + rayon, y + rayon)
        ];
        cellIndexes = cellIndexes.filter(function (value, index, self) {
            return self.indexOf(value) === index;
        });
        cellIndexes.forEach(function (cellIndex) {
            if (!Array.isArray(this.cells[cellIndex])) {
                this.cells[cellIndex] = [];
            }
            this.cells[cellIndex].push(planete);
        }, this);
    }

   getIndex(x, y) {
        var cellIndex = Math.round(x / this.cellSize) + Math.round(y / this.cellSize) * this.cellX;
        return parseInt(cellIndex);
    };
}



// -------------------------------
// CLASSE ESPACE
// -------------------------------
class Espace {

    constructor(canvas) {
        var cellSize = 1;
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;
        this.ctx = canvas.getContext('2d');
        this.planetes = new Array();
        // Constante gravitationnelle déclarée arbitrairement pour le moment
        // this.G = 6.67408 * 10^-11;
        this.G = 0.000492;
        this.timeSpeed = 1;
        this.frameId = null;
        this.dernierRendu = null;
        this._spatialHash = new HachageSpatial(this.width, this.height, cellSize);
        

    }
    // Méthode d'ajout des planètes
    ajouterPlanete(nom, masse, rayon) {
        var planete = new Planete(nom, masse, rayon);
        planete.definirPosition(0, 0);
        this.planetes.push(planete);
        return planete;
    }
    // Méthode qui dessine l'espace et toutes les planètes
    dessine() {
        this.ctx.fillStyle = "rgb(0,0,0)";
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.planetes.forEach(function (planete) {
            planete.dessine(this.ctx);
        }, this);
    }

    // Méthode qui retourne la distance Euclidienne entre deux planètes 
    distance(p1, p2) {
        return p2.position.soustraire(p1.position).norme();
    }

    // Méthode de détection de collision?
    collision(p1,p2){
        var dist = this.distance(p1, p2);
        return (dist - p1.rayon - p2.rayon) <= 0;
    };
    // Méthode de détection de visibilité d'une planète dans la frame
    estVisible(planete) {
        var x = planete.position.x;
        var y = planete.position.y;

        return x >= 0 && y >= 0 && x < this.width && y < this.height;
    };
    //Méthode de fusion des planètes
    fusionPlanetes(p1, p2) {
        if (p1.rayon < p2.rayon) {
            var p = p2;
            p2 = p1;
            p1 = p;
        }
    };
    //Procédure qui gère les conséquences des collisions
    verifieCollisions() {
        this._spatialHash.clear();
        this.planetes.forEach(function(planete) {
            if (this.estVisible(planete)) {
                this._spatialHash.insert(planete);
            }
        }, this);

        this._spatialHash.cells.forEach(function(planetes) {
            var bigPlanet, smallPlanet;
            if (planetes.length > 0) {
                var i = 0;
                var j = 1;
                for (var i = 0 ; i < planetes.length - 1 ; i++) {
                    for (var j = i + 1 ; j < planetes.length ; j++) {
                        var p1 = planetes[i];
                        var p2 = planetes[j];
                        if (this.collision(p1, p2) && (p1.masse > 1 || p2.masse > 1)) {
                            
                            if (p1.masse >= p2.masse) {
                                bigPlanet = p1;
                                smallPlanet = p2;
                                
                            } else {
                                bigPlanet = p2;
                                smallPlanet = p1;
                            }
                            // -------------------------------
                            // Conséquences des collisions
                            // -------------------------------
                           /*var index = this.planetes.indexOf(smallPlanet);
                            var neoAstre = p1;
                            var debris = p2;
                            neoAstre.masse = p1.masse + (p2.masse/2);
                            neoAstre.rayon = p1.rayon + (p2.rayon/3);
                            debris.masse = p2.masse/2;
                            debris.rayon = p2.rayon/3;*/

                            
                            //delete this.planetes[index];
                            //... ici viendra le code des conséquences réelles des diverses collisions
                        }
                    }
                }
            }
        }, this);
    };

    


// -------------------------------
// BOUCLE DE MODELISATION DU TEMPS
// -------------------------------
    
    // Tends vers un rendu de 30 fps, soit environ une frame toutes
    // les 30 ms.
    boucle(temps_present) {
        if (this.dernierRendu === null) {
            this.dernierRendu = temps_present;
        }
        var progress = temps_present - this.dernierRendu;
        if (progress > 30) {
            this.miseAjour(progress);
            this.dessine();
            this.dernierRendu = temps_present;
        }
        this.frameId = window.requestAnimationFrame(this.boucle.bind(this));
    }
    // Lance la simulation
    simule() {
        this.frameId = window.requestAnimationFrame(this.boucle.bind(this));
    }
    // Stoppe la simulation
    stop() {
        if (this.frameId !== null) {
            window.cancelAnimationFrame(this.frameId);
            this.frameId = null;
            this.dernierRendu = null;
        }
    }

    // -------------------------------
    // MISE A JOUR DE L'ETAT DE L'ESPACE
    // -------------------------------

    miseAjour(delta_ms) {
        // Convertion du delta en secondes
        var delta = delta_ms / 1000.0;
        // Mise à jour des positions des planètes
        this.planetes.forEach(function (planete) {
            planete.position
                .ajouteA(planete.rapidite.multiplier(delta))
                .ajouteA(planete.acceleration.multiplier(delta * delta).diviser(2));
        }, this);

        // Remove planets that crashed somewhere
        this.verifieCollisions();
        // Mise à jour des vélocités après calcul de toutes les positions
        // Comme à chaque tour de boucle, nous utilisons l'accélération
        // calculée au tour précédent, cette valeur est stockée en cache
        // pour une question de performance.
        this.planetes.forEach(function (planete) {
            var nouvelleAcceleration = this.calculAcceleration(planete);
            planete.rapidite.ajouteA(planete.acceleration
                .ajoute(nouvelleAcceleration)
                .multiplierPar(delta)
                .divisePar(2));
            planete.definirAcceleration(nouvelleAcceleration.x, nouvelleAcceleration.y);
        }, this);
    }

    // ---------------------------------------------------------------------------------
    // CALCUL D'ACCELERATION DE LA FRONDE GRAVITATIONNELLE S'APPLIQUANT SUR LES PLANETES
    // ---------------------------------------------------------------------------------

    calculAcceleration(planete) {
        var force = new Vecteur(0, 0);
        // Force de gravité exerçée par toutes les autres planètes
        this.planetes.forEach(function (autrePlanete) {
            // Pour des raisons de performances, les planètes de masse 1 seront considérés comme négligeable
            if (!Object.is(planete, autrePlanete) && autrePlanete.masse > 1) {
                
                var direction = autrePlanete.position.soustraire(planete.position);
                var distance = direction.norme();
                //expression de la gravité selon l'équation de Newton
            
                // F = (G * m1 * m2) / d^2
                // G : constante gravitationnelle
                // m1 : masse de l'astre 1
                // m2 : masse de l'astre 2 
                // d : distance entre les deux.
                var gravite = direction.normaliser().multiplierPar(this.G * planete.masse * autrePlanete.masse / (distance * distance));
                force.ajouteA(gravite);
            }
        }, this);
        return force.divisePar(planete.masse);
    }
}







