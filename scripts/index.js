


const boardPositions = [...document.querySelectorAll('td')].reverse();
for(let i=0; i < 10; i++){
    console.log(boardPositions[i].querySelector('div').getAttribute('id'));
}

let letters = 'hgfedcba';
let numbers = '12345678';

for(let i=0; i < 8; i++){
    let num = 1;

    for(let j=0; j < 8; j++){

    }
}

let rowIndex = 0;
let letter, number;
boardPositions.forEach((element, index) => {
    letter = letters[index % 8];
    if(index < 8){
        number = '1';
    }else if( index < 16){
        number = '2';
    }else if(index < 24){
        number = '3';
    }else if(index < 32){
        number = '4';
    }else if(index < 40){
        number = '5';
    }else if(index < 48){
        number = '6';
    }else if(index < 56){
        number = '7';
    }else{
        number = '8';
    }

    element.classList.add(letter + number); 
});