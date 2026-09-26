export type EntityKind = "condition" | "symptom" | "treatment" | "medication" | "body-system" | "risk-factor";

export interface Source {
  title: string;
  organization: string;
  url: string;
}

export interface EntityDetails {
  overview?: string;
  diagnosis?: string;
  causes?: string[];
  attention?: string;
  safety?: string;
  mechanism?: string;
  category?: string;
}

export interface KnowledgeEntity {
  id: string;
  name: string;
  kind: EntityKind;
  description: string;
  bodySystem: string | null;
  details: EntityDetails;
  sources: Source[];
}

export interface KnowledgeRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  relationship: string;
  sourceReference: string;
}

export interface KnowledgeLibrary {
  entities: KnowledgeEntity[];
  relationships: KnowledgeRelationship[];
}

export const kindLabels: Record<EntityKind, string> = {
  condition: "Condition",
  symptom: "Symptom",
  treatment: "Treatment",
  medication: "Medication",
  "body-system": "Body system",
  "risk-factor": "Risk factor",
};

export const kindColors: Record<EntityKind, string> = {
  condition: "#177b71",
  symptom: "#946923",
  treatment: "#4b70a5",
  medication: "#4b70a5",
  "body-system": "#765c99",
  "risk-factor": "#985773",
};

export function connectionsFor(library: KnowledgeLibrary, id: string, kind?: EntityKind) {
  const connected = new Set(library.relationships.filter(r => r.sourceId === id || r.targetId === id).map(r => r.sourceId === id ? r.targetId : r.sourceId));
  return library.entities.filter(e => connected.has(e.id) && (!kind || e.kind === kind));
}

export function connectionCount(library: KnowledgeLibrary, id: string) {
  return library.relationships.filter(r => r.sourceId === id || r.targetId === id).length;
}

export const DISCLAIMER = "Health Atlas provides general educational information only. It is not a medical diagnostic tool and does not replace advice, diagnosis, or treatment from a qualified healthcare professional.";

function editDistance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const old = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = old;
    }
  }
  return row[b.length];
}

const aliases: Record<string, string> = { diabetes: "type-2-diabetes", "heart health": "cardiovascular", "high blood pressure": "hypertension", "acid reflux": "gerd", "hay fever": "allergic-rhinitis", "uti": "urinary-tract-infection", "cbt": "cognitive-behavioral-therapy", "lungs": "respiratory", "skin": "integumentary", "ibs": "irritable-bowel-syndrome" };

export function searchEntities(entities: KnowledgeEntity[], query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return entities;
  return entities.map(entity => {
    const name = entity.name.toLowerCase();
    let score = name === q ? 100 : name.startsWith(q) ? 80 : name.includes(q) ? 60 : 0;
    if (aliases[q] === entity.id) score = 95;
    if (!score && q.length >= 3) {
      const distance = Math.min(editDistance(name, q), ...name.split(/[\s-]+/).map(word => editDistance(word, q)));
      if (distance <= (q.length > 6 ? 2 : 1)) score = 40 - distance;
    }
    if (!score && entity.description.toLowerCase().includes(q)) score = 10;
    return { entity, score };
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score || a.entity.name.localeCompare(b.entity.name)).map(item => item.entity);
}
