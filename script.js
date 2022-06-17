/* Créons un objet qui représentera une question et ses assertions*/
function Question(phrase = "", assertions = [""], correct = 0) {
    this.phrase = phrase;
    this.assertions = assertions;
    this.correct = correct;
}