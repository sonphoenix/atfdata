// BFS function to find path between nodes
export const findPathBFS = (startId, targetId, graph) => {
  const visited = new Set()
  const queue = [[startId]]
  
  while (queue.length > 0) {
    const path = queue.shift()
    const node = path[path.length - 1]
    
    if (node === targetId) {
      return path
    }
    
    if (!visited.has(node)) {
      visited.add(node)
      
      const currentNode = graph.nodes.find(n => n.id === node)
      if (currentNode) {
        for (const neighbor of currentNode.connections) {
          if (!visited.has(neighbor)) {
            const newPath = [...path, neighbor]
            queue.push(newPath)
          }
        }
      }
    }
  }
  
  return null // No path found
}