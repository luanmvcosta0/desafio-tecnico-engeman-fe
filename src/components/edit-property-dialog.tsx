import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";
import { updateProperty } from "@/services/propertyService";
import type { Property, PropertyType } from "@/interfaces/Property";

const TYPE_OPTIONS: { value: PropertyType; label: string }[] = [
  { value: "HOUSE", label: "Casa" },
  { value: "CONDOMINIUM", label: "Condomínio" },
  { value: "BUILDING", label: "Prédio" },
];

export function EditPropertyDialog({
  property,
  open,
  onOpenChange,
  onUpdated,
}: {
  property: Property | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (property: Property) => void;
}) {
  const [name, setName] = useState("");
  const [rooms, setRooms] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState<PropertyType | "">("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (property) {
      setName(property.name);
      setRooms(String(property.rooms));
      setPrice(String(property.price));
      setType(property.type);
      setError("");
    }
  }, [property]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!property) return;

    if (!type) {
      setError("Selecione o tipo do imóvel.");
      return;
    }

    setSubmitting(true);
    try {
      const updated = await updateProperty(property.id, {
        name,
        rooms: Number(rooms),
        price: Number(price),
        type,
      });
      onUpdated(updated);
      onOpenChange(false);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Preencha os campos corretamente",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar imóvel</DialogTitle>
          <DialogDescription>
            Atualize os dados do imóvel.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="edit-name">Nome</FieldLabel>
              <Input
                id="edit-name"
                type="text"
                placeholder="Edifício Vista Mar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-rooms">Quartos</FieldLabel>
              <Input
                id="edit-rooms"
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
              <FieldLabel htmlFor="edit-price">Preço</FieldLabel>
              <Input
                id="edit-price"
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
              <FieldLabel htmlFor="edit-type">Tipo</FieldLabel>
              <NativeSelect
                id="edit-type"
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
