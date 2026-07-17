import { PERSONNEL } from "../personnel";

export interface DailyCleaning {

  oda1: string;

  yazhane: string;

  oda2: string;

  tuvalet: string[];

  banyo: string;

  cevre: string[];

}

let oda2Index = 0;

const ODA2_GROUP = [
  "Yusuf",
  "Samet",
  "Taner",
];

export function createCleaningList(): DailyCleaning {

  const oda2 = ODA2_GROUP[oda2Index];

  oda2Index++;

  if (oda2Index >= ODA2_GROUP.length) {
    oda2Index = 0;
  }

  const used = new Set<string>();

  used.add("Ahmet");
  used.add("Mertali");
  used.add(oda2);

  const available = PERSONNEL
    .filter(p => !used.has(p.name))
    .map(p => p.name);

  const tuvalet = available.splice(0,3);

  const banyo = available.shift()!;

  const cevre = available;

  return {

    oda1: "Ahmet",

    yazhane: "Mertali",

    oda2,

    tuvalet,

    banyo,

    cevre

  };

}
