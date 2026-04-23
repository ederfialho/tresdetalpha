/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class TresDeTAlphaActor extends Actor {

  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of personagem sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.tresdetalpha || {};

    // Make separate methods for each Actor type (personagem, npc, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
    this._prepareNpcData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'personagem') return;

    // Make modifications to data here. For example:
    const abilities = actorData.system.abilities;
    const attributes = actorData.system.attributes;
    const vantagens = actorData.items; //should be advantages instead of items

    Object.values(abilities).map((ability)=>{
      ability.total = ability.value + ability.bonus;
    });

    //Cálculo automático para medir o valor de Força de Ataque
    attributes.forcaDeAtaque.forca.value = abilities.forca.total + abilities.habilidade.total;
    attributes.forcaDeAtaque.poderDeFogo.value = abilities.poderDeFogo.total + abilities.habilidade.total;
    
    //Cálculo automático para medir o valor de Força de Defesa
    attributes.forcaDefesa.value = abilities.armadura.total + abilities.habilidade.total;
    
    let vidaExtra = 0; //vantagens.find((vantagem)=> vantagem.name = "Vida Extra") ?? null;
    let magiaExtra = 0; //vantagens.find((vantagem)=> vantagem.name = "Energia Extra") ?? null;

    //Cálculo de máximo de pontos de vida e de magia
    if (abilities.resistencia.value == 0) {
      actorData.system.vida.max = 1;
      actorData.system.magia.max = 1;
    } else {
      actorData.system.vida.max = (abilities.resistencia.value +(vidaExtra * 2))*5 + actorData.system.vida.bonus;
      actorData.system.magia.max = (abilities.resistencia.value + (magiaExtra * 2))*5 + actorData.system.magia.bonus;
    }

  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;
    //systemData.xp = (systemData.cr * systemData.cr) * 100;
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();

    // Prepare personagem roll data.
    this._getCharacterRollData(data);
    this._getNpcRollData(data);

    return data;
  }

  /**
   * Prepare personagem roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'personagem') return;

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@forca.mod + 4`.
    if (data.abilities) {
      for (let [k, v] of Object.entries(data.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    // Add level for easier access, or fall back to 0.
    if (data.attributes.level) {
      data.lvl = data.attributes.level.value ?? 0;
    }
  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data) {
    if (this.type !== 'npc') return;

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@forca.mod + 4`.
    if (data.abilities) {
      for (let [k, v] of Object.entries(data.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    // Add level for easier access, or fall back to 0.
    if (data.attributes.level) {
      data.lvl = data.attributes.level.value ?? 0;
    }
  }
}