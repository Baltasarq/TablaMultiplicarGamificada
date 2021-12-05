// Multiplication table (c) Baltasar 2021 MIT License <baltasarq@gmail.com>


GameDivs = {
    "start": "dvStart",
    "game" : "dvGame",
    "result": "dvResult",
    "results": "dvResults"
};

Game = {
    "start": 0,
    "end": 0,
    "currentQuestion": 0,
    "numQuestions": 0,
    "numQuestionsPerTable": 0,
    "numTables": 0,
    "tableIndexes": [],
    "positionIndexes": [],
    "results": {
        "wrong": 0
    }
};

function restart()
{
    showDiv( GameDivs.start );
    hideDiv( GameDivs.results );
    hideDiv( GameDivs.game );
    hideDiv( GameDivs.result );
}

function play()
{
    const strLimitSup = document.getElementById( "edSupLimit" ).value;
    const strLimitInf = document.getElementById( "edInfLimit" ).value;
    const strNum = document.getElementById( "edNum" ).value;

    const limSup = parseInt( strLimitSup );
    const limInf = parseInt( strLimitInf );

    Game.numQuestionsPerTable = parseInt( strNum );
    Game.numTables = Math.abs( limSup - limInf );
    Game.numQuestions = Game.numTables * Game.numQuestionsPerTable;
    Game.tableIndexes = calculateTables( Game.numTables, limInf, limSup );
    Game.positionIndexes = calculatePositions( Game.numQuestions );
    Game.currentQuestion = Game.positionIndexes.length - 1;
    Game.results.wrong = 0;

    // Prepare interface
    hideDiv( GameDivs.start );
    hideDiv( GameDivs.results );
    showDiv( GameDivs.game );

    const dvGame = document.getElementById( GameDivs.game );
    const btStart = document.createElement( "button" );
    
    btStart.appendChild( document.createTextNode( "¡Comenzar!" ) );
    btStart.id = "btStartGame";
    btStart.onclick = function() {
        Game.start = Date.now();
        nextQuestion( Game );
    };

    dvGame.textContent = "";
    dvGame.appendChild( btStart );
}

function nextQuestion(game)
{
    if ( game.currentQuestion < 0 ) {
        Game.end = Date.now();
        showResults();
    } else {
        const dvGame = document.getElementById( GameDivs.game );
        const p = document.createElement( "p" );
        const tableIndex = game.tableIndexes[
                                game.currentQuestion % game.numTables ];
        const positionIndex = game.positionIndexes[ game.currentQuestion ];
        const btNext = document.createElement( "button" );
        const btRestart = document.createElement( "button" );
        const edAnswer = document.createElement( "input" );
        const strQuestion = "" + tableIndex
                            + " * " + positionIndex + " = ";
        
        btRestart.appendChild( document.createTextNode( "Restart") );
        btRestart.onclick = function() { restart(); };

        btNext.id = "btNext";
        btNext.appendChild( document.createTextNode( "Siguiente" ) );

        dvGame.onkeyup = function(evt) {
            const code = evt.code;
        
            if ( ( code == "Enter"
                || code == "NumpadEnter" )
              && this.style.display != "none" )
            {
                btNext.onclick();
            }
        };

        btNext.onclick = function() {
            chkResult();
            nextQuestion( game );
        };
        
        p.innerHTML = "<b>" + strQuestion;
        p.appendChild( edAnswer );

        edAnswer.type = "number";
        edAnswer.min = 0;
        edAnswer.value = 0;
        edAnswer.id = "edAnswer";
        edAnswer.question = strQuestion;
        edAnswer.secretResult = tableIndex * positionIndex;
        edAnswer.style.textAlign = "right";

        dvGame.textContent = "";
        dvGame.appendChild( p );
        dvGame.appendChild( btNext );
        dvGame.appendChild( btRestart );
        edAnswer.select();
        edAnswer.focus();
    }
}

/*document.onkeyup = function(evt) {
    const dvGame = document.getElementById( GameDivs.game );
    const code = evt.code;

    if ( ( code == "Enter"
        || code == "NumpadEnter" )
      && dvGame.style.display != "none" )
    {
        btNext.onclick();
    }
};*/

function chkResult()
{
    const dvResult = document.getElementById( "dvResult" );
    const edAnswer = document.getElementById( "edAnswer" );
    const answer = parseInt( edAnswer.value );
    const secret = parseInt( edAnswer.secretResult );
    const resultText = document.createElement( "p" );

    Game.currentQuestion -= 1;
    resultText.innerHTML = "<b>" + edAnswer.question + secret;

    if ( !isNaN( answer )
      && !isNaN( secret )
      && answer == secret )
    {
        resultText.innerHTML += " ¡Correcto!</b>";
        resultText.style = "color: white; background-color: green";
    } else {
        Game.results.wrong += 1;
        resultText.innerHTML += " ¡"
                                + edAnswer.question
                                + answer + " es incorrecto!</b>";
        resultText.style = "color: white; background-color: red";
    }

    dvResult.innerText = "";
    dvResult.appendChild( resultText );
    showDiv( GameDivs.result );
}

function paddedStrFromInt(x, n, c = '0')
{
    return x.toString().padStart( n, c );
}

function strFmtTimeFromSeconds(secs)
{
    const minutes = paddedStrFromInt( parseInt( secs / 60 ), 2 );
    const seconds = paddedStrFromInt( parseInt( secs % 60 ), 2 );
    
    return minutes + ":" + seconds;
}

function showResults()
{
    const dvResults = document.getElementById( GameDivs.results );
    const p = document.createElement( "p" );
    const btRestart = document.createElement( "button" );
    const num = Game.numQuestions;
    const wrong = Game.results.wrong;
    const timeInSeconds = Math.round( ( Game.end - Game.start ) / 1000 );
    const expectedTimeInSeconds = Game.numQuestions * 5;
    const padding = parseInt(
                        Math.max( Math.log10( Game.numQuestions ) + 1,
                        2 ) );
    
    hideDiv( GameDivs.start );
    hideDiv( GameDivs.game );
    hideDiv( GameDivs.result );
    showDiv( GameDivs.results );

    dvResults.innerText = "";
    btRestart.appendChild( document.createTextNode( "Recomenzar") );
    btRestart.onclick = function() { restart(); };
    
    const resultTable = document.createElement( "table" );
    resultTable.id = "tblResults";
    resultTable.style.width = "70%";
    resultTable.style.border = 0;

    row = resultTable.insertRow();
    row.insertCell().innerText =  "Preguntas";
    row.insertCell().innerText = paddedStrFromInt( num, padding );

    row = resultTable.insertRow();
    row.insertCell().innerText =  "Correctas";
    row.insertCell().innerText = paddedStrFromInt( num - wrong, padding )
                                 + " / " + paddedStrFromInt( num, padding );

    row = resultTable.insertRow();
    row.insertCell().innerText =  "Incorrectas";
    row.insertCell().innerText = paddedStrFromInt( wrong, padding )
                                + " / " + paddedStrFromInt( num, padding );

    row = resultTable.insertRow();
    row.insertCell().innerText =  "Porcentaje de aciertos";
    row.insertCell().innerText = paddedStrFromInt(
                                        ( ( ( num - wrong ) / num ) * 100 ),
                                        3 )
                                 + "%";

    row = resultTable.insertRow();
    row.insertCell().innerText =  "Tiempo invertido";
    row.insertCell().innerText = strFmtTimeFromSeconds( timeInSeconds );

    row = resultTable.insertRow();
    row.insertCell().innerText =  "Tiempo esperado";
    row.insertCell().innerText = strFmtTimeFromSeconds( expectedTimeInSeconds );

    row = resultTable.insertRow();
    row.insertCell().innerText =  "Puntuación (cuanto más baja mejor)";
    row.insertCell().innerText =
                        paddedStrFromInt(
                            ( timeInSeconds / expectedTimeInSeconds ) * 100,
                            3 );

    p.appendChild( resultTable );
    dvResults.appendChild( p );
    dvResults.appendChild( btRestart );
}

function calculateTables(numTables, limInf, limSup)
{
    const toret = new Set();
    
    while( toret.size < numTables ) {
        toret.add( rnd( limInf, limSup + 1 ) );
    }
    
    return Array.from( toret );
}

function calculatePositions(numQuestions)
{
    const toret = [];

    for(let i = 0; i < numQuestions; ++i) {
        toret.push( rnd( 2, 13 ) );
    }

    return Array.from( toret );
}

function rnd(min, max)
{
    return ( Math.floor( Math.random() * ( max - min ) ) + min );
}

function hideDiv(divName)
{
    const dv = document.getElementById( divName );

    dv.style.display = "none";
}

function showDiv(divName)
{
    const dv = document.getElementById( divName );

    dv.style.display = "block";
}
