/**
 * TypeDataModels para o sistema 3D&T Alpha.
 * Cada classe define a forma dos dados persistidos em `document.system`
 * e centraliza a lógica de dados derivados (cálculos automáticos).
 *
 * Registrado via `CONFIG.Actor.dataModels` e `CONFIG.Item.dataModels`
 * em `module/tresdetalpha.mjs`.
 */

const { fields } = foundry.data;
const { TypeDataModel } = foundry.abstract;

/* -------------------------------------------- */
/*  Helpers de schema                           */
/* -------------------------------------------- */

/**
 * Retorna um SchemaField para um recurso tipo {value, bonus, min, max}
 * @param {object} [opts]
 * @returns {foundry.data.fields.SchemaField}
 */
function resourceField({ initialValue = 1, initialMax = 1 } = {}) {
  return new fields.SchemaField({
    value: new fields.NumberField({ required: true, integer: true, initial: initialValue, min: 0 }),
    bonus: new fields.NumberField({ required: true, integer: true, initial: 0 }),
    min:   new fields.NumberField({ required: true, integer: true, initial: 0 }),
    max:   new fields.NumberField({ required: true, integer: true, initial: initialMax })
  });
}

/**
 * Retorna um SchemaField de característica {value, bonus, total}.
 * @returns {foundry.data.fields.SchemaField}
 */
function abilityField() {
  return new fields.SchemaField({
    value: new fields.NumberField({ required: true, integer: true, initial: 0 }),
    bonus: new fields.NumberField({ required: true, integer: true, initial: 0 }),
    total: new fields.NumberField({ required: true, integer: true, initial: 0 })
  });
}

/* -------------------------------------------- */
/*  Actor DataModel                             */
/* -------------------------------------------- */

/**
 * Modelo de dados único compartilhado entre Personagem (PJ) e NPC (PNM),
 * dado que suas fichas têm o mesmo esquema em 3D&T Alpha.
 */
export class TresDeTAlphaActorData extends TypeDataModel {
  /** @override */
  static defineSchema() {
    return {
      pontos: new fields.NumberField({ required: true, integer: true, initial: 0 }),
      biography: new fields.HTMLField({ required: true, initial: "" }),

      vida:  resourceField(),
      magia: resourceField(),

      experiencia: new fields.SchemaField({
        value: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0 }),
        min:   new fields.NumberField({ required: true, integer: true, initial: 0 }),
        max:   new fields.NumberField({ required: true, integer: true, initial: 0 })
      }),

      attributes: new fields.SchemaField({
        tipoDeDano: new fields.SchemaField({
          forca: new fields.SchemaField({
            value: new fields.StringField({ required: true, initial: "", blank: true })
          }),
          poderDeFogo: new fields.SchemaField({
            value: new fields.StringField({ required: true, initial: "", blank: true })
          })
        }),
        forcaDeAtaque: new fields.SchemaField({
          forca: new fields.SchemaField({
            value: new fields.NumberField({ required: true, integer: true, initial: 0 })
          }),
          poderDeFogo: new fields.SchemaField({
            value: new fields.NumberField({ required: true, integer: true, initial: 0 })
          })
        }),
        forcaDefesa: new fields.SchemaField({
          value: new fields.NumberField({ required: true, integer: true, initial: 0 })
        })
      }),

      abilities: new fields.SchemaField({
        forca:       abilityField(),
        habilidade:  abilityField(),
        resistencia: abilityField(),
        armadura:    abilityField(),
        poderDeFogo: abilityField()
      })
    };
  }

  /**
   * Cálculos automáticos:
   * - ability.total = value + bonus
   * - forcaDeAtaque.forca.value = forca.total + habilidade.total
   * - forcaDeAtaque.poderDeFogo.value = poderDeFogo.total + habilidade.total
   * - forcaDefesa.value = armadura.total + habilidade.total
   * - vida.max / magia.max em função da resistência
   * @override
   */
  prepareDerivedData() {
    const { abilities, attributes, vida, magia } = this;

    for (const ability of Object.values(abilities)) {
      ability.total = (ability.value ?? 0) + (ability.bonus ?? 0);
    }

    attributes.forcaDeAtaque.forca.value       = abilities.forca.total + abilities.habilidade.total;
    attributes.forcaDeAtaque.poderDeFogo.value = abilities.poderDeFogo.total + abilities.habilidade.total;
    attributes.forcaDefesa.value               = abilities.armadura.total + abilities.habilidade.total;

    if ((abilities.resistencia.value ?? 0) === 0) {
      vida.max  = 1;
      magia.max = 1;
    } else {
      vida.max  = abilities.resistencia.value * 5 + (vida.bonus ?? 0);
      magia.max = abilities.resistencia.value * 5 + (magia.bonus ?? 0);
    }
  }

  /**
   * Dados expostos em fórmulas de roll (@abilities.forca.total, etc.)
   * Foundry já expõe `this` como `@system`. Aqui só duplicamos as abilities
   * no topo por conveniência (como fazia o código legado).
   */
  getRollData() {
    const data = { ...this };
    if (this.abilities) {
      for (const [k, v] of Object.entries(this.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }
    return data;
  }
}

/* -------------------------------------------- */
/*  Item DataModels                             */
/* -------------------------------------------- */

/** Campos compartilhados por todos os itens. */
function baseItemFields() {
  return {
    description: new fields.HTMLField({ required: true, initial: "" })
  };
}

/** Custo em pontos de personagem (inteiro). */
function custoPontos(initial = 0) {
  return new fields.NumberField({ required: true, integer: true, initial });
}

export class TresDeTAlphaVantagemData extends TypeDataModel {
  static defineSchema() {
    return {
      ...baseItemFields(),
      nome: new fields.StringField({ required: true, initial: "", blank: true }),
      custo: custoPontos(0)
    };
  }
}

export class TresDeTAlphaDesvantagemData extends TypeDataModel {
  static defineSchema() {
    return {
      ...baseItemFields(),
      nome: new fields.StringField({ required: true, initial: "", blank: true }),
      custo: custoPontos(0)
    };
  }
}

export class TresDeTAlphaVantagemUnicaData extends TypeDataModel {
  static defineSchema() {
    return {
      ...baseItemFields(),
      nome: new fields.StringField({ required: true, initial: "", blank: true }),
      custo: custoPontos(0)
    };
  }
}

export class TresDeTAlphaPericiaData extends TypeDataModel {
  static defineSchema() {
    return {
      ...baseItemFields(),
      nome: new fields.StringField({ required: true, initial: "", blank: true }),
      custo: custoPontos(2)
    };
  }
}

export class TresDeTAlphaMagiaData extends TypeDataModel {
  static defineSchema() {
    return {
      ...baseItemFields(),
      escola: new fields.StringField({ required: true, initial: "", blank: true }),
      // O custo de magia é livre (ex: "1 PM por rodada"), string.
      custo: new fields.StringField({ required: true, initial: "", blank: true }),
      alcance: new fields.StringField({ required: true, initial: "", blank: true }),
      duracao: new fields.StringField({ required: true, initial: "", blank: true }),
      exigencias: new fields.StringField({ required: true, initial: "", blank: true })
    };
  }
}

export class TresDeTAlphaObjetoMagicoData extends TypeDataModel {
  static defineSchema() {
    return {
      ...baseItemFields(),
      custo: custoPontos(0),
      tipo: new fields.StringField({ required: true, initial: "", blank: true })
    };
  }
}

/* -------------------------------------------- */
/*  Mapas para registro em CONFIG               */
/* -------------------------------------------- */

export const ACTOR_DATA_MODELS = {
  personagem: TresDeTAlphaActorData,
  npc: TresDeTAlphaActorData
};

export const ITEM_DATA_MODELS = {
  vantagem: TresDeTAlphaVantagemData,
  desvantagem: TresDeTAlphaDesvantagemData,
  vantagemUnica: TresDeTAlphaVantagemUnicaData,
  pericia: TresDeTAlphaPericiaData,
  magia: TresDeTAlphaMagiaData,
  objetoMagico: TresDeTAlphaObjetoMagicoData
};
