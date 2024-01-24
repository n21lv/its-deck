const MAX_ROLLS = 20;
const RANDOM_ORG_QUOTA = 25000;

function clearCards() {
    var reset = `       <colgroup>
			<col style="width: 5%;">
            <col style="width: 10%;">
            <col style="width: 25%;">
            <col style="width: 48%;">
            <col style="width: 12%;">
        </colgroup>`;
    $('#objectives').html(reset);
    $('#objectives').hide();
}

function loadCards(mode, cardNums, numDice) {
    if (cardNums === -1) {
        var quota = checkRandomOrgQuota();
        console.log(quota);
        if (quota < RANDOM_ORG_QUOTA) {
            alert('Apologies, human. We have no more dice to roll for today. Try the manual option');
            return;
        }
        cardNums = rollD20(numDice);
    }
    
    $.getJSON('deck.json', (data) => {
        let cardNumbers;
        if (typeof cardNums != 'string') {
            cardNumbers = cardNums;
        } else {
            cardNumbers = cardNums.split(',');
        }
		
		var cardCounter = 0;
        
        cardNumbers.forEach( (cardNum) => {
			// determine where card pairs are to draw a separator line
			let pairNum = Math.floor(cardCounter/2);
			cardCounter++;
			
            let cardIndex = cardNum-1;
            // fetch the icons
            let cardIcons = '';
            if (data[cardIndex].icons > '') {
                let iconsArr = [];
                if (data[cardIndex].icons) {
                    iconsArr = data[cardIndex].icons.split(',');
                }
                iconsArr.forEach( (icon) => {
                    cardIcons += `<span class="icon-${icon}"></span>`;
                } );
            }
            
            let reqs = data[cardIndex][mode + 'Req'];
            let objective = data[cardIndex][mode + 'Objective'];
            
            let card = `        <tbody data-pair=${pairNum}>
            <tr>
				<th class="discard" data-card-id=${cardNum}></th>
                <th class="card_name" colspan=3>${cardNum}. ${data[cardIndex].name}</th>
                <th class="card_icons">${cardIcons}</th>
            </tr>
            <tr>
				<td class="discard"></td>
                <td class="card_reqs" colspan=2><b>Requirements:</b> ${reqs}</td>
                <td class="card_desc" colspan=2><b>Objective:</b> ${objective}</td>
            </tr>
        </tbody>`;
            $('#objectives').append(card);
			
			// draw the separator line, if applicable
			if (!(cardCounter%2)) {
				$('#objectives').append('        <tbody class="separator"><tr></tr></tbody><tbody><tr></tr></tbody>');
			}
        });
    });
    
    $('#objectives').show();
}

function rollD20(numDice) {
    var diceRolls = [];
    
    $.ajaxSetup({
        async: false,
    });
    $.get("https://www.random.org/sequences/?min=1&max=20&col=1&base=10&format=plain&rnd=new", function(data) {
        diceRolls = data.split('\n', MAX_ROLLS);
    });
    $.ajaxSetup({async: true});
    
    let result = diceRolls.slice(0, (numDice*2)); // return only the requested number of cards
    
    return result;
}

function checkRandomOrgQuota() {
    var quota = 0;
    
    $.ajaxSetup({async: false});
    $.get("https://www.random.org/quota/?format=plain", function(data) {
        quota = data;
    });
    $.ajaxSetup({async: true});
    
    return quota;
}