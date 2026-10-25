"use strict";
// Sprites 8 bits des mobs (MOB_ART, MOB_ART2) et planches de pixels.

/* SPRITES 8 BITS DES NOUVEAUX MOBS (même format que BOSS_ART). */
const MOB_ART = {
  kamikaze: { px:3, w:15, h:15, pal:{A:0x0e0a1c, B:0x77151f, C:0x7f444f, D:0x91857f, E:0xb0202e, F:0xc1515b, G:0xd6c4bc, H:0xdfd0ca, I:0xff6e28, J:0xff783c, K:0xff8c3c, L:0xff9632, M:0xff963c, N:0xffec8c, O:0xfff4a0, P:0xffffff},
    frames:[
      [".......K.......",
       "...A..IO...A...",
       "..ACAAAAAAACA..",
       "..AFCFFFFFCBA..",
       ".ACEEEEEEEEECA.",
       ".AFEEEEEEEEEBA.",
       "ACEEEELLLEEEECA",
       ".AFELLLNLLLEBA.",
       ".JFELLNPNLLEBJ.",
       ".AFELLLNLLLEBA.",
       "..AFEELLLEEBA..",
       "...JFGGGGGBJ...",
       "....AFGGGBA....",
       ".....AHGDA.....",
       "......AHA......"],
      ["........O......",
       "...A...M...A...",
       "..ACAAAOAAACA..",
       "..AFCFFFFFCBA..",
       ".ACEEEEEEEEECA.",
       ".AFEEEEEEEEEBA.",
       "ACEEEELLLEEEECA",
       ".AFELLLNLLLEBA.",
       ".JFELLNPNLLEBJ.",
       ".AFELLLNLLLEBA.",
       "..AFEELLLEEBA..",
       "...JFGGGGGBJ...",
       "....AFGGGBA....",
       ".....AHGDA.....",
       "......AHA......"],
    ] },
  spider: { px:3, w:17, h:15, pal:{A:0x0e0a1c, B:0x241340, C:0x341c5c, D:0x3a2160, E:0x54308a, F:0x543680, G:0x584479, H:0x72559f, I:0x906dc4, J:0xbeff50, K:0xdc2c42, L:0xff4650, M:0xffffff},
    frames:[
      [".......AAA.......",
       ".....AAHHHAA.....",
       "..A.AHHEEEHHA.A..",
       ".AIAAHEEKEEDAAIA.",
       "AIAIHEEKKKEEHIAIA",
       "IA.AHEEEKEEEDA.AI",
       "A..AHEEEEEEEDA..A",
       ".AAAAHECCCEDAAAA.",
       "AIIIIECCCCCEIIIIA",
       "AIAAAGJCCCJBAAAIA",
       "IAAAIBCLCLCBIAAAI",
       "IIIIAAGCCCBAAIIIF",
       "AIAAAIAMBMAIAAAIA",
       "AIAAIA.AAA.AIAAIA",
       "AIAAIA.....AIAAIA"],
      [".......AAA.......",
       "..A..AAHHHAA..A..",
       ".AIAAHHEEEHHAAIA.",
       "AIAIAHEEKEEDAIAIA",
       "IAAIHEEKKKEEHFAAI",
       "A..AHEEEKEEEDA..A",
       ".AAAHEEEEEEEDAAA.",
       "AIIIAHECCCEDAIIIA",
       "AIAAIECCCCCEIAAIA",
       "IA..AGJCCCJBA..AI",
       "IA.AAGCLCLCBAA.AI",
       "AAAIIAGCCCBAIIAAA",
       "AIIAAIAMBMAIAAIIA",
       "AIA.AIAAAAAIA.AIA",
       "AIAAIA.....AIAAIA"],
    ] },
};

/* SPRITES 8 BITS: mob doré (Trésorin) et météorite des événements. */
const MOB_ART2 = {
  golden: { px:3, w:15, h:13, pal:{A:0x0e0a1c, B:0x694408, C:0x96620c, D:0xa5801c, E:0xb59154, F:0xecb828, G:0xf1cd68, H:0xfff4a0, I:0xffffff},
    frames:[
      [".....AAAAA.....",
       "..I.AGGGGGA....",
       "...AGFFFFFGAI..",
       "..AGFFFHFFFGA..",
       "AAGFFFFHFFFFGAA",
       "EGFFFFHHHFFFFGE",
       "ECFFHHHIHHHFFCB",
       "AEFFFFHHHFFFFBA",
       "AEDFFFFHFFFFDBA",
       ".AAGFFFHFFFDAA.",
       ".I.AGFFFFFDA...",
       "....AGDDDDA....",
       ".....AAAAA....."],
      [".....AAAAA..I..",
       "....AGGGGGA....",
       "...AGFFFFFGA...",
       "..AGFFFHFFFGA..",
       "AAGFFFFHFFFFGAA",
       "EGFFFFHHHFFFFGE",
       "ECFFHHHIHHHFFCB",
       "AEFFFFHHHFFFFBA",
       "AEDFFFFHFFFFDBA",
       ".AAGFFFHFFFDAA.",
       "...AGFFFFFDA.I.",
       "....AGDDDDA....",
       "...I.AAAAA....."],
    ] },
  meteor: { px:3, w:11, h:11, pal:{A:0x0e0a1c, B:0x4e301e, C:0x4f321f, D:0x613f27, E:0x7a4e30, F:0x96623c, G:0x9b7a63, H:0xb0896c, I:0xffa046},
    frames:[
      ["....AHHA...",
       "...AHFFHA..",
       "..AHFIFFHA.",
       ".AGFFFFFDA.",
       ".AIEFFFBCA.",
       "AGEEBFFEEGA",
       "AGEEEEEEECA",
       "AGEEEEBEECA",
       ".AGBEEEECA.",
       ".AGCEEECCA.",
       "..AAGCCAA.."],
    ] },
};

// construit une feuille horizontale (1 ou 2 images) à partir des lignes de pixels, avec les images numérotées 0,1...
function buildPixelSheet(scene, key, def){
  const px = def.px, w = def.w, h = def.h, n = def.frames.length;
  const c = mkCanvas(w*px*n, h*px), ctx = c.getContext('2d');
  def.frames.forEach((rows, f)=>{
    rows.forEach((row, y)=>{
      for (let x=0;x<w;x++){
        const ch = row[x];
        if (ch === '.' || def.pal[ch] === undefined) continue;
        ctx.fillStyle = '#' + def.pal[ch].toString(16).padStart(6,'0');
        ctx.fillRect(f*w*px + x*px, y*px, px, px);
      }
    });
  });
  const tex = scene.textures.addCanvas(key, c);
  def.frames.forEach((_, f)=> tex.add(f, 0, f*w*px, 0, w*px, h*px));
  return { fw:w*px, fh:h*px };
}
