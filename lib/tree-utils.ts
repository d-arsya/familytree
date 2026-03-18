import * as d3 from "d3"

// Helper to find all roots for a forest-style tree
export const findRoots = (persons: any[], families: any[]) => {
    if (persons.length === 0) return []

    // A person is a root if they have no registered origin family (parents)
    const allPotentialRoots = persons.filter(p => !p.originFamilyId)
    const roots: any[] = []
    const processed = new Set<string>()

    // Sort by creation date for consistency
    const sorted = [...allPotentialRoots].sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )

    sorted.forEach(p => {
        if (processed.has(p.id)) return

        // SMARTER ROOT CHECK:
        // A person is a true root if they have no parents AND:
        // They are not married to someone who actually HAS parents in the tree.
        // (If they are married to an "in-tree" person, they will be discovered as a partner/spouse).
        let hasSpouseWithParents = false
        if (p.partnerships) {
            p.partnerships.forEach((part: any) => {
                const fam = families.find(f => f.id === part.familyId)
                if (fam) {
                    fam.partners.forEach((partner: any) => {
                        if (partner.personId !== p.id) {
                            const spouse = persons.find(per => per.id === partner.personId)
                            if (spouse?.originFamilyId) {
                                hasSpouseWithParents = true
                            }
                        }
                    })
                }
            })
        }

        if (hasSpouseWithParents) {
            // This person is an "outsider" who married into an existing branch.
            // We don't want them as a separate root.
            processed.add(p.id)
            return
        }

        roots.push(p)
        processed.add(p.id)

        // Mark all partners of this root as processed to avoid double branches for couples
        if (p.partnerships) {
            p.partnerships.forEach((part: any) => {
                const fam = families.find(f => f.id === part.familyId)
                fam?.partners.forEach((partner: any) => {
                    if (partner.personId) processed.add(partner.personId)
                })
            })
        }
    })

    return roots
}
