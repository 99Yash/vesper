export type SearchResult = {
  id: string;
  rowVersion: number;
};

export type ClientViewMetadata = { rowVersion: number };
type ClientViewMap = Map<string, ClientViewMetadata>;

/**
 * A Client View Record (CVR) is a minimal representation of a Client View snapshot.
 * In other words, it captures what data a Client Group had at a particular moment in time.
 */
export class CVR {
  public clients: ClientViewMap;
  public notes: ClientViewMap;

  constructor({ clients, notes }: { clients: ClientViewMap; notes: ClientViewMap }) {
    this.clients = clients;
    this.notes = notes;
  }

  static serializeSearchResult(result: SearchResult[]): Map<string, ClientViewMetadata> {
    const data = new Map<string, ClientViewMetadata>();
    result.forEach((row) => data.set(row.id, { rowVersion: row.rowVersion }));

    return data;
  }

  static getPutsSince(nextData: ClientViewMap, prevData: ClientViewMap): string[] {
    const puts: string[] = [];
    nextData.forEach((meta, id) => {
      const prev = prevData.get(id);
      if (prev === undefined || prev.rowVersion < meta.rowVersion) {
        puts.push(id);
      }
    });
    return puts;
  }

  static getDelsSince(nextData: ClientViewMap, prevData: ClientViewMap): string[] {
    const dels: string[] = [];
    prevData.forEach((_, id) => {
      if (!nextData.has(id)) {
        dels.push(id);
      }
    });
    return dels;
  }

  static generateCVR({
      notesMeta,
    clientsMeta,
  }: {
    notesMeta: SearchResult[];
    clientsMeta: SearchResult[];
  }): CVR {
    return {
      notes: CVR.serializeSearchResult(notesMeta),
      clients: CVR.serializeSearchResult(clientsMeta),
    };
  }
}