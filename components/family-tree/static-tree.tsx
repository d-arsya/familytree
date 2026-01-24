"use client"

import * as React from "react"
import * as d3 from "d3"
import { useTheme } from "next-themes"
import { Person, Family, Partnership } from "@prisma/client"
import { PersonDetailModal } from "./person-detail-modal"

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

    // State for modal
    const [selectedPerson, setSelectedPerson] = React.useState<any | null>(null)
    const [modalOpen, setModalOpen] = React.useState(false)

    // Helper to find root
    const findRoot = () => {
        const roots = persons.filter(p => !p.originFamilyId)
        if (roots.length > 0) {
            return roots.sort((a, b) => {
                const dateA = a.dateOfBirth ? new Date(a.dateOfBirth).getTime() : Infinity
                const dateB = b.dateOfBirth ? new Date(b.dateOfBirth).getTime() : Infinity
                return dateA - dateB
            })[0]
        }
        return persons[0]
    }

    React.useEffect(() => {
        if (!svgRef.current || persons.length === 0) return

        const width = 1200
        const height = 800

        const svg = d3.select(svgRef.current)
        svg.selectAll("*").remove()

        const g = svg.append("g").attr("transform", "translate(40,40)")

        // Add defs for patterns
        const defs = svg.append("defs")

        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 3])
            .on("zoom", (e) => {
                g.attr("transform", e.transform)
            })
        svg.call(zoom)
        svg.call(zoom.translateTo, width / 2, 100)

        const rootPerson = findRoot()
        if (!rootPerson) return

        // Build adjacency list
        const childrenMap = new Map<string, string[]>()
        families.forEach(fam => {
            const parentIds = fam.partners.map(p => p.personId)
            const childIds = fam.children.map(c => c.id)
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
            if (node.children.length === 0) delete node.children
            return node
        }

        const rootData = buildHierarchy(rootPerson.id)
        const hierarchy = d3.hierarchy(rootData)
        const treeLayout = d3.tree().nodeSize([250, 200])
        const rootNode = treeLayout(hierarchy)

        // Helper to render card content (Selection is a single 'g' element)
        const renderCardContent = (sel: d3.Selection<SVGGElement, any, any, any>, p: any, parentId?: string) => {
            // Rect Card
            sel.append("rect")
                .attr("width", 200)
                .attr("height", 80)
                .attr("x", -100)
                .attr("y", -40)
                .attr("rx", 10)
                .attr("fill", theme === "dark" ? "#1e293b" : "#ffffff")
                .attr("stroke", p?.gender === "MALE" ? "#3b82f6" : p?.gender === "FEMALE" ? "#ec4899" : "#94a3b8")
                .attr("stroke-width", 2)
                .attr("filter", "url(#card-shadow)")

            // Avatar Group
            const avatar = sel.append("g").attr("transform", "translate(-65, 0)")

            avatar.append("circle")
                .attr("r", 25)
                .attr("fill", theme === "dark" ? "#334155" : "#f1f5f9")

            if (p?.photoUrl) {
                const patternId = `pattern-${p.id.replace(/[^a-zA-Z0-9]/g, "")}`
                if (!defs.select(`#${patternId}`).size()) {
                    defs.append("pattern")
                        .attr("id", patternId)
                        .attr("width", 1)
                        .attr("height", 1)
                        .attr("patternContentUnits", "objectBoundingBox")
                        .append("image")
                        .attr("xlink:href", p.photoUrl)
                        .attr("width", 1)
                        .attr("height", 1)
                        .attr("preserveAspectRatio", "xMidYMid slice")
                }

                avatar.append("circle")
                    .attr("r", 25)
                    .attr("fill", `url(#${patternId})`)
            } else {
                const initials = p?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2) || "?"
                avatar.append("text")
                    .attr("text-anchor", "middle")
                    .attr("dy", "0.35em")
                    .attr("font-size", "16px")
                    .attr("font-weight", "bold")
                    .attr("fill", "#94a3b8")
                    .text(initials)
            }

            // Info Group
            const info = sel.append("g").attr("transform", "translate(-25, 0)")

            info.append("text")
                .attr("dy", "-0.1em")
                .attr("font-size", "14px")
                .attr("font-weight", "bold")
                .attr("fill", theme === "dark" ? "#f8fafc" : "#0f172a")
                .text(p?.name || "Unknown")

            // Sub-info: Year and (Optional) Other Parent
            let subText = p?.dateOfBirth ? new Date(p.dateOfBirth).getFullYear().toString() : ""

            // If we have a parentId context, find the other parent to disambiguate spouses
            if (parentId && p.originFamily) {
                const otherParent = p.originFamily.partners.find((part: any) => part.personId !== parentId)?.person
                if (otherParent) {
                    const initials = otherParent.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2)
                    subText += ` (${initials})`
                }
            }

            info.append("text")
                .attr("dy", "1.4em")
                .attr("font-size", "12px")
                .attr("fill", "#64748b")
                .text(subText)

            if (p?.placeOfBirth) {
                info.append("text")
                    .attr("dy", "2.8em")
                    .attr("font-size", "10px")
                    .attr("fill", "#94a3b8")
                    .text(p.placeOfBirth.length > 20 ? p.placeOfBirth.substring(0, 18) + "..." : p.placeOfBirth)
            }
        }

        // Add shadow filter to defs
        const shadowFilterId = "card-shadow"
        if (!defs.select(`#${shadowFilterId}`).size()) {
            const filter = defs.append("filter").attr("id", shadowFilterId).attr("x", "-20%").attr("y", "-20%").attr("width", "140%").attr("height", "140%")
            filter.append("feGaussianBlur").attr("in", "SourceAlpha").attr("stdDeviation", "2").attr("result", "blur")
            filter.append("feOffset").attr("in", "blur").attr("dx", "1").attr("dy", "1").attr("result", "offsetBlur")
            const merge = filter.append("feMerge")
            merge.append("feMergeNode").attr("in", "offsetBlur")
            merge.append("feMergeNode").attr("in", "SourceGraphic")
        }

        // Render Links
        g.append("g")
            .attr("fill", "none")
            .attr("stroke", "#cbd5e1")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 2)
            .selectAll("path")
            .data(rootNode.links())
            .join("path")
            .attr("d", d3.linkVertical()
                .x((d: any) => d.x)
                .y((d: any) => d.y) as any
            )

        // Render Nodes
        const nodeSelection = g.append("g")
            .selectAll("g")
            .data(rootNode.descendants())
            .join("g")
            .attr("transform", (d: any) => `translate(${d.x},${d.y})`)
            .attr("cursor", "pointer")
            .on("click", (e, d) => {
                const data = d.data as any
                const p = persons.find(per => per.id === data.name)
                if (p) {
                    setSelectedPerson(p)
                    setModalOpen(true)
                }
            })

        nodeSelection.each(function (d: any) {
            const p = persons.find(per => per.id === d.data.name)
            const parentId = d.parent?.data?.name // Context for "Other Parent" logic
            renderCardContent(d3.select(this), p, parentId)
        })

        // Render Partners
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

            const uniquePartners = Array.from(new Map(partnersList.map(p => [p.id, p])).values())

            uniquePartners.forEach((partner, i) => {
                const group = d3.select(this)
                const offset = 220 * (i + 1)

                group.append("path")
                    .attr("d", `M 100 0 L ${offset - 100} 0`)
                    .attr("stroke", "#ec4899")
                    .attr("stroke-width", 2)
                    .attr("stroke-dasharray", "4,4")

                const pGroup = group.append("g")
                    .attr("transform", `translate(${offset}, 0)`)
                    .attr("cursor", "pointer")
                    .on("click", (e) => {
                        e.stopPropagation()
                        setSelectedPerson(partner)
                        setModalOpen(true)
                    })

                renderCardContent(pGroup, partner)
            })
        })

    }, [persons, families, theme])

    return (
        <>
            <div className="w-full h-full overflow-hidden">
                <svg ref={svgRef} className="w-full h-full" />
            </div>

            <PersonDetailModal
                person={selectedPerson}
                open={modalOpen}
                onOpenChange={setModalOpen}
                readOnly={readOnly}
            />
        </>
    )
}
