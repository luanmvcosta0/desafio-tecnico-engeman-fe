import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Search, SquarePen, ShieldMinus, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Input } from "@/components/ui/input";
import { getProperties, toggleActive } from "@/services/propertyService";
import { CreatePropertyDialog } from "@/components/create-property-dialog";
import { EditPropertyDialog } from "@/components/edit-property-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { Property, PropertyType } from "@/interfaces/Property";

const TYPE_LABELS: Record<PropertyType, string> = {
  CONDOMINIUM: "Condomínio",
  HOUSE: "Casa",
  BUILDING: "Prédio",
};

const TYPE_OPTIONS: { value: PropertyType; label: string }[] = [
  { value: "HOUSE", label: "Casa" },
  { value: "CONDOMINIUM", label: "Condomínio" },
  { value: "BUILDING", label: "Prédio" },
];

const PAGE_SIZE = 10;

const EMPTY_FILTERS = {
  name: "",
  type: "" as PropertyType | "",
  minPrice: "",
  maxPrice: "",
  rooms: "",
};

type Filters = typeof EMPTY_FILTERS;

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function PropertiesTable({
  properties,
  canManage,
  canFavorite,
  favorites,
  onEdit,
  onToggleActive,
  onToggleFavorite,
}: {
  properties: Property[];
  canManage: boolean;
  canFavorite: boolean;
  favorites: Set<string>;
  onEdit: (property: Property) => void;
  onToggleActive: (property: Property) => void;
  onToggleFavorite: (property: Property) => void;
}) {
  function handleCopy() {
    const text = properties
      .map(
        (property) =>
          `${property.name}\t${TYPE_LABELS[property.type] ?? property.type}\t${property.rooms}\t${formatPrice(property.price)}`
      )
      .join("\n");
    navigator.clipboard.writeText(text);
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {canFavorite && <TableHead className="w-8" />}
          <TableHead>Nome</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Quartos</TableHead>
          <TableHead className="text-right">
            <div className="flex items-center justify-end gap-2">
              Preço
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copiar tabela de imóveis"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Copy className="size-3.5" />
              </button>
            </div>
          </TableHead>
          {canManage && <TableHead className="text-right">Ações</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {properties.map((property) => (
          <TableRow
            key={property.id}
            className={property.active ? undefined : "opacity-60"}
          >
            {canFavorite && (
              <TableCell>
                <button
                  type="button"
                  onClick={() => onToggleFavorite(property)}
                  aria-label={
                    favorites.has(property.id)
                      ? "Remover dos favoritos"
                      : "Favoritar imóvel"
                  }
                  className={
                    favorites.has(property.id)
                      ? "text-yellow-500 transition-colors hover:text-yellow-600"
                      : "text-muted-foreground transition-colors hover:text-foreground"
                  }
                >
                  <Star
                    className="size-4"
                    fill={favorites.has(property.id) ? "currentColor" : "none"}
                  />
                </button>
              </TableCell>
            )}
            <TableCell className="font-medium text-primary underline-offset-4 hover:underline">
              {property.name}
            </TableCell>
            <TableCell>{TYPE_LABELS[property.type] ?? property.type}</TableCell>
            <TableCell>{property.rooms}</TableCell>
            <TableCell className="text-right font-semibold">
              {formatPrice(property.price)}
            </TableCell>
            {canManage && (
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(property)}
                    aria-label="Editar imóvel"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <SquarePen className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleActive(property)}
                    aria-label={
                      property.active ? "Inativar imóvel" : "Ativar imóvel"
                    }
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ShieldMinus className="size-4" />
                  </button>
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function HomePage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(
    null,
  );
  const [editOpen, setEditOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [debouncedFilters, setDebouncedFilters] = useState<Filters>(EMPTY_FILTERS);
  const hasActiveFilters = Object.values(filters).some((value) => value !== "");
  const canManage =
    auth?.user?.role === "BROKER" || auth?.user?.role === "ADMIN";
  const canFavorite = auth?.user?.role === "CUSTOMER";
  const favoritesKey = `favorites:${auth?.user?.email ?? "anonymous"}`;

  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(favoritesKey);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  function handleToggleFavorite(property: Property) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(property.id)) {
        next.delete(property.id);
      } else {
        next.add(property.id);
      }
      localStorage.setItem(favoritesKey, JSON.stringify([...next]));
      return next;
    });
  }

  const sortedProperties = useMemo(() => {
    if (!canFavorite) return properties;
    return [...properties].sort((a, b) => {
      const aFav = favorites.has(a.id) ? 1 : 0;
      const bFav = favorites.has(b.id) ? 1 : 0;
      return bFav - aFav;
    });
  }, [properties, canFavorite, favorites]);

  function fetchPage(pageToLoad: number, filtersToApply: Filters = debouncedFilters) {
    setLoading(true);
    return getProperties(pageToLoad, PAGE_SIZE, "id", {
      type: filtersToApply.type,
      minPrice: filtersToApply.minPrice === "" ? undefined : Number(filtersToApply.minPrice),
      maxPrice: filtersToApply.maxPrice === "" ? undefined : Number(filtersToApply.maxPrice),
      rooms: filtersToApply.rooms === "" ? undefined : Number(filtersToApply.rooms),
      name: filtersToApply.name,
    })
      .then((data) => {
        setProperties(data.content);
        setTotalElements(data.totalElements);
        setTotalPages(data.totalPages);
        setError(null);
      })
      .catch(() => setError("Não foi possível carregar os imóveis."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedFilters(filters), 400);
    return () => clearTimeout(handle);
  }, [filters]);

  useEffect(() => {
    fetchPage(page, debouncedFilters);
  }, [page, debouncedFilters]);

  function handleFilterChange(patch: Partial<Filters>) {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(0);
  }

  function handleClearFilters() {
    setFilters(EMPTY_FILTERS);
    setDebouncedFilters(EMPTY_FILTERS);
    setPage(0);
  }

  function handleCreated() {
    if (page === 0) {
      fetchPage(0);
    } else {
      setPage(0);
    }
  }

  function handleUpdated(property: Property) {
    setProperties((prev) =>
      prev.map((p) => (p.id === property.id ? property : p)),
    );
  }

  function handleEdit(property: Property) {
    setEditingProperty(property);
    setEditOpen(true);
  }

  async function handleToggleActive(property: Property) {
    try {
      const updated = await toggleActive(property.id);
      setProperties((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p)),
      );
    } catch {
      setError("Não foi possível alterar o status do imóvel.");
    }
  }

  function handleLogout() {
    auth?.logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-3 grid grid-cols-3 items-center">
        <span className="font-semibold text-base">Engeman</span>
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 text-center select-none">
          AcheImovel
        </h1>
        <div className="flex items-center gap-3 justify-end">
          <span className="text-sm text-muted-foreground">
            {auth?.user?.email}
          </span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">
            Olá, {auth?.user?.username || auth?.user?.email}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bem-vindo ao painel principal.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">Imóveis cadastrados</h2>
              {!loading && !error && (
                <span className="text-sm text-muted-foreground">
                  {totalElements}{" "}
                  {totalElements === 1 ? "imóvel" : "imóveis"}
                </span>
              )}
            </div>
            {canManage && <CreatePropertyDialog onCreated={handleCreated} />}
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <InputGroup className="w-full max-w-xs">
              <InputGroupInput
                placeholder="Pesquisar por nome..."
                value={filters.name}
                onChange={(e) => handleFilterChange({ name: e.target.value })}
              />
              <InputGroupAddon>
                <Search className="size-4" />
              </InputGroupAddon>
            </InputGroup>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground" htmlFor="filter-type">
                Tipo
              </label>
              <NativeSelect
                id="filter-type"
                className="w-40"
                value={filters.type}
                onChange={(e) =>
                  handleFilterChange({ type: e.target.value as PropertyType | "" })
                }
              >
                <NativeSelectOption value="">Todos</NativeSelectOption>
                {TYPE_OPTIONS.map((option) => (
                  <NativeSelectOption key={option.value} value={option.value}>
                    {option.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground" htmlFor="filter-min-price">
                Preço mínimo
              </label>
              <Input
                id="filter-min-price"
                type="number"
                min={0}
                step={0.01}
                placeholder="0,00"
                className="w-32"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange({ minPrice: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground" htmlFor="filter-max-price">
                Preço máximo
              </label>
              <Input
                id="filter-max-price"
                type="number"
                min={0}
                step={0.01}
                placeholder="0,00"
                className="w-32"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange({ maxPrice: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground" htmlFor="filter-rooms">
                Quartos (mín.)
              </label>
              <Input
                id="filter-rooms"
                type="number"
                min={0}
                step={1}
                placeholder="0"
                className="w-24"
                value={filters.rooms}
                onChange={(e) => handleFilterChange({ rooms: e.target.value })}
              />
            </div>

            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Limpar filtros
              </Button>
            )}
          </div>

          {loading && (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {!loading && !error && properties.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters
                ? "Nenhum imóvel encontrado para os filtros aplicados."
                : "Nenhum imóvel cadastrado."}
            </p>
          )}

          {!loading && !error && sortedProperties.length > 0 && (
            <>
              <PropertiesTable
                properties={sortedProperties}
                canManage={canManage}
                canFavorite={canFavorite}
                favorites={favorites}
                onEdit={handleEdit}
                onToggleActive={handleToggleActive}
                onToggleFavorite={handleToggleFavorite}
              />

              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        aria-disabled={page === 0}
                        className={
                          page === 0 ? "pointer-events-none opacity-50" : undefined
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          if (page > 0) setPage(page - 1);
                        }}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i).map(
                      (pageNumber) => (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            href="#"
                            isActive={pageNumber === page}
                            onClick={(e) => {
                              e.preventDefault();
                              setPage(pageNumber);
                            }}
                          >
                            {pageNumber + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ),
                    )}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        aria-disabled={page >= totalPages - 1}
                        className={
                          page >= totalPages - 1
                            ? "pointer-events-none opacity-50"
                            : undefined
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          if (page < totalPages - 1) setPage(page + 1);
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </div>
      </main>

      <EditPropertyDialog
        property={editingProperty}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdated={handleUpdated}
      />
    </div>
  );
}

export default HomePage;
