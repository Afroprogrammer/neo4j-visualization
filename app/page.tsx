"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false })

export default function Home() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/graph-data")
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text()
          throw new Error(`Server error: ${res.status} - ${errorText}`)
        }
        return res.json()
      })
      .then((data) => {
        if (!data || !data.nodes || !data.links) {
          throw new Error("Invalid data structure received from server")
        }
        setGraphData(data)
      })
      .catch((err) => {
        console.error("Error fetching graph data:", err)
        setError(err.message || "An unknown error occurred")
      })
  }, [])

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-4xl font-bold mb-8 text-red-500">Error</h1>
        <p>{error}</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">Neo4j Graph Visualization</h1>
      <div className="w-full h-[600px]">
        {graphData.nodes.length > 0 ? (
          <ForceGraph2D
            graphData={graphData}
            nodeLabel="name"
            nodeAutoColorBy="group"
            linkDirectionalArrowLength={3.5}
            linkDirectionalArrowRelPos={1}
          />
        ) : (
          <p>Loading graph data...</p>
        )}
      </div>
    </main>
  )
}

