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
    
}

