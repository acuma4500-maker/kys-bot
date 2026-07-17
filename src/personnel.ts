export interface Person {
  id: number;
  name: string;
  fixedTask?: "ODA1" | "YAZHANE";
}

export const PERSONNEL: Person[] = [
  { id: 1, name: "Ahmet", fixedTask: "ODA1" },
  { id: 2, name: "Mertali", fixedTask: "YAZHANE" },

  { id: 3, name: "Ali" },
  { id: 4, name: "Mustafa" },
  { id: 5, name: "Cuma" },
  { id: 6, name: "Hasan" },
  { id: 7, name: "Hüseyin" },
  { id: 8, name: "Yusuf" },
  { id: 9, name: "Samet" },
  { id: 10, name: "Taner" },
  { id: 11, name: "Mert" },
];
