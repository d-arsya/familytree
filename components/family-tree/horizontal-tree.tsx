"use client"

import * as React from "react"
import * as d3 from "d3"
import { useTheme } from "next-themes"
import { Person, Family, Partnership } from "@prisma/client"
import { PersonDetailModal } from "./person-detail-modal"
import { PersonForm } from "./person-form"
import { FilterIcon } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { findRoots } from "@/lib/tree-utils"

// Types (Same as StaticTree)
interface TreePerson extends Person {
    partnerships: (Partnership & { family: Family })[]
    originFamily: Family | null
}

interface HorizontalTreeProps {
    persons: TreePerson[]
    families: (Family & { partners: (Partnership & { person: Person })[]; children: Person[] })[]
    isEditor?: boolean
}

export function HorizontalTree({ persons, families, isEditor = false }: HorizontalTreeProps) {
    const svgRef = React.useRef<SVGSVGElement>(null)
    const { theme } = useTheme()

    // State
    const [selectedPerson, setSelectedPerson] = React.useState<any | null>(null)
    const [modalOpen, setModalOpen] = React.useState(false)
    const [editDialogOpen, setEditDialogOpen] = React.useState(false)
    const [personToEdit, setPersonToEdit] = React.useState<any | null>(null)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [searchResults, setSearchResults] = React.useState<any[]>([])
    const [startDepth, setStartDepth] = React.useState(1)
    const [endDepth, setEndDepth] = React.useState(100)
    const [zoomRef, setZoomRef] = React.useState<any>(null)

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

        const svg = d3.select(svgRef.current)
        svg.selectAll("*").remove()

        const g = svg.append("g")

        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on("zoom", (e) => {
                g.attr("transform", e.transform)
            })
        svg.call(zoom)
        setZoomRef(() => zoom)

        // Build adjacency list
        const childrenMap = new Map<string, string[]>()
        families.forEach(fam => {
            const parentIds = fam.partners.map((p: any) => p.personId)
            const childList = fam.children.sort((a, b) => new Date((a as any).createdAt).getTime() - new Date((b as any).createdAt).getTime())
            const childIds = childList.map((c: any) => c.id)

            parentIds.forEach((pid: any) => {
                const current = childrenMap.get(pid) || []
                childrenMap.set(pid, [...current, ...childIds])
            })
        })

        // Build hierarchy limited by endDepth
        const buildHierarchy = (personId: string, currentDepth: number): any => {
            if (currentDepth > endDepth) return null

            const childrenIds = childrenMap.get(personId) || []
            const uniqueChildren = Array.from(new Set(childrenIds))

            const node: any = {
                name: personId,
                depth: currentDepth,
                children: uniqueChildren.map(childId => buildHierarchy(childId, currentDepth + 1)).filter(Boolean)
            }

            if (node.children.length > 0) {
                node.children.sort((a: any, b: any) => {
                    const pA = (persons as any[]).find(p => p.id === a.name)
                    const pB = (persons as any[]).find(p => p.id === b.name)
                    if (!pA || !pB) return 0
                    return new Date(pA.createdAt).getTime() - new Date(pB.createdAt).getTime()
                })
            } else {
                delete node.children
            }
            return node
        }

        const rootsList = findRoots(persons, families)
        if (rootsList.length === 0) return

        // Build hierarchy for each root found
        const rootNodesData = rootsList.map(root => buildHierarchy(root.id, 1)).filter(Boolean)

        let rootData: any = null
        if (rootNodesData.length === 1) {
            rootData = rootNodesData[0]
        } else if (rootNodesData.length > 1) {
            rootData = {
                name: "VIRTUAL_ROOT",
                virtual: true,
                children: rootNodesData
            }
        } else {
            return
        }

        // Apply depth filtering
        if (rootData && startDepth > 1) {
            const nodesAtStart: any[] = []
            const findAtDepth = (n: any) => {
                if (!n) return
                if (n.depth === startDepth) {
                    nodesAtStart.push(n)
                } else if (n.children) {
                    n.children.forEach((c: any) => findAtDepth(c))
                }
            }
            findAtDepth(rootData)

            if (nodesAtStart.length === 1) {
                rootData = nodesAtStart[0]
            } else if (nodesAtStart.length > 1) {
                rootData = {
                    name: "VIRTUAL_ROOT",
                    virtual: true,
                    children: nodesAtStart
                }
            } else {
                rootData = null
            }
        }

        if (!rootData) return
        const hierarchy = d3.hierarchy(rootData)

        // Horizontal Layout: nodeSize([height, width]) 
        const treeLayout = d3.tree().nodeSize([240, 280])
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
            sel.append("rect")
                .attr("width", 220)
                .attr("height", 70)
                .attr("x", -110)
                .attr("y", -35)
                .attr("rx", 35)
                .attr("fill", theme === "dark" ? "#1e293b" : "#ffffff")
                .attr("stroke", p?.gender === "MALE" ? "#3b82f6" : p?.gender === "FEMALE" ? "#ec4899" : "#94a3b8")
                .attr("stroke-width", 4)
                .attr("filter", `url(#${shadowFilterId})`)

            const avatar = sel.append("g").attr("transform", "translate(-85, 0)")
            avatar.append("circle").attr("r", 28).attr("fill", theme === "dark" ? "#334155" : "#f1f5f9")

            if (p?.photoUrl) {
                const patternId = `ph-${p.id.replace(/[^a-zA-Z0-9]/g, "")}`
                if (!defs.select(`#${patternId}`).size()) {
                    defs.append("pattern")
                        .attr("id", patternId)
                        .attr("width", 1).attr("height", 1).attr("patternContentUnits", "objectBoundingBox")
                        .append("image").attr("xlink:href", p.photoUrl)
                        .attr("width", 1).attr("height", 1).attr("preserveAspectRatio", "xMidYMid slice")
                }
                avatar.append("circle").attr("r", 28).attr("fill", `url(#${patternId})`)
            } else {
                const initials = p?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2) || "?"
                avatar.append("text").attr("text-anchor", "middle").attr("dy", "0.35em").attr("font-size", "14px").attr("font-weight", "bold").attr("fill", "#94a3b8").text(initials)
            }

            const info = sel.append("g").attr("transform", "translate(-45, 0)")
            const nameStr = p?.name || "Unknown"
            let displayName = nameStr
            if (nameStr.length > 25) {
                const parts = nameStr.split(" ")
                displayName = parts.length > 2 ? parts.slice(0, 2).join(" ") + "..." : nameStr.substring(0, 22) + "..."
            }

            info.append("text")
                .attr("dy", "-0.4em")
                .attr("font-size", displayName.length > 18 ? "12px" : "13px")
                .attr("font-weight", "bold")
                .attr("fill", theme === "dark" ? "#f8fafc" : "#0f172a")
                .text(displayName)

            const yob = p?.dateOfBirth ? new Date(p.dateOfBirth).getFullYear().toString() : ""
            const yod = p?.dateOfDeath ? new Date(p.dateOfDeath).getFullYear().toString() : ""
            const dateRange = yod ? `${yob || "?"} - ${yod}` : (yob || "Unknown")

            info.append("text")
                .attr("dy", "1.2em")
                .attr("font-size", "11px")
                .attr("fill", "#64748b")
                .text(dateRange)
        }

        // Render Links
        g.append("g").attr("fill", "none").attr("stroke", "#cbd5e1").attr("stroke-opacity", 0.6).attr("stroke-width", 4)
            .selectAll("path")
            .data(rootNode.links().filter((l: any) => !l.source.data.virtual))
            .join("path")
            .attr("d", d3.linkHorizontal()
                .x((d: any) => d.y)
                .y((d: any) => d.x) as any
            )

        // Render Nodes
        const nodeSelection = g.append("g")
            .selectAll("g")
            .data(rootNode.descendants().filter((d: any) => !d.data.virtual))
            .join("g")
            .attr("transform", (d: any) => `translate(${d.y},${d.x})`)
            .attr("cursor", "pointer")
            .on("click", (e, d: any) => {
                const p = (persons as any[]).find(per => per.id === d.data.name)
                if (p) { setSelectedPerson(p); setModalOpen(true); }
            })

        nodeSelection.each(function (this: any, d: any) {
            const p = (persons as any[]).find(per => per.id === d.data.name)
            renderCardContent(d3.select(this), p)
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
                const offset = 85 * (i + 1)
                group.append("path")
                    .attr("d", `M 0 35 L 0 ${offset - 35}`)
                    .attr("stroke", "#ec4899").attr("stroke-width", 4).attr("stroke-dasharray", "4,4")
                const pGroup = group.append("g")
                    .attr("transform", `translate(0, ${offset})`)
                    .attr("cursor", "pointer")
                    .on("click", (e) => { e.stopPropagation(); setSelectedPerson(partner); setModalOpen(true); })
                renderCardContent(pGroup, partner)
            })
        })

        // Initial Focus
        const focusOn = (screenX: number, screenY: number) => {
            const svgWidth = svgRef.current?.clientWidth || 1000
            const svgHeight = svgRef.current?.clientHeight || 800
            if (zoom) {
                svg.transition().duration(750).call(
                    zoom.transform,
                    d3.zoomIdentity.translate(svgWidth / 2, svgHeight / 2).scale(1).translate(-screenX, -screenY)
                )
            }
        }

        if (rootData.virtual) {
            const firstChild = rootNode.children?.[0]
            if (firstChild) focusOn(firstChild.y, firstChild.x)
        } else {
            focusOn(rootNode.y, rootNode.x)
        }

        ; (window as any).focusHorizontalNode = (id: string) => {
            const target = rootNode.descendants().find((d: any) => d.data.name === id)
            if (target) {
                focusOn(target.y, target.x)
            }
        }

    }, [persons, families, theme, startDepth, endDepth])

    return (
        <div className="w-full h-full relative group bg-gradient-to-r from-background to-muted/20">
            {/* Toolbar */}
            <div className="absolute top-4 left-4 z-50 flex flex-col gap-2">
                <div className="relative w-72 z-10">
                    <input
                        type="text"
                        placeholder={isEditor ? "Cari untuk Edit..." : "Cari..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 bg-background/80 backdrop-blur-md border rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    />
                    <svg className="absolute left-3 top-2.5 size-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>

                    {searchResults.length > 0 && (
                        <div className="absolute top-full mt-2 w-full z-20 bg-background/90 backdrop-blur-md border rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
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

                <div className="relative z-0 bg-background/80 backdrop-blur-md border rounded-xl shadow-lg p-3 flex items-center gap-2">
                    <FilterIcon className="size-4 text-muted-foreground" />
                    <div className="flex items-center gap-2">
                        <Select value={startDepth.toString()} onValueChange={(val) => setStartDepth(Number(val))}>
                            <SelectTrigger className="w-[80px] h-8 border-0 bg-transparent focus:ring-0 font-medium text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(d => (
                                    <SelectItem key={d} value={d.toString()}>Gen {d}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span className="text-xs text-muted-foreground">-</span>
                        <Select value={endDepth.toString()} onValueChange={(val) => setEndDepth(Number(val))}>
                            <SelectTrigger className="w-[80px] h-8 border-0 bg-transparent focus:ring-0 font-medium text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(d => (
                                    <SelectItem key={d} value={d.toString()}>Gen {d}</SelectItem>
                                ))}
                                <SelectItem value="100">Semua</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="w-full h-full overflow-hidden">
                <svg ref={svgRef} className="w-full h-full" />
            </div>

            <PersonDetailModal
                person={selectedPerson}
                open={modalOpen}
                onOpenChange={setModalOpen}
                readOnly={!isEditor}
                onEdit={isEditor ? (id) => {
                    setPersonToEdit(selectedPerson)
                    setEditDialogOpen(true)
                    setModalOpen(false)
                } : undefined}
            />

            {isEditor && personToEdit && (
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Edit Anggota Keluarga</DialogTitle>
                        </DialogHeader>
                        <PersonForm
                            defaultValues={personToEdit}
                            onSuccess={() => {
                                setEditDialogOpen(false)
                                setPersonToEdit(null)
                                window.location.reload()
                            }}
                            onCancel={() => {
                                setEditDialogOpen(false)
                                setPersonToEdit(null)
                            }}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
