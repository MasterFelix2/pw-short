//npx @svgr/cli src/newMaps/maps/Zeichnung4.svg --out-dir src/svgComponents --svgo-config src/newMaps/maps/svgo.config.js

/*

import Territory from "../components/General/Territory";
import {GermanTerritories, SovietTerritories} from "./MainMap";

    {GermanTerritories.map((item)=>{
      return <Territory 
        id={item.id}
        fill="#36454F"
        d={item.d}
      />
    })}

    {SovietTerritories.map((item)=>{
      return <Territory 
        id={item.id}
        fill="#8B0000"
        d={item.d}
      />
    })}

*/


module.exports = {
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          // customize default plugin options
          inlineStyles: {
            onlyMatchedOnce: false,
          },

          // or disable plugins
          removeDoctype: false,
          cleanupIDs: false,
          removeHiddenElems: false,
          removeEmptyContainers: false,
        },
      },
    },
  ],
};