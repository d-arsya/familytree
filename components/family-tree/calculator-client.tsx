"use client"

import * as React from "react"
import { SearchIcon, CalculatorIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { calculateRelationship } from "@/lib/relationship"

type PersonSimple = { id: string, name: string, gender?: string | null, fatherId?: string | null, motherId?: string | null, spouseIds?: string[] }

export function CalculatorClient({ people }: { people: PersonSimple[] }) {
    const [personA, setPersonA] = React.useState<string>("")
    const [personB, setPersonB] = React.useState<string>("")
    const [openA, setOpenA] = React.useState(false)
    const [openB, setOpenB] = React.useState(false)
    const [result, setResult] = React.useState<any>(null)

    const handleCalculate = () => {
        if (!personA || !personB) return
        console.log("Calculating relationship between:", personA, personB);
        const res = calculateRelationship(people as any, personA, personB)
        setResult(res)
    }

    const getName = (id: string) => people.find(p => p.id === id)?.name || "Unknown"

    return (
        <div className="space-y-8 max-w-xl mx-auto">
            <div className="grid gap-6">
                {/* Person A Select */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Orang Pertama (A)</label>
                    <Popover open={openA} onOpenChange={setOpenA}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" aria-expanded={openA} className="w-full justify-between">
                                {personA ? getName(personA) : "Pilih Nama..."}
                                <SearchIcon className="ml-2 size-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0">
                            <Command>
                                <CommandInput placeholder="Cari nama..." />
                                <CommandList>
                                    <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                                    <CommandGroup>
                                        {people.map(p => (
                                            <CommandItem
                                                key={p.id}
                                                value={`${p.name}-${p.id}`}
                                                onSelect={() => {
                                                    setPersonA(p.id);
                                                    setOpenA(false);
                                                    setResult(null);
                                                }}
                                            >
                                                {p.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="flex justify-center text-muted-foreground">
                    <p className="text-xs uppercase tracking-widest font-bold">ingin mengecek hubungan dengan</p>
                </div>

                {/* Person B Select */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Orang Kedua (B)</label>
                    <Popover open={openB} onOpenChange={setOpenB}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" aria-expanded={openB} className="w-full justify-between">
                                {personB ? getName(personB) : "Pilih Nama..."}
                                <SearchIcon className="ml-2 size-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0">
                            <Command>
                                <CommandInput placeholder="Cari nama..." />
                                <CommandList>
                                    <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                                    <CommandGroup>
                                        {people.map(p => (
                                            <CommandItem
                                                key={p.id}
                                                value={`${p.name}-${p.id}`}
                                                onSelect={() => {
                                                    setPersonB(p.id);
                                                    setOpenB(false);
                                                    setResult(null);
                                                }}
                                            >
                                                {p.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>

                <Button size="lg" onClick={handleCalculate} disabled={!personA || !personB} className="w-full">
                    <CalculatorIcon className="mr-2 size-5" />
                    Cek Hubungan
                </Button>
            </div>

            {/* Result */}
            {result && (
                <Card className="bg-primary/5 border-primary/20 animate-in fade-in zoom-in-95 duration-300">
                    <CardHeader className="text-center pb-2">
                        <CardDescription>Hubungan antara {getName(personA)} dan {getName(personB)}</CardDescription>
                        <CardTitle className="text-2xl font-bold text-primary">{result.relation}</CardTitle>
                    </CardHeader>
                    {result.commonAncestorName && (
                        <CardContent className="text-center">
                            <p className="text-sm text-muted-foreground">
                                Leluhur Bersama: <span className="font-semibold text-foreground">{result.commonAncestorName}</span>
                            </p>
                        </CardContent>
                    )}
                    {!result.commonAncestorName && result.relation !== "Diri Sendiri" && (
                        <CardContent className="text-center">
                            <p className="text-sm text-yellow-600">
                                Tidak ditemukan jalur hubungan darah langsung yang tercatat.
                            </p>
                        </CardContent>
                    )}
                </Card>
            )}
        </div>
    )
}
