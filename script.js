/* Créons un objet qui représentera une question et ses assertions*/
function Question(phrase = "", assertions = [""], correct = 0) {
    this.phrase = phrase;
    this.assertions = assertions;
    this.correct = correct;
}
/* Créons l'objet représentant notre application Quiz App*/
class Quizz_app {
    /**
     * Le constructeur de Quizz App,
     * @param {HTMLElement[]} page_list La liste des balises articles de notre application, normalement 3 article
     * @param {Question[]} question_list Un tableau des nos questions, des objets Questions
     */
    constructor(page_list, question_list) {
        /** Contient les informations saisis par l'utilisateur de l'application */
        this.user = {};
        /** @type {Object<String>} Un objet qui contiendra à chaque fois les elements Html que nous modie */
        this.cur_elm = {};
        /** @type {Number} Un nombre qui représente le temps restant à la quetion*/
        this.temps = 60;
        /** @type {Number} Un nombre qui stocke l'id d'un setInterval, pour le compte à rebourt*/
        this.interval_controle = 0;
        /** @type {Number} Un nombre qui représente le point qu'a le candidat*/
        this.success = 0;
        /** @type {Question[]} */
        this.question_list = question_list;
        /** @type {NodeList<HTMLElement>} */
        this.page_list = page_list;
    }
    /**
     * Permet d'initialiser la page d'acceuil, va afficher la page d'identification
     */
    init_accueil() {
        // On commence par masquer tous les autres articles
        this.page_list.forEach(el => el.style.display = "none");
        this.page_list[0] ? (this.page_list[0].style.display = "block") : ('');
        this.cur_elm = {};
        // On ajoute l'article actuel, ses inputs, span d'erreur et le bouton
        this.cur_elm.page = this.page_list[0];
        this.cur_elm.inputs = document.querySelectorAll(`#${this.cur_elm.page.id} input[type='text']`);
        this.cur_elm.btn = document.querySelector(`#${this.cur_elm.page.id} button`);
        this.cur_elm.erreur = document.querySelectorAll(`#${this.cur_elm.page.id} .error`);
        // On initialise le formulaire
        this.cur_elm.inputs.forEach(el => el.value = "");
        // On ajoute un event au bouton pour commencer
        this.cur_elm.btn.addEventListener('click', this.commencer.bind(this));
    }
    commencer() {
        let [nom, email] = [this.cur_elm.inputs[0], this.cur_elm.inputs[1]];
        // On verifier les données saisis
        let isOk = [nom.value.length > 3, /^.+@.+\..+$/.test(email.value.trim())];
        // Si les données saisies sont incorrectes on reste sur la page, et on affiche l'erreur
        this.cur_elm.erreur[0].textContent = isOk[0] ? "" : "N'oubliez pas de renseigner votre nom avant de commencer le quiz";
        this.cur_elm.inputs[0].classList.toggle('red_border', !isOk[0]);
        this.cur_elm.erreur[1].textContent = isOk[1] ? "" : "N'oubliez pas de renseigner votre email avant de commencer le quiz";
        this.cur_elm.inputs[1].classList.toggle('red_border', !isOk[1]);
        if (!(isOk[0] && isOk[1])) return;
        // On stocke alors ces données
        this.user.nom = nom.value;
        this.user.email = email.value;
        // Finalement on initialise la page suivante
        this.init_quiz();
    }
    /**
     * init_quiz() permet d'afficher la page de question, elle se charge aussi de nous mettre en memoire
     * les differents elements de la page questionnaire
     */
    init_quiz() {
        // On masque tout d'abord tous les autres articles
        this.page_list.forEach(el => el.style.display = "none");
        this.page_list[1] ? (this.page_list[1].style.display = "block") : ('');
        // On places en suite nos element en memoire
        this.cur_elm = {};
        this.cur_elm.page = this.page_list[1];
        // L'element qui contient notre question
        this.cur_elm.question = document.querySelector(`#${this.cur_elm.page.id} #question`);
        // On aura besoin d'ecrire la progression du candidat à l'ecran
        this.cur_elm.pgr_value = document.querySelector(`#${this.cur_elm.page.id} #progression_value`);
        // On aura besoin d'indique le temps qu'il reste sur l'ecran
        this.cur_elm.elapstime = document.querySelector(`#${this.cur_elm.page.id} #elapstime`);
        // On devra aussi mettre à jour la barre de progression
        this.cur_elm.barre_pgr = document.querySelector(`#${this.cur_elm.page.id} #barre_progression span`);
        // On stocke aussi les 4 input radio, qui sont des assertions
        this.cur_elm.assertions = document.querySelectorAll(`#${this.cur_elm.page.id} input[type='radio']`);
        // On stocke aussi en memoire les 2 boutons (Quitter et Suivant)
        this.cur_elm.boutons = document.querySelectorAll(`#${this.cur_elm.page.id} button`);
        // Pour chaque question nous aurons besoin d'afficher le texte de l'assertion
        this.cur_elm.labels = document.querySelectorAll(`#${this.cur_elm.page.id} label span`);
        // On initialiser l'index des question à -1, càd le numero des questions
        this.user.i_quest = -1;
        // On a ajoute les events aux boutons, pour quitter l'interrogation et passer à la question suivante
        this.cur_elm.boutons[0].addEventListener("click", this.init_resultat.bind(this));
        this.cur_elm.boutons[1].addEventListener("click", () => this.next_question(false));
        // Par defaut à chaque nouvelle question, le bouton Suivant est desactivé
        // On ajout donc à chaque assertions la possibilité de l'activer, 
        // lorsqu'on coche une reponse
        this.cur_elm.assertions.forEach((el) => el.addEventListener("change", this.active_next.bind(this)));
        // On crée un compte à rebourt, qui affichera le temps restant à l'écran
        this.interval_controle = setInterval(this.counter.bind(this), 1000);
        // Finalement on affiche la premiére question
        this.next_question(true);
    }
    /**
     * Cette methode permet de passer à la question suivante, ou la page de resultat
     * Elle gere l'affichage de la question, assertions, et progession
     * @param {boolean} isFirst definit s'il s'agit de la premiere question ou pas
     */
    next_question(isFirst = false) {
        // S'il ne s'agit pas de la première question, alors on verifie le resultat pecedent
        if (!isFirst) {
            this.cur_elm.assertions.forEach((el, i) => {
                if (el.checked && this.question_list[this.user.i_quest].correct == i)
                    this.success++;
                // S'il est correcte on incremente this.success
            });
        }
        // Si nous avons deja atteint la dernière question, on va à la page de resultat
        if (++this.user.i_quest >= this.question_list.length) this.init_resultat();
        else {
            // Sinon on passe à la question suivante
            this.cur_elm.boutons[1].disabled = true;
            this.cur_elm.question.textContent = this.question_list[this.user.i_quest].phrase;
            this.cur_elm.assertions.forEach(input => input.checked = false);
            // Cette ligne permet d'afficher les differentes assertions à l'écran
            this.question_list[this.user.i_quest].assertions.forEach((el, i) => {
                this.cur_elm.labels[i].textContent = el;
            });
            this.cur_elm.pgr_value.textContent = `Question ${this.user.i_quest + 1}/15`;
            this.cur_elm.barre_pgr.style.width = Math.floor(100 * (this.user.i_quest + 1) / 15) + '%';
            // Après l'affichage de la question, on initialise le compteur
            this.temps = 20;
        }
    }
    /**
     * La methode qui s'occupe du comptage et affichage du temps
     */
    counter() {
        this.cur_elm.elapstime.textContent = (this.temps > 0) ? (--this.temps) : 0;
        if (!this.temps) this.next_question(false);
    }
    /**
     * La methode qui se charge d'activer le boutoun suivant
     * @param {Event} e L'objet Event gerant l'evenement
     */
    active_next(e) {
        if (e.target.checked)
            this.cur_elm.boutons[1].disabled = false;
    }
    /**
     * Cette methode gere l'affichage de la page des resultats
     * Elle se charge aussi de stopper le compteur du temps
     */
    init_resultat() {
        clearInterval(this.interval_controle);
        this.page_list.forEach(el => el.style.display = "none");
        this.page_list[2] ? (this.page_list[2].style.display = "block") : ('');
        this.cur_elm = {};
        this.cur_elm.page = this.page_list[2];
        // Stockage des elements ici
        this.cur_elm.nom = document.querySelector(`#${this.cur_elm.page.id} #result_nom`);
        this.cur_elm.email = document.querySelector(`#${this.cur_elm.page.id} #result_email`);
        this.cur_elm.symbole = document.querySelector(`#${this.cur_elm.page.id} #result_symbole`);
        this.cur_elm.points = document.querySelector(`#${this.cur_elm.page.id} #result_points`);
        this.cur_elm.restart = document.querySelector(`#${this.cur_elm.page.id} #result_recommencer`);
        // Affichage des resultats
        this.cur_elm.nom.textContent = this.user.nom;
        this.cur_elm.email.textContent = this.user.email;
        this.cur_elm.symbole.className = "mdi";
        this.cur_elm.symbole.classList.toggle((this.success > 8) ? "mdi-check-circle-outline" : "mdi-close-circle-outline");
        this.cur_elm.points.textContent = `${this.success}/15`;
        // Ajout de l'evenement à notre bouton recommencer qui recharge juste la page
        this.cur_elm.restart.addEventListener('click', this.reload_page);
    }
    /** La methode qui recharge le page */
    reload_page() {
        location.reload()
    }
}


// Ici nous preparons les elements qui servirons à construre notre objet quiz app
// Les differentes pages
let myarticle = document.querySelectorAll("article");
// Les differentes questions
let myQuestion = [
    new Question("La syntaxe correcte pour créer un objet vide en Js est :", ["let monObjet = {}", "let monObjet = []", "let monObjet = ()", "let monObjet = null"], 0),
    new Question("Ces mots permettent d'initialiser une variable, sauf :", ["var", "const", "function", "let"], 2),
    new Question("La bonne syntaxe pour écrire un commentaire sur ligne est :", ["// comment", "+ comment", "/* comment */", "# comment"], 0),
    new Question("En le passant à la fonction isNaN, nous obtenons true :", ["300", "-2", "'3'", "0"], 2),
    new Question("Vanilla JavaScript est :", ["Un framework javascript", "Une librairie javascript", "Une marque de crême", "Du pur javascript"], 3),
    new Question("Pour écrire sur le console Javacript on utilise :", ["console.log()", "console.write()", "console.print()", "alert()"], 0),
    new Question("En JavaScript, les expressions regulières sont encadrées par :", ["'", "#", "/", "."], 2),
    new Question("La balise qui permet d'inserer du code javascript est :", ["js", "script", "javascript", "link"], 1),
    new Question("Pour executer JavaScript sur un serveur nous avons besion de :", ["ReactNative", "ReactJS", "NodeJs", "Composer"], 2),
    new Question("Un variable non declarée aura pour valeur :", ["null", "0", "Object", "undefined"], 3),
    new Question("Pour faire réference à un script js extene en html :", ["<script href='mon_script.js'>", "<script src='mon_script.js'>", "<link src='mon_script.js'>", "<rel link='mon_script.js'>"], 1),
    new Question("Pour executer alert() chaque 5s, on écrira :", ["setInterval(alert, 5000)", "setTimeout(alert, 5)", "setInterval(alert, 5)", "forTime(alert, 5000)"], 0),
    new Question("Le nom correct d'une variable est :", ["ma_variable", "ma variable", "ma-variable", "mavariable()"], 1),
    new Question("L'object JavaScript qui gére le DOM est  :", ["HTMLElement", "DOM", "Node", "document"], 3),
    new Question("Un fichier JavaScript a pour extension :", [".j", ".jsx", ".js", ".html"], 2),
];
// Nous construisons notre Quiz App
let myquizapp = new Quizz_app(myarticle, myQuestion);
// Et debutons son utilisation
myquizapp.init_accueil();
