const person = {
  name: "Barreau",
  address: {
    primary: "1 rue des fleurs",
    zipCode: "21000",
    city: "Dijon",
  },
};
const person2 = {
  name: "Paldire",
};

// console.log(person.name);
// console.log(person["name"]);

const tab = [];

tab.lastIndex = 0;

// console.log(person2.address.city); -- Error
console.log(person2.address?.city);
person2.address = { city: "Dijon" };
console.log(person2.address?.city);
// Spread

const { name, ...rest } = person;
console.log(name);
console.log(rest);

// const person = {
//   name: "Barreau",
//   address: {
//     primary: "1 rue des fleurs",
//     zipCode: "21000",
//     city: "Dijon",
//   },
// };
const copy = { ...person };
copy.firstName = "Maxime";

copy.address.city = "Quetigny";
console.log(person);

// Object.

console.log(Object.keys(person.address));
console.log(Object.values(person));

const cities = [
  { zipCode: "21000", city: "Dijon" },
  { zipCode: "21000", city: "Dijon" },
  { zipCode: "21000", city: "Dijon" },
  { zipCode: "21000", city: "Dijon" },
  { zipCode: "89000", city: "Auxerre" },
  { zipCode: "89000", city: "Auxerre" },
  { zipCode: "89000", city: "Auxerre" },
  { zipCode: "89000", city: "Auxerre" },
];

const cityMap = {};
for (const city of cities) {
  cityMap[city.zipCode] = city;
}
console.log(Object.values(cityMap));

console.log("---------Entry---------");

for (const [key, value] of Object.entries(person)) {
  console.log(key, value);
}
