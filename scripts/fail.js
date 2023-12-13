updateBoardAfterTake(victimSquareId, killingSquareId) {
    const dstSquareButton = document.querySelector(`button.${victimSquareId}`);
    const currentSquareButton = document.querySelector(`button.${killingSquareId}`);

    // Swap classes between the buttons
    this.swapClasses(currentSquareButton, dstSquareButton, victimSquareId, killingSquareId);

    // Move the currentSquareButton to the destination square
    dstSquareButton.parentNode.replaceChild(currentSquareButton, dstSquareButton);

    // Reset the victim square button
    this.resetButtonStateToEmpty(dstSquareButton, killingSquareId);
}

swapClasses(button1, button2, class1, class2) {
    button1.classList.remove(class1);
    button1.classList.add(class2);
    button2.classList.remove(class2);
    button2.classList.add(class1);
}

resetButtonStateToEmpty(button, newClass) {
    button.removeAttribute("id");
    button.className = `empty ${newClass}`; // Reset all classes and add 'empty' and the new class
    button.innerHTML = '';
}