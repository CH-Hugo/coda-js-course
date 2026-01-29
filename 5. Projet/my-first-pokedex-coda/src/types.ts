export interface Pokemon {
    name: string;
    url: string;
    id: number;
    types: { type: { name: string } }[];
    abilities: { ability: { name: string } }[];
    generation: number;
}