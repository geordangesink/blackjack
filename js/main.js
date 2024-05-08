
var slider = document.getElementById("bid");
var output = document.getElementById("bid-value");

async function pageLoad(){
	// Relode unfinished game if there is one in local storage
	await checkBalance();

	if (localStorage.getItem("playerCardsImage")){
		let playerCards = localStorage.getItem("playerCardsImage").split(",");
		let botCards = localStorage.getItem("botCardsImage").split(",");

		for (i = 0; i < playerCards.length; i++){
			document.querySelector(`#card-player-${i+1}`).src = playerCards[i];
		}
		
		if (localStorage.getItem("botShow") == "true"){
			for (i = 1; i <= Number(localStorage.getItem("drawBot")); i++){
				document.querySelector(`#card-bot-${i}`).src = botCards[i - 1];
			}
			stand(Boolean(localStorage.getItem("refresh")));
			document.querySelector("#points-bot").innerText = `(${localStorage.getItem("botSum")})`;
		}
		else{
			// bid GUI
			output.innerHTML = localStorage.getItem("bid");
			document.querySelector("#bid-placed").classList.remove("hide");
			document.querySelector("#bid").classList.add("hide");
			document.querySelector("#place-bid").classList.add("hide");

			document.querySelector(`#card-bot-1`).src = "https://www.deckofcardsapi.com/static/img/back.png";
			document.querySelector(`#card-bot-2`).src = botCards[1];

			overTwentyOne("player", "playerCardsValue", Boolean(localStorage.getItem("refresh")));
			overTwentyOne("bot", "botCardsValue", Boolean(localStorage.getItem("refresh")));
			document.querySelector("#points-bot").innerText = `(? + ${overTwentyOne("botNoShow", "botCardsValue")})`;
		}
	}
	else{
		document.querySelector("#bid-placed").classList.add("hide");
		document.querySelector("#bid").classList.remove("hide");
		document.querySelector("#place-bid").classList.remove("hide");
		output.innerHTML = localStorage.getItem("bid"); // Display the default slider value
		document.querySelector("#get-deck").classList.remove("hide");
	}

	if (!localStorage.getItem("balance")){
		localStorage.setItem("balance", "5000");
		localStorage.setItem("refresh", "true");
	}

	// Slider for bid
	slider.max = localStorage.getItem("balance");

	document.querySelector("#current-points").innerText = localStorage.getItem("balance");

	// Update the current slider value (each time you drag the slider handle)
	slider.oninput = function() {
	output.innerHTML = this.value;
	}

	// Buttons
	document.querySelector("#get-deck").addEventListener("click", function(event)
	{
		startGame();
		localStorage.setItem("refresh", "false");
	});

	document.querySelector("#hit").addEventListener("click", function(event)
	{
		drawCard("player", "playerCardsImage", "playerCardsValue");
		localStorage.setItem("refresh", "false");
	});

	document.querySelector("#stand").addEventListener("click", function(event)
	{
		stand();
		localStorage.setItem("refresh", "false");
	});
}
pageLoad();


function startGame()
{
	// Check balance
	checkBalance()

	// player GUI
	document.querySelector("#bid-placed").classList.remove("hide");
	document.querySelector("#bid").classList.add("hide");
	document.querySelector("#place-bid").classList.add("hide");

	// Save bid
	localStorage.setItem("bid", document.querySelector("#bid").value)

	// Reset cards  1.1.1
	if (localStorage.getItem("drawBot")){
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


	// Show buttons and delete Win/Lose announcement
	document.querySelector("#hit").classList.remove("hide");
	document.querySelector("#stand").classList.remove("hide");
	document.querySelector("#winner").innerText = "";

	// Reset all game related local vlues
	localStorage.removeItem("botShow");
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
							
							document.querySelector("#get-deck").classList.add("hide");

							overTwentyOne("player", "playerCardsValue");
							overTwentyOne("bot", "botCardsValue");
							document.querySelector("#points-bot").innerText = `(? + ${overTwentyOne("botNoShow", "botCardsValue")})`;
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

	localStorage.setItem("balance", "5000");

	// Create a new deck
	fetch("https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6", options)
				.then(response => response.json())
				.then(data => {
					console.log("new deck: ");
					console.log(data);
					localStorage.setItem("deckId", data.deck_id);
					deckId = localStorage.getItem("deckId");
				
					// Deal two cards to each
					// fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/draw/?count=4`, options)
						// .then(response => response.json())
						// .then(data => {
							// document.querySelector(`#card-player-1`).src = data.cards[0].image;
							// document.querySelector(`#card-player-2`).src = data.cards[2].image;
							// document.querySelector(`#card-bot-1`).src = "https://www.deckofcardsapi.com/static/img/back.png";
							// document.querySelector(`#card-bot-2`).src = data.cards[3].image;
						// 
							// localStorage.setItem("playerCardsImage", [data.cards[0].image, data.cards[2].image]);
							// localStorage.setItem("botCardsImage", [data.cards[1].image, data.cards[3].image])
						// 
							// localStorage.setItem("playerCardsValue", [data.cards[0].value, data.cards[2].value]);
							// localStorage.setItem("botCardsValue", [data.cards[1].value, data.cards[3].value])
						// })
						// .catch(err =>{
							// document.querySelector("#error").innerText = `unexpected error -> ${err} \n Try again`;
						// })
				})
				.catch(err =>{
					document.querySelector("#error").innerText = `Problems fetching card deck from API server \n-> ${err}`;
				});
			
	document.querySelector("#get-deck").classList.remove("hide");
	// overTwentyOne("player", "playerCardsValue");
	// overTwentyOne("bot", "botCardsValue");
	// document.querySelector("#points-bot").innerText = `(? + ${overTwentyOne("botNoShow", "botCardsValue")})`;
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

// show hand
async function stand(refresh)
{
	overTwentyOne("player", "playerCardsValue", refresh);
	overTwentyOne("bot", "botCardsValue", refresh);
	localStorage.setItem("botShow", "true");

	let botCards = localStorage.getItem("botCardsImage").split(",");
	document.querySelector("#card-bot-1").src = botCards[0];

	document.querySelector("#points-bot").innerText = `(${localStorage.getItem("botSum")})`;

	// keep drawing bot cards
	while (Number(localStorage.getItem("botSum")) <= Number(localStorage.getItem("playerSum")) &&
	Number(localStorage.getItem("botSum")) < 17){
		await new Promise(resolve => setTimeout(resolve, 500));
		await drawCard("bot", "botCardsImage", "botCardsValue");
		document.querySelector("#points-bot").innerText = `(${localStorage.getItem("botSum")})`;
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
	let playerValue = localStorage.getItem(storage).split(",")
	let amountOfCards = playerValue.length;
	let aceCount = 0;
	let value = 0;
	let counterNoShow = 0;

	if (entity === "botNoShow"){
		amountOfCards = 1;
		counterNoShow = 1;
	}

	for (i = 0; i < amountOfCards; i++){
		switch(playerValue[i+counterNoShow]){
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
				value += Number(playerValue[i+counterNoShow]);
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

		localStorage.setItem("playerSum", value);
		document.querySelector("#points-player").innerText = `(${localStorage.getItem("playerSum")})`;

		if (value > 21){
			end("playerBust", refresh);
		}

		else if (value == 21){
			end("playerBlackJack", refresh);
		}

		else if (value < 21 && localStorage.getItem("botShow") !== "true"){
			document.querySelector("#hit").classList.remove("hide");
			document.querySelector("#stand").classList.remove("hide");
		}
	}

	else if ( entity === "botNoShow"){
		return value;
	}

	else{
		localStorage.setItem("botSum", value);
	}
}

// round complete
async function end(statement, refresh)
{
	await new Promise(resolve => setTimeout(resolve, 500));
	document.querySelector("#hit").classList.add("hide");
	document.querySelector("#stand").classList.add("hide");
	document.querySelector("#bid-placed").classList.add("hide");
	
	switch(statement){

		case "playerBust":
			document.querySelector("#winner").innerText = "BUST! You Lose! (-100%)";
			document.querySelector("#get-deck").classList.remove("hide");
			if (localStorage.getItem("refresh") != "true"){
				localStorage.setItem("balance", Math.round(Number(localStorage.getItem("balance")) - Number(localStorage.getItem("bid"))));
			}
			localStorage.setItem("refresh", "true")
			break;

		case "playerBlackJack":
			document.querySelector("#winner").innerText = "BLACK JACK! You Win! (+150%)";
			document.querySelector("#get-deck").classList.remove("hide");
			if (localStorage.getItem("refresh") != "true"){
				localStorage.setItem("balance", Math.round(Number(localStorage.getItem("balance")) + Number(localStorage.getItem("bid")) + Number(localStorage.getItem("bid"))/2));
			}
			localStorage.setItem("refresh", "true")
			break;

		case "playerHigher":
			document.querySelector("#winner").innerText = "You have a higher hand! You Win! (+100%)";
			document.querySelector("#get-deck").classList.remove("hide");
			if (localStorage.getItem("refresh") != "true"){
				localStorage.setItem("balance", Math.round(Number(localStorage.getItem("balance")) + Number(localStorage.getItem("bid"))));
			}
			localStorage.setItem("refresh", "true")
			break;

		case "dealerBust":
			document.querySelector("#winner").innerText = "Dealer went over 21, You Win! (+100%)";
			document.querySelector("#get-deck").classList.remove("hide");
			if (localStorage.getItem("refresh") != "true"){
				localStorage.setItem("balance", Math.round(Number(localStorage.getItem("balance")) + Number(localStorage.getItem("bid"))));
			}
			localStorage.setItem("refresh", "true")
			break;
		
		case "dealerHigher":
			document.querySelector("#winner").innerText = "Dealer has a higher hand! You Lose! (-100%)";
			document.querySelector("#get-deck").classList.remove("hide");
			if (localStorage.getItem("refresh") != "true"){
				localStorage.setItem("balance", Math.round(Number(localStorage.getItem("balance")) - Number(localStorage.getItem("bid"))));
			}
			localStorage.setItem("refresh", "true")
			break;

		default: // Tie
			document.querySelector("#winner").innerText = "It's a Tie! (+0%)";
			document.querySelector("#get-deck").classList.remove("hide");
			localStorage.setItem("refresh", "true")
			break;
	}
	slider.value = slider.min;
	output.innerText = slider.min;
	document.querySelector("#current-points").innerText = localStorage.getItem("balance")
	slider.max = localStorage.getItem("balance");

	checkBalance()
}

async function checkBalance(){
	if (Number(localStorage.getItem("balance")) < Number(slider.min)){
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
					document.querySelector("#main").classList.remove("hide");
					document.querySelector("#out-of-money").classList.add("hide");
				}
				else{
					document.querySelector("#main").classList.add("hide");
					document.querySelector("#out-of-money").classList.remove("hide");
					document.querySelector("#balance").innerText = localStorage.getItem("balance");

				}
		});
	}
	else{
		document.querySelector("#main").classList.remove("hide");
		document.querySelector("#bid").classList.remove("hide");
		document.querySelector("#place-bid").classList.remove("hide");
	}
}