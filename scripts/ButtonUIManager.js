export class ButtonUIManager {
    
    hideResetModalAndShowBoard() {
        document.querySelector('.confirm-reset').style.visibility = 'hidden';
        document.getElementById('board').style.visibility = 'visible';
        document.getElementById('reset').style.visibility = 'visible';
    }

    showResetModal() {
        document.getElementById("board").style.visibility = "hidden";
        document.getElementById('reset').style.visibility = "hidden";
        document.querySelector('.confirm-reset').style.visibility = "visible";
    }
}