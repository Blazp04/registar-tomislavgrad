import { useState } from "react"
import { useCodebooks, useCreateCodebook, useDeleteCodebook, useUpdateCodebook, type CodebookType } from "@/services/codebooks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusIcon, TrashIcon, PencilIcon } from "lucide-react"

const codebookTabs: { type: CodebookType; label: string }[] = [
  { type: "faculty", label: "Fakulteti" },
  { type: "field_of_study", label: "Smjerovi" },
  { type: "high_school_profession", label: "Struke" },
  { type: "city", label: "Gradovi" },
]

function CodebookTab({ type }: { type: CodebookType }) {
  const { data: items, isPending } = useCodebooks(type)
  const createCodebook = useCreateCodebook()
  const deleteCodebook = useDeleteCodebook()
  const updateCodebook = useUpdateCodebook()

  const [addOpen, setAddOpen] = useState(false)
  const [addName, setAddName] = useState("")

  const [editOpen, setEditOpen] = useState(false)
  const [editId, setEditId] = useState("")
  const [editName, setEditName] = useState("")

  const handleAdd = async () => {
    if (!addName.trim()) return
    await createCodebook.mutateAsync({ type, name: addName.trim() })
    setAddName("")
    setAddOpen(false)
  }

  const handleEdit = async () => {
    if (!editName.trim() || !editId) return
    await updateCodebook.mutateAsync({ id: editId, name: editName.trim() })
    setEditOpen(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Jeste li sigurni da želite obrisati ovu stavku?")) return
    await deleteCodebook.mutateAsync(id)
  }

  const openEdit = (id: string, name: string) => {
    setEditId(id)
    setEditName(name)
    setEditOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <PlusIcon className="mr-1 h-4 w-4" />
          Dodaj
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Naziv</TableHead>
              <TableHead className="w-[100px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-8">
                  <div className="h-6 w-6 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </TableCell>
              </TableRow>
            ) : !items?.length ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                  Nema stavki
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(item.id!, item.name!)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id!)}
                        className="text-destructive"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodaj stavku</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Naziv"
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Odustani</Button>
            <Button onClick={handleAdd} disabled={createCodebook.isPending || !addName.trim()}>
              {createCodebook.isPending ? "Spremam..." : "Spremi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uredi stavku</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Naziv"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleEdit()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Odustani</Button>
            <Button onClick={handleEdit} disabled={updateCodebook.isPending || !editName.trim()}>
              {updateCodebook.isPending ? "Spremam..." : "Spremi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function CodebooksPage() {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="faculty">
        <TabsList>
          {codebookTabs.map((tab) => (
            <TabsTrigger key={tab.type} value={tab.type}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {codebookTabs.map((tab) => (
          <TabsContent key={tab.type} value={tab.type}>
            <CodebookTab type={tab.type} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
