export class ButtonUIManager {
    
    hideResetModalAndShowBoard() {
        document.querySelector('.confirm-reset').style.visibility = 'hidden';
        document.querySelector('.game').style.visibility = 'visible';
    }

    showResetModal() {
        document.querySelector(".game").style.visibility = "hidden";
        document.querySelector('.confirm-reset').style.visibility = "visible";
    }
}