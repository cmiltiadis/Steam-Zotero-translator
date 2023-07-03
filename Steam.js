{
	"translatorID": "2d950ca4-583a-46e0-9e96-734914a94ccd",
	"label": "Steam",
	"creator": "Constantinos Miltiadis",
	"target": "https://store.steampowered.com/",
	"minVersion": "5.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2023-07-03 15:40:22"
}

/*
    ***** BEGIN LICENSE BLOCK *****

    Copyright © 2023 Constantinos Miltiadis <3

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
tests:
- games with "coming soon" release date will save that in the date field. E.g. https://store.steampowered.com/app/1068500/Multiverse_Designer/
- multiplatform: https://store.steampowered.com/app/730/CounterStrike_Global_Offensive/
*/

function isSearch(url){
	return url.includes('/search/'); 
}
function isDevPub(url){
	return (url.includes('/developer/') || url.includes('/publisher/')); 
}
function isMultiple(url){
	return (isSearch(url) || isDevPub(url)) ;  
}

function detectWeb(doc, url) {
	// TODO: adjust the logic here
	if (url.includes('/app/')) {
		return 'computerProgram';
	}
	else if (isMultiple(url)){
		if (getSearchResults(doc, true)){
			return 'multiple'; 
		}else {
			return false; 
		}
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	// Zotero.debug("MULTI");

	var items = {};
	var found = false;


	if (isSearch(doc.URL)){
		// Zotero.debug("Search");

		var rows = doc.querySelectorAll('.search_result_row'); 
		
		for (let row of rows){
			let href =row.href; 
			if (href in items) continue; //omit duplicates
			if (href.includes('/app/')==false) continue; //remove bundles
			let title = row.querySelector('span.title'); 
			title = title.textContent; 
			// Zotero.debug(title+" -- "+ href); 

			if (!title || !href) continue; 
			if (checkOnly) return true; 
			found  =true; 
			items [href]= title; 
		}

	}else if (isDevPub(doc.URL)){
		// Zotero.debug("DEV/PUB"); 
		var rows = doc.querySelectorAll('.recommendation'); 

		for (let row of rows){
			let href = row.querySelector('a[href*="/app/"]'); 
			href=href.href; 

			if (href in items) continue; //omit duplicates/demos
			let title =row.querySelector('.color_created'); 
			title =ZU.trimInternal(title.textContent);

			if (!title || !href) continue; 
			if (checkOnly) return true; 
			found=true; 
			items[href]=title; 
		}
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
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	translator.setDocument(doc);

	//title
	var title =doc.querySelector('#appHubAppName').textContent; 
	//date
	var date = text(doc,'div.date'); 
	//dev / publisher 
	var credits = doc.querySelectorAll('.glance_ctn_responsive_left > .dev_row'); 
	if (credits.length==0){
		Zotero.debug("Item is not game (maybe hardware?)"); 
		return; 
	}
	// devs
	var creators =ZU.trimInternal( credits[0].textContent).substring(10); 
	creators=creators.split(',');
	var cleanCreators= []; 
	for (let creator of creators){
		cleanCreators.push(ZU.cleanAuthor(creator, 'author',true ));
	}
	//publisher 
	var publishers= ZU.trimInternal(credits[1].textContent).substring(10); 
	//platforms (get platform tabs if they are there)
	var platforms= doc.querySelectorAll('div.sysreq_tab'); 
	var cleanPlatforms = []; 
	if (platforms.length==0){ cleanPlatforms="Windows";}
	else { 	
		for (let platform of platforms){
			cleanPlatforms.push(ZU.trimInternal(platform.textContent)); 
		}
		cleanPlatforms=cleanPlatforms.toString(); 
	}
	//TAGS
	let tags= doc.querySelectorAll('a.app_tag'); 
	var ntags=[];  
	for (let tag of tags){
		tag = ZU.trimInternal(tag.text);
		ntags.push(tag); 
	}
	
	translator.setHandler('itemDone', (_obj, item) => {
		item.title=title; 
		item.date=date; 
		item.creators=cleanCreators; 
		item.company= publishers; 
		item.attachments=[];//don't save snapshots 
		item.tags=ntags; 
		item.system= cleanPlatforms; 
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
		"url": "https://store.steampowered.com/search/?term=ultrakill",
		"detectedItemType": "multiple",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://store.steampowered.com/app/730/CounterStrike_Global_Offensive/",
		"detectedItemType": "computerProgram",
		"items": [
			{
				"itemType": "computerProgram",
				"title": "Counter-Strike: Global Offensive",
				"creators": [
					{
						"lastName": "Valve",
						"creatorType": "author"
					},
					{
						"lastName": "Hidden Path Entertainment",
						"creatorType": "author"
					}
				],
				"date": "21 Aug, 2012",
				"abstractNote": "Counter-Strike: Global Offensive (CS: GO) expands upon the team-based action gameplay that it pioneered when it was launched 19 years ago. CS: GO features new maps, characters, weapons, and game modes, and delivers updated versions of the classic CS content (de_dust2, etc.).",
				"company": "Valve",
				"libraryCatalog": "store.steampowered.com",
				"shortTitle": "Counter-Strike",
				"system": "Windows,macOS,SteamOS + Linux",
				"url": "https://store.steampowered.com/app/730/CounterStrike_Global_Offensive/",
				"attachments": [],
				"tags": [
					{
						"tag": "Action"
					},
					{
						"tag": "Co-op"
					},
					{
						"tag": "Competitive"
					},
					{
						"tag": "Difficult"
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
						"tag": "Military"
					},
					{
						"tag": "Moddable"
					},
					{
						"tag": "Multiplayer"
					},
					{
						"tag": "Online Co-Op"
					},
					{
						"tag": "PvP"
					},
					{
						"tag": "Realistic"
					},
					{
						"tag": "Shooter"
					},
					{
						"tag": "Strategy"
					},
					{
						"tag": "Tactical"
					},
					{
						"tag": "Team-Based"
					},
					{
						"tag": "Trading"
					},
					{
						"tag": "War"
					},
					{
						"tag": "eSports"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://store.steampowered.com/app/1068500/Multiverse_Designer/",
		"detectedItemType": "computerProgram",
		"items": [
			{
				"itemType": "computerProgram",
				"title": "Multiverse Designer",
				"creators": [
					{
						"lastName": "Toopan Games",
						"creatorType": "author"
					}
				],
				"date": "Coming soon",
				"abstractNote": "Multiverse Designer is a 3D narrative engine and virtual tabletop to power your tabletop RPG games and help you create amazing stories in unique settings. Gather your friends, create awe-inspiring 3D setpieces, control characters and NPCs and throw virtual dice to decide the fate of your players!",
				"company": "Toopan Games",
				"libraryCatalog": "store.steampowered.com",
				"system": "Windows",
				"url": "https://store.steampowered.com/app/1068500/Multiverse_Designer/",
				"attachments": [],
				"tags": [
					{
						"tag": "3D"
					},
					{
						"tag": "Board Game"
					},
					{
						"tag": "CRPG"
					},
					{
						"tag": "Character Customization"
					},
					{
						"tag": "Dark Fantasy"
					},
					{
						"tag": "Dragons"
					},
					{
						"tag": "Dungeon Crawler"
					},
					{
						"tag": "Fantasy"
					},
					{
						"tag": "Game Development"
					},
					{
						"tag": "Grid-Based Movement"
					},
					{
						"tag": "Level Editor"
					},
					{
						"tag": "Magic"
					},
					{
						"tag": "Multiplayer"
					},
					{
						"tag": "Mystery Dungeon"
					},
					{
						"tag": "RPG"
					},
					{
						"tag": "Simulation"
					},
					{
						"tag": "Tabletop"
					},
					{
						"tag": "Tactical RPG"
					},
					{
						"tag": "Third Person"
					},
					{
						"tag": "Utilities"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://store.steampowered.com/publisher/NewBlood",
		"detectedItemType": "multiple",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://store.steampowered.com/app/1229490/ULTRAKILL/",
		"detectedItemType": "computerProgram",
		"items": [
			{
				"itemType": "computerProgram",
				"title": "ULTRAKILL",
				"creators": [
					{
						"lastName": "Arsi \"Hakita\" Patala",
						"creatorType": "author"
					}
				],
				"date": "3 Sep, 2020",
				"abstractNote": "ULTRAKILL is a fast-paced ultraviolent retro FPS combining the skill-based style scoring from character action games with unadulterated carnage inspired by the best shooters of the '90s. Rip apart your foes with varied destructive weapons and shower in their blood to regain your health.",
				"company": "New Blood Interactive",
				"libraryCatalog": "store.steampowered.com",
				"system": "Windows",
				"url": "https://store.steampowered.com/app/1229490/ULTRAKILL/",
				"attachments": [],
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
	}
]
/** END TEST CASES **/
