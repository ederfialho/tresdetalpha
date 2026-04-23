/**
 * Documento Actor customizado do 3D&T Alpha.
 *
 * A lógica de schema e cálculos derivados vive no DataModel
 * (`module/data/_models.mjs` → `TresDeTAlphaActorData`).
 * Aqui deixamos apenas overrides de alto nível específicos do documento.
 *
 * @extends {Actor}
 */
export class TresDeTAlphaActor extends Actor {

  /**
   * Dados para rolls: delega ao DataModel (que já copia as abilities pro topo)
   * e acrescenta os dados base do Actor.
   * @override
   */
  getRollData() {
    const data = super.getRollData();
    // O DataModel tem seu próprio getRollData que acrescenta as abilities no topo.
    if (typeof this.system?.getRollData === "function") {
      Object.assign(data, this.system.getRollData());
    }
    return data;
  }
}
