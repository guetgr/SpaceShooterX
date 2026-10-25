"use strict";
// Bloque le zoom de la page, le menu contextuel, et réveille l'audio au premier toucher.

/* PAS DE ZOOM DE LA PAGE: iOS Safari ignore user-scalable=no, et dans une fenêtre intégrée c'est l'hôte qui décide. On bloque donc les gestes directement. */
['gesturestart','gesturechange','gestureend'].forEach(ev=> document.addEventListener(ev, e=> e.preventDefault(), { passive:false }));       // pincement iOS

document.addEventListener('touchmove', e=>{ if (e.touches && e.touches.length > 1) e.preventDefault(); }, { passive:false });                // pincement à 2 doigts

document.addEventListener('wheel', e=>{ if (e.ctrlKey) e.preventDefault(); }, { passive:false });                                           // pincement du pavé tactile / ctrl+molette

document.addEventListener('dblclick', e=> e.preventDefault());                                                                              // double toucher

document.addEventListener('contextmenu', e=>{ if (!(e.target && e.target.closest && e.target.closest('input, textarea'))) e.preventDefault(); });   // appui long (sauf dans les champs: il faut pouvoir coller le code de sauvegarde)

document.addEventListener('pointerdown', ()=>{ sfx.resume(); try{ music.setScene({ mode:'menu' }); music.start(); }catch(e){ /* ignore */ } }, { once:true });   // la musique du menu démarre au premier toucher
