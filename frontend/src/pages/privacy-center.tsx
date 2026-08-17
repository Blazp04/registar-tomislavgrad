import { useMemo, useState } from "react";
import { DownloadIcon, FilePenLineIcon, Trash2Icon } from "lucide-react";
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
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
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
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Privatnost</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upravljajte obavijestima, preuzmite podatke ili pošaljite zahtjev.
        </p>
      </header>

      <section aria-labelledby="privacy-settings-heading">
        <div className="mb-3">
          <h2 id="privacy-settings-heading" className="font-semibold">
            Postavke
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Odaberite želite li primati neobavezne obavijesti o registru.
          </p>
        </div>

        <label className="flex cursor-pointer items-start justify-between gap-6 rounded-xl border bg-white p-4">
          <span>
            <span className="block text-sm font-medium">
              Neobavezne obavijesti
            </span>
            <span className="mt-1 block text-sm leading-5 text-muted-foreground">
              Ovu privolu možete promijeniti u bilo kojem trenutku.
            </span>
          </span>
          <Checkbox
            className="mt-0.5"
            checked={optionalAccepted}
            disabled={consent.isPending}
            onCheckedChange={(value) => consent.mutate(value === true)}
          />
        </label>
        <p className="mt-2 text-xs text-muted-foreground">
          Uvjeti korištenja i politika privatnosti prihvaćeni su pri registraciji.
        </p>
      </section>

      <section aria-labelledby="privacy-actions-heading">
        <div className="mb-3">
          <h2 id="privacy-actions-heading" className="font-semibold">
            Podaci i zahtjevi
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Preuzmite kopiju svojih podataka ili zatražite postupanje administracije.
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 sm:flex-row sm:items-center">
          <Button variant="outline" onClick={() => downloadOwnData()}>
            <DownloadIcon />
            Preuzmi moje podatke
          </Button>

          <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
            <DialogTrigger asChild>
              <Button>
                <FilePenLineIcon />
                Novi zahtjev
              </Button>
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

      {data.dataRequests.length > 0 && (
        <section aria-labelledby="my-requests-heading">
          <h2 id="my-requests-heading" className="mb-3 font-semibold">
            Moji zahtjevi
          </h2>
          <div className="divide-y rounded-xl border bg-white">
            {data.dataRequests.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 p-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{requestLabels[item.type]}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString("hr-HR")}
                    {item.resolutionNote ? ` · ${item.resolutionNote}` : ""}
                  </p>
                </div>
                <Badge variant="secondary">{statusLabels[item.status]}</Badge>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="border-t pt-5" aria-labelledby="deactivation-heading">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="deactivation-heading" className="text-sm font-medium">
              Deaktivacija računa
            </h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Onemogućuje prijavu, ali ne briše podatke iz registra.
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="self-start text-destructive hover:bg-destructive/10 hover:text-destructive sm:self-auto"
            disabled={deactivate.isPending}
            onClick={deactivateAccount}
          >
            <Trash2Icon />
            Deaktiviraj račun
          </Button>
        </div>
      </section>
    </div>
  );
}
