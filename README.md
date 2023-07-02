# Zotero Translator for Steam games
This is a citation metadata grabber for Steam games using Zotero (a free and open source reference manager), which will scrape the necessary metadata required to reference/cite a given Steam game. 

The matter of referencing videogames in literature is neither trivial nor standardized  [(Gualeni et al. 2019)](#notes). Some (older) cases include videogame references in separate "*Ludography*" sections following different conventions than standard citations. Others include them in a bibliography following their own conventions (see for example game studies publications such as [Game Studies Journal](https://gamestudies.org/2301/submission_guidelines#GSCitation) and [DiGRA (2023)](http://www.digra.org/call-for-papers-digra-2023-international-conference/)). This tool supports the latter version, and should work for most applications. However, given that the abovementioned venues do not provide a precise citation style (as in a CSL file), one might need to adapt their game reference in their text document. 
Furthermore, depending on citation requirements additional fields might be required, which can be added manually in Zotero. For example: 
-  the precise version of the game played,
-  the platform that the game was played, or the platforms for which the game is available (depending on what is required). 

Issues: 
- It does not differentiate soundtracks or films as non-games, since these are not clearly marked as such. However, this is not a trivial problem given that (a) this is primarily aiming game citations, (b) soundtracks and films are not that many on Steam, and more importantly (c) Steam does not provide the appropriate metadata to cite such artifacts (i.e. composer, director, etc.). 
- At the moment this does not work for multiple entries, for example for pages or search results that include multiple games. The Steam website DOM is very consistent in providing the appropriate information on that, and more precisely game titles (which are only provided in an image `alt text`). 

Overview: 
- Install translator (instructions below). 
- Upon entering a website of a Steam game (URL pattern: `store.steampowered.com/app/....`), Zotero connector will detect the game as a 'software' and its icon will change as in the image below:
  > ![image](https://github.com/cmiltiadis/Steam-Zotero-translator/assets/12499359/a142c451-4557-482b-9786-34c01da0e7ba)
- Clicking that icon will automatically download the required metadata required to reference the game (title, developers, publisher, release date, platforms, URL, also description and user contributed keywords) -- see ![metadata](#metadata) and [sample references](#sample-references) below.  
  ![image](https://github.com/cmiltiadis/Steam-Zotero-translator/assets/12499359/397d0114-4a3a-4fd8-92eb-98d6434fc481)
  ![image](https://github.com/cmiltiadis/Steam-Zotero-translator/assets/12499359/8d03faab-5fce-4a8d-a5b6-b290fdac03ef)


# Installation 

Requirements: 
- [Zotero](https://www.zotero.org/) (cross platform). 
- [Zotero connector](https://www.zotero.org/download/connectors) (browser plugin for Firefox, Chrome, Safari, Edge). 

Install: 
- Place `Steam.js` inside the Zotero translators folder: 
  - In Zotero go to  Edit > Preferences > Advanced > Files and Folders, an and click Show Data Directory.
  - A file explorer will pop up. Open the folder `translators`. 
  - Paste the included Javascript file (`Steam.js`) inside the translators folder.
- Refresh Zotero translators:
  - On your browser, right click on the Zotero Connector, and select Manage Extension (or do the same from your browser's list of extensions). In the pop up tab select Extension options, and go to Advanced > Translators > Update Translators (in the same dialog you can remove this translator by selecting reset translators). 
  - If you refresh a Steam game page, the Zotero connector icon should now turn to the icon resembling code, and the translator should work. 

# Metadata 

| Metadata field | Status |
|-|-|
| itemType | "computerProgram" (software) | 
| title |  manually scraped (`div.details_block`)|
| tags (keywords) | manually scraped from user submitted tags (`div.glance_tags.popular_tags`)| 
| creators (programmer) | manually scraped (`div.details_block`) | 
| abstractNote | automatically scraped (description) | 
| version | N/A |
| date | automatically scraped (release date)|   
| system (platforms) |manually scraped (`div.sysreq_tab` if it exists, else "Windows") | 
| place | N/A|
| company (publisher) | manually scraped (`div.details_block`) | 
| programming language | N/A |
| ISBN | N/A |
| url |automatically scraped |
| libraryCatalog | automatically scraped: "store.steampowered.com" | 
| Website snapshot (HTML) |automatically generated | 
| accessDate |automatically generated |

# Sample references 

Sample references (using Chicago Manual of Style 17th ed.): 
- Arsi ‘Hakita’ Patala. ‘ULTRAKILL’. Windows. New Blood Interactive, 3 September 2020. https://store.steampowered.com/app/1229490/ULTRAKILL/.
- Crystal Dynamics, Eidos-Montréal, Feral Interactive (Mac), Feral Interactive (Linux), and Nixxes. ‘Rise of the Tomb Raider™’. Windows,macOS,SteamOS + Linux. Crystal Dynamics, Feral Interactive (Mac), Feral Interactive (Linux), 9 February 2016. https://store.steampowered.com/app/391220/Rise_of_the_Tomb_Raider/.
- FromSoftware Inc. ‘ELDEN RING’. Windows. FromSoftware Inc., Bandai Namco Entertainment, 25 February 2022. https://store.steampowered.com/app/1245620/ELDEN_RING/.
- id Software. ‘DOOM (1993)’. Windows. id Software, 30 April 1995. https://store.steampowered.com/app/2280/DOOM_1993/.
- ———. ‘DOOM Eternal’. Windows. Bethesda Softworks, 20 March 2020. https://store.steampowered.com/app/782330/DOOM_Eternal/.
- Valve, and Hidden Path Entertainment. ‘Counter-Strike: Global Offensive’. Windows,macOS,SteamOS + Linux. Valve, 21 August 2012. https://store.steampowered.com/app/730/CounterStrike_Global_Offensive/.

# Notes 
- Gualeni, Stefano, Riccardo Fassone, and Jonas Linderoth. ‘How to Reference a Digital Game’. In Proceedings of DiGRA 2019: Game, Play and the Emerging Ludo-Mix, 17. Kyoto: DiGRA, 2019. http://www.digra.org/digital-library/publications/how-to-reference-a-digital-game/.



