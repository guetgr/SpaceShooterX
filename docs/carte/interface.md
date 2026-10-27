<!-- Généré par tools/gen_codemap.py : ne pas modifier à la main (relancer le script). -->

# Interface : HTML, CSS, assets

## Ids du HTML (`index.html`) → qui les utilise

Un id sans utilisation = texte/structure purement visuel ou reste d'un ancien écran (à vérifier).

| Id | JS | CSS |
|---|---|---|
| `stage` | `main.js` | `css/style.css`, `css/agp.css` |
| `game-container` | `home/ui.js`, `main.js`, `ui/motion.js`, `ui/norma.js` | `css/style.css`, `css/agp.css` |
| `hud` | — | `css/style.css` |
| `hud-top` | `ui/motion.js` | `css/style.css` |
| `hpTrack` | `player/damage.js`, `ui/motion.js` | — |
| `hpTxt` | `ui/hud.js` | — |
| `hpGhost` | `ui/motion.js` | — |
| `hpFill` | `ui/hud.js` | — |
| `shieldTrack` | `player/damage.js`, `ui/hud.js` | — |
| `shieldFill` | `ui/hud.js` | — |
| `lvlBadge` | `ui/hud.js` | — |
| `xpTrack` | `ui/hud.js` | — |
| `xpFill` | `ui/hud.js` | — |
| `scoreVal` | `ui/hud.js` | — |
| `pauseBtn` | `ui/dom.js`, `ui/motion.js` | — |
| `waveNote` | `ui/hud.js`, `ui/motion.js` | — |
| `waveFill` | `ui/hud.js` | — |
| `waveIco` | — | — |
| `waveTxt` | `ui/hud.js` | — |
| `relicRow` | `systems/relics-fusions.js` | `css/style.css`, `css/agp.css` |
| `boss-hp-wrap2` | `game/level.js`, `scenes/GameScene.js` | `css/style.css`, `css/agp.css` |
| `bossLabel2` | — | — |
| `bossHpFill2` | — | — |
| `bossShTrack2` | — | — |
| `bossShFill2` | — | — |
| `boss-hp-wrap3` | `game/level.js`, `scenes/GameScene.js` | `css/style.css` |
| `bossLabel3` | — | — |
| `bossHpFill3` | — | — |
| `bossShTrack3` | — | — |
| `bossShFill3` | — | — |
| `boss-hp-wrap` | `bosses/core.js`, `game/level.js`, `game/tuto.js`, `scenes/GameScene.js` | `css/style.css`, `css/agp.css` |
| `bossLabel` | `bosses/core.js`, `game/tuto.js` | — |
| `bossHpFill` | `bosses/core.js`, `game/tuto.js` | — |
| `bossShTrack` | `bosses/core.js` | — |
| `bossShFill` | `bosses/core.js` | — |
| `boss-banner` | `bosses/core.js`, `game/tuto.js`, `scenes/GameScene.js` | `css/style.css`, `css/agp.css` |
| `home` | `dev/editor-hook.js`, `home/ui.js`, `scenes/GameScene.js`, `scenes/HomeScene.js`, `ui/dom.js`, `ui/motion.js`, `ui/tree-ui.js` | `css/style.css` |
| `homeTop` | — | `css/style.css`, `css/agp.css` |
| `homeFrag` | `home/ui.js` | — |
| `homeSettings` | `home/ui.js` | — |
| `homeTicker` | `home/ui.js` | `css/agp.css` |
| `homeTrack` | `home/ui.js` | `css/style.css` |
| `pageHangar` | `home/garage.js` | — |
| `pageMap` | `home/galaxy.js` | `css/style.css` |
| `btnGalaxy` | `home/ui.js` | — |
| `mwNum` | `home/ui.js` | — |
| `mwName` | `home/ui.js` | `css/style.css` |
| `mwProg` | `home/ui.js` | — |
| `levelCard` | `home/ui.js` | — |
| `btnLaunch` | `home/ui.js`, `ui/motion.js` | `css/style.css`, `css/agp.css` |
| `mapOrbit` | `home/ui.js` | `css/style.css` |
| `btnBackWorld` | `home/ui.js` | `css/style.css`, `css/agp.css` |
| `pageTree` | `ui/tree-ui.js` | `css/style.css`, `css/agp.css` |
| `treeTabs` | `home/ui.js`, `ui/tree-ui.js` | — |
| `treeBName` | `ui/tree-ui.js` | `css/style.css`, `css/agp.css` |
| `treeBSub` | `ui/tree-ui.js` | — |
| `treeBProg` | `ui/tree-ui.js` | `css/style.css`, `css/agp.css` |
| `treeBBar` | `ui/tree-ui.js` | — |
| `treeScroll` | `ui/tree-ui.js` | — |
| `treeInfo` | — | — |
| `treeInfoIcon` | `ui/tree-ui.js` | — |
| `treeInfoName` | `ui/tree-ui.js` | — |
| `treeInfoDesc` | `ui/tree-ui.js` | — |
| `treeInfoMeta` | `ui/tree-ui.js` | — |
| `treeInvestBtn` | `ui/tree-ui.js` | — |
| `homeTabs` | `ui/motion.js` | `css/style.css`, `css/agp.css` |
| `tabHangar` | `home/ui.js` | — |
| `tabMap` | `home/ui.js` | — |
| `tabTree` | `home/ui.js` | — |
| `homeToast` | `home/galaxy.js` | `css/style.css`, `css/agp.css` |
| `btnDevHome` | `home/ui.js` | `css/style.css` |
| `start` | `game/run.js`, `home/ui.js`, `ui/dom.js`, `ui/norma.js` | — |
| `hiScoreStart` | `ui/dom.js` | — |
| `fragStart` | `ui/dom.js` | — |
| `ascRow` | — | — |
| `btnContinue` | `ui/dom.js` | — |
| `btnStart` | `ui/dom.js` | — |
| `btnSandbox` | `ui/dom.js` | — |
| `devLevelRow` | `ui/dom.js` | — |
| `devLevel` | `ui/dom.js` | — |
| `btnDevLevel` | `ui/dom.js` | — |
| `btnDevClose` | `home/ui.js` | — |
| `btnTuto` | `ui/dom.js` | — |
| `btnSkills` | `ui/dom.js` | — |
| `btnOptionsMain` | `home/ui.js`, `ui/dom.js` | — |
| `btnInfo` | `ui/dom.js` | — |
| `infoMenu` | `ui/dom.js` | — |
| `btnOpenStats` | `ui/dom.js` | — |
| `btnOpenBestiary` | `ui/dom.js` | — |
| `btnOpenAchv` | `ui/dom.js` | — |
| `btnOpenCodex` | `ui/dom.js` | — |
| `btnOpenPacts` | `ui/dom.js` | — |
| `btnOpenLeaderboard` | `ui/dom.js` | — |
| `btnInfoBack` | `ui/dom.js` | — |
| `statsPage` | `ui/dom.js` | — |
| `btnStatsBack` | `ui/dom.js` | — |
| `statsName` | `ui/dom.js` | — |
| `statsList` | `ui/pages.js` | — |
| `bestiaryPage` | `ui/dom.js` | — |
| `btnBestiaryBack` | `ui/dom.js` | — |
| `bestiaryGrid` | `ui/pages.js` | — |
| `pactsPage` | `ui/dom.js` | `css/style.css` |
| `btnPactsBack` | `ui/dom.js` | — |
| `pactsSummary` | `ui/pages.js` | — |
| `pactsList` | `ui/pages.js` | — |
| `codexPage` | `ui/dom.js` | `css/style.css` |
| `btnCodexBack` | `ui/dom.js` | — |
| `codexSummary` | `ui/pages.js` | — |
| `codexList` | `ui/pages.js` | — |
| `achvPage` | `ui/dom.js` | — |
| `btnAchvBack` | `ui/dom.js` | — |
| `achvSummary` | `ui/pages.js` | — |
| `achvList` | `ui/pages.js` | — |
| `gameNotice` | `systems/achievements.js` | `css/style.css`, `css/agp.css` |
| `gnName` | `systems/achievements.js` | — |
| `gnDesc` | `systems/achievements.js` | — |
| `achvToast` | `systems/achievements.js` | `css/style.css` |
| `atName` | `systems/achievements.js` | — |
| `atDesc` | `systems/achievements.js` | — |
| `leaderboardPage` | `ui/dom.js` | — |
| `btnLeaderboardBack` | `ui/dom.js` | — |
| `lbList` | `ui/pages.js` | — |
| `pauseMenu` | `scenes/GameScene.js`, `ui/dom.js` | `css/style.css`, `css/agp.css` |
| `pauseSub` | `ui/dom.js` | — |
| `btnResume` | `ui/dom.js` | `css/style.css` |
| `btnSettings` | `ui/dom.js` | — |
| `btnPauseStats` | `ui/dom.js` | — |
| `btnPauseInfo` | `ui/dom.js` | — |
| `pauseGear` | `ui/dom.js`, `ui/pages.js` | `css/style.css`, `css/agp.css` |
| `btnGearToggle` | `ui/dom.js` | — |
| `pgCount` | `ui/pages.js` | — |
| `pgTabG` | `ui/dom.js`, `ui/pages.js` | `css/agp.css` |
| `pgNG` | `ui/pages.js` | — |
| `pgTabM` | `ui/dom.js`, `ui/pages.js` | `css/agp.css` |
| `pgNM` | `ui/pages.js` | — |
| `pgTitle` | `ui/pages.js` | — |
| `pgPage` | `ui/pages.js` | — |
| `pgGrid` | `ui/pages.js` | `css/style.css`, `css/agp.css` |
| `pgDetail` | `ui/pages.js` | `css/style.css`, `css/agp.css` |
| `pgPrev` | `ui/dom.js` | — |
| `pgNext` | `ui/dom.js` | — |
| `btnQuit` | `ui/dom.js` | — |
| `quitConfirm` | `ui/dom.js` | — |
| `quitMsg` | `ui/dom.js` | — |
| `btnQuitNo` | `ui/dom.js` | — |
| `btnQuitYes` | `ui/dom.js` | — |
| `settingsMenu` | `scenes/GameScene.js`, `ui/dom.js` | `css/style.css`, `css/agp.css` |
| `btnSettingsBack` | `ui/dom.js` | — |
| `volMaster` | `ui/dom.js` | — |
| `volMasterV` | — | — |
| `btnMusicToggle` | `ui/dom.js` | — |
| `volMusic` | `ui/dom.js` | — |
| `volMusicV` | — | — |
| `btnSfxToggle` | `ui/dom.js` | — |
| `volSfx` | `ui/dom.js` | — |
| `volSfxV` | — | — |
| `setName` | `ui/dom.js` | — |
| `cloudStatus` | `ui/dom.js` | — |
| `btnExport` | `ui/dom.js` | — |
| `btnImport` | `ui/dom.js` | — |
| `saveBox` | `ui/dom.js` | `css/style.css` |
| `btnImportOk` | `ui/dom.js` | `css/style.css` |
| `btnResetProgress` | `ui/dom.js` | — |
| `btnTutoDev` | `ui/dom.js` | — |
| `levelup` | `player/progression.js`, `scenes/GameScene.js`, `systems/relics-fusions.js`, `ui/dom.js` | `css/style.css`, `css/agp.css` |
| `luPause` | `ui/dom.js` | — |
| `cardsWrap` | `player/progression.js`, `systems/relics-fusions.js` | `css/style.css`, `css/agp.css` |
| `luNorma` | `player/progression.js` | — |
| `rerollBtn` | `player/progression.js`, `systems/relics-fusions.js`, `ui/dom.js` | — |
| `comboTxt` | `systems/combo.js` | `css/style.css` |
| `styleHud` | `ui/hud.js` | `css/style.css`, `css/agp.css` |
| `styleRank` | `ui/hud.js` | `css/style.css` |
| `styleInfo` | — | `css/style.css` |
| `styleName` | `ui/hud.js` | `css/style.css` |
| `styleCount` | `ui/hud.js` | `css/style.css` |
| `styleXp` | `ui/hud.js` | `css/style.css` |
| `styleFill` | `ui/hud.js` | — |
| `odBtn` | `scenes/GameScene.js`, `systems/overdrive.js`, `ui/dom.js` | `css/style.css`, `css/agp.css` |
| `redVig` | `game/run.js`, `systems/skills.js` | `css/style.css` |
| `gameover` | `game/run.js`, `game/tuto.js`, `scenes/GameScene.js`, `ui/dom.js`, `ui/motion.js` | `css/style.css`, `css/agp.css` |
| `rpNo` | `game/run.js` | — |
| `goLevel` | `game/run.js` | — |
| `goProg` | `game/run.js`, `ui/motion.js` | — |
| `goProgFill` | `game/run.js`, `ui/motion.js` | — |
| `goProgTxt` | `game/run.js`, `ui/motion.js` | — |
| `finalKills` | `game/run.js`, `ui/motion.js` | — |
| `finalScore` | `game/run.js`, `ui/motion.js` | — |
| `finalLvl` | `game/run.js` | — |
| `finalTime` | `game/run.js` | — |
| `goRewards` | `game/run.js` | — |
| `rpGrade` | `game/run.js` | — |
| `rpMention` | `game/run.js` | — |
| `goExtra` | `game/run.js`, `ui/motion.js` | — |
| `rpNorma` | `game/run.js`, `ui/motion.js` | — |
| `newBest` | `game/run.js`, `ui/motion.js` | — |
| `btnNext` | `game/run.js`, `ui/dom.js`, `ui/motion.js` | — |
| `btnRetry` | `game/run.js`, `ui/dom.js`, `ui/motion.js` | — |
| `btnGoMenu` | `ui/dom.js`, `ui/motion.js` | — |

## CSS : sélecteurs définis plusieurs fois dans un même fichier

Souvent des couches successives volontaires (« INTERFACE ALLÉGÉE » écrase les règles du haut), mais source de confusion.

### `css/style.css` : 473 sélecteurs, 36 définis plusieurs fois

- `:root` : 2 fois
- `#hud` : 2 fois
- `.mute-btn` : 2 fois
- `.pact-row.on` : 2 fois
- `.ach-row.done` : 2 fois
- `#relicRow` : 2 fois
- `#odBtn.ready` : 2 fois
- `#styleHud` : 2 fois
- `#styleRank` : 2 fois
- `#styleName` : 2 fois
- `#styleCount` : 2 fois
- `.hp-bar-track` : 2 fois
- `.hp-bar-fill` : 2 fois
- `.score-val` : 3 fois
- `.shield-bar-track` : 2 fois
- `.lvl-badge` : 2 fois
- `.xp-track` : 2 fois
- `.wave-note` : 2 fois
- `.overlay` : 2 fois
- `.title-logo` : 2 fois
- `.btn` : 2 fois
- `.btn.secondary` : 2 fois
- `#pauseGear` : 3 fois
- `.card` : 2 fois
- `.card:hover` : 2 fois
- `.card-icon` : 2 fois
- `#gameover .go-title` : 2 fois
- `#boss-hp-wrap` : 2 fois
- `#boss-hp-wrap2` : 2 fois
- `#boss-hp-wrap3` : 2 fois
- `.boss-hp-label` : 3 fois
- `.boss-hp-track` : 3 fois
- `.boss-sh-track` : 2 fois
- `#pauseMenu, #settingsMenu` : 2 fois
- `#pageTree` : 2 fois
- `.acc-head` : 2 fois

### `css/agp.css` : 276 sélecteurs, 2 définis plusieurs fois

- `#stage` : 2 fois
- `.lu-sub` : 2 fois

### Sélecteurs de `style.css` redéfinis par `agp.css` (128)

`agp.css` est chargé après : sa version gagne. Pour comprendre un style, lire les deux.

`#boss-banner`, `#btnBackWorld`, `#btnLaunch`, `#game-container`, `#gameNotice .gn-desc`, `#gameNotice .gn-name`, `#gameover`, `#gameover .go-title`, `#gameover.win .go-title`, `#homeTabs`, `#homeToast`, `#homeTop`, `#levelup .lu-title`, `#odBtn`, `#pageTree`, `#pauseGear .pg-head`, `#pauseMenu, #settingsMenu`, `#pgGrid .pg-it.sel`, `#relicRow`, `#stage`, `#styleHud`, `#treeBName`, `#treeBProg`, `#tutoEnd .go-title`, `#tutoEnd .te-big`, `#tutoEnd .te-new`, `#tutoEnd.win .go-title`, `#tutoPct .tp-fill`, `.boss-hp-label`, `.boss-hp-track`, `.btn.secondary`, `.btn.secondary:hover`, `.btn:not(.secondary):not(.small)`, `.card`, `.card-desc`, `.card-name`, `.card.fusion`, `.card:hover`, `.go-extra`, `.go-extra .go-boss`, `.go-extra .go-near`, `.go-prog`, `.go-prog-bar`, `.go-prog-bar > i`, `.go-rewards`, `.go-rw`, `.go-rw b`, `.go-rw.total`, `.go-rw.total b`, `.go-stats`, `.go-unlock`, `.gx-hint`, `.gx-title`, `.hangar-body`, `.hangar-body .stat-row`, `.hangar-gap`, `.hangar-seg button`, `.hangar-seg button.on`, `.hangar-tier`, `.home-frag`, `.home-ico`, `.home-page`, `.home-tab`, `.home-tab.buy::after`, `.home-tab.on`, `.home-tab.on::before`, `.home-tab::before`, `.hp-bar-fill`, `.hp-bar-ghost`, `.hp-bar-track`, `.hp-label, .score-label`, `.hp-title`, `.lc-comp i`, `.lc-comp i u`, `.lc-line`, `.lc-name`, `.level-card`, `.lu-title`, `.lvl-badge`, `.map-arrow`, `.mod`, `.mod-detail em`, `.mod.sel`, `.mute-btn`, `.mw-n`, `.mw-name`, `.mw-prog`, `.new-best`, `.node`, `.node-pct`, `.node-pct.full`, `.node.boss`, `.node.done`, `.node.open`, `.node.sel`, `.overlay`, `.overlay::after`, `.scanlines`, `.score-label`, `.score-val`, `.sheet`, `.sheet-overlay`, `.sheet::before`, `.shield-bar-fill`, `.shield-bar-track`, `.skin`, `.skin i`, `.skin.sel`, `.skin.sel i`, `.tc-cost`, `.tc-cost b`, `.tc-nm`, `.tcard`, `.tcard.aff::before`, `.tree-bhead`, `.tree-info`, `.tree-info-meta`, `.tree-info-name`, `.tree-invest-btn`, `.tree-invest-btn:disabled`, `.tree-tabs`, `.tt-dot`, `.ttab`, `.ttier`, `.wave-note`, `.xp-fill`, `.xp-track`, `:root`

### Classes / ids CSS que ni le HTML ni le JS ne mentionnent (26 candidats)

Peut aussi être une classe construite par concaténation de texte : vérifier avant de supprimer.

`hangar-body` (style.css), `hangar-custom-note` (agp.css), `hangar-gap` (style.css), `hangar-label` (agp.css), `hangar-part` (agp.css), `hangar-part-option` (agp.css), `hangar-part-options` (agp.css), `hangar-part-title` (agp.css), `hangar-stage` (agp.css), `hangar-tier` (style.css), `hp-label` (style.css), `hp-title` (style.css), `lvl-badge` (style.css), `mod-detail` (style.css), `mod-empty` (style.css), `mod-grid` (style.css), `mod-head` (agp.css), `n1` (style.css), `n2` (style.css), `n3` (style.css), `nm-av` (agp.css), `nm-eye` (agp.css), `nm-mouth` (agp.css), `p-1` (style.css), `p1` (style.css), `skin-row` (style.css)

### @keyframes jamais utilisés (0)

—

## Assets (`assets/manifest.json`)

`audio/music/` : 23, `audio/sfx/` : 66, `fonts/` : 3, `hud/` : 1, `sprites/` : 165

### ⚠ `asset(...)` qui visent un fichier absent du manifeste (0)

—

### Assets dont le nom n'apparaît nulle part dans le code (18 candidats)

Les sons enregistrés sont référencés par leur nom dans `audio/sfx-files.js`, les sprites par `asset('…')` ou par des clés de texture : vérifier avant de supprimer.

`hud/segments.svg`, `sprites/ui_arrow_l.png`, `sprites/ui_arrow_r.png`, `sprites/ui_check.png`, `sprites/ui_clock.png`, `sprites/ui_frag.png`, `sprites/ui_galaxy.png`, `sprites/ui_gear.png`, `sprites/ui_hand.png`, `sprites/ui_lock.png`, `sprites/ui_next.png`, `sprites/ui_pause.png`, `sprites/ui_pip_off.png`, `sprites/ui_pip_on.png`, `sprites/ui_skull.png`, `sprites/ui_star.png`, `sprites/ui_target.png`, `sprites/ui_trophy.png`
