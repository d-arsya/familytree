"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2Icon } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createPerson, updatePerson, PersonInput } from "@/lib/actions/person"
import { toast } from "sonner"

// Extended schema to include all fields requested
const formSchema = z.object({
    name: z.string().min(1, "Nama harus diisi"),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    dateOfBirth: z.string().optional().nullable(), // input date returns string
    placeOfBirth: z.string().optional().nullable(),
    dateOfDeath: z.string().optional().nullable(),
    placeOfDeath: z.string().optional().nullable(),
    bio: z.string().optional().nullable(),
    photoUrl: z.string().optional().or(z.literal("")),
    fatherId: z.string().optional(),
    motherId: z.string().optional(),
    spouseId: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface PersonFormProps {
    defaultValues?: Partial<PersonInput> & { id?: string }
    onSuccess?: () => void
    onCancel?: () => void
}

export function PersonForm({ defaultValues, onSuccess, onCancel }: PersonFormProps) {
    const isEdit = !!defaultValues?.id
    const [isPending, startTransition] = React.useTransition()
    const [citiesData, setCitiesData] = React.useState<Record<string, string[]>>({})
    const [selectedProvinceBirth, setSelectedProvinceBirth] = React.useState<string>("")
    const [selectedProvinceDeath, setSelectedProvinceDeath] = React.useState<string>("")

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: defaultValues?.name || "",
            gender: defaultValues?.gender || undefined,
            dateOfBirth: defaultValues?.dateOfBirth ? format(new Date(defaultValues.dateOfBirth), "yyyy-MM-dd") : "",
            placeOfBirth: defaultValues?.placeOfBirth || "",
            dateOfDeath: defaultValues?.dateOfDeath ? format(new Date(defaultValues.dateOfDeath), "yyyy-MM-dd") : "",
            placeOfDeath: defaultValues?.placeOfDeath || "",
            bio: defaultValues?.bio || "",
            photoUrl: defaultValues?.photoUrl || "",
            fatherId: (defaultValues as any)?.fatherId || (defaultValues as any)?.originFamily?.partners?.find((p: any) => p.role === "HUSBAND")?.personId || undefined,
            motherId: (defaultValues as any)?.motherId || (defaultValues as any)?.originFamily?.partners?.find((p: any) => p.role === "WIFE")?.personId || undefined,
            spouseId: (defaultValues as any)?.spouseId || (defaultValues as any)?.partnerships?.[0]?.family?.partners?.find((p: any) => p.personId !== (defaultValues as any).id)?.personId || undefined,
        },
    })

    // Load cities data
    React.useEffect(() => {
        fetch('/cities.json')
            .then(res => res.json())
            .then(data => setCitiesData(data))
            .catch(err => console.error('Failed to load cities:', err))
    }, [])

    // Update form when defaultValues change (essential for Modal/Sheet reuse)
    React.useEffect(() => {
        if (defaultValues) {
            form.reset({
                name: defaultValues.name || "",
                gender: defaultValues.gender || undefined,
                dateOfBirth: defaultValues.dateOfBirth ? format(new Date(defaultValues.dateOfBirth), "yyyy-MM-dd") : "",
                placeOfBirth: defaultValues.placeOfBirth || "",
                dateOfDeath: defaultValues.dateOfDeath ? format(new Date(defaultValues.dateOfDeath), "yyyy-MM-dd") : "",
                placeOfDeath: defaultValues.placeOfDeath || "",
                bio: defaultValues.bio || "",
                photoUrl: defaultValues.photoUrl || "",
                fatherId: (defaultValues as any).fatherId || (defaultValues as any).originFamily?.partners?.find((p: any) => p.role === "HUSBAND")?.personId || undefined,
                motherId: (defaultValues as any).motherId || (defaultValues as any).originFamily?.partners?.find((p: any) => p.role === "WIFE")?.personId || undefined,
                spouseId: (defaultValues as any).spouseId || (defaultValues as any).partnerships?.[0]?.family?.partners?.find((p: any) => p.personId !== (defaultValues as any).id)?.personId || undefined,
            })
            setPhotoPreview(defaultValues.photoUrl || "")

            // Attempt to find and set province based on city
            if (Object.keys(citiesData).length > 0) {
                if (defaultValues.placeOfBirth) {
                    const prov = Object.keys(citiesData).find(p => citiesData[p].includes(defaultValues.placeOfBirth!))
                    if (prov) setSelectedProvinceBirth(prov)
                }
                if (defaultValues.placeOfDeath) {
                    const prov = Object.keys(citiesData).find(p => citiesData[p].includes(defaultValues.placeOfDeath!))
                    if (prov) setSelectedProvinceDeath(prov)
                }
            }
        }
    }, [defaultValues, form, citiesData])

    const [photoPreview, setPhotoPreview] = React.useState(defaultValues?.photoUrl || "")
    const [peopleList, setPeopleList] = React.useState<{ id: string, name: string, gender: string | null, dateOfBirth: string | null }[]>([])

    // Fetch list of people for select options
    React.useEffect(() => {
        import("@/lib/actions/person").then(mod => {
            mod.getPeopleList().then(data => setPeopleList(data))
        })
    }, [])

    // Filtering Helpers
    const currentDob = form.watch("dateOfBirth") ? new Date(form.watch("dateOfBirth")!) : null
    const currentGender = form.watch("gender")

    const getOlderPeople = (gender?: "MALE" | "FEMALE") => {
        return peopleList.filter(p => {
            // Exclude self
            if (p.id === defaultValues?.id) return false
            // Gender check
            if (gender && p.gender !== gender) return false
            // Age check: parent should be older (born BEFORE child)
            if (currentDob && p.dateOfBirth) {
                const parentDob = new Date(p.dateOfBirth)
                if (parentDob >= currentDob) return false // Parent born after/same as child -> invalid
            }
            return true
        })
    }

    const getPotentialSpouses = () => {
        return peopleList.filter(p => {
            if (p.id === defaultValues?.id) return false
            // Different gender (Heteronormative as requested)
            if (currentGender && p.gender && p.gender === currentGender) return false
            return true
        })
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const formData = new FormData()
        formData.append("file", file)

        // Upload
        const { uploadFile } = await import("@/lib/actions/upload")
        const res = await uploadFile(formData)

        if (res.error) {
            toast.error("Gagal mengupload foto")
        } else if (res.url) {
            setPhotoPreview(res.url)
            form.setValue("photoUrl", res.url)
        }
    }

    const onSubmit = (data: FormData) => {
        startTransition(async () => {
            const payload: any = {
                ...data,
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
                dateOfDeath: data.dateOfDeath ? new Date(data.dateOfDeath) : null,
            }

            // Include relationship IDs if they exist in form data (we need to typesafe this)
            // Using 'any' for payload temporarily as we extend the form schema dynamically
            const extData = data as any
            if (extData.fatherId) payload.fatherId = extData.fatherId
            if (extData.motherId) payload.motherId = extData.motherId
            if (extData.spouseId) payload.spouseId = extData.spouseId

            let result
            if (isEdit && defaultValues?.id) {
                result = await updatePerson(defaultValues.id, payload)
            } else {
                result = await createPerson(payload)
            }

            if (result.error) {
                toast.error(isEdit ? "Gagal mengubah data" : "Gagal menambahkan data")
                return
            }

            toast.success(isEdit ? "Data berhasil diubah" : "Data berhasil ditambahkan")
            onSuccess?.()
        })
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap *</Label>
                <Input id="name" {...form.register("name")} placeholder="Nama Lengkap" />
                {form.formState.errors.name && (
                    <p className="text-xs text-destructive">{form.formState.errors.name?.message}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Jenis Kelamin</Label>
                    <Select
                        value={form.watch("gender") || undefined}
                        onValueChange={(val) => form.setValue("gender", val as any)}
                    >
                        <SelectTrigger className="h-9 w-full">
                            <SelectValue placeholder="Pilih..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="MALE">Laki-laki</SelectItem>
                            <SelectItem value="FEMALE">Perempuan</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                    <Label>Foto</Label>
                    <div className="flex items-center gap-2">
                        {photoPreview && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={photoPreview} alt="Preview" className="size-10 rounded-full object-cover border" />
                        )}
                        <Input type="file" onChange={handleFileChange} accept="image/*" className="text-xs" />
                        <input type="hidden" {...form.register("photoUrl")} />
                    </div>
                </div>
            </div>

            {/* Relationship Section */}
            <div className="space-y-3 border-t pt-4">
                <p className="text-sm font-medium">Hubungan Keluarga (Opsional)</p>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Ayah</Label>
                        <Select
                            value={form.watch("fatherId") || undefined}
                            onValueChange={(v) => form.setValue("fatherId", v)}
                        >
                            <SelectTrigger className="h-9 w-full"><SelectValue placeholder="Pilih Ayah" /></SelectTrigger>
                            <SelectContent>
                                {getOlderPeople("MALE").map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.dateOfBirth ? p.dateOfBirth.substring(0, 4) : '?'})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Ibu</Label>
                        <Select
                            value={form.watch("motherId") || undefined}
                            onValueChange={(v) => form.setValue("motherId", v)}
                        >
                            <SelectTrigger className="h-9 w-full"><SelectValue placeholder="Pilih Ibu" /></SelectTrigger>
                            <SelectContent>
                                {getOlderPeople("FEMALE").map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.dateOfBirth ? p.dateOfBirth.substring(0, 4) : '?'})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Pasangan</Label>
                    <Select
                        value={form.watch("spouseId") || undefined}
                        onValueChange={(v) => form.setValue("spouseId", v)}
                    >
                        <SelectTrigger className="h-9 w-full"><SelectValue placeholder="Pilih Pasangan" /></SelectTrigger>
                        <SelectContent>
                            {getPotentialSpouses().map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Data Kelahiran */}
            <div className="border-t pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">

                    <div className="space-y-2">
                        <Label>Provinsi</Label>
                        <Select value={selectedProvinceBirth} onValueChange={setSelectedProvinceBirth}>
                            <SelectTrigger className="h-9 w-full">
                                <SelectValue placeholder="Pilih Provinsi..." />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.keys(citiesData).sort().map((prov, i) => (
                                    <SelectItem key={i} value={prov}>{prov}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Alamat (Kota)</Label>
                        <Select
                            value={form.watch("placeOfBirth") || ""}
                            onValueChange={(val) => form.setValue("placeOfBirth", val)}
                            disabled={!selectedProvinceBirth}
                        >
                            <SelectTrigger className="h-9 w-full">
                                <SelectValue placeholder="Pilih Kota..." />
                            </SelectTrigger>
                            <SelectContent>
                                {(citiesData[selectedProvinceBirth] || []).sort().map((city, i) => (
                                    <SelectItem key={i} value={city}>{city}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Tanggal Lahir</Label>
                        <Input type="date" {...form.register("dateOfBirth")} className="h-9" />
                    </div>
                    <div className="space-y-2">
                        <Label>Tanggal Wafat</Label>
                        <Input type="date" {...form.register("dateOfDeath")} className="h-9" />
                    </div>
                </div>
            </div>

            <div className="space-y-2 border-t pt-4">
                <Label>Biografi Singkat</Label>
                <Textarea {...form.register("bio")} placeholder="Catatan tambahan..." />
            </div>

            <div className="flex justify-end gap-2 pt-4">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
                        Batal
                    </Button>
                )}
                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2Icon className="mr-2 size-4 animate-spin" />}
                    {isEdit ? "Simpan Perubahan" : "Tambah Orang"}
                </Button>
            </div>
        </form>
    )
}
