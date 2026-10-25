"use strict";
// Ajoute des méthodes à une classe (comme si elles étaient écrites dans le corps de la classe). Sert à répartir GameScene sur plusieurs fichiers.

function mixin(cls, methods){
  Object.keys(methods).forEach(k=>{
    if (Object.prototype.hasOwnProperty.call(cls.prototype, k)) throw new Error("mixin: " + cls.name + "." + k + " est défini deux fois");
    Object.defineProperty(cls.prototype, k, { value: methods[k], writable: true, configurable: true, enumerable: false });
  });
}
