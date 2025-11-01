"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SecuritySettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = () => {
    // TODO: [API: PATCH /api/auth/password]
    alert("Mudança de senha será implementada");
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href="/app/settings">
          <Button variant="ghost" size="sm">← Voltar</Button>
        </Link>
        <h1 className="font-heading text-3xl mt-4 mb-2">Segurança</h1>
      </div>

      <div className="space-y-6 max-w-2xl">
        <section className="p-6 border rounded">
          <h2 className="font-heading text-xl mb-4">Alterar Senha</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="current-password">Senha Atual</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button onClick={handleChangePassword}>
              Alterar Senha
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            [API: PATCH /api/auth/password]
          </p>
        </section>

        <section className="p-6 border rounded">
          <h2 className="font-heading text-xl mb-4">Privacidade</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              <span>Permitir que empresas vejam meu perfil público</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              <span>Receber emails de notificações</span>
            </label>
            <Button variant="outline">Salvar Preferências</Button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            [API: PATCH /api/user/privacy]
          </p>
        </section>
      </div>
    </div>
  );
}

