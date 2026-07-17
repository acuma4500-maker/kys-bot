import type { Person } from "./types";

/**
 * KYS — Personel modülü.
 * Başlangıç listesi ve personel yardımcı fonksiyonları.
 */

export const INITIAL_PERSONNEL: readonly string[] = [
  "Ahmet",
  "Mertali",
  "Ali",
  "Mustafa",
  "Cuma",
  "Hasan",
  "Hüseyin",
  "Yusuf",
  "Samet",
  "Taner",
  "Mert",
];

export function createPerson(name: string): Person {
  const trimmed = name.trim();
  return { id: trimmed, name: trimmed, status: "AKTIF" };
}

export function findPerson(
  people: Person[],
  idOrName: string,
): Person | undefined {
  const key = idOrName.trim().toLocaleLowerCase("tr");
  return people.find((p) => p.id.toLocaleLowerCase("tr") === key);
}

export function activePeople(people: Person[]): Person[] {
  return people.filter((p) => p.status === "AKTIF");
}
