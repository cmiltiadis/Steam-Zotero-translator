{
	"translatorID": "0a813d36-f214-4043-a7c5-4378c9a9ca05",
	"label": "Steam",
	"creator": "Constantinos Miltiadis ",
	"target": "https://store.steampowered.com/app/",
	"minVersion": "5.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2023-06-29 12:52:38"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2023 Constantinos Miltiadis

	This file is part of Zotero.

	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with Zotero. If not, see <http://www.gnu.org/licenses/>.

	***** END LICENSE BLOCK *****
*/

/*
Saving as software. Required citations fields: 
https://aurimasv.github.io/z2csl/typeMap.xml#map-computerProgram

OK
- Abstract
- Release Date
- Tags 

Not 
- Platforms 
- Publisher 


*/
function detectWeb(doc, url) {
	// TODO: adjust the logic here
	if (url.includes('/app/')) {
		return 'computerProgram';
	}
	else if (getSearchResults(doc, true)) {
		return 'multiple';
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	// TODO: adjust the CSS selector
	var rows = doc.querySelectorAll('h2 > a.title[href*="/article/"]');
	for (let row of rows) {
		// TODO: check and maybe adjust
		let href = row.href;
		// TODO: check and maybe adjust
		let title = ZU.trimInternal(row.textContent);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}

async function doWeb(doc, url) {
	if (detectWeb(doc, url) == 'multiple') {
		let items = await Zotero.selectItems(getSearchResults(doc, false));
		if (!items) return;
		for (let url of Object.keys(items)) {
			await scrape(await requestDocument(url));
		}
	}
	else {
		await scrape(doc, url);
	}
}

async function scrape(doc, url = doc.location.href) {
	let translator = Zotero.loadTranslator('web');
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	translator.setDocument(doc);

	//RELEASE DATE - OK 
	let release = text(doc, 'div.date'); 
	// Zotero.debug("Release:"+ release); 

	//Platform (System) - OK 
	let platform = doc.querySelectorAll('div.sysreq_tab');//if multiplatform this div exists
	let platforms=[]; 
	if (platform.length!=0){
		for (let pl of platform){
			platforms.push(ZU.trimInternal(pl.textContent)); 
		}
	} else{ //otherwise just windows 
		platforms.push("Windows"); 
	}
	// Zotero.debug("PLATFORMs:"+ platforms); 

	//TAGS - OK
	let tags = text(doc, 'div.glance_tags.popular_tags'); 
	tags= tags.replace('+', ''); //remove + at the end of the tags 
	tags = tags.split('\n'); // split by new line 
	ntags=[]; 
	for (let tag of tags){
		// ntags.push
		tag = ZU.trimInternal(tag); 
		ntags.push(tag); 
	}

	// DEVELOPERS AND PUBLISHERS OK 


	//GET Details form 'div.details_block'
	let details = doc.querySelectorAll('div.details_block')[0]; 
	detailsText= details.textContent; 
	detailsText= detailsText.replace ('\t',''); 
	let detailsSplit =detailsText.split('\n'); 
	// Zotero.debug(detailsSplit); 

	let title = ZU.trimInternal( detailsSplit[2].replace('Title:', '')); 
	let developer =  ZU.trimInternal(detailsSplit[9]).split(','); 
	let publisher= ZU.trimInternal(detailsSplit[15]); 

	//Test 
	// Zotero.debug("Title:"+ title); 
	// Zotero.debug("Developer:"+ developer); 
	// Zotero.debug("Publisher:"+ publisher); 

	//cleanup and format developers 
	let authors =[]; 
	for (let dev of developer){
		authors.push(Zotero.Utilities.cleanAuthor(dev, 'author',true )); 
	}
	
	translator.setHandler('itemDone', (_obj, item) => {
		item.title=title; 
		item.creators= authors; 
		item.tags=ntags; 
		item.date= release; 
		item.system= platforms;
		item.company = publisher; 
		item.complete();
	});

	let em = await translator.getTranslatorObject();
	em.itemType = 'computerProgram';
	// TODO map additional meta tags here, or delete completely
	// em.addCustomFields({
	// 	'twitter:description': 'abstractNote'
	// });
	await em.doWeb(doc, url);
}


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://store.steampowered.com/app/1229490/ULTRAKILL/",
		"detectedItemType": "computerProgram",
		"items": [
			{
				"itemType": "computerProgram",
				"title": "ULTRAKILL on Steam",
				"creators": [],
				"abstractNote": "ULTRAKILL is a fast-paced ultraviolent retro FPS combining the skill-based style scoring from character action games with unadulterated carnage inspired by the best shooters of the '90s. Rip apart your foes with varied destructive weapons and shower in their blood to regain your health.",
				"libraryCatalog": "store.steampowered.com",
				"url": "https://store.steampowered.com/app/1229490/ULTRAKILL/",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "3D"
					},
					{
						"tag": "Action"
					},
					{
						"tag": "Arena Shooter"
					},
					{
						"tag": "Blood"
					},
					{
						"tag": "Character Action Game"
					},
					{
						"tag": "Cyberpunk"
					},
					{
						"tag": "Difficult"
					},
					{
						"tag": "Early Access"
					},
					{
						"tag": "FPS"
					},
					{
						"tag": "Fast-Paced"
					},
					{
						"tag": "First-Person"
					},
					{
						"tag": "Old School"
					},
					{
						"tag": "Retro"
					},
					{
						"tag": "Robots"
					},
					{
						"tag": "Sci-fi"
					},
					{
						"tag": "Shooter"
					},
					{
						"tag": "Silent Protagonist"
					},
					{
						"tag": "Singleplayer"
					},
					{
						"tag": "Spectacle fighter"
					},
					{
						"tag": "Stylized"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://store.steampowered.com/app/1201540/HELLCARD/",
		"detectedItemType": "computerProgram",
		"items": [
			{
				"itemType": "computerProgram",
				"title": "Save 20% on HELLCARD on Steam",
				"creators": [],
				"date": "16 Feb, 2023",
				"abstractNote": "Hellcard is a unique cooperative deck builder rogue-like game. Descend into the paper dungeons on your own, recruit computer-controlled companions or join other players' lobbies in fast-paced tactical card battles against the armies of darkness and the Archdemon himself!",
				"libraryCatalog": "store.steampowered.com",
				"url": "https://store.steampowered.com/app/1201540/HELLCARD/",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "Card Battler"
					},
					{
						"tag": "Card Game"
					},
					{
						"tag": "Co-op"
					},
					{
						"tag": "Co-op Campaign"
					},
					{
						"tag": "Deckbuilding"
					},
					{
						"tag": "Difficult"
					},
					{
						"tag": "Dungeon Crawler"
					},
					{
						"tag": "Early Access"
					},
					{
						"tag": "Fantasy"
					},
					{
						"tag": "Isometric"
					},
					{
						"tag": "Local Co-Op"
					},
					{
						"tag": "Online Co-Op"
					},
					{
						"tag": "RPG"
					},
					{
						"tag": "Roguelike"
					},
					{
						"tag": "Roguelike Deckbuilder"
					},
					{
						"tag": "Roguelite"
					},
					{
						"tag": "Singleplayer"
					},
					{
						"tag": "Strategy"
					},
					{
						"tag": "Turn-Based"
					},
					{
						"tag": "Turn-Based Combat"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://store.steampowered.com/app/303210/The_Beginners_Guide/",
		"detectedItemType": "computerProgram",
		"items": [
			{
				"itemType": "computerProgram",
				"title": "The Beginner's Guide on Steam",
				"date": "1 Oct, 2015",
				"abstractNote": "The Beginner's Guide is a narrative video game from Davey Wreden, the creator of The Stanley Parable. It lasts about an hour and a half and has no traditional mechanics, no goals or objectives. Instead, it tells the story of a person struggling to deal with something they do not understand.",
				"libraryCatalog": "store.steampowered.com",
				"url": "https://store.steampowered.com/app/303210/The_Beginners_Guide/",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "Abstract"
					},
					{
						"tag": "Adventure"
					},
					{
						"tag": "Atmospheric"
					},
					{
						"tag": "Dark"
					},
					{
						"tag": "Emotional"
					},
					{
						"tag": "Experience"
					},
					{
						"tag": "Experimental"
					},
					{
						"tag": "First-Person"
					},
					{
						"tag": "Great Soundtrack"
					},
					{
						"tag": "Indie"
					},
					{
						"tag": "Narration"
					},
					{
						"tag": "Philosophical"
					},
					{
						"tag": "Psychological"
					},
					{
						"tag": "Psychological Horror"
					},
					{
						"tag": "Puzzle"
					},
					{
						"tag": "Short"
					},
					{
						"tag": "Singleplayer"
					},
					{
						"tag": "Story Rich"
					},
					{
						"tag": "Surreal"
					},
					{
						"tag": "Walking Simulator"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
