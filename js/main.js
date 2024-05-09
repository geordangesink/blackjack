const cardBackSideImage = "https://www.deckofcardsapi.com/static/img/back.png";

// Arrays for fetched elements
var botCardImages = new Array();
var botCardValues = new Array();
var playerCardImages = new Array();
var playerCardValues = new Array();
var cardsLeftInDeck = 0;

const dom = {
    // Sections
    main: document.querySelector("#main"),
    outOfMoney: document.querySelector("#out-of-money"),


    // Texts
    bidLabel: document.querySelector("#place-bid"),
    bidValue: document.querySelector("#bid-value"),
	bidValueInput: document.querySelector("#bid-value-input"),
	bidSelect: document.querySelector("#select-bid"),
    bidValueLabel: document.querySelector("#bid-placed"),
    pointsBot: document.querySelector("#points-bot"),
    pointsPlayer: document.querySelector("#points-player"),
    result: document.querySelector("#winner"),
    balance: document.querySelector("#current-points"),
    balanceTooSmall : document.querySelector("#balance"),
	name: document.querySelector("#name"),
	username: document.querySelector("#username"),
	highscoreSubmit: document.querySelector("highscore-submit"),
	highscore: document.querySelector("#highscore"),
	highscoreAfter: document.querySelector("#highscore-after"),

    // Buttons
    newRound: document.querySelector("#get-deck"),
    hit: document.querySelector("#hit"),
    stnd: document.querySelector("#stand"),
    
    // Sliders
    bid: document.querySelector("#bid"),

    // Card images
    cardPlayer: function(num){
        return document.querySelector(`#card-player-${num}`);
    },

    cardBot: function(num){
        return document.querySelector(`#card-bot-${num}`);
    }
}

// Button actions
dom.bidSelect.addEventListener("click", function(){
	selectBid();
	localStorage.setItem("refresh", "false");
});
dom.newRound.addEventListener("click", function(){
    startGame();
    localStorage.setItem("refresh", "false");
});
dom.hit.addEventListener("click", function(){
    drawCard("player", "playerCardsImage", "playerCardsValue");
    localStorage.setItem("refresh", "false");
});
dom.stnd.addEventListener("click", function(){
    stand();
    localStorage.setItem("refresh", "false");
});

pageLoad();
async function pageLoad(){
	// Relode unfinished game if there is one in local storage
	await checkBalance();

	if ( localStorage.getItem("playerCardsImage") ){
		document.submitform.username.value = localStorage.getItem("username");
		document.submitform.highscoresubmit.value = localStorage.getItem("highscore");
		document.querySelector("#submit-highscore").classList.remove("hide")
		dom.highscore.innerText = localStorage.getItem("highscore");
		let playerCards = localStorage.getItem("playerCardsImage").split(",");
		let botCards = localStorage.getItem("botCardsImage").split(",");

		for ( i = 1; i <= playerCards.length; i++ ){
			dom.cardPlayer(i).src = playerCards[i - 1];
		}
		
		if ( localStorage.getItem("botShow") == "true" ){
			for ( i = 1; i <= botCards.length; i++ ){
				dom.cardBot(i).src = botCards[i - 1];
			}
			stand(Boolean(localStorage.getItem("refresh")));
			dom.pointsBot.innerText = `(${localStorage.getItem("botSum")})`;
		}
		else{
			// bid GUI
			dom.bidValue.innerText = localStorage.getItem("bid");
			dom.bidValueLabel.classList.remove("hide");
			dom.bid.classList.add("hide");
			dom.bidLabel.classList.add("hide");
			dom.bidValueInput.classList.add("hide");
			dom.bidSelect.classList.add("hide");

			dom.cardBot(1).src = cardBackSideImage;
			dom.cardBot(2).src = botCards[1];

			overTwentyOne("player", "playerCardsValue", Boolean(localStorage.getItem("refresh")));
			overTwentyOne("bot", "botCardsValue", Boolean(localStorage.getItem("refresh")));

			dom.pointsBot.innerText = `(? + ${overTwentyOne("botNoShow", "botCardsValue")})`;
		}
	}
	else{
        document.querySelector("#submit-highscore").classList.add("hide")
		dom.bidValue.innerHTML = localStorage.getItem("bid");
		dom.newRound.classList.remove("hide");
	}
}


// slider config
dom.bid.max = localStorage.getItem("balance");
dom.bid.oninput = function() {
	dom.bidValue.innerHTML = this.value;
}
// dom.bidValueInput.oninput = function() {
// 	dom.bid.value = this.value;
// }
dom.balance.innerText = localStorage.getItem("balance");

function startGame()
{
    bidPlaced();
    localStorage.setItem("bid", dom.bid.value);

    // Reset cards to fix mobile but where img spots dont reset (1.1.1)
    if (localStorage.getItem("cardsOnHandBot")){
		for (i = 1; i <= 21; i++){
			document.querySelector(`#card-bot-${i}`).remove();
			let newElement = document.createElement("img");
			newElement.id = `card-bot-${i}`
			document.querySelector("#cards-container-bot").appendChild(newElement);
		}
		for (i = 1; i <= 21; i++){
			document.querySelector(`#card-player-${i}`).remove();
			let newElement = document.createElement("img");
			newElement.id = `card-player-${i}`
			document.querySelector("#cards-container-player").appendChild(newElement);
		}
	}

    // reset local storage
    localStorage.removeItem("botShow");
    localStorage.removeItem("playerCardsImage");
    localStorage.removeItem("playerCardsValue");
    localStorage.removeItem("botCardsImage");
    localStorage.removeItem("botCardsValue");
    localStorage.setItem("cardsOnHandPlayer", 2);
    localStorage.setItem("cardsOnHandBot", 2);

    let deckId = localStorage.getItem("deckId");

    const options = {
        method: "GET"
    };

    // cardsOnHand two cards for each from old deck
    fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/draw/?count=4`, options)
        .then(response => response.json())
        .then(data => {
            if (data.success !== true){
                console.log("Missing deck, creating new one ...")
                newDeck();
            }
            else{
                let remainingCards = data.remaining;
                localStorage.setItem("remainingCards", remainingCards);
                
                let firstCardOnHandPlayer = data.cards[0];
                let firstCardOnHandBot = data.cards[1];
                let secondCardOnHandPlayer = data.cards[2];
                let secondCardOnHandBot = data.cards[3];
                
                dom.cardPlayer(1).src = firstCardOnHandPlayer.image;
                dom.cardPlayer(2).src = secondCardOnHandPlayer.image;
                dom.cardBot(1).src = cardBackSideImage;
                dom.cardBot(2).src = secondCardOnHandBot.image;
                
                localStorage.setItem("playerCardsImage", [firstCardOnHandPlayer.image, secondCardOnHandPlayer.image]);
                localStorage.setItem("playerCardsValue", [firstCardOnHandPlayer.value, secondCardOnHandPlayer.value]);
                
                localStorage.setItem("botCardsImage", [firstCardOnHandBot.image, secondCardOnHandBot.image]);
                localStorage.setItem("botCardsValue", [firstCardOnHandBot.value, secondCardOnHandBot.value]);
                
                overTwentyOne("player", "playerCardsValue");
                overTwentyOne("bot", "botCardsValue");
                
                dom.pointsBot.innerText = `(? + ${overTwentyOne("botNoShow", "botCardsValue")})`;
            }
        })
        .catch(err => {
            console.log(`couldn't draw cards --> ${err}`);
			dom.newRound.classList.remove("hide");
    })

	// if cards left are lower than 42 --> shuffle
	if ( Number(localStorage.getItem("remainingCards")) < 42 ){
		fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/shuffle/`, options)
			.then(response => response.json())
			.then(data => {
				console.log("Remaining cards were below 42. Decks were shuffeled");
				console.log(data);
			})
			.catch(err => {
				console.log(`Problem when trying to shuffle deck \n --> ${err}`);
			});
	}

}

function newDeck()
{
    const url = "https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6";
	const options = {
        method : "GET"
    };

	localStorage.setItem("balance", "5000");
	localStorage.setItem("highscore", localStorage.getItem("balance"));
	dom.highscore.innerText = localStorage.getItem("highscore");
	dom.balance.innerText = localStorage.getItem("balance");
	dom.bid.max = localStorage.getItem("balance");

	// Create a new deck
	fetch(url, options)
				.then(response => response.json())
				.then(data => {
					console.log("new deck: ");
					console.log(data);
					localStorage.setItem("deckId", data.deck_id);
					deckId = localStorage.getItem("deckId");
				})
				.catch(err =>{
					document.querySelector("#error").innerText = `Problems fetching card deck from API server \n-> ${err}`;
				});
			
	document.querySelector("#get-deck").classList.remove("hide");
}

async function drawCard(entity, image, value)
{
    let newCardNum = 0;

    if ( entity == "player" ){
        localStorage.setItem("cardsOnHandPlayer", Number(localStorage.getItem("cardsOnHandPlayer")) + 1);
		newCardNum = localStorage.getItem("cardsOnHandPlayer");
    }
    else{
		localStorage.setItem("cardsOnHandBot",Number(localStorage.getItem("cardsOnHandBot")) +1);
		newCardNum = localStorage.getItem("cardsOnHandBot");
	}

    let deckId = localStorage.getItem("deckId");
    const url = `https://www.deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`;
    const options = {
        method : "GET"
    };

    // Draw a card from deck
	await fetch(url, options)
        .then(response => response.json())
        .then(data => {
            console.log(`cards: \n --->`);
			console.log(data);
            document.querySelector(`#card-${entity}-${newCardNum}`).src = data.cards[0].image;

            localStorage.setItem(image, [localStorage.getItem(image), data.cards[0].image]);
            localStorage.setItem(value, [localStorage.getItem(value), data.cards[0].value]);
            overTwentyOne(entity, value);

        })
        .catch(err => {
            console.log(err);
            document.querySelector("#error").innerText = "No Deck Connected, Start a new Game";
        })
}

// Show hand
async function stand(refresh)
{
	overTwentyOne("player", "playerCardsValue", refresh);
	overTwentyOne("bot", "botCardsValue", refresh);
	localStorage.setItem("botShow", "true");

	let botCards = localStorage.getItem("botCardsImage").split(",");
	dom.cardBot(1).src = botCards[0];

	dom.pointsBot.innerText = `(${localStorage.getItem("botSum")})`;

	// keep drawing bot cards
	while (Number(localStorage.getItem("botSum")) <= Number(localStorage.getItem("playerSum")) &&
	Number(localStorage.getItem("botSum")) < 17){
		await new Promise(resolve => setTimeout(resolve, 500));
		await drawCard("bot", "botCardsImage", "botCardsValue");
		dom.pointsBot.innerText = `(${localStorage.getItem("botSum")})`;
	}

	if (Number(localStorage.getItem("botSum")) > Number(localStorage.getItem("playerSum")) &&
	Number(localStorage.getItem("botSum")) <= 21){
		end("dealerHigher", refresh);
	}
	else if (Number(localStorage.getItem("botSum")) < Number(localStorage.getItem("playerSum")) &&
	Number(localStorage.getItem("botSum")) >= 17){
		end("playerHigher", refresh);
	}
	else if (Number(localStorage.getItem("botSum")) == Number(localStorage.getItem("playerSum"))){
		end("tie", refresh);
	}
	else{
		end("dealerBust", refresh);
	}

}

// calculate total value
function overTwentyOne(entity, storage, refresh)
{
	let entityValue = localStorage.getItem(storage).split(",")
	let amountOfCards = entityValue.length;
	let aceCount = 0;
	let value = 0;
	let counterNoShow = 0;

	if ( entity === "botNoShow" ){
		amountOfCards = 1;
		counterNoShow = 1;
	}

	for ( i = 0; i < amountOfCards; i++ ){
		switch(entityValue[i+counterNoShow]){
			case "ACE":
				aceCount++;
				break;
			
			case "QUEEN":
				value += 10;
				break;
			
			case "KING":
				value += 10;
				break;
			
			case "JACK":
				value += 10;
				break;
			
			default:
				value += Number(entityValue[i+counterNoShow]);
				break;
		}
	}

	for (i = 0; i < aceCount; i++){
		if ((value + 11 + aceCount - i - 1) > 21){
			value++;
		}
		else{
			value += 11;
		}
	}

	if ( entity == "player" ){

		localStorage.setItem("playerSum", value);
		dom.pointsPlayer.innerText = `(${localStorage.getItem("playerSum")})`;

		if (value > 21){
			end("playerBust", refresh);
		}

		else if (value == 21){
			end("playerBlackJack", refresh);
		}

		else if (value < 21 && localStorage.getItem("botShow") !== "true"){
			dom.hit.classList.remove("hide");
			dom.stnd.classList.remove("hide");
		}
	}

	else if ( entity === "botNoShow"){
		return value;
	}

	else{
		localStorage.setItem("botSum", value);
	}
}

async function end(statement, refresh)
{
	await new Promise(resolve => setTimeout(resolve, 500));
	bidNotPlaced()
	
	switch(statement){

		case "playerBust":
			dom.result.innerText = "BUST! You Lose! (-100%)";
			dom.newRound.classList.remove("hide");
			if (localStorage.getItem("refresh") != "true"){
				localStorage.setItem("balance", Math.round(Number(localStorage.getItem("balance")) - Number(localStorage.getItem("bid"))));
			}
			localStorage.setItem("refresh", "true")
			break;

		case "playerBlackJack":
			dom.result.innerText = "BLACK JACK! You Win! (+150%)";
			dom.newRound.classList.remove("hide");
			if (localStorage.getItem("refresh") != "true"){
				localStorage.setItem("balance", Math.round(Number(localStorage.getItem("balance")) + Number(localStorage.getItem("bid")) + Number(localStorage.getItem("bid"))/2));
				win();
			}
			localStorage.setItem("refresh", "true")
			break;

		case "playerHigher":
			dom.result.innerText = "You have a higher hand! You Win! (+100%)";
			dom.newRound.classList.remove("hide");
			if (localStorage.getItem("refresh") != "true"){
				localStorage.setItem("balance", Math.round(Number(localStorage.getItem("balance")) + Number(localStorage.getItem("bid"))));
				win();
			}
			localStorage.setItem("refresh", "true")
			break;

		case "dealerBust":
			dom.result.innerText = "Dealer went over 21, You Win! (+100%)";
			dom.newRound.classList.remove("hide");
			if (localStorage.getItem("refresh") != "true"){
				localStorage.setItem("balance", Math.round(Number(localStorage.getItem("balance")) + Number(localStorage.getItem("bid"))));
				win();
			}
			localStorage.setItem("refresh", "true")
			break;
		
		case "dealerHigher":
			dom.result.innerText = "Dealer has a higher hand! You Lose! (-100%)";
			dom.newRound.classList.remove("hide");
			if (localStorage.getItem("refresh") != "true"){
				localStorage.setItem("balance", Math.round(Number(localStorage.getItem("balance")) - Number(localStorage.getItem("bid"))));
			}
			localStorage.setItem("refresh", "true")
			break;

		default: // Tie
			dom.result.innerText = "It's a Tie! (+0%)";
			dom.newRound.classList.remove("hide");
			localStorage.setItem("refresh", "true")
			break;
	}
	let nextBid = function(){
		return localStorage.getItem("bid") > localStorage.getItem("balance") ? localStorage.getItem("balance") : localStorage.getItem("bid");
	}
	dom.bid.value = nextBid();
	dom.bidValue.innerText = nextBid();
		
	dom.balance.innerText = localStorage.getItem("balance")
	dom.bid.max = localStorage.getItem("balance");

	checkBalance()
}

async function checkBalance(){
	if (Number(localStorage.getItem("balance")) < Number(dom.bid.min)){
		await new Promise(resolve => setTimeout(resolve, 2500))

		const options = {
			method : "GET"
		};
		await fetch(`https://www.deckofcardsapi.com/api/deck/${localStorage.getItem("deckId")}/shuffle/`, options)
			.then(response => response.json())
			.then(data => {
				console.log(data);

				// If there is no deck with stored ID
				if (data.success === false){
					localStorage.clear();
					console.log("Missing deck, creating new one ...")
					newDeck();
					dom.main.classList.remove("hide");
					dom.outOfMoney.classList.add("hide");
				}
				else{
					dom.main.classList.add("hide");
					dom.outOfMoney.classList.remove("hide");
					dom.balanceTooSmall.innerText = localStorage.getItem("balance");
					dom.highscoreAfter.innerText = localStorage.getItem("highscore");
					document.querySelector("#submit-highscore").classList.remove("hide")
				}
		});
	}
	else{
		dom.main.classList.remove("hide");
		document.querySelector("#bid").classList.remove("hide");
		document.querySelector("#place-bid").classList.remove("hide");
	}
}

function win()
{
	if ( Number(localStorage.getItem("balance")) > Number(localStorage.getItem("highscore")) ){
		localStorage.setItem("highscore", localStorage.getItem("balance"))
	}
	dom.highscore.innerText = localStorage.getItem("highscore");
	document.submitform.username.value = localStorage.getItem("username");
	document.submitform.highscoresubmit.value = localStorage.getItem("highscore");
}

function selectBid(){
	if ( Number(dom.bidValueInput.value) < Number(dom.bid.min) ){
		dom.bid.value = dom.bid.min;
		dom.bidValue.innerText = dom.bid.min;
	}
	else if ( Number(dom.bidValueInput.value) <= Number(localStorage.getItem("balance")) ){
		dom.bid.value = dom.bidValueInput.value;
		dom.bidValue.innerText = dom.bidValueInput.value;
	}
	else{
		dom.bid.value = localStorage.getItem("balance");
		dom.bidValue.innerText = localStorage.getItem("balance");
	}
}

// Adjust UI
function bidPlaced()
{
    // adjust bid-related UI
    dom.bidValueLabel.classList.remove("hide");
	dom.bid.classList.add("hide");
	dom.bidLabel.classList.add("hide");
	dom.bidValueInput.classList.add("hide");
	dom.bidSelect.classList.add("hide");

    // adjust game-core-related UI
    dom.newRound.classList.add("hide");
    dom.hit.classList.remove("hide");
	dom.stnd.classList.remove("hide");
	dom.result.innerText = "";
}

// Adjust UI
function bidNotPlaced()
{
    // adjust bid-related UI
    dom.bidValueLabel.classList.add("hide");
	dom.bid.classList.remove("hide");
	dom.bidLabel.classList.remove("hide");
	dom.bidValueInput.classList.remove("hide");
	dom.bidSelect.classList.remove("hide");

    // adjust game-core-related UI
    dom.newRound.classList.remove("hide");
    dom.hit.classList.add("hide");
	dom.stnd.classList.add("hide");
}

async function nameSubmited()
{
	localStorage.setItem("username", dom.name.value)
	dom.form.classList.add("hide");
	dom.main.classList.remove("hide");
	dom.outOfMoney.classList.add("hide");
	localStorage.setItem("submit", "true");
	await newDeck();
	bidNotPlaced();
	dom.bidValue.innerHTML = localStorage.getItem("bid");
	document.querySelector("#submit-highscore").classList.remove("hide")
}