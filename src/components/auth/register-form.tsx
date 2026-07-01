import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { useAuth } from "@/contexts/AuthProvider";
import React, { useState } from "react";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { register } = useAuth()!;
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      await register(username, email, password, role);
      navigate("/");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Preencha os campos corretamente",
      );
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 text-center select-none">
        AcheImovel
      </h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-center text-2xl">
            Faça seu Cadastro
          </CardTitle>
          <CardDescription className="flex justify-center">
            Crie sua conta para ter acesso a plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">Nome de usuário</FieldLabel>
                <Input
                  id="username"
                  type="text"
                  placeholder="Luan Costa"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="seuemail@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-gray-400">
                  Deve ter pelo menos 8 caracteres
                </p>
              </Field>
              <Field>
                <FieldLabel htmlFor="username">Função</FieldLabel>
                <NativeSelect
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <NativeSelectOption value="">
                    Selecione uma opção
                  </NativeSelectOption>
                  <NativeSelectOption value="BROKER">
                    Corretor
                  </NativeSelectOption>
                  <NativeSelectOption value="CUSTOMER">
                    Cliente
                  </NativeSelectOption>
                </NativeSelect>
              </Field>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Field>
                <Button type="submit">Cadastre-se</Button>
                <FieldDescription className="text-center">
                  Ja tem uma conta?{" "}
                  <button
                    onClick={() => navigate("/login")}
                    className="cursor-pointer underline"
                  >
                    Login
                  </button>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
