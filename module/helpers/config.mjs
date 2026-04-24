export const TRESDETALPHA = {};

/**
 * The set of Ability Scores used within the sytem.
 * @type {Object}
 */
 TRESDETALPHA.abilities = {
  "forca": "TRESDETALPHA.Caracteristicas.forca.label",
  "habilidade": "TRESDETALPHA.Caracteristicas.habilidade.label",
  "resistencia": "TRESDETALPHA.Caracteristicas.resistencia.label",
  "armadura": "TRESDETALPHA.Caracteristicas.armadura.label",
  "poderDeFogo": "TRESDETALPHA.Caracteristicas.poderDeFogo.label"
};

TRESDETALPHA.abilityAbbreviations = {
  "forca": "TRESDETALPHA.Caracteristicas.forca.abreviacao",
  "habilidade": "TRESDETALPHA.Caracteristicas.habilidade.abreviacao",
  "resistencia": "TRESDETALPHA.Caracteristicas.resistencia.abreviacao",
  "armadura": "TRESDETALPHA.Caracteristicas.armadura.abreviacao",
  "poderDeFogo": "TRESDETALPHA.Caracteristicas.poderDeFogo.abreviacao"
};

/**
 * Tipos de dano do 3D&T Alpha (Manual p. 75 — "TIPOS DE DANO").
 *
 * O tipo de dano só faz diferença quando o alvo tem Armadura Extra,
 * Invulnerabilidade ou Vulnerabilidade contra ele.
 *
 * - `forca` — tipos de dano físico (corpo-a-corpo / arma branca).
 * - `pdf`   — tipos de dano de Poder de Fogo (à distância / energia).
 * - `magia` — tipo especial sobreposto pelas vantagens mágicas e armas mágicas.
 *
 * GMs podem estender estas listas via módulos/world scripts mutando
 * `CONFIG.TRESDETALPHA.damageTypes.forca.push("Psíquico")`, por exemplo.
 */
TRESDETALPHA.damageTypes = {
  forca: ["Corte", "Esmagamento", "Perfuração"],
  pdf:   ["Elétrico", "Fogo", "Frio", "Luz", "Químico", "Sônico", "Trevas"],
  magia: ["Magia"] // categoria especial
};