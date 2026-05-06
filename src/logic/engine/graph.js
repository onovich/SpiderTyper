export function findMatchingPaths(nodes, sequence) {
  if (!sequence) {
    return [];
  }

  const paths = [];

  for (const node of nodes) {
    if (node.letter === sequence[0]) {
      paths.push(...explore(node, sequence, 1, [node]));
    }
  }

  return paths;
}

function explore(node, sequence, index, currentPath) {
  if (index === sequence.length) {
    return [currentPath];
  }

  const paths = [];

  for (const neighbor of node.neighbors) {
    if (neighbor.letter === sequence[index] && !currentPath.includes(neighbor)) {
      paths.push(...explore(neighbor, sequence, index + 1, [...currentPath, neighbor]));
    }
  }

  return paths;
}

export function buildShortestPath(start, target) {
  if (!start || !target || start === target) {
    return [];
  }

  const queue = [[start]];
  const visited = new Set([start]);

  while (queue.length > 0) {
    const path = queue.shift();
    const node = path[path.length - 1];

    if (node === target) {
      return path.slice(1);
    }

    for (const neighbor of node.neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }

  return [];
}
