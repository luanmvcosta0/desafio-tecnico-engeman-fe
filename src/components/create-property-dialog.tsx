import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { createProperty } from "@/services/propertyService";
import type { Property, PropertyType } from "@/interfaces/Property";

const TYPE_OPTIONS: { value: PropertyType; label: string }[] = [
  { value: "HOUSE", label: "Casa" },
  { value: "CONDOMINIUM", label: "Condomínio" },
  { value: "BUILDING", label: "Prédio" },
];

export function CreatePropertyDialog({
  onCreated,
}: {
  onCreated: (property: Property) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [rooms, setRooms] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState<PropertyType | "">("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function resetForm() {
    setName("");
    setRooms("");
    setPrice("");
    setType("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!type) {
      setError("Selecione o tipo do imóvel.");
      return;
    }

    setSubmitting(true);
    try {
      const created = await createProperty({
        name,
        rooms: Number(rooms),
        price: Number(price),
        type,
      });
      onCreated(created);
      setOpen(false);
      resetForm();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Preencha os campos corretamente",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button>Novo imóvel</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar imóvel</DialogTitle>
          <DialogDescription>
            Preencha os dados do imóvel para cadastrá-lo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nome</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="Edifício Vista Mar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="rooms">Quartos</FieldLabel>
              <Input
                id="rooms"
                type="number"
                min={1}
                step={1}
                placeholder="3"
                value={rooms}
                onChange={(e) => setRooms(e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="price">Preço</FieldLabel>
              <Input
                id="price"
                type="number"
                min={0.01}
                step={0.01}
                placeholder="350000.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="type">Tipo</FieldLabel>
              <NativeSelect
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as PropertyType)}
              >
                <NativeSelectOption value="">
                  Selecione uma opção
                </NativeSelectOption>
                {TYPE_OPTIONS.map((option) => (
                  <NativeSelectOption key={option.value} value={option.value}>
                    {option.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
