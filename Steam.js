{
	"translatorID": "2d950ca4-583a-46e0-9e96-734914a94ccd",
	"label": "Steam",
	"creator": "Constantinos Miltiadis <3",
	"target": "https://store.steampowered.com/",
	"minVersion": "5.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2023-07-04 12:26:09"
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
Documentation at: https://github.com/cmiltiadis/Steam-Zotero-translator
- Translator does not provision for 'http' only for 'https' -- Since Steam is a web shop it's assumed it will always comply by secure 'https'
- For URLs that concern hardware (e.g. Valve Index), not games, the scrape function escapes before saving. 
- Soundtracks and films, will be saved as games ('computerProgram'). 
  There is no easy way to distinguish them. Bare in mind however,
  that the metadata fields created (besides the type) are not correct/adequate for citing such works.
*/

/*
Tests:
- Single games
https://store.steampowered.com/app/1229490/ULTRAKILL/
- multi-platform: 
https://store.steampowered.com/app/730/CounterStrike_Global_Offensive/
- release date "coming soon" (will be saved as 'coming soon'): 
https://store.steampowered.com/app/1068500/Multiverse_Designer/
- Publisher
https://store.steampowered.com/publisher/NewBlood
- Developer (with hardware items)
https://store.steampowered.com/developer/valve
- Search: 
https://store.steampowered.com/search/?term=ultrakill
https://store.steampowered.com/search/?term=rpg
- Troubleshooting 
- works in Zotero, not in Scaffold
https://store.steampowered.com/app/1245620/ELDEN_RING/
- multi-publisher / works in Zotero fails in Scaffold
https://store.steampowered.com/app/391220/Rise_of_the_Tomb_Raider/

*/

/*
Coding refs: 
- Zotero Translator overview: https://www.zotero.org/support/dev/translators
- Zotero coding reference: https://www.zotero.org/support/dev/translators/coding
- ZoteroUtilities: https://github.com/zotero/utilities/blob/master/utilities.js
- Citoid tutorial: https://www.mediawiki.org/wiki/Citoid/Creating_Zotero_translators#Write_test_cases
- Zotero translator wiki: https://github.com/zotero/translator
*/

//check url patterns with multiple entries
//search 
function isSearch(url){
	return url.includes('/search/'); 
}
//developer or publisher page
function isDevPub(url){
	return (url.includes('/developer/') || url.includes('/publisher/') ); 
}
//search, dev, or publisher page 
function isMultiple(url){
	return (isSearch(url) || isDevPub(url)) ;  
}

function detectWeb(doc, url) {
	if (url.includes('/app/')) {// games include '/app/' in their url
		return 'computerProgram';
	}
	if (isMultiple(url)){
		if (getSearchResults(doc, true)){
			return 'multiple'; 
		}
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;

	if (isSearch(doc.URL)){ // for search results
		var rows = doc.querySelectorAll('.search_result_row[href*="/app/"]'); 
		for (let row of rows){
			let href =row.href; 
			if (href in items) continue; //omit duplicates
			let title = row.querySelector('span.title'); 
			title = title.textContent; 
			if (!title || !href) continue; 
			if (checkOnly) return true; 
			found  =true; 
			items [href]= title; 
		}

	}else if (isDevPub(doc.URL)){  // for publisher/ developer page 
		var rows = doc.querySelectorAll('.recommendation'); 
		for (let row of rows){
			let href = row.querySelector('a[href*="/app/"]'); 
			href=href.href; 

			if (href in items) continue; //omit duplicates/demos
			let title =row.querySelector('.color_created'); 
			title =ZU.trimInternal(title.textContent);//cleanup 

			if (!title || !href) continue; 
			if (checkOnly) return true; 
			found=true; 
			items[href]=title; 
		}
	}
	return found ? items : false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), (items) => {
			if (!items) {
				return true;
			}
			const articles = [];
			for (const i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
			return true;
		});
	}
	else {
		scrape(doc, url);
	}
}

function scrape(doc, url){
	//Title
	var title =doc.querySelector('#appHubAppName').textContent; 
	//Release date
	var date = text(doc,'div.date'); 
	//game description for abstract 
	let description = text (doc, 'div.game_description_snippet') ; 
	//Developers (creators) 
	var devs = doc.querySelectorAll('#developers_list > a'); 
	if (devs.length==0){
		Zotero.debug("Item is not game (maybe hardware?)"); 
		return; 
	}
	var cleanDevs=[]; 
	for (dev of devs){
		cleanDevs.push(ZU.cleanAuthor(dev.textContent, 'programmer',true ));
	}
	//Publishers (comma separated) 
	var pubs = doc.querySelectorAll('.glance_ctn_responsive_left > .dev_row')[1]; 
	pubs =pubs.querySelectorAll('a'); 
	var cleanPubs=[]; 
	for (let pub of pubs){
		cleanPubs.push(pub.textContent); 
	}
	cleanPubs= cleanPubs.join(', '); 
    //Tags (user tags)
	let tags= doc.querySelectorAll('a.app_tag'); 
	var cleanTags=[];  
	for (let tag of tags){
		tag = ZU.trimInternal(tag.text);
		cleanTags.push(tag); 
	}
	
	//Platforms (get platform tabs if they are there, else 'Windows')
	var platforms= doc.querySelectorAll('div.sysreq_tab'); 
	var cleanPlatforms = []; 
	if (platforms.length==0){ cleanPlatforms="Windows";}
	else { 	
		for (let platform of platforms){
			cleanPlatforms.push(ZU.trimInternal(platform.textContent)); 
		}
		cleanPlatforms=cleanPlatforms.join(', '); 
	}
	//create & assemble object 
	var item = new Z.Item("computerProgram"); 
	item.title=title; 
	item.tags=cleanTags; 
	item.creators= cleanDevs; 
	item.date=date; 
	item.abstractNote=description; 
	item.company=cleanPubs; 
	item.system= cleanPlatforms; 
	item.url= url; 
	item.libraryCatalog="store.steampowered.com"; 
	item.complete(); 
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
				"title": "ULTRAKILL",
				"creators": [
					{
						"lastName": "Arsi \"Hakita\" Patala",
						"creatorType": "programmer"
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
						"creatorType": "programmer"
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
		"url": "https://store.steampowered.com/app/730/CounterStrike_Global_Offensive/",
		"detectedItemType": "computerProgram",
		"items": [
			{
				"itemType": "computerProgram",
				"title": "Counter-Strike: Global Offensive",
				"creators": [
					{
						"lastName": "Valve",
						"creatorType": "programmer"
					},
					{
						"lastName": "Hidden Path Entertainment",
						"creatorType": "programmer"
					}
				],
				"date": "21 Aug, 2012",
				"abstractNote": "Counter-Strike: Global Offensive (CS: GO) expands upon the team-based action gameplay that it pioneered when it was launched 19 years ago. CS: GO features new maps, characters, weapons, and game modes, and delivers updated versions of the classic CS content (de_dust2, etc.).",
				"company": "Valve",
				"libraryCatalog": "store.steampowered.com",
				"shortTitle": "Counter-Strike",
				"system": "Windows, macOS, SteamOS + Linux",
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
		"url": "https://store.steampowered.com/publisher/NewBlood",
		"detectedItemType": "multiple",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://store.steampowered.com/developer/valve",
		"detectedItemType": "multiple",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://store.steampowered.com/search/?term=rpg",
		"detectedItemType": "multiple",
		"items": "multiple"
	}
]
/** END TEST CASES **/
