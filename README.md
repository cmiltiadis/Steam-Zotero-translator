# Zotero Translator for Steam games
This is a citation metadata scraper for Steam games, for [Zotero](https://www.zotero.org/) (a free and open-source reference manager). It will scrape the necessary metadata required to reference/cite a given Steam game, from: 
1. Steam pages of single games,
2. Search results,
3. Steam pages of developers or publishers.

This is a documentation page for testing before submission to the Zotero Translator repository. 

Issues: 
- It does not differentiate soundtracks or films as non-games, since these are not clearly marked as non-games. However, this is a trivial problem given that (a) this is primarily aiming videogame citations, (b) soundtracks and films are not that many on Steam, and more importantly (c) Steam does not even provide the appropriate metadata to cite such artifacts (i.e. composer, director, etc.).
- Hardware items (e.g. Valve Index), which feature the same URL pattern as videogame pages (`https://store.steampowered.com/app/....`) will be detected as valid items, but the Translator will escape before saving them (as they don't have Developer/Publisher fields). 
- Release dates such as 'coming soon' will be saved as such.

# Citing videogames 

The matter of referencing videogames in literature is neither trivial nor standardized [(Gualeni et al. 2019)](#notes). Some (older) cases include videogame references in separate "*Ludography*" sections following different conventions than standard citations. Others include them in a standard bibliography/reference section following distinct conventions (see for example game studies publications such as [Game Studies Journal](https://gamestudies.org/2301/submission_guidelines#GSCitation) and [DiGRA (2023)](http://www.digra.org/call-for-papers-digra-2023-international-conference/)). This tool supports the latter case and should work for most applications. However, given that the abovementioned venues do not provide a precise citation style (as in a [CSL file](https://github.com/citation-style-language/styles)), one might need to adapt their game references in their text document. 
Furthermore, depending on citation requirements additional fields might be required, which can be added manually in Zotero. For example: 
-  the precise version of the game played,
-  the platform that the game was played, or the platforms for which the game is available (depending on what is required). 

# In use 
- Install translator ([instructions below](#installation)). 
- Upon entering a website of a Steam game (URL pattern: `store.steampowered.com/app/....`), the Zotero connector will detect the game as 'software' and its icon will change to one resembling code. Clicking that icon will automatically download the required metadata required to reference the game (title, developers, publisher, release date, platforms, URL, also description and user-contributed keywords) -- see [metadata](#metadata) and [sample references](#sample-references) below.  
  ![image](https://github.com/cmiltiadis/Steam-Zotero-translator/assets/12499359/88b692ea-d37e-4bb5-9686-e6784cd97218)
  ![image](https://github.com/cmiltiadis/Steam-Zotero-translator/assets/12499359/397d0114-4a3a-4fd8-92eb-98d6434fc481)
  ![image](https://github.com/cmiltiadis/Steam-Zotero-translator/assets/12499359/8d03faab-5fce-4a8d-a5b6-b290fdac03ef)
- Below is a case of search results for the term `ultrakill` (note that the second entry (Ultrakill demo) is omitted since it leads to the same URL as the first). 
  ![image](https://github.com/cmiltiadis/Steam-Zotero-translator/assets/12499359/63dd01f1-c481-49b8-8cc5-36171386bda3)
- Below is a case of a Steam page of a Publisher. The same applies for pages of Developers. 
  ![image](https://github.com/cmiltiadis/Steam-Zotero-translator/assets/12499359/d581aff0-54e9-416e-9958-00f6a56fe89d)


# Metadata 

| Metadata field | Status |
|-|-|
| itemType | "computerProgram" (software) | 
| title |  manually scraped (`#appHubAppName`)|
| date (release date) | manually scraped (`div.date`) |   
| creators (developers) | manually scraped (`.glance_ctn_responsive_left > .dev_row [0]`) | 
| company (publishers) | manually scraped (`.glance_ctn_responsive_left > .dev_row [1]`) | 
| abstractNote (description) | automatically scraped |
| tags | manually scraped from user-submitted tags (`a.app_tag`)| 
| system (platforms) | manually scraped (`div.sysreq_tab` if it exists, else "Windows") | 
| version | N/A |
| place | N/A|
| programming language | N/A |
| ISBN | N/A |
| url |automatically scraped |
| libraryCatalog | automatically scraped: "store.steampowered.com" | 
| Website snapshot (HTML) | omitted (`item.attachments=[];`)| 
| accessDate |automatically generated |

# Installation 

Requirements: 
- [Zotero](https://www.zotero.org/) (free, open-source, cross platform). 
- [Zotero connector](https://www.zotero.org/download/connectors) (browser plugin for Firefox, Chrome, Safari, Edge). 

Install: 
- Place `Steam.js` inside the Zotero translators folder: 
  - In Zotero go to  Edit > Preferences > Advanced > Files and Folders, and click Show Data Directory.
  - A file explorer will pop up. Open the folder `translators`, and paste the included Javascript file (`Steam.js`) inside.
- Refresh Zotero translators:
  - On your browser, right-click on the Zotero Connector icon, and select Options, or Manage Extension/Options. In the pop-up tab go to Advanced > Translators > Update Translators (in the same dialog you can remove this translator by selecting reset translators). 
- The translator should now work!
  - If you visit a Steam game page, the Zotero connector icon should now resemble code.
  - If you search Steam, or visit a Developer's or a Publisher's page, the icon will turn into a folder, indicating that there are multiple games available to scrape from such websites. If you click on the icon, a new 

# Sample references 

The references below make use of the citation style  *Chicago Manual of Style 17th Ed. (not)*, and include cases such as multiple platforms, multiple developers, and multiple publishers. 

- Arsi ‘Hakita’ Patala. ‘ULTRAKILL’. Windows. New Blood Interactive, 3 September 2020. https://store.steampowered.com/app/1229490/ULTRAKILL/.
- Crystal Dynamics, Eidos-Montréal, Feral Interactive (Mac), Feral Interactive (Linux), and Nixxes +. ‘Rise of the Tomb Raider™’. Windows,macOS,SteamOS + Linux. Crystal Dynamics, Feral Interactive (Mac), Feral Interactive (Linux) +, 9 February 2016. https://store.steampowered.com/app/391220/Rise_of_the_Tomb_Raider/.
- FromSoftware Inc. ‘ELDEN RING’. Windows. FromSoftware Inc., Bandai Namco Entertainment +, 25 February 2022. https://store.steampowered.com/app/1245620/ELDEN_RING/.
- id Software. ‘DOOM (1993)’. Windows. id Software, 30 April 1995. https://store.steampowered.com/app/2280/DOOM_1993/.
———. ‘DOOM Eternal’. Windows. Bethesda Softworks, 20 March 2020. https://store.steampowered.com/app/782330/DOOM_Eternal/.
- Valve, and Hidden Path Entertainment. ‘Counter-Strike: Global Offensive’. Windows,macOS,SteamOS + Linux. Valve, 21 August 2012. https://store.steampowered.com/app/730/CounterStrike_Global_Offensive/.

# Notes 
- Gualeni, Stefano, Riccardo Fassone, and Jonas Linderoth. ‘How to Reference a Digital Game’. In Proceedings of DiGRA 2019: Game, Play and the Emerging Ludo-Mix, 17. Kyoto: DiGRA, 2019. http://www.digra.org/digital-library/publications/how-to-reference-a-digital-game/.



