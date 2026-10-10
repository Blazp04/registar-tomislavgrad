import { useMemo, useState } from "react";
import { BellIcon, DownloadIcon, FilePenLineIcon, InboxIcon, PowerIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { useLogout } from "@/services/auth";
import {
  downloadOwnData,
  useCreateDataRequest,
  useDeactivateAccount,
  useProfile,
  useRecordConsent,
  type DataRequest,
} from "@/services/registry";
import { IconTile, PageHeader, Spinner } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const requestLabels: Record<DataRequest["type"], string> = {
  correction: "Ispravak podataka",
  export: "Službeni izvoz",
  restriction: "Ograničenje obrade",
  deletion: "Brisanje podataka",
};

const statusVariants: Record<DataRequest["status"], "neutral" | "info" | "success" | "destructive"> = {
  submitted: "neutral",
  in_review: "info",
  completed: "success",
  rejected: "destructive",
};

const statusLabels: Record<DataRequest["status"], string> = {
  submitted: "Zaprimljen",
  in_review: "U obradi",
  completed: "Dovršen",
  rejected: "Odbijen",
};

export default function PrivacyCenterPage() {
  const { data, isPending } = useProfile();
  const consent = useRecordConsent();
  const createRequest = useCreateDataRequest();
  const deactivate = useDeactivateAccount();
  const logout = useLogout();
  const navigate = useNavigate();
  const [requestOpen, setRequestOpen] = useState(false);
  const [type, setType] = useState<DataRequest["type"]>("correction");
  const [details, setDetails] = useState("");
  const latestOptional = useMemo(
    () => data?.consents.find((item) => item.type === "optional_updates"),
    [data],
  );

  if (isPending || !data) {
    return <Spinner className="min-h-[40vh]" />;
  }

  const optionalAccepted =
    latestOptional?.accepted === true && !latestOptional.withdrawnAt;

  const submitRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await createRequest.mutateAsync({ type, details: details || null });
    setDetails("");
    setRequestOpen(false);
  };

  const deactivateAccount = async () => {
    if (
      !confirm(
        "Deaktivirati račun? Nakon odjave više se nećete moći prijaviti bez pomoći administracije.",
      )
    ) {
      return;
    }

    await deactivate.mutateAsync();
    await logout.mutateAsync();
    navigate("/");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Privatnost"
        description="Upravljajte obavijestima, preuzmite podatke ili pošaljite zahtjev administraciji."
      />

      <section aria-labelledby="privacy-settings-heading" className="rounded-xl border bg-card">
        <div className="border-b px-5 py-4">
          <h2 id="privacy-settings-heading" className="font-semibold">Postavke</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Odaberite želite li primati neobavezne obavijesti o registru.</p>
        </div>
        <label className="flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/40">
          <IconTile tone="navy"><BellIcon /></IconTile>
          <span className="flex-1">
            <span className="block text-sm font-medium">Neobavezne obavijesti</span>
            <span className="mt-0.5 block text-sm leading-5 text-muted-foreground">Ovu privolu možete promijeniti u bilo kojem trenutku.</span>
          </span>
          <Checkbox
            className="size-5"
            checked={optionalAccepted}
            disabled={consent.isPending}
            onCheckedChange={(value) => consent.mutate(value === true)}
          />
        </label>
        <p className="rounded-b-2xl border-t bg-muted/40 px-5 py-3 text-xs text-muted-foreground">
          Uvjeti korištenja i politika privatnosti prihvaćeni su pri registraciji.
        </p>
      </section>

      <section aria-labelledby="privacy-actions-heading">
        <div className="mb-3">
          <h2 id="privacy-actions-heading" className="font-semibold">Podaci i zahtjevi</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Preuzmite kopiju svojih podataka ili zatražite postupanje administracije.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => downloadOwnData()}
            className="group flex items-center gap-4 rounded-xl border bg-card p-4 text-left transition-colors hover:border-foreground/20 hover:bg-muted/40"
          >
            <IconTile tone="navy"><DownloadIcon /></IconTile>
            <span>
              <span className="block font-medium">Preuzmi moje podatke</span>
              <span className="block text-xs text-muted-foreground">Kopija profila u strojno čitljivom obliku</span>
            </span>
          </button>

          <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="group flex items-center gap-4 rounded-xl border bg-card p-4 text-left transition-colors hover:border-foreground/20 hover:bg-muted/40"
              >
                <IconTile tone="brand"><FilePenLineIcon /></IconTile>
                <span>
                  <span className="block font-medium">Novi zahtjev</span>
                  <span className="block text-xs text-muted-foreground">Ispravak, izvoz, ograničenje ili brisanje</span>
                </span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Pošaljite zahtjev</DialogTitle>
                <DialogDescription>
                  Zahtjev će biti evidentiran i proslijeđen administraciji na obradu.
                </DialogDescription>
              </DialogHeader>

              <form id="privacy-request-form" className="space-y-4" onSubmit={submitRequest}>
                <div className="space-y-2">
                  <Label>Vrsta zahtjeva</Label>
                  <Select
                    value={type}
                    onValueChange={(value) =>
                      setType(value as DataRequest["type"])
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(requestLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="details">Obrazloženje (neobavezno)</Label>
                  <Textarea
                    id="details"
                    value={details}
                    onChange={(event) => setDetails(event.target.value)}
                    placeholder="Dodajte detalje koji će pomoći pri obradi zahtjeva"
                  />
                </div>
              </form>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRequestOpen(false)}
                >
                  Odustani
                </Button>
                <Button
                  type="submit"
                  form="privacy-request-form"
                  disabled={createRequest.isPending}
                >
                  {createRequest.isPending ? "Slanje..." : "Pošalji zahtjev"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <section aria-labelledby="my-requests-heading">
        <h2 id="my-requests-heading" className="mb-3 font-semibold">
          Moji zahtjevi
        </h2>
        {data.dataRequests.length > 0 ? (
          <div className="divide-y rounded-xl border bg-card">
            {data.dataRequests.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{requestLabels[item.type]}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString("hr-HR")}
                    {item.resolutionNote ? ` · ${item.resolutionNote}` : ""}
                  </p>
                </div>
                <Badge variant={statusVariants[item.status]}>{statusLabels[item.status]}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-dashed px-5 py-4 text-sm text-muted-foreground">
            <InboxIcon className="size-4" /> Još niste poslali nijedan zahtjev.
          </div>
        )}
      </section>

      <section className="rounded-xl border p-5" aria-labelledby="deactivation-heading">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="deactivation-heading" className="text-sm font-semibold">
              Deaktivacija računa
            </h2>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              Onemogućuje prijavu, ali ne briše podatke iz registra.
            </p>
          </div>
          <Button
            variant="destructive"
            className="self-start sm:self-auto"
            disabled={deactivate.isPending}
            onClick={deactivateAccount}
          >
            <PowerIcon />
            Deaktiviraj račun
          </Button>
        </div>
      </section>
    </div>
  );
}
