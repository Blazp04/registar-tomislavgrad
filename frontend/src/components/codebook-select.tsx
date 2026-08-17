import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { useCodebooks, useSuggestCodebook, type CodebookItem, type CodebookType } from "@/services/codebooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function CodebookSelect({ type, label, value, onChange, required = false, placeholder = "Odaberite" }: { type: CodebookType; label: string; value: string | null; onChange: (value: string | null) => void; required?: boolean; placeholder?: string }) {
  const { data: remoteItems = [] } = useCodebooks(type);
  const suggest = useSuggestCodebook();
  const [other, setOther] = useState(false);
  const [name, setName] = useState("");
  const [localSuggestion, setLocalSuggestion] = useState<CodebookItem | null>(null);
  const items = localSuggestion && !remoteItems.some((item) => item.id === localSuggestion.id)
    ? [...remoteItems, localSuggestion]
    : remoteItems;

  const addSuggestion = async () => {
    if (name.trim().length < 2) return;
    const item = await suggest.mutateAsync({ type, name: name.trim() });
    setLocalSuggestion(item);
    onChange(item.id);
    setOther(false);
    setName("");
  };

  return <div className="space-y-2">
    <Label>{label}{required ? " *" : " (neobavezno)"}</Label>
    <Select value={other ? "__other" : value ?? ""} onValueChange={(selected) => { if (selected === "__other") { setOther(true); onChange(null); } else { setOther(false); onChange(selected); } }}>
      <SelectTrigger className="w-full"><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>{items.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}{item.isOfficial ? "" : " (čeka provjeru)"}</SelectItem>)}<SelectItem value="__other">Nije na popisu</SelectItem></SelectContent>
    </Select>
    {other && <div className="flex gap-2"><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Unesite vrijednost" /><Button type="button" variant="outline" onClick={addSuggestion} disabled={suggest.isPending || name.trim().length < 2}><PlusIcon className="h-4 w-4" /> Dodaj</Button></div>}
    {value && items.find((item) => item.id === value)?.isOfficial === false && <p className="text-xs text-amber-700">Vrijednost čeka administrativnu provjeru.</p>}
  </div>;
}
