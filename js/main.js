// Relode unfinished game if there is one in local storage

////// MAKE SO BOT CARDS AND RESULTS STAY
if (localStorage.getItem("playerCardsImage")){
	let playerCards = localStorage.getItem("playerCardsImage").split(",");
	let botCards = localStorage.getItem("botCardsImage").split(",");
	document.querySelector(`#card-player-1`).src = playerCards[0];
	document.querySelector(`#card-player-2`).src = playerCards[1];
	document.querySelector(`#card-player-3`).src = playerCards[2];
	document.querySelector(`#card-player-4`).src = playerCards[3];
	
	if (localStorage.getItem("botShow") == "true"){
		for (i = 1; i <= Number(localStorage.getItem("drawBot")); i++){
			document.querySelector(`#card-bot-${i}`).src = botCards[i - 1];
		}
	}
	else{
	document.querySelector(`#card-bot-1`).src = "https://www.deckofcardsapi.com/static/img/back.png";
	document.querySelector(`#card-bot-2`).src = botCards[1];
	}

	if (localStorage.getItem("stand") == "true"){
		stand();
	}
	else{
	overTwentyOne("player", "playerCardsValue");
	overTwentyOne("bot", "botCardsValue");
	}
}

document.querySelector("#get-deck").addEventListener("click", function(event)
{
    startGame();
});

document.querySelector("#hit").addEventListener("click", function(event)
{
	drawCard("player", "playerCardsImage", "playerCardsValue");
});

localStorage.setItem("test", 0);

document.querySelector("#stand").addEventListener("click", function(event)
{
	stand();
});


function startGame()
{

	// Reset cards
	if (localStorage.getItem("drawBot")){
		for (i = 1; i <= localStorage.getItem("drawBot"); i++){
			document.querySelector(`#card-bot-${i}`).src = "";
		}
	}

	for (i = 1; i <= Number(localStorage.getItem("draw")); i++){
		document.querySelector(`#card-player-${i}`).src = "";
		document.querySelector(`#card-bot-${i}`).src = "";
	}

	// Show buttons and delete Win/Lose announcement
	document.querySelector("#hit").classList.remove("hide");
	document.querySelector("#stand").classList.remove("hide");
	document.querySelector("#winner").innerText = "";

	// Reset all game related local vlues
	localStorage.removeItem("botShow");
	localStorage.removeItem("stand");
	localStorage.removeItem("playerCardsImage");
	localStorage.removeItem("playerCardsValue");
	localStorage.removeItem("botCardsImage");
	localStorage.removeItem("botCardsValue");
	localStorage.setItem("draw", 2);
	localStorage.setItem("drawBot", 2);

	let deckId = localStorage.getItem("deckId");

    const options = {
        method : "GET"
    };

	// Shuffle Deck and draw a Card
	fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/shuffle/`, options)
		.then(response => response.json())
		.then(data => {
			console.log(data);
			// If there is no deck with stored ID
			if (data.success === false){
				console.log("Missing deck, creating new one ...")
				newDeck();
			}
			else{
				// Draw two cards for each from old deck (shuffled)
				fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/draw/?count=4`, options)
						.then(response => response.json())
						.then(data => {

							document.querySelector(`#card-player-1`).src = data.cards[0].image;
							document.querySelector(`#card-player-2`).src = data.cards[2].image;
							document.querySelector(`#card-bot-1`).src = "https://www.deckofcardsapi.com/static/img/back.png";
							document.querySelector(`#card-bot-2`).src = data.cards[3].image;
						
							localStorage.setItem("playerCardsImage", [data.cards[0].image, data.cards[2].image]);
							localStorage.setItem("botCardsImage", [data.cards[1].image, data.cards[3].image])
						
							localStorage.setItem("playerCardsValue", [data.cards[0].value, data.cards[2].value]);
							localStorage.setItem("botCardsValue", [data.cards[1].value, data.cards[3].value])
							
							overTwentyOne("player", "playerCardsValue");
							overTwentyOne("bot", "botCardsValue");
						})
			}
		})
}

function newDeck()
{
	// Asign Deck API ID
	let deckId = localStorage.getItem("deckId");
	const options = {
        method : "GET"
    };

	// Create a new deck
	fetch("https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6", options)
				.then(response => response.json())
				.then(data => {
					console.log("new deck: ");
					console.log(data);
					localStorage.setItem("deckId", data.deck_id);
					deckId = localStorage.getItem("deckId");
				
					// Deal two cards to each
					fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/draw/?count=4`, options)
						.then(response => response.json())
						.then(data => {
							document.querySelector(`#card-player-1`).src = data.cards[0].image;
							document.querySelector(`#card-player-2`).src = data.cards[2].image;
							document.querySelector(`#card-bot-1`).src = "https://www.deckofcardsapi.com/static/img/back.png";
							document.querySelector(`#card-bot-2`).src = data.cards[3].image;
						
							localStorage.setItem("playerCardsImage", [data.cards[0].image, data.cards[2].image]);
							localStorage.setItem("botCardsImage", [data.cards[1].image, data.cards[3].image])
						
							localStorage.setItem("playerCardsValue", [data.cards[0].value, data.cards[2].value]);
							localStorage.setItem("botCardsValue", [data.cards[1].value, data.cards[3].value])
						})
				});
			
	overTwentyOne("player", "playerCardsValue");
	overTwentyOne("bot", "botCardsValue");
}

async function drawCard(entity, image, value)
{
	let draw = 0;
	let entities = entity;
	let values = value;

	if (entity == "player"){
		localStorage.setItem("draw", Number(localStorage.getItem("draw")) + 1);
		draw = localStorage.getItem("draw")
	}
	else{
		localStorage.setItem("drawBot",Number(localStorage.getItem("drawBot")) +1);
		draw = localStorage.getItem("drawBot");
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
			console.log(data);
			console.log("cards");
			document.querySelector(`#card-${entity}-${draw}`).src = data.cards[0].image;

			localStorage.setItem(image, [localStorage.getItem(image), data.cards[0].image]);
			localStorage.setItem(value, [localStorage.getItem(value), data.cards[0].value]);
			overTwentyOne(entities, values);

        })
		.catch(err => {
			console.log(err);
			document.querySelector("#error").innerText = "No Deck Connected, Start a new Game";
		})
}

/////// MAKE AUTOMATIC
async function stand()
{
	localStorage.setItem("botShow", "true");
	localStorage.setItem("stand", "true");

	let botCards = localStorage.getItem("botCardsImage").split(",");
	document.querySelector("#card-bot-1").src = botCards[0];

	// While loop doesnt work, even with await????
	while (Number(localStorage.getItem("botSum")) < Number(localStorage.getItem("playerSum")) &&
	Number(localStorage.getItem("botSum")) < 17){
		await new Promise(resolve => setTimeout(resolve, 1000)) .then(() => { console.log('1 second passed'); });
		await drawCard("bot", "botCardsImage", "botCardsValue");
	}

	if (Number(localStorage.getItem("botSum")) > Number(localStorage.getItem("playerSum")) &&
	Number(localStorage.getItem("botSum")) <= 21){
		document.querySelector("#winner").innerText = "Dealer has higher hand! You Lose!";
		end();
	}
	else if (Number(localStorage.getItem("botSum")) < Number(localStorage.getItem("playerSum")) &&
	Number(localStorage.getItem("botSum")) >= 17){
		document.querySelector("#winner").innerText = "You have a higher hand! You Win!";
		end();
	}
	else if (Number(localStorage.getItem("botSum")) == Number(localStorage.getItem("playerSum"))){
		document.querySelector("#winner").innerText = "It's a Tie!";
		end();
	}
	else{
		document.querySelector("#winner").innerText = "You Win!";
		end();
	}

}

function overTwentyOne(entity, storage)
{
	let playerValue = localStorage.getItem(storage).split(",")
	let aceCount = 0;
	let value = 0;

	for (i = 0; i < playerValue.length; i++){
		switch(playerValue[i]){
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
				value += Number(playerValue[i]);
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

	if ( entity == "player"){
		if (value > 21){
			end();

			document.querySelector("#winner").innerText = "BUST! You Lose!";
		}

		else if (value == 21){
			end();

			document.querySelector("#winner").innerText = "BLACK JACK! You Win!";
		}

		else{
			document.querySelector("#hit").classList.remove("hide");
			document.querySelector("#stand").classList.remove("hide");
		}
		localStorage.setItem("playerSum", value);
	}

	else{
		localStorage.setItem("botSum", value);
	}
}

function end()
{
	document.querySelector("#hit").classList.add("hide");
	document.querySelector("#stand").classList.add("hide");
}