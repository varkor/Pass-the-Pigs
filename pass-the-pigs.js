Array.prototype.removeDuplicates = function() {
	var i, filter = {}, resultant = [];
	for (i = 0; i < this.length; ++i)
		filter[this[i]] = 0;
	for (i in filter)
		resultant.push(i);
	return resultant;
};

document.onclick = function() {
	var inputs = document.getElementsByTagName("input");
	if (inputs.length > 0)
		inputs[0].focus();
};

function addLine(text, className, safe) {
	if (!text)
		text = "&nbsp;";
	var separateLines = text.split("\n");
	if (separateLines.length > 1) {
		for (var i = 0; i < separateLines.length; ++i)
			addLine(separateLines[i]);
		return;
	}
	text = colourKeywords(text);
	line.push(document.createElement("li"));
	if (safe) {
		var safeText = document.createTextNode(text);
		line[line.length-1].appendChild(safeText);
	} else {
		line[line.length-1].innerHTML = text;
	}
	if (className)
		line[line.length-1].className = className;
	$$("flow").appendChild(line[line.length-1]);
	window.scrollTo(0, document.body.scrollHeight);
	return line[line.length-1];
}

function addInput(callback) {
	var input = addLine("<input type=\"text\">").childNodes[0];
	if (document.hasFocus())
		input.focus();
	input.onkeyup = function(ev) {
		if (ev.keyCode === 13 && this.value.trim().length > 0) { // Enter
			this.value = this.value.trim();
			if (callback)
				callback(this.value);
			this.parentNode.className = "input";
			this.parentNode.appendChild(document.createTextNode(this.value));
			this.parentNode.removeChild(this);
		}
	};
	return input;
}

function $$(el) {
	return document.getElementById(el);
}

function timeline() {
	var progress = true;
	switch (time) {
		case 0:
			addLine("==== Welcome to Pass the Pigs ====", "centred large persistent");
			addLine(0, "large");
			break;
		case 1:
			addLine("== Text-based version ==", "centred persistent");
			addLine();
			break;
		case 2:
			addLine("== Created in 2013 by varkor, updated for 2014 ==", "centred persistent");
			addLine();
			break;
		case 3:
			addLine();
			addLine(">> Please enter the names of all the players (separated by commas)");
			addInput(function(input) {
				input = input.replace(new RegExp("[\\[\\]<>§]", "g"), "");
				players = input.split(/\s*,\s*/);
				if (players.length !== players.removeDuplicates().length) { // Duplicate names
					addLine("> You can't have two players with the same name!");
					time = 3;
				}
				else {
					for (var i = 0; i < players.length; ++i)
						playerScore[players[i]] = 0;
				}
				timeline();
			});
			progress = false;
			break;
		case 4:
			addLine(">> Would you like any virtual players? ([Y]es or [N]o)");
			addInput(function(input) {
				if (input.toLowerCase() === 'y') {
					addLine("> How many virtual players would you like? (8 Maximum)");
					addInput(function(input) {
						bots = parseInt(input);
						if (bots < 0)
							bots = 0;
						if (bots > 8)
							bots = 8;
						for (var i = 0; i < bots; ++i) {
							players.push("[Bot_" + (i + 1) + "]");
							playerScore["[Bot_" + (i + 1) + "]"] = 0;
						}
						timeline();
					});
				} else if (input.toLowerCase() === 'n') {
					timeline();
				} else {
					addLine("> Please answer with [Y]es or [N]o.");
					time = 4;
					timeline();
				}
			});
			progress = false;
			break;
		case 5:
			addLine(">> There " + (players.length === 1 ? "is" : "are") + " " + players.length + " player" + (players.length === 1 ? "" : "s") + " in the game:");
			var names = "";
			for (var i = 0; i < players.length; ++i)
				names += (i + 1) + ") §" + players[i] + "§\n";
			if (names.substr(-1) === '\n')
				names = names.slice(0, -1);
			addLine(names);
			break;
		case 6:
			addLine(">> The current target is " + targetScore + " point" + (targetScore !== 1 ? "s" : "") + ". Are you happy with this target? ([Y]es or [N]o)");
			addInput(function(input) {
				if (input.toLowerCase() === 'y') {
					timeline();
				}
				else if (input.toLowerCase() === 'n') {
					addLine(">> What target score do you want to aim for?");
					addInput(function(input) {
						var target = parseInt(input);
						if (isNaN(target) || target <= 0) {
							addLine("> That's not a sensible target. We'll just stick with " + targetScore +".");
						}
						else {
							targetScore = target;
						}
						timeline();
					});
				}
				else {
					addLine("> Please answer with [Y]es or [N]o.");
					time = 6;
					timeline();
				}
			});
			progress = false;
			break;
		case 7:
			addLine("== Let the games begin! ==", "centred");
			break;
		case 8:
			game();
			break;
			
		default:
			end = true;
			break;
	}
	if (progress)
		setTimeout(function() {timeline();}, 1000 * interval);
	if (!end) {
		++time;
	}
}

function game() {
	var progress = true;
	var nextPhase = -1;
	switch (phase) {
		case 0: // Turn start
			var previousLines = $$("flow").childNodes;
			for (var i = 0; i < previousLines.length; ++i) {
				if (previousLines[i].className.search("persistent") === -1) {
					previousLines[i].className += " faded";
					previousLines[i].className = previousLines[i].className.replace("faded ", "");
				}
			}
			if (players.length === 0) {
				phase = 9;
				game();
				return;
			}
			whoseTurn = (whoseTurn + 1) % players.length;
			player = players[whoseTurn];
			isBot = (whoseTurn >= players.length - bots);
			turnScore = 0;
			addLine("\nIt's §" + player + "§'s turn! " + (isBot ? "They're" : "You're") + " currently on " + playerScore[player] + " point" + (playerScore[player] !== 1 ? "s" : "") + ".");
			if (isBot)
				nextPhase = 2;
			break;
		case 1: // Action choice
			addLine(">> What would you like to do? ([R]oll, [S]ee the scores, [G]ive up)");
			addInput(function(input) {
				switch (input.toLowerCase()) {
					case 'r':
						phase = 2; // Roll
						game();
						return;
					case 's':
						showScores();
						return;
					case 'g':
						if (players.length > 1)
							phase = 3; // Give up
						else {
							addLine("> You're the only one playing &ndash; you can't give up!");
							phase = 1;
						}
						game();
						return;
					default:
						addLine("> You can't do that!");
						game(); // Restart phase
						return;
				}
			});
			progress = false;
			break;
		case 2: // Roll
			addLine(randomRollLine());
			microphases = true;
			break;
		case 2.1:
			addLine("Everyone watches with bated breath as the pigs roll into position...");
			nextPhase = 4;
			break;
		case 3: //Give up
			addLine("The tension is too much for §" + player + "§. They head away from the table in shame.");
			microphases = true;
			break;
		case 3.1:
			players.splice(whoseTurn, 1);
			delete playerScore[player];
			--whoseTurn;
			addLine(">> §" + player + "§ has given up. There " + (players.length === 1 ? "is" : "are") + " now only " + players.length + " player" + (players.length === 1 ? "" : "s") + ".");
			nextPhase = 0;
			break;
		case 4: // Pigs land
			var roll = randomPigs(), individualPigs = "";
			if (roll["position"] === "Piggyback") {
				addLine("What?!? One pig's on top of the other &ndash; it's a Piggyback! It's such an unnatural position for pigs that " + (isBot ? "§" + player + "§ is" : "you're") + " sent in shame from the game, not to return again.");
				players.splice(whoseTurn, 1);
				delete playerScore[player];
				--whoseTurn;
				addLine(">> §" + player + "§ has been banned for their unnatural play. There " + (players.length === 1 ? "is" : "are") + " now only " + players.length + " player" + (players.length === 1 ? "" : "s") + ".");
				nextPhase = 0;
				break;
			}
			if (roll["position"] === "Pig Out") {
				addLine("Oh no! A Pig Out!");
				nextPhase = 7; // Lose turn
				break;
			}
			if (roll["position"] === "Out Of Table") {
				addLine((isBot ? "They've" : "You've") + " run Out of Table &ndash; one of the pigs has fallen off the edge! For being so violent, 10 points have been deducted from " + (isBot ? "their" : "your") + " score." + (playerScore[player] < 0 ? " Well, they would have been if " + (isBot ? "they'd" : "you'd") + " had that many to begin with. " + (isBot ? "Rheir" : "Your") + " points are simply set to zero instead." : ""));
				if (playerScore[player] < 0)
					playerScore[player] = 0;
				nextPhase = 7; // Lose turn
				break;
			}
			if (roll["position"] === "Makin' Bacon") {
				addLine("The pigs are Makin' Bacon! We certainly can't have that! " + (isBot ? "They" : "You") + " lose all your points to teach " + (isBot ? "them" : "you") + " a lesson.");
				nextPhase = 7; // Lose turn
				break;
			}
			if (roll["position"] === "Mixed Combo")
				individualPigs = ": a " + roll["pigs"][0] + " and a " + roll["pigs"][1];
				addLine("It's a " + roll["position"] + individualPigs + "!");
			microphases = true;
			break;
		case 4.1:
			if (isBot) {
				addLine("§" + player + "§ now has " + turnScore + " this turn.");
				if (turnScore > Math.random() * 100 || playerScore[player] + turnScore >= targetScore)
					nextPhase = 6;
				else
					nextPhase = 2;
			}
			else {
				addLine("That puts you on " + turnScore + " point" + (turnScore !== 1 ? "s" : "") + " this turn! If you banked now, you'd be on " + (playerScore[player] + turnScore) + " point" + (playerScore[player] + turnScore !== 1 ? "s" : "") + (playerScore[player] + turnScore >= targetScore ? ", which would win you the game!" : "."));
				nextPhase = 5;
			}
			break;
		case 5:
			addLine(">> What will you do next? ([R]oll Again, [B]ank your points, [S]ee the scores, [G]ive up)");
			addInput(function(input) {
				switch (input.toLowerCase()) {
					case 'r':
						phase = 2; // Roll
						game();
						return;
					case 'b':
						phase = 6; // Bank
						game();
						return;
					case 's':
						showScores();
						return;
					case 'g':
						if (players.length > 1)
							phase = 3; // Give up
						else {
							addLine("You're the only one playing &ndash; you can't give up!");
							phase = 5;
						}
						game();
						return;
					default:
						addLine("> You can't do that!");
						game(); // Restart phase
						return;
				}
			});
			progress = false;
			break;
		case 6: // Bank
			playerScore[player] += turnScore;
			if (playerScore[player] >= targetScore) {
				addLine("§" + player + "§ has got " + playerScore[player] + "!");
				nextPhase = 8; // Win
				break;
			}
			if (isBot)
				addLine("§" + player + "§'s decided to stop there, banking their points and bringing their total up to " + playerScore[player] + ".");
			else
				addLine("Better safe than sorry. You bank your points, bringing you to " + playerScore[player] + ", and pass the pigs to the next person.");
			nextPhase = 0;
			break;
		case 7: // Lose turn
			addLine("Growling with frustration, " + (isBot ? "they" : "you") + " hand the pigs to the next person. After that, " + (isBot ? "they" : "you") + "'ve got " + playerScore[player] + " point" + (playerScore[player] !== 1 ? "s" : "") + ".");
			nextPhase = 0;
			break;
		case 8: // Won the game
			addLine("Congratulations §" + player + "§!");
			microphases = true;
			break;
		case 8.1:
			addLine("§" + player + "§ has won the game!");
			nextPhase = 10;
			microphases = false;
			break;
		case 9: // No players left
			addLine("\nThere are no players left in the game. The pigs lie forlornly on the table with no-one left to pass them...");
			nextPhase = 10;
			break;
		case 10: // Fade game out
			break;
	}
	if (progress) {
		if (nextPhase !== -1) {
			phase = nextPhase;
			microphases = false;
		}
		else {
			if (microphases) {
				var currentMicrophase = phase.toString().split(".")[1], nextMicrophase;
				if (currentMicrophase === undefined)
					currentMicrophase = 0;
				phase = parseFloat(Math.floor(phase) + "." + (parseInt(currentMicrophase) + 1));
			}
			else {
				phase = Math.floor(phase);
				++phase;
			}
		}
		setTimeout(function() {game();}, 1000 * interval);
	}
}

function randomRollLine() {
	var pronoun = (isBot ? "They" : "You");
	var lines = [pronoun + " roll the pigs carefully...", pronoun + " send the pigs hurtling across the table!", "With a little shake, " + pronoun.toLowerCase() + " release the pigs..."];
	return lines[Math.floor(Math.random() * lines.length)];
}

function randomPigs() {
	var pigs = [], position, totalScore;
	for (var i = 0, r, c = 0; i < 2; ++i) {
		r = Math.random() * 100;
		if (r <= c + 0.61)
			pigs.push("Leaning Jowler");
		else if (r <= c + 3.0)
			pigs.push("Snouter");
		else if (r <= c + 8.8)
			pigs.push("Trotter");
		else if (r <= c + 22.4)
			pigs.push("Razorback");
		else if (r <= c + 30.2)
			pigs.push("Dotted Side");
		else
			pigs.push("Blank Side");
	}
	if (array2Is(pigs, "Blank Side", "Dotted Side")) {
		position = "Pig Out"; turnScore = 0;
	}
	else if (array2Is(pigs, "Blank Side") || array2Is(pigs, "Dotted Side")) {
		position = "Sider"; turnScore += 1;
	}
	else if (singlePig(pigs, "Razorback")) {
		position = "Razorback"; turnScore += 5;
	}
	else if (array2Is(pigs, "Razorback")) {
		position = "Double Razorback"; turnScore += 20;
	}
	else if (singlePig(pigs, "Trotter")) {
		position = "Trotter"; turnScore += 5;
	}
	else if (array2Is(pigs, "Trotter")) {
		position = "Double Trotter"; turnScore += 20;
	}
	else if (singlePig(pigs, "Snouter")) {
		position = "Snouter"; turnScore += 10;
	}
	else if (array2Is(pigs, "Snouter")) {
		position = "Double Snouter"; turnScore += 40;
	}
	else if (singlePig(pigs, "Leaning Jowler")) {
		position = "Leaning Jowler"; turnScore += 15;
	}
	else if (array2Is(pigs, "Leaning Jowler")) {
		position = "Double Leaning Jowler"; turnScore += 60;
	}
	else {
		position = "Mixed Combo";
		for (var i = 0; i < pigs.length; ++i) {
			switch (pigs[i]) {
				case "Razorback":
				case "Trotter":
					turnScore += 5;
					break;
				case "Snouter":
					turnScore += 10;
					break;
				case "Leaning Jowler":
					turnScore += 15;
					break;
			}
		}
	}
	var r = Math.random() * 100;
	if (r >= 0 && r < 0.7) { // 0.7% chance
		position = "Makin' Bacon"; turnScore = 0; playerScore[player] = 0;
	}
	if (r >= 0.7 && r < 1.0) { // 0.3% chance
		position = "Kissing Bacon"; turnScore += 100;
	}
	if (r >= 1.0 && r < 1.01) { // 0.01% chance
		position = "Piggyback"; turnScore = 0;
	}
	if (r >= 1.01 && r < 2.01) { // 1% chance
		position = "Out Of Table"; turnScore = 0; playerScore[player] -= 10;
	}
	return {"position" : position, "pigs" : pigs};
}

function array2Is(array, value1, value2) {
	if (!value2 && value1)
		value2 = value1;
	return ((array[0] === value1 && array[1] === value2) || (array[1] === value1 && array[0] === value2));
}

function singlePig(array, value) {
	return array2Is(array, value, "Blank Side") || array2Is(array, value, "Dotted Side");
}

function showScores() {
	var scores = [], scoreList = [];
	for (var player in playerScore)
		scores.push({player : player, score : playerScore[player]});
	scores.sort(function (a, b) { return b.score - a.score; });
	for (var i = 0; i < scores.length; ++ i)
		scoreList.push("§" + scores[i].player + "§ is on " + scores[i].score + " point" + (scores[i].score !== 1 ? "s" : ""));
	scoreList = scoreList.join("; ");
	scoreList += "."
	addLine("> The scores are as follows: " + scoreList);
	game();
}

function colourKeywords(string) {
	var keywords = {"Blank Side" : "grey", "Dotted Side" : "grey", "Mixed Combo" : "aqua", "Sider" : "grey", "Double Razorback" : "fuchsia", "Razorback" : "fuchsia", "Double Leaning Jowler" : "yellow", "Leaning Jowler" : "yellow", "Double Trotter" : "orange", "Trotter": "orange", "Double Snouter" : "darkviolet", "Snouter": "darkviolet", "Pig Out" : "red", "Makin' Bacon" : "firebrick", "Kissing Bacon" : "bisque", "Out Of Table" : "indianred", "Piggyback" : "whitesmoke"};
	for (var word in keywords) {
		string = string.replace(new RegExp("(^|[^§])" + word + "($|[^§])", "gi"), "$1<span style=\"color: " + keywords[word] + "; text-shadow: none;\">" + word + "</span>$2");
	}
	string = string.replace(new RegExp("§", "gi"), "");
	return string;
}

function start() {
	$$("flow").innerHTML = "";
	$$("flow").removeAttribute("class");
	
	line = [];
	
	time = 0;
	end = false;
	players = [];
	bots = 0;
	playerScore = {};
	targetScore = 100;
	interval = 1;

	whoseTurn = -1;
	phase = 0;
	microphases = false;
	
	timeline();
}