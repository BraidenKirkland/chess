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

export const piecesToSymbols = {
    'pawn': {
        'white': '&#9817',
        'black': '&#9823'
    },
    'bishop': {
        'white': '&#9815',
        'black': '&#9821'
    },
    'knight': {
        'white': '&#9816',
        'black': '&#9822'
    },
    'queen': {
        'white': '&#9813',
        'black': '&#9819'
    },
    'king': {
        'white': '&#9812',
        'black': '&#9818'
    },
    'rook': {
        'white': '&#9814',
        'black': '&#9820'
    }
};

