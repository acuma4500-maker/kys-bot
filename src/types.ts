export type Task =
  | "ODA1"
  | "ODA2"
  | "YAZIHANE"
  | "TUVALET"
  | "BANYO"
  | "CEVRE";

export interface Person {
  id: number;
  name: string;
  fixedTask?: Task;
  active: boolean;
}
