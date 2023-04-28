export interface ITree {
  id?: string;
  name?: string;
  value?: number;
  selected?: boolean;
  filtered?: boolean;
  children?: ITree[];
  favorite?: boolean;
}
