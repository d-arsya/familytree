"use client"

import * as React from "react"
import * as d3 from "d3"
import { useTheme } from "next-themes"
import { Person, Family, Partnership } from "@prisma/client"
import { PersonDetailModal } from "./person-detail-modal"
import { findRoots } from "@/lib/tree-utils"

// Types
interface TreePerson extends Person {
    partnerships: (Partnership & { family: Family })[]
    originFamily: Family | null
}

interface StaticTreeProps {
    persons: TreePerson[]
    families: (Family & { partners: (Partnership & { person: Person })[]; children: Person[] })[]
    readOnly?: boolean
}

export function StaticTree({ persons, families, readOnly = false }: StaticTreeProps) {
    const svgRef = React.useRef<SVGSVGElement>(null)
    const { theme } = useTheme()

    // State for modal & UI
    const [selectedPerson, setSelectedPerson] = React.useState<any | null>(null)
    const [modalOpen, setModalOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [searchResults, setSearchResults] = React.useState<any[]>([])

    // Search Logic
    React.useEffect(() => {
        if (searchQuery.length > 2) {
            const query = searchQuery.toLowerCase()
            const filtered = (persons as any[]).filter(p => p.name.toLowerCase().includes(query))
            setSearchResults(filtered)
        } else {
            setSearchResults([])
        }
    }, [searchQuery, persons])

    React.useEffect(() => {
        if (!svgRef.current || persons.length === 0) return

        const svgElement = svgRef.current
        const svgWidth = svgElement.clientWidth || 1200
        const svgHeight = svgElement.clientHeight || 800

        const svg = d3.select(svgRef.current)
        svg.selectAll("*").remove()

        const g = svg.append("g")

        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on("zoom", (e) => {
                g.attr("transform", e.transform)
            })
        svg.call(zoom)

        // Build adjacency list
        const childrenMap = new Map<string, string[]>()
        families.forEach(fam => {
            const parentIds = fam.partners.map((p: any) => p.personId)
            const childIds = fam.children.map((c: any) => c.id)
            parentIds.forEach((pid: any) => {
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
            if (node.children.length === 0) delete node.children
            return node
        }

        const rootsList = findRoots(persons, families)
        if (rootsList.length === 0) return

        const rootNodesData = rootsList.map(root => buildHierarchy(root.id)).filter(Boolean)

        let rootData: any = null
        if (rootNodesData.length === 1) {
            rootData = rootNodesData[0]
        } else {
            rootData = {
                name: "VIRTUAL_ROOT",
                virtual: true,
                children: rootNodesData
            }
        }

        const hierarchy = d3.hierarchy(rootData)
        const treeLayout = d3.tree().nodeSize([500, 240])
        const rootNode = treeLayout(hierarchy)

        // Add defs for filters and patterns
        const defs = svg.append("defs")

        // Shadow Filter
        const shadowFilterId = "card-shadow"
        const filter = defs.append("filter").attr("id", shadowFilterId).attr("x", "-20%").attr("y", "-20%").attr("width", "140%").attr("height", "140%")
        filter.append("feGaussianBlur").attr("in", "SourceAlpha").attr("stdDeviation", "2").attr("result", "blur")
        filter.append("feOffset").attr("in", "blur").attr("dx", "1").attr("dy", "1").attr("result", "offsetBlur")
        const merge = filter.append("feMerge")
        merge.append("feMergeNode").attr("in", "offsetBlur")
        merge.append("feMergeNode").attr("in", "SourceGraphic")

        // Helper to render card content
        const renderCardContent = (sel: d3.Selection<SVGGElement, any, any, any>, p: any, parentId?: string) => {
            sel.append("rect")
                .attr("width", 184)
                .attr("height", 84)
                .attr("x", -92)
                .attr("y", -42)
                .attr("rx", 10)
                .attr("fill", theme === "dark" ? "#1e293b" : "#ffffff")
                .attr("stroke", p?.gender === "MALE" ? "#3b82f6" : p?.gender === "FEMALE" ? "#ec4899" : "#94a3b8")
                .attr("stroke-width", 2)
                .attr("filter", `url(#${shadowFilterId})`)

            const avatar = sel.append("g").attr("transform", "translate(-62, 0)")
            avatar.append("circle").attr("r", 25).attr("fill", theme === "dark" ? "#334155" : "#f1f5f9")

            if (p?.photoUrl) {
                const patternId = `p-${p.id.replace(/[^a-zA-Z0-9]/g, "")}`
                if (!defs.select(`#${patternId}`).size()) {
                    defs.append("pattern")
                        .attr("id", patternId)
                        .attr("width", 1).attr("height", 1).attr("patternContentUnits", "objectBoundingBox")
                        .append("image").attr("xlink:href", p.photoUrl)
                        .attr("width", 1).attr("height", 1).attr("preserveAspectRatio", "xMidYMid slice")
                }
                avatar.append("circle").attr("r", 25).attr("fill", `url(#${patternId})`)
            } else {
                const initials = p?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2) || "?"
                avatar.append("text").attr("text-anchor", "middle").attr("dy", "0.35em").attr("font-size", "14px").attr("font-weight", "bold").attr("fill", "#94a3b8").text(initials)
            }

            const info = sel.append("g").attr("transform", "translate(-25, 0)")
            const nameStr = p?.name || "Unknown"
            const truncatedName = nameStr.length > 20 ? nameStr.substring(0, 18) + "..." : nameStr
            info.append("text").attr("dy", "-0.1em").attr("font-size", "13px").attr("font-weight", "bold").attr("fill", theme === "dark" ? "#f8fafc" : "#0f172a").text(truncatedName)

            let subText = p?.dateOfBirth ? new Date(p.dateOfBirth).getFullYear().toString() : ""
            if (parentId && p.originFamily) {
                const otherParent = p.originFamily.partners.find((part: any) => part.personId !== parentId)?.person
                if (otherParent) {
                    const initials = otherParent.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2)
                    subText += ` (${initials})`
                }
            }
            info.append("text").attr("dy", "1.4em").attr("font-size", "11px").attr("fill", "#64748b").text(subText)

            if (p?.placeOfBirth) {
                const truncatedAddr = p.placeOfBirth.length > 22 ? p.placeOfBirth.substring(0, 20) + "..." : p.placeOfBirth
                info.append("text").attr("dy", "2.8em").attr("font-size", "10px").attr("fill", "#94a3b8").text(truncatedAddr)
            }
        }

        // Render Links
        g.append("g").attr("fill", "none").attr("stroke", "#cbd5e1").attr("stroke-opacity", 0.6).attr("stroke-width", 4)
            .selectAll("path").data(rootNode.links().filter((l: any) => !l.source.data.virtual)).join("path")
            .attr("d", d3.linkVertical().x((d: any) => d.x).y((d: any) => d.y) as any)

        // Render Nodes
        const nodeSelection = g.append("g").selectAll("g").data(rootNode.descendants().filter((d: any) => !d.data.virtual)).join("g")
            .attr("transform", (d: any) => `translate(${d.x},${d.y})`)
            .attr("cursor", "pointer")
            .on("click", (e, d: any) => {
                const p = (persons as any[]).find(per => per.id === d.data.name)
                if (p) { setSelectedPerson(p); setModalOpen(true); }
            })

        nodeSelection.each(function (this: any, d: any) {
            const p = (persons as any[]).find(per => per.id === d.data.name)
            renderCardContent(d3.select(this), p, (d.parent?.data as any)?.name)
        })

        // Render Partners
        nodeSelection.each(function (this: any, d: any) {
            const p = (persons as any[]).find(per => per.id === d.data.name)
            if (!p || !p.partnerships) return

            const partnersList: any[] = []
            p.partnerships.forEach((part: any) => {
                const family = families.find(f => f.id === part.familyId)
                if (!family) return
                family.partners.forEach((fp: any) => {
                    if (fp.personId !== p.id) {
                        const partner = (persons as any[]).find(per => per.id === fp.personId)
                        if (partner) partnersList.push(partner)
                    }
                })
            })

            const uniquePartners = Array.from(new Map(partnersList.map(pair => [pair.id, pair])).values())
            uniquePartners.forEach((partner: any, i) => {
                const group = d3.select(this as SVGGElement)
                const offset = 210 * (i + 1)
                group.append("path").attr("d", `M 92 0 L ${offset - 92} 0`).attr("stroke", "#ec4899").attr("stroke-width", 4).attr("stroke-dasharray", "4,4")
                const pGroup = group.append("g").attr("transform", `translate(${offset}, 0)`).attr("cursor", "pointer")
                    .on("click", (e) => { e.stopPropagation(); setSelectedPerson(partner); setModalOpen(true); })
                renderCardContent(pGroup, partner)
            })
        })

        // Zoom helper
        const focusOn = (x: number, y: number) => {
            svg.transition().duration(750).call(
                zoom.transform,
                d3.zoomIdentity.translate(svgWidth / 2, svgHeight / 2).scale(1).translate(-x, -y)
            )
        }

        // Initial Center
        if (rootData.virtual) {
            const firstChild = rootNode.children?.[0]
            if (firstChild) focusOn(firstChild.x, firstChild.y)
        } else {
            focusOn(rootNode.x, rootNode.y)
        }

        ; (window as any).focusTreeNode = (id: string) => {
            const target = rootNode.descendants().find((d: any) => d.data.name === id)
            if (target) {
                focusOn(target.x, target.y)
            } else {
                const nodes = rootNode.descendants()
                for (const d of nodes) {
                    const p = (persons as any[]).find(per => per.id === (d.data as any).name)
                    if (p?.partnerships?.some((part: any) => families.find(f => f.id === part.familyId)?.partners.some((fp: any) => fp.personId === id))) {
                        focusOn(d.x, d.y)
                        break
                    }
                }
            }
        }

    }, [persons, families, theme])

    return (
        <div className="w-full h-full relative group">
            {/* Search Box */}
            <div className="absolute top-4 left-4 z-50 w-72">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Cari nama..."
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
                                    (window as any).focusTreeNode(p.id)
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
                readOnly={readOnly}
            />
        </div>
    )
}
