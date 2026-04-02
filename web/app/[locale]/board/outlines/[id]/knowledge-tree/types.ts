export interface KnowledgeNode {
  id: number;
  name: string;
  desc?: string;
  level: number;
  status?: number;
  outline_id?: number;
  f_node?: number | null;
  children: KnowledgeNode[];
}

export interface OutlineInfo {
  id: number;
  name: string;
  desc?: string;
  status: string;
  node_count?: number;
}
