interface ISM64Material {
  color: number,
  ambient: number
}

interface IMarioColors {
  Hat: ISM64Material,
  Hair: ISM64Material,
  Gloves: ISM64Material,
  Overall:ISM64Material,
  Shoes: ISM64Material,
  Face:ISM64Material
}

export type { ISM64Material, IMarioColors }