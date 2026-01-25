import { PrismaClient, Gender, PartnerRole } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

async function main() {
    console.log('Cleaning database...')
    await prisma.partnership.deleteMany()
    await prisma.person.deleteMany()
    await prisma.family.deleteMany()

    console.log('Seeding 8 generations (Limit < 100 people)...')

    let totalPeople = 0
    const MAX_PEOPLE = 95 // Target just under 100

    // Helper to create a person using Faker
    async function createFakePerson(gender: Gender, birthYear: number, originFamilyId?: string) {
        if (totalPeople >= MAX_PEOPLE) return null

        const firstName = gender === 'MALE' ? faker.person.firstName('male') : faker.person.firstName('female')
        const lastName = faker.person.lastName()
        const birthDate = new Date(`${birthYear}-${faker.number.int({ min: 1, max: 12 })}-${faker.number.int({ min: 1, max: 28 })}`)

        // Random death date for older generations
        let deathDate: Date | null = null
        if (birthYear < 1970 && Math.random() > 0.6) {
            deathDate = new Date(`${birthYear + faker.number.int({ min: 60, max: 90 })}-01-01`)
        }

        const person = await prisma.person.create({
            data: {
                name: `${firstName} ${lastName}`,
                gender,
                dateOfBirth: birthDate,
                dateOfDeath: deathDate,
                placeOfBirth: faker.location.city(),
                bio: faker.person.bio(),
                photoUrl: faker.image.avatar(),
                originFamilyId
            }
        })
        totalPeople++
        return person
    }

    // Initial Root Couple (Gen 1)
    const rootMale = await createFakePerson('MALE', 1880)
    const rootFemale = await createFakePerson('FEMALE', 1885)

    if (!rootMale || !rootFemale) return

    const rootFamily = await prisma.family.create({
        data: {
            partners: {
                create: [
                    { personId: rootMale.id, role: 'HUSBAND' },
                    { personId: rootFemale.id, role: 'WIFE' }
                ]
            }
        }
    })

    let currentGenFamilies = [rootFamily.id]

    for (let gen = 2; gen <= 8; gen++) {
        const nextGenFamilies: string[] = []
        const birthYearBase = 1880 + (gen - 1) * 20 // Approx 20 years per generation

        for (const parentFamilyId of currentGenFamilies) {
            // Limit children to stay under MAX_PEOPLE
            // To reach 8 generations with ~100 people, we need a narrow tree.
            // Average children per family should be 1-2.
            const numChildren = Math.random() > 0.7 ? 2 : 1

            for (let i = 0; i < numChildren; i++) {
                if (totalPeople >= MAX_PEOPLE) break

                const gender: Gender = Math.random() > 0.5 ? 'MALE' : 'FEMALE'
                const child = await createFakePerson(gender, birthYearBase + faker.number.int({ min: 0, max: 10 }), parentFamilyId)

                if (!child) break

                // Add spouse for non-last generation if we have space
                if (gen < 8 && totalPeople < MAX_PEOPLE) {
                    const spouseGender: Gender = gender === 'MALE' ? 'FEMALE' : 'MALE'
                    const spouse = await createFakePerson(spouseGender, birthYearBase + faker.number.int({ min: 0, max: 10 }))

                    if (spouse) {
                        const newFamily = await prisma.family.create({
                            data: {
                                partners: {
                                    create: [
                                        { personId: child.id, role: gender === 'MALE' ? 'HUSBAND' : 'WIFE' },
                                        { personId: spouse.id, role: spouseGender === 'MALE' ? 'HUSBAND' : 'WIFE' }
                                    ]
                                }
                            }
                        })
                        nextGenFamilies.push(newFamily.id)
                    }
                }
            }
        }

        currentGenFamilies = nextGenFamilies
        if (totalPeople >= MAX_PEOPLE) break
    }

    console.log(`Seeding completed. Total people: ${totalPeople}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
