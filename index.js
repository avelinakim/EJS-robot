
// Build Roads

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

///////////////////////////////////////////////////////////////////
// Create Village State

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

///////////////////////////////////////////////////////////////////
// Run Robot Function

function runRobot(state, robot, memory) {
  for (let turn = 0; ; turn++) {
    if (state.parcels.length === 0) {
      console.log(`Done in ${turn} turns`);
      break;
    }
    let action = robot(state, memory);
    state = state.move(action.direction);
    memory = action.memory;
    console.log(`Moved to ${action.direction}`);
  }
}

///////////////////////////////////////////////////////////////////
// Create Random Robot

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomRobot(state) {
  return { direction: randomPick(roadGraph[state.place]) };
}

// Also added directly to class
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

//runRobot(VillageState.random(), randomRobot); 

///////////////////////////////////////////////////////////////////
// Create Mailroute Robot

const mailRoute = [
  "Alice's House", "Cabin", "Alice's House", "Bob's House",
  "Town Hall", "Daria's House", "Ernie's House",
  "Grete's House", "Shop", "Grete's House", "Farm",
  "Marketplace", "Post Office"
];

function routeRobot(state, memory) {
  //console.log(memory);
  if (memory.length == 0) memory = mailRoute;
  return { direction: memory[0], memory: memory.slice(1) };
}

//runRobot(VillageState.random(), routeRobot, []);

///////////////////////////////////////////////////////////////////
// Goal-oriented Robot

function findRoute(graph, from, to) {
  let work = [{ at: from, route: [] }];
  for (let i = 0; i < work.length; i++) {
    let { at, route } = work[i];
    for (let place of graph[at]) {
      if (place == to) return route.concat(place);
      if (!work.some(w => w.at == place)) {
        work.push({ at: place, route: route.concat(place) });
      }
    }
  }
}

function goalOrientedRobot({ place, parcels }, route) {
  if (route.length === 0) {
    let parcel = parcels[0];
    if (parcel.place == place) {
      route = findRoute(roadGraph, place, parcel.address);
    }
    else {
      route = findRoute(roadGraph, place, parcel.place);
    }
  }
  return { direction: route[0], memory: route.slice(1) };
}

//runRobot(VillageState.random(), goalOrientedRobot, []);

///////////////////////////////////////////////////////////////////
// Compare Robots

// Write a function compareRobots that takes two robots (and their starting memory). It should generate 100 tasks and let each of the robots solve each of these tasks. When done, it should output the average number of steps each robot took per task.

// For the sake of fairness, make sure you give each task to both robots, rather than generating different tasks per robot.

function runCRobot(state, robot, memory) {
  for (let turn = 0; ; turn++) {
    if (state.parcels.length === 0) {
      return turn;
      break;
    }
    let action = robot(state, memory);
    state = state.move(action.direction);
    memory = action.memory;
    console.log(`Moved to ${action.direction}`);
  }
}

function compareRobots(robot1, memory1, robot2, memory2) {
  let r1Steps = 0;
  let r2Steps = 0;
  let tasks = 100;
  for (let i = 0; i < tasks; i++) {
    let village = VillageState.random();
    r1Steps += runCRobot(village, robot1, memory1);
    r2Steps += runCRobot(village, robot2, memory2);
  }
  console.log("Robot1 average: " + r1Steps / tasks +
    "\nRobot2 average: " + r2Steps / tasks);
  console.log("Efficiency Change: ", r1Steps / tasks - r2Steps / tasks);
}

//compareRobots(routeRobot, [], goalOrientedRobot, []);

///////////////////////////////////////////////////////////////////
// Efficient Goal-oriented Robot

function efficientGoalRobot({ place, parcels }, route) {
  // set next target parcel 
  let nextParcel;
  for (let p of parcels) {
    let steps;
    let routeType;
    if (p.place === place) {
      steps = findRoute(roadGraph, place, p.address).length;
      routeType = "deliver";
    }
    else {
      steps = findRoute(roadGraph, place, p.place).length;
      routeType = "pickUp";
    }
    if (!nextParcel || steps < nextParcel.steps) nextParcel = { parcel: p, steps };
    else if (steps === nextParcel.steps) {
      if (routeType == "pickUp") nextParcel = { parcel: p, steps };
    }
  }
  nextParcel = nextParcel.parcel;

  // pick up parcel
  if (nextParcel.place !== place) {
    route = findRoute(roadGraph, place, nextParcel.place);
  }
  // deliver parcel
  else {
    route = findRoute(roadGraph, place, nextParcel.address);
  }

  return { direction: route[0], memory: route.slice(1) };
}

//runRobot(VillageState.random(), efficientGoalRobot, []);
compareRobots(goalOrientedRobot, [], efficientGoalRobot, []);
