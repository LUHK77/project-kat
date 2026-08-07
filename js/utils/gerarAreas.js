// utils/RoomGenerator.js

export function gerarAreas(minW = 8, maxW = 15, minH = 8, maxH = 15) {

    const largura = random(minW, maxW);
    const altura  = random(minH, maxH);

    const sala = [];

    for (let y = 0; y < altura; y++) {
        sala[y] = [];

        for (let x = 0; x < largura; x++) {
            sala[y][x] = true;
        }
    }

    arredondarCantos(sala);

    return {
        largura,
        altura,
        tiles: sala
    };
}

function arredondarCantos(sala) {

    const h = sala.length;
    const w = sala[0].length;

    const cantos = [
        [0,0],
        [w-1,0],
        [0,h-1],
        [w-1,h-1]
    ];

    for (const [x,y] of cantos) {

        const remover = random(0,2);

        if(remover >= 1)
            sala[y][x] = false;

        if(remover == 2){

            if(x==0) sala[y][1]=false;
            else sala[y][w-2]=false;

            if(y==0) sala[1][x]=false;
            else sala[h-2][x]=false;
        }
    }
}

function random(min,max){
    return Math.floor(Math.random()*(max-min+1))+min;
}