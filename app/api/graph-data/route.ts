import { NextResponse } from "next/server"
import neo4j from "neo4j-driver"

interface Node {
  id: number
  name: string
  group: string
}

interface Link {
  source: number
  target: number
  type: string
}

export async function GET() {
  let driver
  let session

  try {
    driver = neo4j.driver(
      process.env.NEO4J_URI!,
      neo4j.auth.basic(
        process.env.NEO4J_USERNAME!,
        process.env.NEO4J_PASSWORD!
      )
    )
    await driver.verifyConnectivity()
    console.log("Connected to Neo4j")

    session = driver.session({ database: "neo4j" })

    const result = await session.run(`
      MATCH (n)
      OPTIONAL MATCH (n)-[r]->(m)
      RETURN n, r, m
    `)

    const nodes: Node[] = []
    const links: Link[] = []
    const nodeMap = new Map<number, number>()

    result.records.forEach((record) => {
      const source = record.get("n")
      const target = record.get("m")
      const relationship = record.get("r")

      if (!nodeMap.has(source.identity.low)) {
        nodeMap.set(source.identity.low, nodes.length)
        nodes.push({ id: source.identity.low, name: source.properties.name, group: source.labels[0] })
      }

      if (target && !nodeMap.has(target.identity.low)) {
        nodeMap.set(target.identity.low, nodes.length)
        nodes.push({ id: target.identity.low, name: target.properties.name, group: target.labels[0] })
      }

      if (relationship) {
        links.push({
          source: source.identity.low,
          target: target.identity.low,
          type: relationship.type,
        })
      }
    })

    console.log(`Fetched ${nodes.length} nodes and ${links.length} links`)

    return NextResponse.json({ nodes, links })
  } catch (error: unknown) {
    console.error("Error in Neo4j operation:", error)
    return new NextResponse(
      JSON.stringify({
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  } finally {
    if (session) {
      await session.close()
      console.log("Neo4j session closed")
    }
    if (driver) {
      await driver.close()
      console.log("Neo4j driver closed")
    }
  }
}

