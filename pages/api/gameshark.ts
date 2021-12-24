
import { IMarioColors } from "./types"
import { materialToGS } from "./utils"

const convertPaletteToGS = ( palette: IMarioColors ) => {
  const hat     = materialToGS( palette.Hat )
  const overall = materialToGS( palette.Overall )
  const gloves  = materialToGS( palette.Gloves )
  const shoes   = materialToGS( palette.Shoes )
  const skin    = materialToGS( palette.Face )
  const hair    = materialToGS( palette.Hair )
  let gameshark =
    `8107EC40 ${ hat.color[0] }\n` +
    `8107EC42 ${ hat.color[1] }\n` +
    `8107EC38 ${ hat.ambient[0] }\n` +
    `8107EC3A ${ hat.ambient[1] }\n` +
    `8107EC28 ${ overall.color[0] }\n` +
    `8107EC2A ${ overall.color[1] }\n` +
    `8107EC20 ${ overall.ambient[0] }\n` +
    `8107EC22 ${ overall.ambient[1] }\n` +
    `8107EC58 ${ gloves.color[0] }\n` +
    `8107EC5A ${ gloves.color[1] }\n` +
    `8107EC50 ${ gloves.ambient[0] }\n` +
    `8107EC52 ${ gloves.ambient[1] }\n` +
    `8107EC70 ${ shoes.color[0] }\n` +
    `8107EC72 ${ shoes.color[1] }\n` +
    `8107EC68 ${ shoes.ambient[0] }\n` +
    `8107EC6A ${ shoes.ambient[1] }\n` +
    `8107EC88 ${ skin.color[0] }\n` +
    `8107EC8A ${ skin.color[1] }\n` +
    `8107EC80 ${ skin.ambient[0] }\n` +
    `8107EC82 ${ skin.ambient[1] }\n` +
    `8107ECA0 ${ hair.color[0] }\n` +
    `8107ECA2 ${ hair.color[1] }\n` +
    `8107EC98 ${ hair.ambient[0] }\n` +
    `8107EC9A ${ hair.ambient[1] }\n`
  return gameshark
}

export { convertPaletteToGS }