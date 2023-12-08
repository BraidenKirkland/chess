export const getNumericPosition = (regularPosition) => {
    const letters = 'abcdefgh';
    const numbers = '12345678';

    return [letters.indexOf(regularPosition[0]), numbers.indexOf(regularPosition[1])];
}

/* e.g. 00 -> a1 , 77 -> h8 */
export const getRegularPosition = (numericPosition) => {
    const letters = 'abcdefgh';
    const numbers = '12345678';

    return String(letters[Number(numericPosition[0])] + numbers[Number(numericPosition[1])]);
}

export const highlightElement = (element, color) => {
    element.style.backgroundColor = color;
}


export const addHighlightToElements = (moveList) => {
    moveList.forEach((square) => {
        let dstSqaure = document.querySelector('.' + square);
        highlightElement(dstSqaure, 'yellow');
    });
}

export const removeHighlightFromElements = (moveList) => {
    moveList.forEach((square) => {
        let dstSqaure = document.querySelector('.' + square);
        highlightElement(dstSqaure, null);
    });
}

