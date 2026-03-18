"use client"

import * as React from "react"
import * as d3 from "d3"
import { useTheme } from "next-themes"
import { Person, Family, Partnership } from "@prisma/client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, Maximize, Loader2 } from "lucide-react"
import { PersonDetailModal } from "./person-detail-modal"

// Types for our graph data
interface TreePerson extends Person {
    partnerships: (Partnership & { family: Family })[]
    originFamily: Family | null
}

interface D3TreeProps {
    persons: TreePerson[]
    families: (Family & { partners: (Partnership & { person: Person })[]; children: Person[] })[]
    onNodeClick?: (personId: string) => void
}

interface NodeDatum {
    id: string
    type: "person" | "family"
    data: any
    x?: number
    y?: number
}

interface LinkDatum {
    source: string
    target: string
    type: "parent-child" | "partnership"
}

export function D3Tree({ persons, families }: D3TreeProps) {
    const svgRef = React.useRef<SVGSVGElement>(null)
    const wrapperRef = React.useRef<HTMLDivElement>(null)
    const { theme } = useTheme()
    const [transform, setTransform] = React.useState<d3.ZoomTransform>(d3.zoomIdentity)

    // Modal state
    const [selectedPerson, setSelectedPerson] = React.useState<any | null>(null)
    const [modalOpen, setModalOpen] = React.useState(false)

    const handleNodeClick = (personId: string) => {
        const person = persons.find(p => p.id === personId)
        if (person) {
            setSelectedPerson(person)
            setModalOpen(true)
        }
    }

    // Initialize D3 graph
    React.useEffect(() => {
        if (!svgRef.current || persons.length === 0) return

        const width = wrapperRef.current?.clientWidth || 1000
        const height = wrapperRef.current?.clientHeight || 800

        const svg = d3.select(svgRef.current)
        svg.selectAll("*").remove() // Clear previous renders

        // Create main group for zoom/pan
        const g = svg.append("g")

        // Setup zoom behavior
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                g.attr("transform", event.transform)
                setTransform(event.transform)
            })

        svg.call(zoom)

        // Prepare data for layout
        // Strategy: Use d3-force for organic layout of complex families
        // Nodes: Persons and Families (as connector nodes)
        const nodes: NodeDatum[] = [
            ...persons.map(p => ({ id: p.id, type: "person" as const, data: p })),
            ...families.map(f => ({ id: f.id, type: "family" as const, data: f }))
        ]

        const links: LinkDatum[] = []

        // Connect partners to their families
        families.forEach(family => {
            family.partners.forEach(partner => {
                links.push({
                    source: partner.personId,
                    target: family.id,
                    type: "partnership"
                })
            })

            // Connect children to their origin family
            family.children.forEach(child => {
                links.push({
                    source: family.id,
                    target: child.id,
                    type: "parent-child"
                })
            })
        })

        // Force simulation
        const simulation = d3.forceSimulation(nodes as any)
            .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-1000))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide(80))
            .force("y", d3.forceY(0).strength(0.05)) // Subtle gravity to keep vertical structure
            .on("tick", ticked)

        // Render links
        const link = g.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke-width", d => d.type === "partnership" ? 2 : 1.5)
            .attr("stroke", d => d.type === "partnership" ? "#ec4899" : "#64748b") // Pink for partners, slate for kids

        // Render nodes (Person)
        const node = g.append("g")
            .selectAll(".node")
            .data(nodes.filter(n => n.type === "person"))
            .join("g")
            .attr("class", "node cursor-pointer")
            .call(d3.drag<any, any>()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended) as any)
            .on("click", (e, d) => handleNodeClick(d.id))

        // Person Card (Background)
        node.append("rect")
            .attr("width", 180)
            .attr("height", 80)
            .attr("x", -90)
            .attr("y", -40)
            .attr("rx", 10)
            .attr("fill", theme === "dark" ? "#1e293b" : "#ffffff")
            .attr("stroke", d => (d.data as Person).gender === "MALE" ? "#3b82f6" : "#ec4899")
            .attr("stroke-width", 2)
            .attr("class", "shadow-sm")

        // Person Image/Icon
        node.append("circle")
            .attr("r", 20)
            .attr("cx", -60)
            .attr("cy", 0)
            .attr("fill", "#e2e8f0")

        // Fallback Icon Text (initials)
        node.append("text")
            .attr("x", -60)
            .attr("y", 5)
            .attr("text-anchor", "middle")
            .attr("fill", "#64748b")
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .text(d => (d.data as Person).name.substring(0, 2).toUpperCase())

        // Person Image (if exists)
        // We would use <image> tag with clip-path for proper circle image

        // Person Name
        node.append("text")
            .attr("x", -30)
            .attr("y", -5)
            .attr("text-anchor", "start")
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .attr("fill", theme === "dark" ? "#f1f5f9" : "#0f172a")
            .text(d => {
                const name = (d.data as Person).name
                return name.length > 15 ? name.substring(0, 15) + "..." : name
            })

        // Person Info
        node.append("text")
            .attr("x", -30)
            .attr("y", 15)
            .attr("text-anchor", "start")
            .attr("font-size", "10px")
            .attr("fill", theme === "dark" ? "#94a3b8" : "#64748b")
            .text(d => {
                const p = d.data as Person
                if (p.dateOfBirth) {
                    return new Date(p.dateOfBirth).getFullYear().toString()
                }
                return ""
            })

        // Family Nodes (Small dots)
        const familyNode = g.append("g")
            .selectAll(".family-node")
            .data(nodes.filter(n => n.type === "family"))
            .join("circle")
            .attr("r", 6)
            .attr("fill", "#64748b")
            .attr("stroke", "#fff")
            .attr("stroke-width", 4)

        function ticked() {
            link
                .attr("x1", (d: any) => d.source.x)
                .attr("y1", (d: any) => d.source.y)
                .attr("x2", (d: any) => d.target.x)
                .attr("y2", (d: any) => d.target.y)

            node
                .attr("transform", (d: any) => `translate(${d.x},${d.y})`)

            familyNode
                .attr("cx", (d: any) => d.x)
                .attr("cy", (d: any) => d.y)
        }

        // Drag functions
        function dragstarted(event: any, d: any) {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
        }

        function dragged(event: any, d: any) {
            d.fx = event.x
            d.fy = event.y
        }

        function dragended(event: any, d: any) {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
        }

        // Cleanup
        return () => {
            simulation.stop()
        }
    }, [persons, families, theme])

    // Zoom controls
    const handleZoomIn = () => {
        if (!svgRef.current) return
        d3.select(svgRef.current).transition().call(
            d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 1.2
        )
    }

    const handleZoomOut = () => {
        if (!svgRef.current) return
        d3.select(svgRef.current).transition().call(
            d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 0.8
        )
    }

    const handleResetZoom = () => {
        if (!svgRef.current) return
        d3.select(svgRef.current).transition().call(
            d3.zoom<SVGSVGElement, unknown>().transform as any, d3.zoomIdentity
        )
    }

    return (
        <>
            <div ref={wrapperRef} className="relative w-full h-[calc(100vh-100px)] overflow-hidden bg-dot-pattern">
                {/* Canvas */}
                <svg
                    ref={svgRef}
                    className="w-full h-full touch-none cursor-move"
                />

                {/* Controls */}
                <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                    <Button variant="secondary" size="icon" onClick={handleZoomIn}>
                        <ZoomIn className="size-4" />
                    </Button>
                    <Button variant="secondary" size="icon" onClick={handleZoomOut}>
                        <ZoomOut className="size-4" />
                    </Button>
                    <Button variant="secondary" size="icon" onClick={handleResetZoom}>
                        <Maximize className="size-4" />
                    </Button>
                </div>

                {/* Legend/Overlay can go here */}
                <div className="absolute top-6 left-6 glass px-4 py-2 rounded-full text-xs text-muted-foreground pointer-events-none">
                    {persons.length} Members • {families.length} Families
                </div>
            </div>

            {/* Person Detail Modal */}
            <PersonDetailModal
                person={selectedPerson}
                open={modalOpen}
                onOpenChange={setModalOpen}
            />
        </>
    )
}
