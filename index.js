
const roads = [
  "Alice's House-Bob's House", "Alice's House-Cabin",
  "Alice's House-Post Office", "Bob's House-Town Hall",
  "Daria's House-Ernie's House", "Daria's House-Town Hall",
  "Ernie's House-Grete's House", "Grete's House-Farm",
  "Grete's House-Shop", "Marketplace-Farm",
  "Marketplace-Post Office", "Marketplace-Shop",
  "Marketplace-Town Hall", "Shop-Town Hall"
];
// console.log(roads);
function buildGraph(edges) {
  let graph = Object.create(null);
  function addEdge(from, to) {
    if (graph[from]) graph[from].push(to);
    else graph[from] = [to];
  }
  for (let [from, to] of edges.map(r => r.split("-"))) {
    addEdge(from, to);
    addEdge(to, from);
  }
  return graph;
}

const roadGraph = buildGraph(roads);
console.log("ROADS: ", roadGraph);

class VillageState {
  constructor(place, parcels) {
    this.place = place;
    this.parcels = parcels;
  }
  move(destination) {
    if (roadGraph[this.place].indexOf(destination) === -1) return this;
    let nextParcels = this.parcels.map(p => {
      if (p.place !== this.place) return p;
      return { place: destination, address: p.address };
    });
    nextParcels = nextParcels.filter(p => p.address !== destination);
    return new VillageState(destination, nextParcels);
  }
  static random(parcelCount = 5) {
    let parcels = [];
    let place;
    for (i = 0; i < parcelCount; i++) {
      let address = randomPick(Object.keys(roadGraph));
      do {
        place = randomPick(Object.keys(roadGraph));
      } while (place == address);
      parcels.push({ place, address }); //shorthand key/value pair with same name
    }
    console.log("Parcels: ", parcels);
    return new VillageState("Post Office", parcels);
  }

}

let first = new VillageState(
  "Post Office",
  [{ place: "Post Office", address: "Alice's House" }]
);
let next = first.move("Alice's House");

// console.log(next.place);
// // → Alice's House
// console.log(next.parcels);
// // → []
// console.log(first.place);
// // → Post Office

function runRobot(state, robot, memory) {
  for (let turn = 0; ; turn++) {
    if (state.parcels.length === 0) {
      console.log(`Done in ${turn} turns`);
      break;
    }
    let action = robot(state, memory);
    state = state.move(action.direction);
    memory = action.move;
    console.log(`Moved to ${action.direction}`);
  }
}

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomRobot(state) {
  return { direction: randomPick(roadGraph[state.place]) };
}

VillageState.random = (parcelCount = 5) => {
  let parcels = [];
  let place;
  for (i = 0; i < parcelCount; i++) {
    let address = randomPick(Object.keys(roadGraph));
    do {
      place = randomPick(Object.keys(roadGraph));
    } while (place == address);
    parcels.push({ place, address }); //shorthand key/value pair with same name
  }
  console.log("Parcels: ", parcels);
  return new VillageState("Post Office", parcels);
};

runRobot(VillageState.random(), randomRobot); 
