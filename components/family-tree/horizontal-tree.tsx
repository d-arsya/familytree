"use client"

import * as React from "react"
import * as d3 from "d3"
import { useTheme } from "next-themes"
import { Person, Family, Partnership } from "@prisma/client"
import { PersonDetailModal } from "./person-detail-modal"

// Types (Same as StaticTree)
interface TreePerson extends Person {
    partnerships: (Partnership & { family: Family })[]
    originFamily: Family | null
}

interface HorizontalTreeProps {
    persons: TreePerson[]
    families: (Family & { partners: (Partnership & { person: Person })[]; children: Person[] })[]
}

export function HorizontalTree({ persons, families }: HorizontalTreeProps) {
    const svgRef = React.useRef<SVGSVGElement>(null)
    const { theme } = useTheme()

    // State for modal & UI
    const [selectedPerson, setSelectedPerson] = React.useState<any | null>(null)
    const [modalOpen, setModalOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [searchResults, setSearchResults] = React.useState<any[]>([])

    const findRoot = () => {
        const roots = persons.filter(p => !p.originFamilyId)
        if (roots.length > 0) {
            // Sort roots by createdAt or DOB
            return roots.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0]
        }
        return persons[0]
    }

    // Search Logic
    React.useEffect(() => {
        if (searchQuery.length > 2) {
            const query = searchQuery.toLowerCase()
            const filtered = persons.filter(p => p.name.toLowerCase().includes(query))
            setSearchResults(filtered)
        } else {
            setSearchResults([])
        }
    }, [searchQuery, persons])

    React.useEffect(() => {
        if (!svgRef.current || persons.length === 0) return

        const svg = d3.select(svgRef.current)
        svg.selectAll("*").remove()

        const g = svg.append("g")

        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on("zoom", (e) => {
                g.attr("transform", e.transform)
            })
        svg.call(zoom)

        const rootPerson = findRoot()
        if (!rootPerson) return

        // Build adjacency list
        const childrenMap = new Map<string, string[]>()
        families.forEach(fam => {
            const parentIds = fam.partners.map(p => p.personId)
            const childList = fam.children.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            const childIds = childList.map(c => c.id)

            parentIds.forEach(pid => {
                const current = childrenMap.get(pid) || []
                childrenMap.set(pid, [...current, ...childIds])
            })
        })

        // Build hierarchy
        const buildHierarchy = (personId: string): any => {
            const childrenIds = childrenMap.get(personId) || []
            const uniqueChildren = Array.from(new Set(childrenIds))

            const node: any = {
                name: personId,
                children: uniqueChildren.map(childId => buildHierarchy(childId))
            }

            // Allow sorting children at each level
            if (node.children.length > 0) {
                node.children.sort((a: any, b: any) => {
                    const pA = persons.find(p => p.id === a.name)
                    const pB = persons.find(p => p.id === b.name)
                    if (!pA || !pB) return 0
                    return new Date(pA.createdAt).getTime() - new Date(pB.createdAt).getTime()
                })
            } else {
                delete node.children
            }
            return node
        }

        const rootData = buildHierarchy(rootPerson.id)
        const hierarchy = d3.hierarchy(rootData)

        // Horizontal Layout: nodeSize([height, width]) 
        // We want wide separation vertically (nodes are stacked) and appropriate horizontal depth
        const treeLayout = d3.tree().nodeSize([180, 280])
        const rootNode = treeLayout(hierarchy)

        // Add defs
        const defs = svg.append("defs")
        const shadowFilterId = "card-shadow-h"
        const filter = defs.append("filter").attr("id", shadowFilterId).attr("x", "-20%").attr("y", "-20%").attr("width", "140%").attr("height", "140%")
        filter.append("feGaussianBlur").attr("in", "SourceAlpha").attr("stdDeviation", "2").attr("result", "blur")
        filter.append("feOffset").attr("in", "blur").attr("dx", "1").attr("dy", "1").attr("result", "offsetBlur")
        const merge = filter.append("feMerge")
        merge.append("feMergeNode").attr("in", "offsetBlur")
        merge.append("feMergeNode").attr("in", "SourceGraphic")

        // Helper: Card Renderer
        const renderCardContent = (sel: d3.Selection<SVGGElement, any, any, any>, p: any) => {
            // Simplified Card Style for Passive View
            sel.append("rect")
                .attr("width", 240) // Wider card for long names
                .attr("height", 80)
                .attr("x", -120)
                .attr("y", -40)
                .attr("rx", 40) // Pill shape
                .attr("fill", theme === "dark" ? "#1e293b" : "#ffffff")
                .attr("stroke", p?.gender === "MALE" ? "#3b82f6" : p?.gender === "FEMALE" ? "#ec4899" : "#94a3b8")
                .attr("stroke-width", 2)
                .attr("filter", `url(#${shadowFilterId})`)

            // Avatar
            const avatar = sel.append("g").attr("transform", "translate(-90, 0)")
            avatar.append("circle").attr("r", 32).attr("fill", theme === "dark" ? "#334155" : "#f1f5f9")

            if (p?.photoUrl) {
                const patternId = `ph-${p.id.replace(/[^a-zA-Z0-9]/g, "")}`
                if (!defs.select(`#${patternId}`).size()) {
                    defs.append("pattern")
                        .attr("id", patternId)
                        .attr("width", 1).attr("height", 1).attr("patternContentUnits", "objectBoundingBox")
                        .append("image").attr("xlink:href", p.photoUrl)
                        .attr("width", 1).attr("height", 1).attr("preserveAspectRatio", "xMidYMid slice")
                }
                avatar.append("circle").attr("r", 32).attr("fill", `url(#${patternId})`)
            } else {
                const initials = p?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2) || "?"
                avatar.append("text").attr("text-anchor", "middle").attr("dy", "0.35em").attr("font-size", "16px").attr("font-weight", "bold").attr("fill", "#94a3b8").text(initials)
            }

            const info = sel.append("g").attr("transform", "translate(-45, 0)")

            const nameStr = p?.name || "Unknown"
            const truncatedName = nameStr.length > 18 ? nameStr.substring(0, 16) + "..." : nameStr
            info.append("text").attr("dy", "-0.4em").attr("font-size", "14px").attr("font-weight", "bold").attr("fill", theme === "dark" ? "#f8fafc" : "#0f172a").text(truncatedName)

            const yob = p?.dateOfBirth ? new Date(p.dateOfBirth).getFullYear().toString() : ""
            info.append("text").attr("dy", "1.2em").attr("font-size", "12px").attr("fill", "#64748b").text(yob || "Unknown Year")
        }

        // Render Links (Horizontal)
        g.append("g").attr("fill", "none").attr("stroke", "#cbd5e1").attr("stroke-opacity", 0.6).attr("stroke-width", 2)
            .selectAll("path").data(rootNode.links()).join("path")
            .attr("d", d3.linkHorizontal()
                .x((d: any) => d.y) // Swap X/Y for horizontal
                .y((d: any) => d.x) as any
            )

        // Render Nodes
        const nodeSelection = g.append("g").selectAll("g").data(rootNode.descendants()).join("g")
            .attr("transform", (d: any) => `translate(${d.y},${d.x})`) // Swap X/Y
            .attr("cursor", "pointer")
            .on("click", (e, d: any) => {
                const p = persons.find(per => per.id === d.data.name)
                if (p) { setSelectedPerson(p); setModalOpen(true); }
            })

        nodeSelection.each(function (d: any) {
            const p = persons.find(per => per.id === d.data.name)
            renderCardContent(d3.select(this as SVGGElement), p)
        })

        // Render Partners (Slightly offset vertically or horizontally?)
        // In horizontal layout, partners should probably be below or next to the node.
        // Let's put them below (vertically offset in y-axis)
        // Wait, 'y' in D3 horizontal tree is the horizontal axis (depth), 'x' is vertical (breadth).
        // So offset in 'x' puts them below/above. Offset in 'y' puts them next to.

        nodeSelection.each(function (d: any) {
            const p = persons.find(per => per.id === d.data.name)
            if (!p || !p.partnerships) return

            const partnersList: any[] = []
            p.partnerships.forEach(part => {
                const family = families.find(f => f.id === part.familyId)
                if (!family) return
                family.partners.forEach(fp => {
                    if (fp.personId !== p.id) {
                        const partner = persons.find(per => per.id === fp.personId)
                        if (partner) partnersList.push(partner)
                    }
                })
            })

            // Unique partners
            const uniquePartners = Array.from(new Map(partnersList.map(pair => [pair.id, pair])).values())

            uniquePartners.forEach((partner: any, i) => {
                const group = d3.select(this as SVGGElement)
                const offset = 80 * (i + 1) // 80px vertical offset

                // Connector
                group.append("path")
                    .attr("d", `M 0 35 L 0 ${offset - 35}`) // Vertical line down from center
                    .attr("stroke", "#ec4899").attr("stroke-width", 2).attr("stroke-dasharray", "4,4")

                const pGroup = group.append("g")
                    .attr("transform", `translate(0, ${offset})`) // Move down
                    .attr("cursor", "pointer")
                    .on("click", (e) => { e.stopPropagation(); setSelectedPerson(partner); setModalOpen(true); })

                renderCardContent(pGroup, partner)

                // Keep coords for search focus (Swapped)
                partner.xCoords = d.y; // X on screen
                partner.yCoords = d.x + offset; // Y on screen
            })
        })

        // Zoom helper
        const focusOn = (screenX: number, screenY: number) => {
            const svgWidth = svgRef.current?.clientWidth || 1000
            const svgHeight = svgRef.current?.clientHeight || 800
            svg.transition().duration(750).call(
                zoom.transform,
                d3.zoomIdentity.translate(svgWidth / 2, svgHeight / 2).scale(1).translate(-screenX, -screenY)
            )
        }

        // Center Root (y, x) -> (horizontal, vertical)
        focusOn(rootNode.y, rootNode.x)

            ; (window as any).focusHorizontalNode = (id: string) => {
                const target = rootNode.descendants().find((d: any) => d.data.name === id)
                if (target) {
                    focusOn(target.y, target.x) // Swap for focus
                } else {
                    // Check partners
                    // Helper to find partner coordinates manually
                    // Simplified: just try to find primary node
                    const nodes = rootNode.descendants()
                    for (const d of nodes) {
                        const p = persons.find(per => per.id === (d.data as any).name)
                        if (p?.partnerships?.some(part => families.find(f => f.id === part.familyId)?.partners.some(fp => fp.personId === id))) {
                            focusOn(d.y, d.x)
                            break
                        }
                    }
                }
            }

    }, [persons, families, theme])

    return (
        <div className="w-full h-full relative group bg-gradient-to-r from-background to-muted/20">
            {/* Search Box */}
            <div className="absolute top-4 left-4 z-50 w-72">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Cari..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 bg-background/80 backdrop-blur-md border rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    />
                    <svg className="absolute left-3 top-2.5 size-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {searchResults.length > 0 && (
                    <div className="mt-2 bg-background/90 backdrop-blur-md border rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                        {searchResults.map(p => (
                            <button
                                key={p.id}
                                onClick={() => {
                                    (window as any).focusHorizontalNode(p.id)
                                    setSearchQuery("")
                                    setSearchResults([])
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-primary/10 border-b last:border-0 transition-colors"
                            >
                                <p className="text-sm font-semibold">{p.name}</p>
                                <p className="text-[10px] text-muted-foreground uppercase">{p.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}</p>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="w-full h-full overflow-hidden">
                <svg ref={svgRef} className="w-full h-full" />
            </div>

            <PersonDetailModal
                person={selectedPerson}
                open={modalOpen}
                onOpenChange={setModalOpen}
                readOnly={true} // Always read-only
            />
        </div>
    )
}
